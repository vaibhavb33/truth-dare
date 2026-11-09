# Asteria Voice Synthesis API Specification & Security Report

**Task Reference:** Task 39 (Voice Playback Complete Diagnostic & Repair)  
**Endpoint:** `/api/voice/synthesize`  
**Security Standard:** Server-Authoritative Key Storage, Strict Privacy Guardrails, IP Rate Limiting  
**Date:** November 2026

---

## 1. API Endpoints

### 1.1 POST `/api/voice/synthesize`
Synthesizes speech audio for truth and dare prompts.

#### Request Headers
| Header | Value | Requirement |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Required |
| `x-forwarded-for` | `<client-ip>` | Extracted for rate limiting |

#### Request Body
```json
{
  "text": "सच: क्या आपने कभी किसी दोस्त का कोई बड़ा राज छुपाया है?",
  "language": "hi",
  "rate": 1.0,
  "voiceId": "hi-IN-Neural2-A",
  "isCustom": false
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `text` | `string` | **Yes** | Text to vocalize. Maximum length: 500 characters. |
| `language` | `string` | No | Target language code (`en`, `hi`, `es`, `pt`, `fr`, `id`, `ar`, `de`). Defaults to `en`. |
| `rate` | `number` | No | Speaking speed multiplier between `0.5` and `2.0`. Defaults to `1.0`. |
| `voiceId` | `string` | No | Specific neural speaker ID from catalog. |
| `isCustom` | `boolean`| No | Flag denoting user-created Custom Deck content. Bypasses public caching. |

#### Successful Response (`200 OK`)
Returns the binary audio stream (WAV or MP3).

```http
HTTP/1.1 200 OK
Content-Type: audio/wav
Content-Length: 48234
Cache-Control: public, max-age=604800, immutable
X-Asteria-Voice-Engine: neural
X-Asteria-Voice-Provider: google
X-Asteria-Voice-Cached: true
X-Asteria-Voice-Id: hi-IN-Neural2-A
```

*Note: For Custom Deck questions (`isCustom: true`), `Cache-Control` is strictly set to `private, no-cache, no-store, must-revalidate`.*

#### Error Responses
- **`400 Bad Request`:** Empty prompt, whitespace only, or prompt exceeds 500 characters.
  ```json
  { "error": "Text cannot be empty.", "fallback": true }
  ```
- **`429 Too Many Requests`:** IP rate limit exceeded (>30 synthesis calls / minute).
  ```json
  {
    "error": "Voice synthesis rate limit exceeded. Please wait a moment.",
    "fallback": true,
    "retryAfter": 42
  }
  ```
- **`503 Service Unavailable`:** Upstream neural provider offline or failed. Triggers transparent browser speech fallback on the client.
  ```json
  { "error": "Upstream neural voice service timeout", "fallback": true }
  ```

---

### 1.2 GET `/api/voice/synthesize`
Queries available neural providers and registered speaker catalogs.

#### Query Parameters
- `language` *(optional)*: Filter voices by BCP-47 language tag (e.g. `?language=hi`).

#### Response (`200 OK`)
```json
{
  "provider": "google",
  "available": true,
  "voices": [
    {
      "id": "hi-IN-Neural2-A",
      "name": "Google Hindi Neural2 (Female)",
      "language": "hi",
      "gender": "female",
      "sampleRate": 24000
    },
    {
      "id": "hi-IN-Neural2-B",
      "name": "Google Hindi Neural2 (Male)",
      "language": "hi",
      "gender": "male",
      "sampleRate": 24000
    }
  ]
}
```

---

## 2. Privacy, Security & Resource Governance

1. **Zero Secret Exposure in Client Code:**
   No cloud API keys (`GOOGLE_TTS_API_KEY`, `AZURE_SPEECH_KEY`, `ELEVENLABS_API_KEY`) are exposed in browser bundles, environment variables prefixed with `NEXT_PUBLIC_`, or network payloads. Synthesis is strictly executed on the server.
2. **Absolute Privacy for Custom Decks:**
   Private user-authored Truth & Dare questions are marked with `isCustom: true`. The in-memory LRU `VoiceCache` explicitly bypasses disk/memory caching for custom questions. Audio responses return `no-store, private` headers, preventing CDN, proxy, or server-side retention of personal party questions.
3. **Abuse Protection & Rate Limiting:**
   Each client IP is limited to 30 neural synthesis requests per minute. Prompts are capped at 500 characters to prevent runaway token expenditure.
