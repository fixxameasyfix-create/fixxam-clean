export const AC_EXAMPLES = `
=========================
AIR CONDITIONER EXAMPLES
=========================

Example 1

Customer:

"My AC is not cooling."

Assistant:

{
  "action":"find_service",
  "response":"I understand. If your AC is running but not cooling, the problem may be caused by a dirty air filter, low refrigerant, a faulty compressor or poor airflow. You can safely check whether the air filter is dirty and clean it if necessary. If the problem continues, it is best to have a qualified AC technician inspect the system.",
  "normalizedQuery":"air conditioner not cooling",
  "language":"en",
  "categoryId":"ac",
  "subcategoryId":"cooling_problem",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":50000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":90
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"AC Technician",
    "materials":[
      "Air filter",
      "Refrigerant (if required)"
    ],
    "tools":[
      "AC pressure gauge",
      "Thermometer"
    ],
    "maintenanceTips":[
      "Clean the air filter every one to three months for better cooling performance."
    ],
    "marketplaceItems":[
      "Air filter"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available AC Technicians"
}

Example 2

Customer:

"AC dina baya sanyaya."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan AC ɗinka baya sanyaya, matsalar na iya kasancewa daga datti a filter, ƙarancin refrigerant ko matsalar compressor. Za ka iya duba filter idan yana da datti ka tsaftace shi. Idan har yanzu bai fara sanyaya ba, yana da kyau ƙwararren AC technician ya duba shi.",
  "normalizedQuery":"air conditioner not cooling",
  "language":"ha",
  "categoryId":"ac",
  "subcategoryId":"cooling_problem",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":50000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":90
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"AC Technician",
    "materials":[
      "Air filter",
      "Refrigerant (if required)"
    ],
    "tools":[
      "AC pressure gauge"
    ],
    "maintenanceTips":[
      "Ka rika tsaftace filter lokaci-lokaci domin AC ya ci gaba da sanyaya yadda ya kamata."
    ],
    "marketplaceItems":[
      "Air filter"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren AC Technician"
}

Example 3

Customer:

"My AC no dey cool again."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your AC no dey cool again, e fit be dirty filter, low gas, faulty compressor or poor airflow. You fit first clean the filter if e dirty. If e still no cool after that, make verified AC technician check am.",
  "normalizedQuery":"air conditioner not cooling",
  "language":"pcm",
  "categoryId":"ac",
  "subcategoryId":"cooling_problem",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":50000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":90
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"AC Technician",
    "materials":[
      "Air filter",
      "Refrigerant (if required)"
    ],
    "tools":[
      "AC pressure gauge"
    ],
    "maintenanceTips":[
      "Clean your AC filter regularly make airflow no reduce."
    ],
    "marketplaceItems":[
      "Air filter"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available AC Technicians"
}

Example 4

Customer:

"My AC is leaking water."

Assistant:

{
  "action":"find_service",
  "response":"I understand. Water leaking from an air conditioner is commonly caused by a blocked drain pipe, a dirty filter or improper installation. You can safely switch off the AC and check whether the air filter needs cleaning. If the leak continues after cleaning the filter, a qualified AC technician should inspect the drainage system.",
  "normalizedQuery":"air conditioner leaking water",
  "language":"en",
  "categoryId":"ac",
  "subcategoryId":"water_leak",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":7000,
    "maximumPrice":25000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Easy",
    "confidence":91
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"AC Technician",
    "materials":[
      "Drain hose"
    ],
    "tools":[
      "Drain cleaning brush"
    ],
    "maintenanceTips":[
      "Clean the drain line and air filter regularly to prevent water leakage."
    ],
    "marketplaceItems":[
      "Drain hose"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available AC Technicians"
}

Example 5

Customer:

"AC dina na zubar da ruwa."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan AC ɗinka na zubar da ruwa, matsalar na iya kasancewa daga toshewar bututun drain, datti a filter ko kuma matsalar shigar AC. Kashe AC ɗin sannan ka duba filter idan yana buƙatar tsaftacewa. Idan ruwa ya ci gaba da zuba, yana da kyau ƙwararren AC technician ya duba shi.",
  "normalizedQuery":"air conditioner leaking water",
  "language":"ha",
  "categoryId":"ac",
  "subcategoryId":"water_leak",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":7000,
    "maximumPrice":25000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Easy",
    "confidence":91
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"AC Technician",
    "materials":[
      "Drain hose"
    ],
    "tools":[
      "Drain cleaning brush"
    ],
    "maintenanceTips":[
      "Ka rika tsaftace filter da drain lokaci-lokaci domin hana ruwa zubowa."
    ],
    "marketplaceItems":[
      "Drain hose"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren AC Technician"
}

Example 6

Customer:

"My AC dey leak water."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your AC dey leak water, e fit mean say the drain pipe block, the filter dirty or water no fit pass well. Switch off the AC first. If cleaning the filter no solve am, make verified AC technician inspect the drainage system.",
  "normalizedQuery":"air conditioner leaking water",
  "language":"pcm",
  "categoryId":"ac",
  "subcategoryId":"water_leak",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":7000,
    "maximumPrice":25000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Easy",
    "confidence":91
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"AC Technician",
    "materials":[
      "Drain hose"
    ],
    "tools":[
      "Drain cleaning brush"
    ],
    "maintenanceTips":[
      "Clean your AC filter and drain regularly make water no dey leak."
    ],
    "marketplaceItems":[
      "Drain hose"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available AC Technicians"
}

Example 7

Customer:

"AC mi ò tún n tútù mọ."

Assistant:

{
  "action":"find_service",
  "response":"Mo ti gbọ́. Bí AC rẹ kò bá tún n tútù mọ́, ó ṣeé ṣe kí filter rẹ dọti, refrigerant rẹ dín kù tàbí compressor ní ìṣòro. O lè ṣàyẹ̀wò kí o sì fọ filter náà bí ó bá dọti. Tí kò bá tún ṣiṣẹ́ dáadáa lẹ́yìn náà, ó dára kí onímọ̀ AC ṣàyẹ̀wò rẹ.",
  "normalizedQuery":"air conditioner not cooling",
  "language":"yo",
  "categoryId":"ac",
  "subcategoryId":"cooling_problem",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":50000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":90
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"AC Technician",
    "materials":[
      "Air filter",
      "Refrigerant (if required)"
    ],
    "tools":[
      "AC pressure gauge"
    ],
    "maintenanceTips":[
      "Máa fọ filter AC rẹ ní gbogbo oṣù díẹ̀ kí afẹ́fẹ́ lè máa jáde dáadáa."
    ],
    "marketplaceItems":[
      "Air filter"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Wa Onímọ̀ AC Tó Wà Nítòsí"
}

Example 8

Customer:

"AC m anaghị ajụ oyi."

Assistant:

{
  "action":"find_service",
  "response":"Aghọtara m. Ọ bụrụ na AC gị anaghị ajụ oyi, nsogbu ahụ nwere ike ịbụ filter ruru unyi, refrigerant belatara ma ọ bụ compressor nwere nsogbu. Ị nwere ike lelee ma hichaa filter ahụ. Ọ bụrụ na nsogbu ahụ gara n'ihu, kpọọ onye ọkachamara na AC.",
  "normalizedQuery":"air conditioner not cooling",
  "language":"ig",
  "categoryId":"ac",
  "subcategoryId":"cooling_problem",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":50000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":90
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"AC Technician",
    "materials":[
      "Air filter",
      "Refrigerant (if required)"
    ],
    "tools":[
      "AC pressure gauge"
    ],
    "maintenanceTips":[
      "Na-asacha filter AC mgbe niile ka ọ na-arụ ọrụ nke ọma."
    ],
    "marketplaceItems":[
      "Air filter"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Chọta Ndị Ọrụ AC Dị Nso"
}

Example 9

Customer:

"AC dina no dey cool."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Tunda AC ɗinka ba ya sanyaya, matsalar na iya kasancewa daga datti a filter, ƙarancin refrigerant ko matsalar compressor. Ka fara duba filter ɗin. Idan bai gyaru ba, zan iya taimaka maka samun ƙwararren AC technician.",
  "normalizedQuery":"air conditioner not cooling",
  "language":"ha",
  "categoryId":"ac",
  "subcategoryId":"cooling_problem",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":50000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":89
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"AC Technician",
    "materials":[
      "Air filter"
    ],
    "tools":[
      "AC pressure gauge"
    ],
    "maintenanceTips":[
      "Ka rika tsaftace filter lokaci-lokaci."
    ],
    "marketplaceItems":[
      "Air filter"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren AC Technician"
}

Example 10

Customer:

"My AC dey make loud noise."

Assistant:

{
  "action":"find_service",
  "response":"I understand. A loud noise from an AC may be caused by a loose fan blade, worn motor bearing, loose casing or debris inside the unit. Switch the AC off and avoid using it until the source of the noise is identified. Continued operation could cause further damage.",
  "normalizedQuery":"air conditioner making loud noise",
  "language":"en",
  "categoryId":"ac",
  "subcategoryId":"noise_problem",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":8000,
    "maximumPrice":35000,
    "currency":"NGN",
    "estimatedTime":"1-2 hours",
    "difficulty":"Medium",
    "confidence":88
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"AC Technician",
    "materials":[
      "Fan blade (if required)",
      "Motor bearing (if required)"
    ],
    "tools":[
      "Screwdriver",
      "AC service tools"
    ],
    "maintenanceTips":[
      "Service your AC regularly to prevent excessive wear and unusual noise."
    ],
    "marketplaceItems":[
      "Fan blade"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available AC Technicians"
}

`.trim();

