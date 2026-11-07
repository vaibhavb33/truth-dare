# Architectural Risk Register & Mitigation Matrix
**Platform:** Asteria Party Gaming Platform (`https://truthordarequiz.com`)  
**Role:** CTO & Senior Full-Stack Architect  
**Date:** November 7, 2026  

---

## 1. Risk Assessment Framework

Risks are categorized across four critical engineering vectors:
- **Severity:** High (Catastrophic/P0), Medium (Degraded/P1), Low (Minor/P2)
- **Likelihood:** High (> 50%), Medium (20% - 50%), Low (< 20%)

```
                                  LIKELIHOOD
                       Low          Medium          High
                  +-------------+-------------+-------------+
             High |   Risk 04   |   Risk 01   |   Risk 02   |
                  +-------------+-------------+-------------+
         SEVERITY |   Risk 06   |   Risk 03   |   Risk 05   |
                  +-------------+-------------+-------------+
              Low |   Risk 08   |   Risk 07   |             |
                  +-------------+-------------+-------------+
```

---

## 2. Comprehensive Risk Matrix

| Risk ID | Risk Description | Severity | Likelihood | Impact Area | Mitigation Strategy |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **R-01** | **Database Desynchronization during Multiplayer Migration** | High | Medium | Multiplayer Rooms | Maintain dual-read fallback: if PostgreSQL query fails or times out, fallback to in-memory room engine seamlessly. |
| **R-02** | **WebSocket Disconnects on Mobile Cellular Networks** | High | High | Live Room Gameplay | Implement automatic exponential reconnection with fallback to current 1.5s HTTP polling if WebSocket fails 3 times. |
| **R-03** | **iOS Safari SpeechSynthesis Gesture Lockout** | Medium | Medium | Voice Narration | AudioContext & SpeechSynthesis must be unlocked on first user tap gesture (`play` or `flip`) before programmatic speech. |
| **R-04** | **Data Loss during Question Ingestion** | High | Low | Question Database | Run seed script with `ON CONFLICT (id) DO NOTHING` in transactional batches; verify 2,652 count post-seed. |
| **R-05** | **Offline Pass & Play Broken by Cloud Dependencies** | Medium | High | PWA Offline Play | Retain static TypeScript question bundles in client build; offline mode uses local bundle, cloud mode enriches it. |
| **R-06** | **Custom Deck Cross-Site Scripting (XSS)** | High | Low | Custom Deck Studio | Sanitize all user-inputted custom prompts with strict HTML tag stripping and character length limits (< 250 chars). |
| **R-07** | **Voice Language Voice Availability Discrepancies** | Low | Medium | Voice Narration | Detect available voices via `window.speechSynthesis.getVoices()`; fall back to default device speech if native accent missing. |
| **R-08** | **Next.js Bundle Size Creep from Supabase SDK** | Low | Low | Core Web Vitals | Dynamic import of Supabase client; tree-shake unused SDK modules to preserve 103 kB shared JS budget. |

---

## 3. Deep-Dive Mitigation Protocols

### Mitigation Protocol for R-01 (Zero-Downtime Multiplayer Migration)
```typescript
export async function getRoomResilient(roomCode: string): Promise<MultiplayerRoom | null> {
  try {
    // 1. Attempt PostgreSQL fetch
    const { data: dbRoom } = await supabase.from('multiplayer_rooms').select('*').eq('room_code', roomCode).single();
    if (dbRoom) return formatDbRoom(dbRoom);
  } catch (err) {
    console.warn('[Multiplayer Resilience] PostgreSQL query failed, checking in-memory fallback:', err);
  }

  // 2. Fallback to in-memory roomEngine singleton
  return roomEngine.getRoom(roomCode);
}
```

### Mitigation Protocol for R-02 (Mobile Realtime Reconnection)
- Keep `RoomClient.tsx` state machine decoupled from the transport layer.
- If WebSocket status changes to `'CLOSED'` or `'ERROR'`, silently switch transport to HTTP `/api/rooms/[code]` polling without interrupting player screens.
- When WebSocket reconnects, resume push events and terminate polling.

### Mitigation Protocol for R-03 (iOS Safari Audio & Speech Unlock)
- Safari requires user gesture interaction before `window.speechSynthesis.speak()` or Web Audio playback will output sound.
- On the game start or card flip tap:
  ```typescript
  const unlockAudioContext = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      const silentUtterance = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(silentUtterance);
    }
  };
  ```

---

## 4. Rollback & Contingency Plan

If any phase of the major upgrade encounters catastrophic regression:
1. **Git Rollback Point:** Checkout branch `asteria-major-upgrade-backup` (`git checkout asteria-major-upgrade-backup`).
2. **Database Isolation:** All new database tables are additive (`CREATE TABLE IF NOT EXISTS`) and will not drop or alter existing code structures.
3. **PWA Invalidation:** Bump cache version string from `v1` to `v2` in `public/sw.js` to instantly evict obsolete client assets across all user devices.
