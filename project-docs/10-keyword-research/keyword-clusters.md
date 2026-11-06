# Semantic Keyword Clusters & Cannibalization Architecture

**Project Name:** Asteria — Premium Party Gaming Platform  
**Document:** Keyword Clustering & Anti-Cannibalization Matrix  
**Role:** Senior SEO Strategist and Keyword Research Specialist  
**Date:** November 6, 2026  
**Status:** Complete — Ready for Review  

---

## 1. Keyword Clustering Framework

To ensure maximum organic search visibility without triggering internal algorithmic competition (**keyword cannibalization**), all search queries are organized into **10 distinct, non-overlapping clusters**. 

Each cluster is assigned to a specific **Page Type** (Interactive Engine, Central Directory, Public Library, Custom Creator, or Editorial Pillar Guide) matching user search intent.

---

## 2. The 10 Core Semantic Clusters

```
                       ┌─────────────────────────────┐
                       │     CLUSTER 01: Asteria     │
                       │     Hub (Homepage: /)       │
                       │  "free online party games"  │
                       └──────────────┬──────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
┌────────┴───────────┐      ┌─────────┴──────────┐       ┌─────────┴──────────┐
│   CLUSTER 02: ToD  │      │   CLUSTER 03: All  │       │  CLUSTER 04: Vault │
│   Core Engine      │      │   Games Directory  │       │  Question Library  │
│  /games/truth-     │      │   /games           │       │  /questions        │
│    or-dare         │      │   "party games"    │       │  "questions list"  │
└────────┬───────────┘      └────────────────────┘       └────────────────────┘
         │
    ┌────┴──────────────────────────┬────────────────────────────┐
    │                               │                            │
┌───┴───────────────┐      ┌────────┴───────────┐       ┌────────┴───────────┐
│ CLUSTER 05:       │      │ CLUSTER 06:        │       │ CLUSTER 07:        │
│ Couples & Dating  │      │ Friends & Party    │       │ Kids & Family      │
│ ?cat=couples-flirty│     │ ?cat=classic-party │       │ ?cat=family-kids   │
└───────────────────┘      └────────────────────┘       └────────────────────┘
    │                               │
┌───┴───────────────┐      ┌────────┴───────────┐
│ CLUSTER 08: Teens │      │ CLUSTER 09: Sister │
│ & Sleepovers      │      │ Party Games        │
│ ?cat=teens-hangout│      │ (NHIE, WYR, MLT)   │
└───────────────────┘      └────────────────────┘
```

---

### Cluster 01: Core Platform Hub & Instant Play
* **Cluster ID:** `CLUST-01`
* **Target URL:** `/` (Root Homepage)
* **Search Intent:** Commercial Investigation / Free Play Discovery
* **Primary Target Keyword:** `online party games`
* **Secondary Target Keywords:** `free online party games`, `play party games online with friends`, `browser party games`, `virtual party games`
* **Long-Tail Variations:**
  - `party games to play online with friends without app`
  - `free browser party games with room codes`
  - `virtual party games for discord and zoom`
* **Anti-Cannibalization Rule:** The homepage targets broad party game aggregations and the platform brand. It does **not** compete for specific single-game head terms like `"never have i ever questions"`.

---

### Cluster 02: Truth or Dare Interactive Engine
* **Cluster ID:** `CLUST-02`
* **Target URL:** `/games/truth-or-dare`
* **Search Intent:** Transactional (Direct User Desire to Play Immediately)
* **Primary Target Keyword:** `truth or dare online`
* **Secondary Target Keywords:** `play truth or dare`, `truth or dare game`, `truth or dare website`, `truth or dare online game`
* **Long-Tail Variations:**
  - `play truth or dare online free no ads`
  - `truth or dare card flip game online`
  - `truth or dare game with dare timer`
* **Anti-Cannibalization Rule:** This URL represents the *interactive software engine*. It serves the active game loop, 3D card arena, player turn management, and dare timer. It passes informational list searches to `/questions`.

---

### Cluster 03: Games Directory & Catalog Hub
* **Cluster ID:** `CLUST-03`
* **Target URL:** `/games`
* **Search Intent:** Navigational / Broad Directory
* **Primary Target Keyword:** `party games online`
* **Secondary Target Keywords:** `list of online party games`, `parlor games online`, `group games in browser`, `free party games hub`
* **Long-Tail Variations:**
  - `best online party games to play on mobile with friends`
  - `party game collection truth or dare never have i ever`
* **Anti-Cannibalization Rule:** Serves as a navigational index with structured schema (`ItemList`). Links directly to the 6 individual game engines.

---

### Cluster 04: Public Challenge Vault & Filterable Question Search
* **Cluster ID:** `CLUST-04`
* **Target URL:** `/questions`
* **Search Intent:** Informational / List Browsing
* **Primary Target Keyword:** `truth or dare questions`
* **Secondary Target Keywords:** `best truth or dare questions`, `truth questions list`, `dare questions list`, `questions for truth or dare`
* **Long-Tail Variations:**
  - `searchable truth or dare questions library`
  - `500 good truth or dare questions copy and paste`
  - `truth questions ranked by intensity level`
* **Anti-Cannibalization Rule:** Captures users who want to *read*, *search*, or *copy* questions rather than play a turn-based card game. Links directly into `/games/truth-or-dare` via *"Play This Challenge in Game"* buttons.

---

