# Cross-Browser PWA Promotional Behavior & Install Workflows
**Platform:** Asteria Party Gaming Platform (`https://truthordarequiz.com`)  
**Target Environments:** Android Chromium, iOS Safari, Desktop Chrome/Edge, Fallback Browsers  

---

## 1. Browser Installation Flow Matrix

| Platform / Browser | Native Event Support | Installation Action | User Experience |
| :--- | :---: | :--- | :--- |
| **Android Chrome / Edge / Brave** | `beforeinstallprompt` | `deferredPrompt.prompt()` | Native OS bottom-sheet install dialog |
| **Android Samsung Internet** | `beforeinstallprompt` | `deferredPrompt.prompt()` | Native Samsung launcher dialog |
| **iOS Safari (iPhone / iPad)** | None | Custom 3-Step Instruction Modal | Step-by-step guidance to tap Share -> Add to Home Screen |
| **Desktop Chrome / Edge** | `beforeinstallprompt` | `deferredPrompt.prompt()` | Address bar dialog / App window creation |
| **Desktop Firefox / Safari (macOS)** | None | Interactive Help Card | Guides player to bookmark or pin web app |

---

## 2. Platform-Specific Workflow Implementation

### 2.1 Android & Chromium Browsers
Chromium-based browsers fire the `beforeinstallprompt` event when an eligible site is visited.
1. `usePWA` captures and retains the event object (`e.preventDefault()`).
2. When the weekly promotion appears, clicking **"Add to Home Screen"** invokes:
   ```typescript
   await deferredPrompt.prompt();
   const { outcome } = await deferredPrompt.userChoice;
   if (outcome === 'accepted') {
     // User confirmed installation
     localStorage.setItem('asteria_pwa_installed', 'true');
   }
   ```
3. The browser triggers the `appinstalled` event upon successful creation of the launcher shortcut.
4. Asteria plays a celebratory victory sound and marks the app permanently installed.

### 2.2 iOS Safari (WebKit Architecture)
iOS Safari does not support automated PWA prompts. Calling unsupported prompt functions causes runtime exceptions or broken user buttons.
- Asteria detects iOS WebKit via user agent analysis and `navigator.standalone === false`.
- Clicking **"Add to Home Screen"** opens the dedicated, portaled **iOS Installation Modal** (`components/pwa/IOSInstallModal.tsx`):
  - **Step 1:** Tap the Safari Share button in the toolbar.
  - **Step 2:** Scroll down and choose **"Add to Home Screen"** (`[+]`).
  - **Step 3:** Tap **"Add"** in the top-right corner.
- Once launched from the iOS Home Screen, `navigator.standalone` evaluates to `true`, permanently disabling all promotional reminders.

### 2.3 Desktop & Unsupported Browsers
For desktop browsers without active `beforeinstallprompt` eligibility (or where installation is blocked by system policies):
- Clicking "Add to Home Screen" flips the card to an inline **Help Screen** (`showDesktopHelp = true`).
- The player is guided to click the install icon in their browser address bar or use shortcut `Ctrl+D` (`Cmd+D`) to bookmark.
- A "Got It, Thanks!" dismiss action returns the card to clean state.

