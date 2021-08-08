[![test](https://github.com/dansalias/aws_s3_presign/actions/workflows/test.yml/badge.svg)](https://github.com/dansalias/aws_s3_presign/actions/workflows/test.yml)

__Deno__ module for creating presigned URLs to get and update objects in Amazon
S3 (AWS Signature Version 4). Implemented and tested as per
https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html.

## Usage
```ts
import { getSignedUrl } from 'https://deno.land/x/aws_s3_presign/mod.ts'

const url = getSignedUrl({
  accessKeyId: 'my-aws-access-key-id',
  secretAccessKey: 'my-aws-secret-access-key',
  bucketName: 'example-bucket',
  objectPath: '/test.txt',
  region: 'us-east-1',
})
```

## Options
```ts
interface GetSignedUrlOptions {
  bucketName: string        // required
  objectPath: string        // required
  accessKeyId: string       // required
  secretAccessKey: string   // required
  method?: 'GET' | 'PUT'    // default 'GET'
  region?: string           // default 'us-east-1'
  expiresIn?: number        // seconds, default 86400 (24 hours)
  date?: Date               // forced creation date, for testing
}
```

## Testing
```
git clone https://github.com/dansalias/aws_s3_presign
cd ./aws_s3_presign
deno test
```
