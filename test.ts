import {
  assertEquals,
} from 'https://deno.land/std@0.103.0/testing/asserts.ts'
import { getPreSignatureKey, getSignedUrl } from './mod.ts'

const date = new Date('Fri, 24 May 2013 00:00:00 GMT')

const baseTestOptions = {
  bucket: 'examplebucket',
  key: '/test.txt',
  region: 'us-east-1',
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  date,
}

Deno.test('creates a presigned URL', () => {
  assertEquals(
    getSignedUrl(baseTestOptions),
    [
      'https://examplebucket.s3.amazonaws.com/test.txt',
      '?X-Amz-Algorithm=AWS4-HMAC-SHA256',
      '&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request',
      '&X-Amz-Date=20130524T000000Z',
      '&X-Amz-Expires=86400',
      '&X-Amz-SignedHeaders=host',
      '&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404',
    ].join('')
  )
})

Deno.test('creates a presigned URL with a session token', () => {
  assertEquals(
    getSignedUrl({
      ...baseTestOptions,
      sessionToken: 'AQoEXAMPLEH4aoAH0gNCAPyJxz4BlCFFxWNE1OPTgk5TthT+FvwqnKwRcOIfrRh3c/LTo6UDdyJwOOvEVPvLXCrrrUtdnniCEXAMPLE/IvU1dYUg2RVAJBanLiHb4IgRmpRV3zrkuWJOgQs8IZZaIv2BXIa2R4OlgkBN9bkUDNCJiBeb/AXlzBBko7b15fjrBs2+cTQtpZ3CYWFXG8C5zqx37wnOE49mRl/+OtkIKGO7fAE',
    }),
    [
      'https://examplebucket.s3.amazonaws.com/test.txt',
      '?X-Amz-Algorithm=AWS4-HMAC-SHA256',
      '&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request',
      '&X-Amz-Date=20130524T000000Z',
      '&X-Amz-Expires=86400',
      '&X-Amz-Security-Token=AQoEXAMPLEH4aoAH0gNCAPyJxz4BlCFFxWNE1OPTgk5TthT%2BFvwqnKwRcOIfrRh3c%2FLTo6UDdyJwOOvEVPvLXCrrrUtdnniCEXAMPLE%2FIvU1dYUg2RVAJBanLiHb4IgRmpRV3zrkuWJOgQs8IZZaIv2BXIa2R4OlgkBN9bkUDNCJiBeb%2FAXlzBBko7b15fjrBs2%2BcTQtpZ3CYWFXG8C5zqx37wnOE49mRl%2F%2BOtkIKGO7fAE',
      '&X-Amz-SignedHeaders=host',
      '&X-Amz-Signature=3e7fe71f8da45a44c5ee7851dc99611df44ed2171068fa778b3537333ee2b435',
    ].join('')
  )
})

Deno.test('creates a pre signature key', () => {
  const signature = getPreSignatureKey(baseTestOptions);
  assertEquals(signature.byteLength, 32);
})

Deno.test('generate two urls and compare', () => {
  const signature = getPreSignatureKey(baseTestOptions);
  const preSignatureKeyUrl = getSignedUrl(baseTestOptions, signature);
  const url = getSignedUrl(baseTestOptions);
  assertEquals(preSignatureKeyUrl, url);
});
