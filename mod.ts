import { Sha256, HmacSha256 } from 'https://deno.land/std@0.160.0/hash/sha256.ts'

const NEWLINE = '\n'

interface GetSignatureKeyOptions {
  date: Date,
  region: string
  secretAccessKey: string
}

interface GetSignedUrlOptions {
  bucket: string
  key: string
  accessKeyId: string
  secretAccessKey: string
  date: Date
  expiresIn: number
  region: string
  sessionToken?: string
  method?: 'GET' | 'PUT'
  queryParams?: Record<string, string | number>
  endpoint?: string,
  protocol?: string,
  usePathRequestStyle?: boolean,
  signatureKey?: ArrayBuffer,
}

type UserOptions = Partial<GetSignedUrlOptions> & Pick<GetSignedUrlOptions,
  'bucket' |
  'key' |
  'accessKeyId' |
  'secretAccessKey'
>

const DEFAULT_OPTIONS: Partial<GetSignedUrlOptions> = {
  method: 'GET',
  region: 'us-east-1',
  queryParams: {},
  expiresIn: 86400,
  endpoint: 's3.amazonaws.com',
  usePathRequestStyle: false,
  protocol: 'https'
}

function sha256(data: string): string {
  return new Sha256().update(data).hex()
}

function hmacSha256(key: string | ArrayBuffer, data: string): ArrayBuffer {
  return new HmacSha256(key).update(data).arrayBuffer()
}

function hmacSha256Hex(key: string | ArrayBuffer, data: string): string {
  return new HmacSha256(key).update(data).hex()
}

function ymd(date: Date): string {
  return date.toISOString().substring(0, 10).replace(/[^\d]/g, '')
}

function isoDate(date: Date): string {
  return `${date.toISOString().substring(0, 19).replace(/[^\dT]/g, '')}Z`
}

function getHost(options: GetSignedUrlOptions) {
  return options.usePathRequestStyle ? options.endpoint : `${options.bucket}.${options.endpoint}`
}

function getPath(options: GetSignedUrlOptions) {
  const path = options.usePathRequestStyle ? `/${options.bucket}/${options.key}` : `/${options.key}`

  return path.replaceAll(/\/+/g, '/')
}

function getQueryParameters(options: GetSignedUrlOptions): URLSearchParams {
  return new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${options.accessKeyId}/${ymd(options.date)}/${options.region}/s3/aws4_request`,
    'X-Amz-Date': isoDate(options.date),
    'X-Amz-Expires': options.expiresIn.toString(),
    'X-Amz-SignedHeaders': 'host',
    ...(options.sessionToken ? { 'X-Amz-Security-Token': options.sessionToken } : {}),
    ...options.queryParams,
  })
}

function getCanonicalRequest(options: GetSignedUrlOptions, queryParameters: URLSearchParams): string {
  queryParameters.sort()

  return [
    options.method, NEWLINE,
    getPath(options), NEWLINE,
    queryParameters.toString(), NEWLINE,
    `host:${getHost(options)}`, NEWLINE,
    NEWLINE,
    'host', NEWLINE,
    'UNSIGNED-PAYLOAD',
  ].join('')
}

function getSignaturePayload(options: GetSignedUrlOptions, payload: string): string {
  return [
    'AWS4-HMAC-SHA256', NEWLINE,
    isoDate(options.date), NEWLINE,
    `${ymd(options.date)}/${options.region}/s3/aws4_request`, NEWLINE,
    sha256(payload),
  ].join('')
}

export function getSignatureKey(options: GetSignatureKeyOptions): ArrayBuffer {
  let key: ArrayBuffer
  key = hmacSha256(`AWS4${options.secretAccessKey}`, ymd(options.date))
  key = hmacSha256(key, options.region)
  key = hmacSha256(key, 's3')
  key = hmacSha256(key, 'aws4_request')

  return key
}

function getUrl(options: GetSignedUrlOptions, queryParameters: URLSearchParams, signature: string): string {
  queryParameters.set('X-Amz-Signature', signature)

  return `${options.protocol}://${getHost(options)}${getPath(options)}?${new URLSearchParams(queryParameters).toString()}`
}

export function getSignedUrl(providedOptions: UserOptions): string {
  const options = {
    ...DEFAULT_OPTIONS,
    ...providedOptions,
    ...{
      date: providedOptions.date ?? new Date(),
    }
  } as GetSignedUrlOptions
  const queryParameters = getQueryParameters(options)
  const canonicalRequest = getCanonicalRequest(options, queryParameters)
  const signaturePayload = getSignaturePayload(options, canonicalRequest)
  const signatureKey = options.signatureKey || getSignatureKey(options)
  const signature = hmacSha256Hex(signatureKey, signaturePayload)
  const url = getUrl(options, queryParameters, signature)

  return url
}
