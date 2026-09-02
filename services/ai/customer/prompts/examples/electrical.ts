export const ELECTRICAL_EXAMPLES = `
=========================
ELECTRICAL EXAMPLES
=========================

Example 1

Customer:

"My wall socket is sparking."

Assistant:

{
  "action":"emergency",
  "response":"A sparking socket can indicate a dangerous electrical fault. Stop using the socket immediately. If it is safe to do so, switch off the power at the main breaker for that circuit. Do not touch exposed wiring or continue using the socket until it has been inspected.",
  "normalizedQuery":"electrical socket sparking",
  "language":"en",
  "categoryId":"electrical",
  "subcategoryId":"socket_repair",
  "urgency":"high",
  "estimate":{
    "minimumPrice":8000,
    "maximumPrice":25000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Medium",
    "confidence":90
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Electrician",
    "materials":["Electrical socket"],
    "tools":["Voltage tester"],
    "maintenanceTips":["Replace damaged sockets immediately and avoid overloading them."],
    "marketplaceItems":["Electrical socket"]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Electricians"
}

Example 2

Customer:

"My living room light is not turning on."

Assistant:

{
  "action":"find_service",
  "response":"The problem may be caused by a faulty bulb, a damaged switch or a tripped breaker. Start by safely testing the bulb with another working fitting. If the breaker keeps tripping or replacing the bulb does not solve the issue, an electrician should inspect the circuit.",
  "normalizedQuery":"light not working",
  "language":"en",
  "categoryId":"electrical",
  "subcategoryId":"lighting_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":3000,
    "maximumPrice":15000,
    "currency":"NGN",
    "estimatedTime":"20-60 minutes",
    "difficulty":"Easy",
    "confidence":82
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Electrician",
    "materials":["Light bulb"],
    "tools":["Screwdriver"],
    "maintenanceTips":["Use bulbs with the correct wattage."],
    "marketplaceItems":["LED bulb"]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Electricians"
}

Example 3

Customer:

"I got an electric shock when I touched my fridge."

Assistant:

{
  "action":"emergency",
  "response":"An electric shock from a refrigerator is dangerous. Stop using the appliance immediately and disconnect power only if it is safe to do so. Do not continue touching the appliance until it has been inspected by a qualified technician.",
  "normalizedQuery":"fridge electric shock",
  "language":"en",
  "categoryId":"electrical",
  "subcategoryId":"electrical_fault",
  "urgency":"high",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":30000,
    "currency":"NGN",
    "estimatedTime":"1-2 hours",
    "difficulty":"Hard",
    "confidence":94
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Electrician",
    "materials":[],
    "tools":["Voltage tester"],
    "maintenanceTips":["Ensure appliances are properly earthed and inspected if you ever feel an electric shock."],
    "marketplaceItems":[]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Electricians"
}

Example 4

Customer:

"Soket dina yana yin walƙiya."

Assistant:

{
  "action":"emergency",
  "response":"Na gane. Idan socket ɗinka yana yin walƙiya, wannan na iya zama haɗari. Ka daina amfani da socket ɗin nan take. Idan yana da aminci, kashe breaker ɗin da ke ba shi wuta. Kada ka taɓa wayoyin da suka bayyana. Ka kira ƙwararren electrician ya duba shi kafin a sake amfani da socket ɗin.",
  "normalizedQuery":"electrical socket sparking",
  "language":"ha",
  "categoryId":"electrical",
  "subcategoryId":"socket_repair",
  "urgency":"high",
  "estimate":{
    "minimumPrice":8000,
    "maximumPrice":25000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Medium",
    "confidence":94
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Electrician",
    "materials":[
      "Electrical socket"
    ],
    "tools":[
      "Voltage tester"
    ],
    "maintenanceTips":[
      "Ka guji ɗora kayan lantarki masu yawa a socket ɗaya."
    ],
    "marketplaceItems":[
      "Electrical socket"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren Electrician"
}

Example 5

Customer:

"My socket dey spark."

Assistant:

{
  "action":"emergency",
  "response":"No wahala, but this one fit dangerous. Stop using the socket immediately. If e safe, switch off the breaker supplying that socket. No touch any exposed wire until verified electrician inspect am.",
  "normalizedQuery":"electrical socket sparking",
  "language":"pcm",
  "categoryId":"electrical",
  "subcategoryId":"socket_repair",
  "urgency":"high",
  "estimate":{
    "minimumPrice":8000,
    "maximumPrice":25000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Medium",
    "confidence":94
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Electrician",
    "materials":[
      "Electrical socket"
    ],
    "tools":[
      "Voltage tester"
    ],
    "maintenanceTips":[
      "Avoid overloading one socket with many appliances."
    ],
    "marketplaceItems":[
      "Electrical socket"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Electricians"
}

Example 6

Customer:

"Socket mi ń ṣe iná."

Assistant:

{
  "action":"emergency",
  "response":"Mo ti gbọ́. Bí socket rẹ bá ń ṣe iná, ó lè jẹ́ ìṣòro tó lewu. Dáwọ́ lílo rẹ dúró lẹ́sẹ̀kẹsẹ̀. Tí ó bá jẹ́ ailewu, pa breaker tó ń fún un ní iná. Má ṣe fi ọwọ́ kan waya tí ó hàn gbangba. Kí onímọ̀ ina ṣàyẹ̀wò rẹ kí ẹ tó tún lò ó.",
  "normalizedQuery":"electrical socket sparking",
  "language":"yo",
  "categoryId":"electrical",
  "subcategoryId":"socket_repair",
  "urgency":"high",
  "estimate":{
    "minimumPrice":8000,
    "maximumPrice":25000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Medium",
    "confidence":94
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Electrician",
    "materials":[
      "Electrical socket"
    ],
    "tools":[
      "Voltage tester"
    ],
    "maintenanceTips":[
      "Má ṣe so ọpọlọpọ ohun èlò mọ́ socket kan ṣoṣo."
    ],
    "marketplaceItems":[
      "Electrical socket"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Wa Onímọ̀ Ina"
}

Example 7

Customer:

"Socket m na-eme spark."

Assistant:

{
  "action":"emergency",
  "response":"Aghọtara m. Ọ bụrụ na socket gị na-eme spark, nke a nwere ike ịdị ezigbo ize ndụ. Kwụsị iji socket ahụ ozugbo. Ọ bụrụ na ọ dị mma ime ya, gbanyụọ breaker nke na-enye ya ọkụ. Emetụla waya ọ bụla pụtara ìhè. Kpọọ onye ọkachamara n'ọrụ eletrik ka ọ nyochaa ya tupu eji ya ọzọ.",
  "normalizedQuery":"electrical socket sparking",
  "language":"ig",
  "categoryId":"electrical",
  "subcategoryId":"socket_repair",
  "urgency":"high",
  "estimate":{
    "minimumPrice":8000,
    "maximumPrice":25000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Medium",
    "confidence":95
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Electrician",
    "materials":[
      "Electrical socket"
    ],
    "tools":[
      "Voltage tester"
    ],
    "maintenanceTips":[
      "Ejikọla ọtụtụ ngwaọrụ eletrik n'otu socket."
    ],
    "marketplaceItems":[
      "Electrical socket"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Chọta Ndị Ọrụ Eletrik"
}

Example 8

Customer:

"Socket dina no dey work."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan socket ɗinka baya aiki, matsalar na iya kasancewa daga breaker, wiring ko socket ɗin kansa. Da farko ka gwada wani socket daban domin tabbatar da matsalar. Idan har yanzu bai yi aiki ba, yana da kyau ƙwararren electrician ya duba shi.",
  "normalizedQuery":"electrical socket not working",
  "language":"ha",
  "categoryId":"electrical",
  "subcategoryId":"socket_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":5000,
    "maximumPrice":20000,
    "currency":"NGN",
    "estimatedTime":"30-60 minutes",
    "difficulty":"Easy",
    "confidence":92
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Electrician",
    "materials":[
      "Electrical socket"
    ],
    "tools":[
      "Voltage tester",
      "Screwdriver"
    ],
    "maintenanceTips":[
      "Ka dinga duba sockets lokaci-lokaci domin gano matsala tun da wuri."
    ],
    "marketplaceItems":[
      "Electrical socket"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren Electrician"
}

Example 9

Customer:

"My light no dey come on."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your light no dey come on, e fit be bad bulb, faulty switch, tripped breaker or wiring problem. Try another working bulb first. If e still no work, make verified electrician inspect the circuit.",
  "normalizedQuery":"light not working",
  "language":"pcm",
  "categoryId":"electrical",
  "subcategoryId":"lighting_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":3000,
    "maximumPrice":15000,
    "currency":"NGN",
    "estimatedTime":"20-60 minutes",
    "difficulty":"Easy",
    "confidence":90
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Electrician",
    "materials":[
      "LED bulb",
      "Light switch"
    ],
    "tools":[
      "Voltage tester",
      "Screwdriver"
    ],
    "maintenanceTips":[
      "Use quality LED bulbs and avoid overloading electrical circuits."
    ],
    "marketplaceItems":[
      "LED bulb",
      "Light switch"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Electricians"
}

Example 10

Customer:

"My house dey smell like burning wire."

Assistant:

{
  "action":"emergency",
  "response":"This could be a serious electrical emergency. If it is safe to do so, switch off the main electrical breaker immediately. Do not continue using electrical appliances or touch exposed wires. A burning wire smell may indicate overheating cables or an electrical fire risk. Contact a qualified electrician as soon as possible.",
  "normalizedQuery":"burning electrical wire smell",
  "language":"en",
  "categoryId":"electrical",
  "subcategoryId":"electrical_fire_risk",
  "urgency":"high",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":50000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Hard",
    "confidence":99
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Electrician",
    "materials":[
      "Electrical cable",
      "Circuit breaker",
      "Electrical connector"
    ],
    "tools":[
      "Voltage tester",
      "Insulation tester",
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Never ignore a burning smell from electrical wiring. Schedule regular electrical inspections and replace damaged wiring immediately."
    ],
    "marketplaceItems":[
      "Electrical cable",
      "Circuit breaker"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Electricians"
}

`.trim();