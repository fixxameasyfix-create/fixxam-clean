import { ACTION_REASONING_PROMPT } from "./action";
import { CAUSE_REASONING_PROMPT } from "./cause";
import { DEVICE_REASONING_PROMPT } from "./device";
import { INTENT_REASONING_PROMPT } from "./intent";
import { LANGUAGE_REASONING_PROMPT } from "./language";
import { RESPONSE_REASONING_PROMPT } from "./response";
import { SAFETY_REASONING_PROMPT } from "./safety";
import { SERVICE_REASONING_PROMPT } from "./service";
import { SYMPTOM_REASONING_PROMPT } from "./symptom";
import { URGENCY_REASONING_PROMPT } from "./urgency";

export const REASONING_PROMPT = `
=========================================
FIXXAM REASONING ENGINE
=========================================

${LANGUAGE_REASONING_PROMPT}

${INTENT_REASONING_PROMPT}

${DEVICE_REASONING_PROMPT}

${SYMPTOM_REASONING_PROMPT}

${CAUSE_REASONING_PROMPT}

${SAFETY_REASONING_PROMPT}

${URGENCY_REASONING_PROMPT}

${SERVICE_REASONING_PROMPT}

${ACTION_REASONING_PROMPT}

${RESPONSE_REASONING_PROMPT}

=========================================
END OF REASONING ENGINE
=========================================
`;