# Multi-Device Layout & Screenshot Comparison (`TEST 3 & TEST 4`)

**Project:** Asteria Multiplayer Party Gaming Platform  
**Test Suite:** [qaMobilePartyRoomFinal.js](file:///Users/vaibhavborkar/truth&dare/tests/e2e/qaMobilePartyRoomFinal.js)  
**Telemetry Source:** [qa-results.json](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/qa-results.json)  
**Overall Verdict:** **PASS** *(Note: on ultra-short `320x568` legacy height, `Start Game` initially sits below the fold under the fixed `MobileDock` and requires vertical scroll (`ScrollableToClear: true`); all devices `>= 360px` clear `MobileDock` without scrolling.)*

---

## 1. Bounding-Box Overlap Matrix Across All 9 Viewports (`TEST 3 & TEST 4`)

Every bounding box was measured programmatically in Chromium at `scrollY = 0` after applying compact mobile spacing fixes in [RoomClient.tsx](file:///Users/vaibhavborkar/truth&dare/app/room/%5Bcode%5D/RoomClient.tsx).

| Device | Resolution | Header Bottom (`px`) | Toolbar (`top`–`bot`, `W×H`) | Players (`top`–`bot`) | Lobby (`top`–`bot`) | Start CTA Bottom (`px`) | Dock Top (`px`) | Dock Clearance at Initial Load | Structural Overlaps / `overflow-x` | Verdict |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **320px** | `320×568` | `64` | `72–229` (`296×157`) | `239–305` | `315–619.5` | `558.5` | `503` | `-55.5px` (scroll clears, `canScrollToBottom: true`) | `0` overlaps / `false` | **PARTIAL (Initial Fold)** / **PASS (Scrollable)** |
| **360px** | `360×640` | `64` | `72–229` (`336×157`) | `239–305` | `315–619.5` | `558.5` | `575` | **`+16.5px` CLEAR** | `0` overlaps / `false` | **PASS** |
| **375px** | `375×667` | `64` | `72–229` (`351×157`) | `239–305` | `315–619.5` | `558.5` | `602` | **`+43.5px` CLEAR** | `0` overlaps / `false` | **PASS** |
| **390px** | `390×844` | `64` | `72–229` (`366×157`) | `239–305` | `315–619.5` | `558.5` | `779` | **`+220.5px` CLEAR** | `0` overlaps / `false` | **PASS** |
| **414px** | `414×896` | `64` | `72–229` (`390×157`) | `239–305` | `315–619.5` | `558.5` | `831` | **`+272.5px` CLEAR** | `0` overlaps / `false` | **PASS** |
| **430px** | `430×932` | `64` | `72–229` (`406×157`) | `239–305` | `315–619.5` | `558.5` | `867` | **`+308.5px` CLEAR** | `0` overlaps / `false` | **PASS** |
| **768px** | `768×1024` | `64` | `120–184` (`736×64`) | `208–284` | `551.5–920` | `843` | `959` | **`+116px` CLEAR** | `0` overlaps / `false` | **PASS** |
| **1024px** | `1024×768` | `64` | `120–184` (`992×64`) | `208–284` | `367.5–736` | `659` | *hidden* | Viewport fits (`736 < 768`) | `0` overlaps / `false` | **PASS** |
| **1440px** | `1440×900` | `64` | `120–184` (`992×64`) | `208–284` | `499.5–868` | `791` | *hidden* | Viewport fits (`868 < 900`) | `0` overlaps / `false` | **PASS** |

*Structural overlap checks run per viewport:* `headerVsToolbar`, `toolbarVsPlayers`, `playersVsLobby`, `hostOutsidePlayersBar`, `startBtnOutsideLobby`, and `docOverflowX` — **all `false` across 9/9 devices**.

---

## 2. Regression Found & Fixed During QA: Initial Bottom Dock Clearance

- **Before Fix:** Excessive mobile spacing in [RoomClient.tsx](file:///Users/vaibhavborkar/truth&dare/app/room/%5Bcode%5D/RoomClient.tsx) (`py-3 space-y-4`, `p-3 gap-2.5`, `p-5 space-y-5`, `w-14 h-14` hourglass container, and vertical `justify-between` push) placed the `Start Game ->` CTA at `bottom ≈ 625px`, overlapping the fixed `64px` bottom navigation dock (`MobileDock`) at initial load on common compact phones (`360×640` and `375×667`).
- **After Fix:** Tightened mobile-only Tailwind utilities (`py-2 sm:py-6`, `space-y-2.5 sm:space-y-6`, `justify-start md:justify-between`, `gap-2 p-2.5` toolbar, `p-4 sm:p-8 space-y-3 sm:space-y-6` Lobby card, `w-11 h-11 sm:w-16 sm:h-16` icon badge), reclaiming ~`70–90px` vertically on `< sm` viewports while leaving tablet/desktop (`>= 640px` / `>= 768px`) visuals unchanged.
- **Measured Gain:** `Start Game ->` now renders completely above `MobileDock` at initial load on **`360×640` (`+17px` clear)** and **`375×667` (`+44px` clear)** as well as all larger devices (`+221px` on `390px`, `+273px` on `414px`, `+309px` on `430px`, `+116px` on `768px`).

---

## 3. Visual Inspection Catalog

All screenshots were visually inspected via image review:

### Lobby & Responsive Suite
- [00_2player_lobby_390px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/00_2player_lobby_390px.png): 2-player Host view (`HostQA` + `GuestQA`), emerald-highlighted `ROOM: ESB5PS`, clean `✓ Copied` button, unobstructed Lobby card and `Start Game ->`.
- [room-320px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/room-320px.png): 3-row mobile toolbar (`296px`) and Players card crisp with zero clipping; `Start Game` extends smoothly into scrollable region below dock on 568px height.
- [room-360px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/room-360px.png): `Start Game ->` button completely visible above `MobileDock`.
- [room-375px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/room-375px.png): Full `Start Game ->` + settings hint cleanly clear of bottom navigation.
- [room-390px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/room-390px.png): Generous breathing room between Lobby card (`619.5px`) and `MobileDock` (`779px`).
- [room-414px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/room-414px.png) & [room-430px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/room-430px.png): Balanced spacing and centered proportions across large phones.
- [room-768px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/room-768px.png): Clean single-row desktop-style toolbar transition with centered Lobby card above dock.
- [room-1024px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/room-1024px.png) & [room-1440px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/room-1440px.png): Full desktop navigation, single-row toolbar, bottom dock hidden (`lg:hidden`).

### Active Gameplay & Portal Dropdown Views
- [gameplay-390px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/gameplay-390px.png): Active `Round 1` Party Room on `390×844` — turn banner (`It's YOUR Turn!`), 3D `TRUTH` / `DARE` selection card, voice buttons (`Listen to Truth` / `Listen to Dare`), and prompt text fit cleanly above `MobileDock`.
- [dropdown-320px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/dropdown-320px.png), [dropdown-375px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/dropdown-375px.png), [dropdown-390px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/dropdown-390px.png), [dropdown-768px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/dropdown-768px.png), [dropdown-1440px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/dropdown-1440px.png): Standalone solid opaque (`rgb(13, 13, 30)`) dropdown anchored inside viewport with clear `"Active"` pill and zero bleed-through.
