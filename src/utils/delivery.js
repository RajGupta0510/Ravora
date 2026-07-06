import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env if it exists in the root directory to populate process.env
const rootDir = path.resolve(__dirname, '../../..');
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const firstEq = trimmed.indexOf('=');
      if (firstEq === -1) return;
      const key = trimmed.substring(0, firstEq).trim();
      let val = trimmed.substring(firstEq + 1).trim();
      // Remove enclosing quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    });
    console.log('[Delivery Config] Root .env parsed successfully.');
  } catch (err) {
    console.error('[Delivery Config] Failed to read .env file:', err);
  }
}

// HTTPS helper to make REST API requests without dependencies
const requestHttps = (url, options, bodyData = '') => {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP Error ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
};

/**
 * Send an OTP code via Email (supports SendGrid, Resend, or Console fallback)
 */
export const sendEmailOtp = async (toEmail, otpCode) => {
  const provider = (process.env.EMAIL_PROVIDER || 'console').toLowerCase();
  const fromEmail = process.env.EMAIL_FROM || 'no-reply@ravora.ai';
  const subject = 'Ravora Multi-Factor Verification';
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1a202c;">
      <h2 style="color: #4f46e5; margin-bottom: 10px;">Security Verification</h2>
      <p style="font-size: 16px; line-height: 1.5;">Welcome to Ravora. Use the following 6-digit verification code to complete your action:</p>
      <div style="margin: 24px 0; text-align: center;">
        <span style="display: inline-block; padding: 12px 24px; font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 0.1em; color: #4f46e5; background-color: #f3f4f6; border-radius: 6px;">${otpCode}</span>
      </div>
      <p style="font-size: 14px; color: #718096; line-height: 1.5;">This verification code is only valid for <strong>5 minutes</strong>. If you did not request this, please secure your account immediately.</p>
    </div>
  `;

  console.log(`[Email Delivery] Attempting send to ${toEmail} using provider: ${provider}`);

  if (provider === 'sendgrid') {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) throw new Error('SENDGRID_API_KEY env variable is not set.');

    const body = JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: fromEmail, name: 'Ravora Intelligence' },
      subject: subject,
      content: [{ type: 'text/html', value: htmlContent }]
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    };
    await requestHttps('https://api.sendgrid.com/v3/mail/send', options, body);
    console.log(`[Email Delivery] SendGrid email successfully dispatched.`);
    return true;
  }

  if (provider === 'resend') {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY env variable is not set.');

    const body = JSON.stringify({
      from: fromEmail,
      to: toEmail,
      subject: subject,
      html: htmlContent
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    };
    await requestHttps('https://api.resend.com/emails', options, body);
    console.log(`[Email Delivery] Resend email successfully dispatched.`);
    return true;
  }

  // Fallback / Developer console mode
  console.log(`[Email Delivery Sandbox Fallback]
  ============================================
  To: ${toEmail}
  Subject: ${subject}
  OTP Code: ${otpCode}
  ============================================`);
  return true;
};

/**
 * Send an OTP code via SMS (supports Twilio or Console fallback)
 */
export const sendSmsOtp = async (toMobile, otpCode) => {
  const provider = (process.env.SMS_PROVIDER || 'console').toLowerCase();
  const messageBody = `Your Ravora verification code is: ${otpCode}. Valid for 5 minutes.`;

  console.log(`[SMS Delivery] Attempting send to ${toMobile} using provider: ${provider}`);

  if (provider === 'twilio') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio parameters (SID, token, or phone number) are missing from env.');
    }

    const postData = new URLSearchParams({
      To: toMobile,
      From: fromNumber,
      Body: messageBody
    }).toString();

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader
      }
    };
    await requestHttps(url, options, postData);
    console.log(`[SMS Delivery] Twilio SMS successfully dispatched.`);
    return true;
  }

  // Fallback / Developer console mode
  console.log(`[SMS Delivery Sandbox Fallback]
  ============================================
  To: ${toMobile}
  Message: ${messageBody}
  ============================================`);
  return true;
};

/**
 * Send an OTP duplicate via WhatsApp if configured (Twilio WhatsApp Sandbox or Business API)
 */
export const sendWhatsAppOtp = async (toMobile, otpCode) => {
  const enabled = process.env.WHATSAPP_ENABLED === 'true';
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM; // e.g., whatsapp:+14155238886
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!enabled) {
    console.log(`[WhatsApp Delivery] WhatsApp integration is disabled/not configured.`);
    return false;
  }

  if (!accountSid || !authToken || !fromWhatsApp) {
    console.warn(`[WhatsApp Delivery] Missing Twilio credentials or sender number for WhatsApp dispatch.`);
    return false;
  }

  const messageBody = `Your Ravora verification code is: ${otpCode}. Valid for 5 minutes.`;
  console.log(`[WhatsApp Delivery] Dispatching duplicate code to ${toMobile}...`);

  try {
    // Format to phone number to ensure it has whatsapp: prefix
    const formattedTo = toMobile.startsWith('whatsapp:') ? toMobile : `whatsapp:${toMobile}`;
    const formattedFrom = fromWhatsApp.startsWith('whatsapp:') ? fromWhatsApp : `whatsapp:${fromWhatsApp}`;

    const postData = new URLSearchParams({
      To: formattedTo,
      From: formattedFrom,
      Body: messageBody
    }).toString();

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader
      }
    };

    await requestHttps(url, options, postData);
    console.log(`[WhatsApp Delivery] Twilio WhatsApp successfully dispatched.`);
    return true;
  } catch (err) {
    console.error('[WhatsApp Delivery] WhatsApp transmission failed:', err.message);
    return false;
  }
};
