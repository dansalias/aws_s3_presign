import {
  assertEquals,
} from 'https://deno.land/std@0.103.0/testing/asserts.ts'
import { getSignedUrl } from './mod.ts'

const date = new Date('Fri, 24 May 2013 00:00:00 GMT')

Deno.test('creates a presigned URL', () => {
  assertEquals(
    getSignedUrl({
      bucketName: 'examplebucket',
      objectPath: '/test.txt',
      region: 'us-east-1',
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      date,
    }),
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
