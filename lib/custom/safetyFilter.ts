/**
 * Asteria Custom Deck Content Safety Filter
 * Prevents dangerous, illegal, and non-consensual truth and dare prompts
 */

export interface SafetyCheckResult {
  isValid: boolean;
  category?: 'violence_harm' | 'illegal_activity' | 'non_consensual' | 'hate_harassment' | 'dangerous_physical';
  reason?: string;
}

// Prohibited pattern rules across supported languages
const PROHIBITED_RULES: Array<{
  category: SafetyCheckResult['category'];
  reason: string;
  patterns: RegExp[];
}> = [
  {
    category: 'violence_harm',
    reason: 'Prompts involving physical injury, self-harm, or severe bodily violence are prohibited.',
    patterns: [
      /\b(kill\s+(yourself|someone)|suicide|commit\s+suicide|self-harm|cut\s+(yourself|your\s+wrists)|overdose)\b/i,
      /\b(आत्महत्या|खुद\s*को\s*मारो|हाथ\s*काटो)\b/i,
      /\b(suicidio|cortarse|hacerse\s+daño|matate)\b/i,
      /\b(suicídio|cortar\s+os\s+pulsos|matar-se)\b/i,
      /\b(suicide|se\s+blesser|se\s+tuer)\b/i,
      /\b(selbstmord|ritzen|umbringen)\b/i,
      /\b(bunuh\s+diri|melukai\s+diri)\b/i,
      /\b(انتحار|قتل\s+النفس|أذى\s+النفس)\b/i,
    ],
  },
  {
    category: 'dangerous_physical',
    reason: 'Dangerous physical stunts, consuming hazardous chemicals/poisons, or fire hazards are prohibited.',
    patterns: [
      /\b(swallow\s+(glass|bleach|detergent|poison|razor|pins|pills))\b/i,
      /\b(drink\s+(bleach|gasoline|petrol|poison|antifreeze|detergent))\b/i,
      /\b(set\s+.*on\s+fire|in\s+brand\s+stecken|mettre\s+le\s+feu|prender\s+fuego|आग\s+लगाओ)\b/i,
      /\b(touch\s+.*(live\s+wire|electric\s+fence|socket\s+with\s+metal))\b/i,
      /\b(jump\s+off\s+a\s+(moving\s+car|cliff|roof|bridge))\b/i,
      /\b(जहर\s+पियो|ब्लीच|चलती\s+गाड़ी\s+से\s+कूदो)\b/i,
      /\b(beber\s+(lejía|veneno|gasolina))\b/i,
      /\b(boire\s+(de\s+l'eau\s+de\s+javel|poison))\b/i,
      /\b(trinken\s+(bleichmittel|gift))\b/i,
      /\b(minum\s+(racun|pemutih)|bakar\s+diri)\b/i,
      /\b(شرب\s+السم|إشعال\s+النار)\b/i,
    ],
  },
  {
    category: 'illegal_activity',
    reason: 'Prompts promoting criminal offenses, driving under the influence, theft, or vandalism are prohibited.',
    patterns: [
      /\b(drive\s+(drunk|intoxicated)|drink\s+and\s+drive)\b/i,
      /\b(steal\s+(from|a|money|car)|shoplift|rob\s+a|vandalize|slash\s+tires)\b/i,
      /\b(doxx|swat\s+someone|steal\s+credit\s+card|hack\s+into)\b/i,
      /\b(चोरी\s+करो|शराब\s+पीकर\s+गाड़ी\s+चलाओ)\b/i,
      /\b(conducir\s+borracho|robar\s+en|pinchar\s+ruedas)\b/i,
      /\b(conduire\s+ivre|voler\s+dans|pirater)\b/i,
      /\b(betrunken\s+fahren|stehlen|einbrechen)\b/i,
      /\b(menyetir\s+mabuk|mencuri|merusak)\b/i,
      /\b(القيادة\s+تحت\s+تأثير|سرقة|تخريب)\b/i,
    ],
  },
  {
    category: 'non_consensual',
    reason: 'Non-consensual physical contact, sharing private media without consent, or harassment is strictly prohibited.',
    patterns: [
      /\b(touch\s+.*without\s+(consent|permission))\b/i,
      /\b(share\s+.*(nudes|private\s+photos|intimate\s+photos).*without\s*(consent|permission)?)\b/i,
      /\b(grope|blackmail\s+someone|strip\s+someone\s+without)\b/i,
      /\b(take\s+off\s+.*clothes\s+without)\b/i,
      /\b(बिना\s+सहमति\s+के\s+छूना|निजी\s+तस्वीरें\s+भेजना)\b/i,
      /\b(tocar\s+.*sin\s+consentimiento|fotos\s+íntimas\s+sin\s+permiso)\b/i,
      /\b(toucher\s+.*sans\s+consentement|photos\s+intimes\s+sans\s+accord)\b/i,
      /\b(anfassen\s+.*ohne\s+zustimmung|intime\s+fotos\s+verbreiten)\b/i,
      /\b(menyentuh\s+.*tanpa\s+izin|foto\s+pribadi\s+tanpa\s+izin)\b/i,
      /\b(لمس\s+.*دون\s+موافقة|نشر\s+صور\s+خاصة\s+بدون\s+إذن)\b/i,
    ],
  },
  {
    category: 'hate_harassment',
    reason: 'Hate speech, slurs, severe harassment, or targeted identity-based attacks are prohibited.',
    patterns: [
      /\b(nazi|white\s+supremacy|terrorist\s+attack|bomb\s+threat)\b/i,
      /\b(kill\s+all\s+(gays|trans|muslims|jews|blacks|whites|immigrants))\b/i,
    ],
  },
];

/**
 * Validates a custom question string for content safety
 */
export function validateQuestionSafety(prompt: string): SafetyCheckResult {
  const clean = (prompt || '').trim();
  if (!clean) {
    return { isValid: false, reason: 'Write a question before adding it.' };
  }

  for (const rule of PROHIBITED_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(clean)) {
        return {
          isValid: false,
          category: rule.category,
          reason: rule.reason,
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Validates full custom question constraints (empty, duplicates, length, and safety)
 */
export function validateCustomQuestion(
  prompt: string,
  existingPrompts: string[] = [],
  maxLength: number = 250
): { isValid: boolean; error?: string } {
  const raw = prompt ?? '';
  const clean = raw.trim();

  // 1. Empty Check
  if (!clean) {
    if (raw.length > 0) {
      return { isValid: false, error: 'Your question cannot contain only spaces.' };
    }
    return { isValid: false, error: 'Write a question before adding it.' };
  }

  // 2. Length Check
  if (clean.length > maxLength) {
    return {
      isValid: false,
      error: `Maximum ${maxLength} characters allowed.`,
    };
  }

  // 3. Duplicate Check
  const normalized = clean.toLowerCase();
  const isDuplicate = existingPrompts.some((p) => p.trim().toLowerCase() === normalized);
  if (isDuplicate) {
    return { isValid: false, error: 'This question is already in your deck.' };
  }

  // 4. Content Safety Check
  const safety = validateQuestionSafety(clean);
  if (!safety.isValid) {
    return { isValid: false, error: safety.reason || 'This question contains prohibited content.' };
  }

  return { isValid: true };
}
