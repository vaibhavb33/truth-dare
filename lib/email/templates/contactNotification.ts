/**
 * Play Truth & Dare — Contact Form Email Template
 * Renders high-compatibility HTML & Plaintext emails with brand aesthetic.
 */

export interface ContactNotificationData {
  name: string;
  email: string;
  message: string;
  timestampIso: string;
  ip?: string;
  userAgent?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderContactEmail(data: ContactNotificationData): RenderedEmail {
  const safeName = escapeHtml(data.name.trim());
  const safeEmail = escapeHtml(data.email.trim());
  const safeMessage = escapeHtml(data.message.trim()).replace(/\n/g, '<br/>');
  const safeIp = data.ip ? escapeHtml(data.ip) : 'Unknown';

  const dateObj = new Date(data.timestampIso);
  const formattedDate = !isNaN(dateObj.getTime())
    ? dateObj.toUTCString()
    : data.timestampIso;

  const subject = `[Play Truth & Dare] New Contact Form Message from ${data.name.trim()}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0A0418; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0418; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #150C2C; border: 1px solid #2C185B; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          
          <!-- Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #24114D 0%, #170B33 100%); padding: 32px 32px 24px 32px; border-bottom: 1px solid #2C185B; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.35); border-radius: 24px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #C4B5FD; margin-bottom: 12px;">
                Contact Us Notification
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                Play Truth &amp; Dare
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94A3B8;">
                New inquiry received via <a href="https://playtruthndare.com/contact" style="color: #A78BFA; text-decoration: none;">playtruthndare.com/contact</a>
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              
              <!-- Sender Overview Table -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1D103D; border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); width: 130px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">
                    Visitor Name
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; font-weight: 700; color: #FFFFFF;">
                    ${safeName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">
                    Visitor Email
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; font-weight: 600; color: #A78BFA;">
                    <a href="mailto:${safeEmail}" style="color: #A78BFA; text-decoration: underline;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">
                    Timestamp
                  </td>
                  <td style="padding: 14px 18px; font-size: 13px; color: #CBD5E1;">
                    ${escapeHtml(formattedDate)}
                  </td>
                </tr>
              </table>

              <!-- Message Section -->
              <div style="margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #A78BFA;">
                  Message Content:
                </span>
              </div>
              <div style="background-color: #0E0720; border-left: 4px solid #8B5CF6; border-radius: 4px 12px 12px 4px; padding: 20px; font-size: 14px; line-height: 1.6; color: #F1F5F9; word-break: break-word; margin-bottom: 28px;">
                ${safeMessage}
              </div>

              <!-- Quick Reply CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${safeEmail}?subject=Re:%20Play%20Truth%20%26%20Dare%20Inquiry" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4); text-align: center;">
                      Reply Directly to ${safeName}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Metadata Footer -->
              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: #64748B; line-height: 1.5; text-align: center;">
                Client IP: ${safeIp} &bull; Received via Play Truth &amp; Dare Secure Contact Pipeline<br/>
                Host: <a href="https://playtruthndare.com" style="color: #64748B; text-decoration: underline;">https://playtruthndare.com</a>
              </div>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `====================================================
PLAY TRUTH & DARE — NEW CONTACT SUBMISSION
====================================================

Visitor Name: ${data.name.trim()}
Visitor Email: ${data.email.trim()}
Submission Time: ${formattedDate} (${data.timestampIso})
Sender IP: ${data.ip || 'Unknown'}

----------------------------------------------------
MESSAGE:
----------------------------------------------------
${data.message.trim()}

----------------------------------------------------
Reply directly: mailto:${data.email.trim()}?subject=Re:%20Play%20Truth%20%26%20Dare%20Inquiry
Website: https://playtruthndare.com/contact
====================================================`;

  return { subject, html, text };
}

