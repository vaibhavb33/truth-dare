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
      console.warn(
        `[ContactEmailService] RESEND_API_KEY is not defined. Email simulated for destination: ${destinationEmail}`
      );
      return {
        success: true,
        mocked: true,
        messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      };
    }

    try {
      const response = await client.emails.send({
        from: fromEmail,
        to: destinationEmail,
        replyTo: params.email.trim(),
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });

      if (response.error) {
        console.error('[ContactEmailService] Resend API returned error:', response.error);
        return {
          success: false,
          error: response.error.message || 'Email delivery failed through provider.',
        };
      }

      return {
        success: true,
        messageId: response.data?.id,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown email dispatch exception.';
      console.error('[ContactEmailService] Exception during email dispatch:', err);
      return {
        success: false,
        error: errorMsg,
      };
    }
  }
}

export const contactEmailService = new ContactEmailService();

