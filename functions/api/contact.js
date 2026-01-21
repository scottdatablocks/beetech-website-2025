const MAX_LENGTHS = {
  name: 200,
  email: 320,
  company: 200,
  inquiryType: 120,
  message: 5000
};

const jsonResponse = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  });

const isBlank = (value) => !value || !value.trim();

const sanitizeLine = (value) => value.replace(/[\r\n]+/g, ' ').trim();

export async function onRequestPost({ request, env }) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonResponse({ ok: false, error: 'Invalid content type.' }, 415);
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return jsonResponse({ ok: false, error: 'Invalid JSON payload.' }, 400);
  }

  const name = sanitizeLine(String(body.name || ''));
  const email = sanitizeLine(String(body.email || '')).toLowerCase();
  const company = sanitizeLine(String(body.company || ''));
  const inquiryType = sanitizeLine(String(body.inquiryType || body.inquiry_type || ''));
  const message = String(body.message || '').trim();

  if (isBlank(name) || isBlank(email) || isBlank(message)) {
    return jsonResponse({ ok: false, error: 'Name, email, and message are required.' }, 400);
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValid) {
    return jsonResponse({ ok: false, error: 'Please provide a valid email address.' }, 400);
  }

  if (name.length > MAX_LENGTHS.name) {
    return jsonResponse({ ok: false, error: 'Name is too long.' }, 400);
  }
  if (email.length > MAX_LENGTHS.email) {
    return jsonResponse({ ok: false, error: 'Email is too long.' }, 400);
  }
  if (company.length > MAX_LENGTHS.company) {
    return jsonResponse({ ok: false, error: 'Company name is too long.' }, 400);
  }
  if (inquiryType.length > MAX_LENGTHS.inquiryType) {
    return jsonResponse({ ok: false, error: 'Inquiry type is too long.' }, 400);
  }
  if (message.length > MAX_LENGTHS.message) {
    return jsonResponse({ ok: false, error: 'Message is too long.' }, 400);
  }

  const resendApiKey = env.RESEND_API_KEY;
  if (!resendApiKey) {
    return jsonResponse({ ok: false, error: 'Email service is not configured.' }, 500);
  }

  const toAddress = env.CONTACT_TO || 'hello@beetech.ai';
  const fromAddress = env.CONTACT_FROM || 'no-reply@beetech.ai';
  const inquiryLabel = inquiryType || 'General Inquiry';
  const subject = `BeeTech Contact: ${inquiryLabel} — ${name}`.slice(0, 200);

  const messageBody = [
    'New BeeTech contact form submission',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || 'N/A'}`,
    `Inquiry Type: ${inquiryLabel}`,
    '',
    'Message:',
    message,
    '',
    'Metadata:',
    `Submitted At: ${new Date().toISOString()}`,
    `User Agent: ${request.headers.get('user-agent') || 'unknown'}`,
    `IP: ${request.headers.get('cf-connecting-ip') || 'unknown'}`
  ].join('\n');

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${resendApiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: toAddress,
        reply_to: email,
        subject,
        text: messageBody
      })
    });

    if (!resendResponse.ok) {
      return jsonResponse({ ok: false, error: 'Failed to send email.' }, 502);
    }
  } catch (error) {
    return jsonResponse({ ok: false, error: 'Email service error.' }, 502);
  }

  return jsonResponse({ ok: true });
}
