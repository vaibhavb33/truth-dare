'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function ContactFormClient() {
  const { dict } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
          website: honeypot, // Spam honeypot trap
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        const errorText =
          data?.error || 'Unable to deliver your message right now. Please try again.';
        setErrorMessage(errorText);
        sound.triggerHaptic(50);
        return;
      }

      // Successful dispatch
      sound.playVictory();
      sound.triggerHaptic(20);
      setIsSent(true);
      setName('');
      setEmail('');
      setMessage('');
      setHoneypot('');
    } catch (err) {
      console.error('[ContactForm] Network failure:', err);
      setErrorMessage('Network connection error. Please check your internet connection and try again.');
      sound.triggerHaptic(50);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setter(e.target.value);
    if (errorMessage) {
      setErrorMessage('');
    }
    if (isSent) {
      setIsSent(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-6">
      {/* Direct Email Channel Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-highlight/70 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0 text-brand-400 shadow-glow-brand">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Direct Contact Email
            </span>
            <a
              href="mailto:borkarvaibhav98@gmail.com"
              className="text-white hover:text-brand-300 font-bold text-xs sm:text-sm transition-colors break-all flex items-center gap-1.5 group"
              title="Click to send an email to borkarvaibhav98@gmail.com"
            >
              <span>borkarvaibhav98@gmail.com</span>
              <span className="text-brand-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-xs">
                ↗
              </span>
            </a>
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end justify-between text-[11px] text-slate-400 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Inbox
          </span>
          <span className="text-[10px] text-slate-500">Replies within 24h</span>
        </div>
      </div>
      {isSent && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-semibold animate-fade-in"
        >
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{dict.contact.successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs font-semibold animate-fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
        {/* Invisible honeypot field for bot suppression */}
        <div aria-hidden="true" style={{ display: 'none' }} className="hidden">
          <label htmlFor="contact-hp">Do not fill this field</label>
          <input
            id="contact-hp"
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="contact-name" className="text-xs font-semibold text-slate-300">
            {dict.contact.nameLabel}
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={handleInputChange(setName)}
            required
            maxLength={100}
            disabled={isSubmitting}
            placeholder="e.g. Alex"
            className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none focus:border-brand-400 disabled:opacity-60 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="contact-email" className="text-xs font-semibold text-slate-300">
            {dict.contact.emailLabel}
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={handleInputChange(setEmail)}
            required
            maxLength={254}
            disabled={isSubmitting}
            placeholder="name@example.com"
            className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none focus:border-brand-400 disabled:opacity-60 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="contact-message" className="text-xs font-semibold text-slate-300">
            {dict.contact.messageLabel}
          </label>
          <textarea
            id="contact-message"
            rows={4}
            value={message}
            onChange={handleInputChange(setMessage)}
            placeholder={dict.contact.messagePlaceholder}
            required
            maxLength={5000}
            disabled={isSubmitting}
            className="w-full p-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none focus:border-brand-400 disabled:opacity-60 transition-colors resize-y"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full font-bold gap-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{dict.contact.sending || 'Sending...'}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{dict.contact.sendButton}</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
