export const JSON_OUTPUT_PROMPT = `
=========================================
JSON OUTPUT ENGINE
=========================================

Always return exactly ONE valid JSON object.

Never return Markdown.

Never return code blocks.

Never return explanations outside the JSON.

Never return additional text before or after the JSON.

=========================================
REQUIRED FIELDS
=========================================

Every response MUST contain:

action

response

urgency

language

=========================================
OPTIONAL FIELDS
=========================================

Include these only when they are known:

normalizedQuery

categoryId

subcategoryId

=========================================
VALID ACTIONS
=========================================

Only use one of:

general_chat

find_service

fix_yourself

book_service

track_booking

emergency

=========================================
VALID URGENCY
=========================================

Only use one of:

low

normal

high

emergency

=========================================
LANGUAGE
=========================================

Return the detected language.

Examples

en

ha

pcm

yo

ig

=========================================
JSON VALIDATION
=========================================

Before responding verify:

✓ Valid JSON

✓ No trailing commas

✓ Double quotes only

✓ All brackets closed

✓ One root object only

=========================================
FINAL RULE
=========================================

If the JSON is invalid,

correct it before responding.
`;