# Menu image uploads

1. Create an R2 bucket for public menu images in the Cloudflare dashboard.
2. Connect a public custom domain to the bucket (recommended for production), or enable its public `r2.dev` URL for development. The S3 API endpoint is not a public image URL.
3. Create R2 S3 credentials with **Object Read & Write** access restricted to this bucket.
4. Add the following to the admin dashboard's `.env` and production server environment, then restart the app:

```dotenv
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=cafe-menu-images
R2_PUBLIC_URL=https://images.example.com
```

Keep all credentials server-side; do not prefix them with `NEXT_PUBLIC_` or commit real values. `R2_PUBLIC_URL` is the public bucket root, without `/menu-items`.

Admins can select a JPEG, PNG, or WebP file up to 3 MB in **Menu Items**. Clicking **Save item** uploads it to `menu-items/<random UUID>.<extension>` and saves the public URL to Supabase's existing `image_url` field. No database migration or browser-to-R2 CORS setup is required because uploads run on the admin server. The upload checks MIME type, file signatures, and size; SVG is not accepted.

The server action body limit is 4 MB to allow multipart overhead. Ensure the hosting platform or reverse proxy also accepts requests this large.

If the database save fails, the app attempts to delete the newly uploaded object. Replaced, removed, and deleted-item images are retained in R2 to avoid breaking shared URLs and historical order images; clean up unreferenced files separately.

To verify: add an item with an image, open its public URL, refresh the page, replace its image, and verify it appears on the customer menu. Check that non-admin users cannot save changes and that invalid or oversized files are rejected.

References: [R2 AWS SDK v3 integration](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/), [public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/).