### Cluster 05: Couples, Dating & Long-Distance Romance
* **Cluster ID:** `CLUST-05`
* **Target URL:** `/games/truth-or-dare?category=couples-flirty` (supported by pillar guide `/blog/50-best-dares-over-facetime`)
* **Search Intent:** Hybrid (Romantic Play / Relationship Building)
* **Primary Target Keyword:** `truth or dare for couples`
* **Secondary Target Keywords:** `couples truth or dare`, `romantic truth or dare questions`, `truth or dare for date night`, `flirty truth questions`
* **Long-Tail Variations:**
  - `truth or dare questions for long distance couples over facetime`
  - `deep intimacy truth or dare questions for boyfriend girlfriend`
  - `romantic date night truth or dare game online`
* **Anti-Cannibalization Rule:** The editorial blog guide captures long-distance video advice and sends gameplay clicks directly to the couples deck preset.

---

### Cluster 06: Friends, House Parties & Adult Gatherings
* **Cluster ID:** `CLUST-06`
* **Target URL:** `/games/truth-or-dare?category=classic-party`
* **Search Intent:** Transactional / Group Play
* **Primary Target Keyword:** `truth or dare for friends`
* **Secondary Target Keywords:** `funny truth or dare questions`, `party truth or dare`, `crazy dares for friends`, `truth or dare drinking game`
* **Long-Tail Variations:**
  - `hilarious truth or dare questions for house party`
  - `truth or dare game rules for college parties`
  - `crazy dares to do in front of friends`
* **Anti-Cannibalization Rule:** Focuses on social banter, friend history, and funny forfeits without leaking into romantic or child-friendly clusters.

---

### Cluster 07: Family-Friendly & Kids Clean Entertainment
* **Cluster ID:** `CLUST-07`
* **Target URL:** `/games/truth-or-dare?category=family-kids`
* **Search Intent:** Informational / Safe Entertainment
* **Primary Target Keyword:** `truth or dare for kids`
* **Secondary Target Keywords:** `clean truth or dare`, `family truth or dare questions`, `safe dares for kids`, `school safe truth or dare`
* **Long-Tail Variations:**
  - `clean truth or dare questions for 8 to 12 year olds`
  - `wholesome family game night truth or dare generator`
  - `safe physical dares for kids birthday party`
* **Anti-Cannibalization Rule:** Must never overlap with mature or drinking keywords. Content strictly emphasizes wholesome parent/teacher safety.

---

### Cluster 08: Teens, High School & Sleepovers
* **Cluster ID:** `CLUST-08`
* **Target URL:** `/games/truth-or-dare?category=teens-hangout`
* **Search Intent:** Social / Youth Culture
* **Primary Target Keyword:** `truth or dare for teens`
* **Secondary Target Keywords:** `teen truth or dare questions`, `sleepover truth or dare`, `truth or dare for teenagers`, `crush questions for teens`
* **Long-Tail Variations:**
  - `embarrassing truth questions for teenage sleepovers`
  - `relatable high school truth or dare questions`
  - `fun dares for teens over text and social media`
* **Anti-Cannibalization Rule:** Addresses school, social media, and adolescent social dynamics, distinct from general adult party prompts.

---

### Cluster 09: Sister Party Games (NHIE, WYR, MLT, Spinner)
* **Cluster ID:** `CLUST-09`
* **Target URLs:**
  - `/games/never-have-i-ever` (`never have i ever online`, `10 fingers down game`)
  - `/games/would-you-rather` (`would you rather online`, `would you rather with stats`)
  - `/games/most-likely-to` (`most likely to online game`, `who is most likely to`)
  - `/games/spin-the-bottle` (`spin the bottle online`, `random spinner wheel game`)
  - `/games/this-or-that` (`this or that game online`, `rapid fire preferences`)
* **Search Intent:** Transactional / Game-Specific
* **Anti-Cannibalization Rule:** Each sister game has its own dedicated, isolated URL and structured schema (`WebApplication`). They cross-link in the footer and game recommendations, but never mix primary meta tags.

---

### Cluster 10: Custom Deck Authoring & Editorial Rules
* **Cluster ID:** `CLUST-10`
* **Target URLs:**
  - `/custom` (`create custom truth or dare deck`, `custom party game maker`)
  - `/blog/official-truth-or-dare-rules` (`truth or dare official rules`, `how to play truth or dare`)
  - `/blog/clean-icebreakers-for-work` (`workplace safe icebreaker games`, `virtual icebreakers for zoom`)
* **Search Intent:** Informational & Tool Customization
* **Anti-Cannibalization Rule:** Captures high-authority informational traffic and channels users directly into active gameplay sessions.

---

## 3. Anti-Cannibalization Governance Rules

1. **One Intent, One Primary URL:** If two queries share the exact same user goal (e.g., `"truth or dare online"` and `"play truth or dare in browser"`), both map to `/games/truth-or-dare`. Never create duplicate thin pages.
2. **Interactive vs Informational Boundary:**
   - When the user wants to **play right now**, route to `/games/truth-or-dare`.
   - When the user wants to **browse or copy a static list of questions**, route to `/questions`.
   - When the user wants **detailed gameplay rules, history, or variations**, route to `/blog/official-truth-or-dare-rules`.
3. **Query Parameter Canonicalization:**
   URL variations such as `/games/truth-or-dare?category=couples-flirty` declare canonical tags pointing cleanly to the parent canonical root or utilize unique indexable landing paths when distinct content warrants indexation.

