export const PLUMBING_EXAMPLES = `
=========================
PLUMBING EXAMPLES
=========================

Example 1

Customer:

"My tap is leaking."

Assistant:

{
  "action":"fix_yourself",
  "response":"A leaking tap is usually caused by a worn washer, damaged cartridge or loose fitting. If you are comfortable using basic hand tools, you can safely turn off the water supply and inspect the tap. If the leak continues after replacing the worn parts, a plumber should inspect it.",
  "normalizedQuery":"leaking tap repair",
  "language":"en",
  "categoryId":"plumbing",
  "subcategoryId":"tap_repair",
  "urgency":"low",
  "estimate":{
    "minimumPrice":3000,
    "maximumPrice":10000,
    "currency":"NGN",
    "estimatedTime":"20-45 minutes",
    "difficulty":"Easy",
    "confidence":92
  },
  "recommendation":{
    "professionalRequired":false,
    "serviceCategory":"Plumber",
    "materials":[
      "Tap washer",
      "Tap cartridge"
    ],
    "tools":[
      "Adjustable spanner",
      "Screwdriver"
    ],
    "maintenanceTips":[
      "Avoid tightening the tap too hard as it wears the washer faster."
    ],
    "marketplaceItems":[
      "Tap washer",
      "Tap cartridge"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":false,
  "buttonLabel":""
}

Example 2

Customer:

"My kitchen pipe is leaking under the sink."

Assistant:

{
  "action":"find_service",
  "response":"A leak under the sink is commonly caused by a loose pipe connection, damaged seal or cracked pipe. You can place a bucket under the leak and avoid using the sink until it has been inspected. If tightening the connection does not stop the leak, a plumber is recommended.",
  "normalizedQuery":"kitchen pipe leak",
  "language":"en",
  "categoryId":"plumbing",
  "subcategoryId":"pipe_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":5000,
    "maximumPrice":20000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Medium",
    "confidence":88
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Plumber",
    "materials":[
      "PVC pipe",
      "Pipe connector",
      "PVC adhesive"
    ],
    "tools":[
      "Pipe wrench"
    ],
    "maintenanceTips":[
      "Inspect pipe joints regularly for small leaks."
    ],
    "marketplaceItems":[
      "PVC pipe",
      "PVC adhesive"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Plumbers"
}

Example 3

Customer:

"My toilet is blocked."

Assistant:

{
  "action":"fix_yourself",
  "response":"A blocked toilet is often caused by excessive tissue, foreign objects or waste build-up. If the water level is not rising dangerously, you can try using a toilet plunger. If the blockage does not clear or sewage begins to overflow, contact a plumber.",
  "normalizedQuery":"blocked toilet",
  "language":"en",
  "categoryId":"plumbing",
  "subcategoryId":"toilet_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":5000,
    "maximumPrice":15000,
    "currency":"NGN",
    "estimatedTime":"20-60 minutes",
    "difficulty":"Easy",
    "confidence":90
  },
  "recommendation":{
    "professionalRequired":false,
    "serviceCategory":"Plumber",
    "materials":[],
    "tools":[
      "Toilet plunger"
    ],
    "maintenanceTips":[
      "Avoid flushing wipes, sanitary products or other solid objects."
    ],
    "marketplaceItems":[
      "Toilet plunger"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":false,
  "buttonLabel":""
}
`.trim();