const sgMail = require('@sendgrid/mail');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide name, email and message.' });
  }

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const TO_EMAIL = process.env.TO_EMAIL || 'aweclient@gmail.com';
  const FROM_EMAIL = process.env.FROM_EMAIL || TO_EMAIL; // Better to use a verified sender in SendGrid

  if (!SENDGRID_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured. Please set SENDGRID_API_KEY in environment.' });
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  const subject = `New Inquiry from Awesome Accounting Services Website`;
  const text = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  const html = `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Message:</strong></p><p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`;

  try {
    await sgMail.send({
      to: TO_EMAIL,
      from: FROM_EMAIL,
      subject,
      text,
      html,
    });

    return res.status(200).json({ message: 'Thank you! Your message has been sent.' });
  } catch (err) {
    console.error('SendGrid error:', err?.response?.body || err);
    return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
};

function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
