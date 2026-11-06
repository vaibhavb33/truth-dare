# Component Architecture & Frontend Topology

**Project Name:** Project Asteria  
**Document:** React Component Hierarchy & State Flow  
**Role:** Senior Full-Stack Architect & Lead Developer  
**Date:** November 5, 2026  
**Status:** Approved & Implemented

---

## 1. Component Hierarchy & Atomic Groupings

The frontend component architecture is structured into four distinct modular layers:

```
App Providers (Theme, AudioContext, Preferences)
  └── Universal Navigation (Header, Footer, Mobile Dock)
       └── Game Canvas Container (State Orchestrator)
            ├── 3D Flip Card Container (Perspective & Faces)
            ├── Timer Progress Ring (SVG Vector Engine)
            ├── Player Roster Dock (Turn Chips & Leaderboard)
            ├── Real-time Reaction Stream (Emoji Bursts)
            └── Action Controls (Truth/Dare, Complete, Skip)
```

---

## 2. State Management Architecture

* **Local Game State:**
  * Uses lightweight typed Zustand-style state stores for local session parameters:
    * `activeCard`: Current prompt, type, category, intensity.
    * `isFlipped`: Boolean tracking 3D card presentation state.
    * `roster`: Array of `Player` objects with scores, turn order, and skip counts.
    * `timer`: Seconds remaining, active state, pause state.
    * `history`: In-memory set of drawn card IDs (`Set<string>`) ensuring zero duplication.
* **Multiplayer Room State:**
  * Synchronized state store receiving real-time event updates via WebSockets / Supabase Realtime broadcast channels.
  * Dispatches optimistic UI updates locally and reconciles against authoritative server timestamped actions.
* **User Preferences:**
  * Persistent `localStorage` store managing: Master Audio Mute, Haptic Vibration Toggle, Dark/Light Theme, and 18+ Age Gate Affirmation.

