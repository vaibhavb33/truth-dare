'use client';

import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';

export function ContactFormClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    sound.playVictory();
    sound.triggerHaptic(20);
    setIsSent(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-6">
      {isSent && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-semibold animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>Thank you! Your feedback has been transmitted to the Asteria product team.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="contact-name" className="text-xs font-semibold text-slate-300">
            Your Name / Nickname:
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none focus:border-brand-400"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="contact-email" className="text-xs font-semibold text-slate-300">
            Email Address (Optional):
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none focus:border-brand-400"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="contact-message" className="text-xs font-semibold text-slate-300">
            Message / Prompt Suggestion:
          </label>
          <textarea
            id="contact-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What questions, features, or suggestions would make Asteria better?"
            required
            className="w-full p-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none focus:border-brand-400"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full font-bold gap-2">
          <Send className="w-4 h-4" /> Send Feedback
        </Button>
      </form>
    </div>
  );
}

