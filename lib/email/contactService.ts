/**
 * Play Truth & Dare — Email Dispatch Service
 * Handles server-side email dispatch using Resend with fallback safety.
 */

import { Resend } from 'resend';
import { renderContactEmail, ContactNotificationData } from './templates/contactNotification';

export interface SendContactEmailParams {
  name: string;
  email: string;
  message: string;
  timestampIso?: string;
  ip?: string;
  userAgent?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  mocked?: boolean;
  error?: string;
}

export class ContactEmailService {
  private resendClient: Resend | null = null;
  private apiKey: string | null = null;

  private getClient(): Resend | null {
    const key = process.env.RESEND_API_KEY?.trim() || null;
    if (!key) {
      this.resendClient = null;
      this.apiKey = null;
      return null;
    }

    if (this.resendClient && this.apiKey === key) {
      return this.resendClient;
    }

    this.apiKey = key;
    this.resendClient = new Resend(key);
    return this.resendClient;
  }

  public getDestinationEmail(): string {
    return process.env.CONTACT_EMAIL?.trim() || 'borkarvaibhav98@gmail.com';
  }

  public getSenderEmail(): string {
    // Note: If domain is verified in Resend (e.g. playtruthndare.com),
    // set CONTACT_FROM_EMAIL="Play Truth & Dare <notifications@playtruthndare.com>".
    // Default fallback uses the official Resend verified testing sender.
    return (
      process.env.CONTACT_FROM_EMAIL?.trim() ||
      'Play Truth & Dare <onboarding@resend.dev>'
    );
  }

  /**
   * Dispatches a contact inquiry notification to the designated administrator.
   */
  public async sendContactNotification(
    params: SendContactEmailParams
  ): Promise<SendEmailResult> {
    const timestampIso = params.timestampIso || new Date().toISOString();
    const destinationEmail = this.getDestinationEmail();
    const fromEmail = this.getSenderEmail();

    const notificationData: ContactNotificationData = {
      name: params.name,
      email: params.email,
      message: params.message,
      timestampIso,
      ip: params.ip,
      userAgent: params.userAgent,
    };

    const rendered = renderContactEmail(notificationData);
    const client = this.getClient();

    if (!client) {
      if (process.env.NODE_ENV === 'test' || process.env.MOCK_EMAIL === 'true') {
        console.warn(
          `[ContactEmailService] RESEND_API_KEY is not defined. Email simulated in test mode for: ${destinationEmail}`
        );
        return {
          success: true,
          mocked: true,
          messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        };
      }

      console.error(
        `[ContactEmailService] CRITICAL: RESEND_API_KEY environment variable is not configured on the server. Cannot dispatch email to ${destinationEmail}.`
      );
      return {
        success: false,
        error:
          'Email delivery service is currently not configured on this server (missing RESEND_API_KEY). Please contact borkarvaibhav98@gmail.com directly.',
      };
    }

    try {
      console.log(
        `[ContactEmailService] Initiating Resend dispatch | From: ${fromEmail} | To: ${destinationEmail} | Reply-To: ${params.email.trim()}`
      );

      const response = await client.emails.send({
        from: fromEmail,
        to: destinationEmail,
        replyTo: params.email.trim(),
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });

      if (response.error) {
        console.error(
          `[ContactEmailService] Resend API dispatch error: [${response.error.name}] ${response.error.message}`
        );
        return {
          success: false,
          error: response.error.message || 'Email delivery failed through provider.',
        };
      }

      console.log(
        `[ContactEmailService] Email successfully accepted by Resend! Message ID: ${response.data?.id} | Destination: ${destinationEmail}`
      );

      return {
        success: true,
        messageId: response.data?.id,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown email dispatch exception.';
      console.error('[ContactEmailService] Exception during Resend dispatch:', err);
      return {
        success: false,
        error: errorMsg,
      };
    }
  }
}

export const contactEmailService = new ContactEmailService();

