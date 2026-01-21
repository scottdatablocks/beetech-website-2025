# Contact Form Delivery (Cloudflare Pages + Resend)

This site uses a Cloudflare Pages Function to send contact form submissions via Resend.

## Cloudflare Pages Environment Variables

Add the following secrets/variables in **Cloudflare Pages → Settings → Environment variables**:

- `RESEND_API_KEY` (secret, required)
  - Create an API key in Resend and store it as a secret.
- `CONTACT_TO` (optional)
  - Defaults to `hello@beetech.ai` if not set.
- `CONTACT_FROM` (optional)
  - Defaults to `no-reply@beetech.ai` if not set.
  - **Important:** Resend requires a verified sender domain. Update this value to a verified sender email if needed.

## Endpoint

The function is deployed at:

- `POST /api/contact`
- JSON body: `{ "name": "...", "email": "...", "company": "...", "inquiryType": "...", "message": "..." }`

## Testing

### cURL

```bash
curl -X POST https://<your-cloudflare-pages-domain>/api/contact \
  -H 'content-type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","company":"Analytical Engines","inquiryType":"General Inquiry","message":"Hello from BeeTech."}'
```

### Browser

1. Navigate to the Contact page in the live site.
2. Submit the form and confirm the success message appears.
3. Confirm the email arrives at the configured recipient address.
