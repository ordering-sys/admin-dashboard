import { randomUUID } from 'node:crypto'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { MAX_MENU_IMAGE_BYTES, menuImageExtension } from '@/lib/menu-image'

function r2Config() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    throw new Error('Image uploads are not configured. Set the R2 environment variables on the admin server.')
  }
  const publicUrl = new URL(R2_PUBLIC_URL)
  if (publicUrl.protocol !== 'https:' || publicUrl.search || publicUrl.hash || publicUrl.username || publicUrl.password) {
    throw new Error('R2_PUBLIC_URL must be a public HTTPS bucket URL without credentials, a query, or a fragment.')
  }
  return {
    bucket: R2_BUCKET_NAME,
    publicUrl: publicUrl.toString().replace(/\/$/, ''),
    client: new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    }),
  }
}

export async function uploadMenuImage(file: File) {
  if (file.size === 0 || file.size > MAX_MENU_IMAGE_BYTES) throw new Error('Choose an image up to 3 MB.')
  const bytes = Buffer.from(await file.arrayBuffer())
  const extension = menuImageExtension(bytes, file.type)
  if (!extension) throw new Error('Choose a valid JPEG, PNG, or WebP image.')
  const { client, bucket, publicUrl } = r2Config()
  const key = `menu-items/${randomUUID()}.${extension}`
  await client.send(new PutObjectCommand({
    Bucket: bucket, Key: key, Body: bytes, ContentType: file.type,
    CacheControl: 'public, max-age=31536000, immutable',
  }))
  return { key, url: `${publicUrl}/${key}` }
}

// Only remove a newly uploaded object if saving its database record failed.
// Existing images may still be referenced by historical orders or other items.
export async function discardMenuImage(key: string) {
  const { client, bucket } = r2Config()
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
