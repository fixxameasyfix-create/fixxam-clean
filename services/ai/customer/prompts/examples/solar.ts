export const SOLAR_EXAMPLES = `
=========================
SOLAR SYSTEM EXAMPLES
=========================

Example 1

Customer:

"My solar panels are not charging the battery."

Assistant:

{
  "action":"find_service",
  "response":"I understand. If your solar panels are not charging the battery, the problem may be caused by dirty panels, loose wiring, a faulty charge controller or poor sunlight. You can safely check whether the panels are clean and free from shade. If the problem continues, it is best to have a qualified solar technician inspect the system.",
  "normalizedQuery":"solar panels not charging battery",
  "language":"en",
  "categoryId":"solar",
  "subcategoryId":"panel_not_charging",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":60000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":92
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "MC4 connector",
      "Solar cable"
    ],
    "tools":[
      "Multimeter",
      "Solar tester"
    ],
    "maintenanceTips":[
      "Clean the solar panels regularly and avoid shade covering them."
    ],
    "marketplaceItems":[
      "MC4 connector",
      "Solar cable"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Solar Technicians"
}

Example 2

Customer:

"Inverter dina baya kunna."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan inverter ɗinka baya kunna, matsalar na iya kasancewa daga batir, fuse, wiring ko inverter ɗin kansa. Ka fara tabbatar da cewa batir yana da caji kuma babu fuse da ya ƙone. Idan har yanzu bai kunna ba, yana da kyau ƙwararren solar technician ya duba shi.",
  "normalizedQuery":"inverter not powering on",
  "language":"ha",
  "categoryId":"solar",
  "subcategoryId":"inverter_fault",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":15000,
    "maximumPrice":70000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":90
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "Fuse"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Ka rika duba haɗin batir da fuse lokaci-lokaci."
    ],
    "marketplaceItems":[
      "Fuse"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren Solar Technician"
}

Example 3

Customer:

"My inverter no dey power my house."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your inverter no dey supply power, e fit be low battery, blown fuse, overload or inverter fault. First reduce the load and check whether the battery dey charged. If e still no work, make verified solar technician inspect am.",
  "normalizedQuery":"inverter not supplying power",
  "language":"pcm",
  "categoryId":"solar",
  "subcategoryId":"inverter_fault",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":15000,
    "maximumPrice":70000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":91
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "Fuse"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Avoid overloading your inverter and service the batteries regularly."
    ],
    "marketplaceItems":[
      "Fuse"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Solar Technicians"
}

Example 4

Customer:

"My solar battery drains too fast."

Assistant:

{
  "action":"find_service",
  "response":"I understand. If your solar battery drains much faster than usual, the battery may be aging, the charging system may not be working properly or the connected load may be too high. You can safely reduce unnecessary appliances and observe whether the battery lasts longer. If the problem continues, a qualified solar technician should inspect the battery and charging system.",
  "normalizedQuery":"solar battery drains quickly",
  "language":"en",
  "categoryId":"solar",
  "subcategoryId":"battery_problem",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":80000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":91
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "Battery terminal",
      "Battery cable"
    ],
    "tools":[
      "Battery tester",
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Avoid discharging the battery completely and inspect battery terminals regularly."
    ],
    "marketplaceItems":[
      "Battery cable",
      "Battery terminal"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Solar Technicians"
}

Example 5

Customer:

"Batirin solar dina yana zafi sosai."

Assistant:

{
  "action":"emergency",
  "response":"Na gane. Idan batirin solar yana yin zafi sosai, wannan na iya zama haɗari. Kashe tsarin idan yana da aminci ka yi haka, kuma kada ka taɓa batirin idan yana kumbura ko yana fitar da wari. Kada ka ci gaba da amfani da tsarin har sai ƙwararren solar technician ya duba shi.",
  "normalizedQuery":"solar battery overheating",
  "language":"ha",
  "categoryId":"solar",
  "subcategoryId":"battery_overheating",
  "urgency":"high",
  "estimate":{
    "minimumPrice":20000,
    "maximumPrice":100000,
    "currency":"NGN",
    "estimatedTime":"1-4 hours",
    "difficulty":"Hard",
    "confidence":96
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "Battery terminal",
      "Battery fuse"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Ka rika duba yanayin batiri lokaci-lokaci kuma kada ka rufe wurin da iska ba ta shiga."
    ],
    "marketplaceItems":[
      "Battery fuse"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren Solar Technician"
}

Example 6

Customer:

"My inverter no dey change to battery when light go."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your inverter no dey switch to battery when public power goes off, the problem fit come from the changeover circuit, battery connection or inverter settings. Avoid opening the inverter yourself. Make verified solar technician inspect the system to prevent further damage.",
  "normalizedQuery":"automatic inverter changeover not working",
  "language":"pcm",
  "categoryId":"solar",
  "subcategoryId":"automatic_changeover_fault",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":15000,
    "maximumPrice":70000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":90
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "Changeover relay",
      "Fuse"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Service your inverter regularly and check battery connections for corrosion."
    ],
    "marketplaceItems":[
      "Changeover relay",
      "Fuse"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Solar Technicians"
}

Example 7

Customer:

"Solar mi ò ń gba charge dáadáa."

Assistant:

{
  "action":"find_service",
  "response":"Mo ti gbọ́. Bí solar system rẹ kò bá ń gba charge dáadáa, ó ṣeé ṣe kí panel náà dọti, wiring rẹ ní ìṣòro tàbí charge controller kò ṣiṣẹ́ dáadáa. O lè fọ panel náà bí ó bá dọti. Tí ìṣòro náà bá tẹ̀síwájú, ó dára kí onímọ̀ solar ṣàyẹ̀wò rẹ.",
  "normalizedQuery":"solar panel not charging properly",
  "language":"yo",
  "categoryId":"solar",
  "subcategoryId":"panel_not_charging",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":60000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":91
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "MC4 connector",
      "Solar cable"
    ],
    "tools":[
      "Digital multimeter",
      "Solar tester"
    ],
    "maintenanceTips":[
      "Máa fọ panel solar rẹ ní gbogbo oṣù kí ó lè gba oorun dáadáa."
    ],
    "marketplaceItems":[
      "MC4 connector"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Wa Onímọ̀ Solar Tó Wà Nítòsí"
}

Example 8

Customer:

"Solar m anaghị echa batrị."

Assistant:

{
  "action":"find_service",
  "response":"Aghọtara m. Ọ bụrụ na solar gị anaghị echa batrị, nsogbu ahụ nwere ike ịbụ panel ruru unyi, charge controller mebiri emebi ma ọ bụ wiring nwere nsogbu. Lelee ma panel dị ọcha. Ọ bụrụ na nsogbu ahụ gara n'ihu, kpọọ onye ọkachamara na solar.",
  "normalizedQuery":"solar battery not charging",
  "language":"ig",
  "categoryId":"solar",
  "subcategoryId":"battery_not_charging",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":60000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":90
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "Solar cable",
      "MC4 connector"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Na-ehicha panel solar mgbe niile ka ọ na-arụ ọrụ nke ọma."
    ],
    "marketplaceItems":[
      "Solar cable"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Chọta Ndị Ọrụ Solar Dị Nso"
}

Example 9

Customer:

"Solar dina no dey charge battery."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan solar ɗinka baya cajin batiri, matsalar na iya kasancewa daga panel, charge controller ko wiring. Ka fara tabbatar panel yana samun hasken rana sosai. Idan matsalar ta ci gaba, zan iya taimaka maka samun ƙwararren solar technician.",
  "normalizedQuery":"solar battery not charging",
  "language":"ha",
  "categoryId":"solar",
  "subcategoryId":"battery_not_charging",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":60000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":91
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "MC4 connector",
      "Solar cable"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Ka rika tsaftace panel domin ya ci gaba da karɓar hasken rana sosai."
    ],
    "marketplaceItems":[
      "MC4 connector"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren Solar Technician"
}

Example 10

Customer:

"My solar battery dey swell."

Assistant:

{
  "action":"emergency",
  "response":"This is a serious safety concern. A swollen solar battery can fail or become dangerous. Switch off the solar system if it is safe to do so. Do not continue charging or using the battery, and do not puncture or open it. Arrange for a qualified solar technician to inspect and replace the battery if necessary.",
  "normalizedQuery":"swollen solar battery",
  "language":"en",
  "categoryId":"solar",
  "subcategoryId":"battery_swollen",
  "urgency":"high",
  "estimate":{
    "minimumPrice":30000,
    "maximumPrice":200000,
    "currency":"NGN",
    "estimatedTime":"1-4 hours",
    "difficulty":"Hard",
    "confidence":98
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "Replacement battery"
    ],
    "tools":[
      "Battery tester",
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Inspect batteries regularly for heat, swelling or leakage and replace damaged batteries immediately."
    ],
    "marketplaceItems":[
      "Replacement battery"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Solar Technicians"
}

Example 11

Customer:

"My solar inverter is showing overload."

Assistant:

{
  "action":"fix_yourself",
  "response":"I understand. An overload warning usually means the connected appliances are drawing more power than the inverter can safely supply. Switch off some appliances and restart the inverter. If the warning keeps appearing even with a small load, a qualified solar technician should inspect the inverter.",
  "normalizedQuery":"solar inverter overload",
  "language":"en",
  "categoryId":"solar",
  "subcategoryId":"inverter_overload",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":5000,
    "maximumPrice":30000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Easy",
    "confidence":92
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "Circuit breaker"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Do not connect appliances whose total power exceeds the inverter rating."
    ],
    "marketplaceItems":[
      "Circuit breaker"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Solar Technicians"
}

Example 12

Customer:

"Solar dina tana kashewa da kanta."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan tsarin solar yana kashewa da kansa, matsalar na iya kasancewa daga ƙarancin cajin batiri, overload ko matsalar inverter. Ka rage kayan da suke amfani da wuta sannan ka sake gwadawa. Idan matsalar ta ci gaba, ƙwararren solar technician ya kamata ya duba tsarin.",
  "normalizedQuery":"solar system shutting down",
  "language":"ha",
  "categoryId":"solar",
  "subcategoryId":"system_shutdown",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":50000,
    "currency":"NGN",
    "estimatedTime":"1-2 hours",
    "difficulty":"Medium",
    "confidence":90
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "Battery fuse"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Ka tabbatar batir yana samun cikakken caji kuma kada a yi overload."
    ],
    "marketplaceItems":[
      "Battery fuse"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren Solar Technician"
}

Example 13

Customer:

"My solar no dey charge well when sun dey."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your solar system no dey charge well even when sun dey, e fit be dirty panels, loose cable, faulty charge controller or damaged panel. Clean the panels first if e safe. If e still no improve, make verified solar technician inspect the system.",
  "normalizedQuery":"solar charging poorly",
  "language":"pcm",
  "categoryId":"solar",
  "subcategoryId":"poor_charging",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":60000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":91
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "MC4 connector",
      "Solar cable"
    ],
    "tools":[
      "Solar tester",
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Clean your solar panels regularly and inspect cables for loose connections."
    ],
    "marketplaceItems":[
      "MC4 connector",
      "Solar cable"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Solar Technicians"
}

Example 14

Customer:

"My solar panel glass is broken."

Assistant:

{
  "action":"find_service",
  "response":"I understand. A cracked solar panel can lose efficiency and may allow moisture to enter the panel. Avoid touching broken glass and do not attempt to repair the panel with glue or tape. A qualified solar technician should inspect the panel and determine whether replacement is necessary.",
  "normalizedQuery":"broken solar panel",
  "language":"en",
  "categoryId":"solar",
  "subcategoryId":"panel_damage",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":20000,
    "maximumPrice":180000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Hard",
    "confidence":95
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "Replacement solar panel"
    ],
    "tools":[
      "Solar tester"
    ],
    "maintenanceTips":[
      "Inspect solar panels regularly after heavy rain or storms."
    ],
    "marketplaceItems":[
      "Replacement solar panel"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Solar Technicians"
}

Example 15

Customer:

"Panel ɗin solar dina ya fashe."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan panel ɗin solar ya fashe, kada ka ci gaba da amfani da shi saboda ruwa na iya shiga ciki kuma hakan na iya ƙara lalata tsarin. Kada ka taɓa gilashin da ya fashe. Ka nemi ƙwararren solar technician ya duba shi.",
  "normalizedQuery":"broken solar panel",
  "language":"ha",
  "categoryId":"solar",
  "subcategoryId":"panel_damage",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":20000,
    "maximumPrice":180000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Hard",
    "confidence":95
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "Replacement solar panel"
    ],
    "tools":[
      "Solar tester"
    ],
    "maintenanceTips":[
      "Ka duba panel bayan iska mai ƙarfi ko ruwan sama mai yawa."
    ],
    "marketplaceItems":[
      "Replacement solar panel"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren Solar Technician"
}

Example 16

Customer:

"My solar system dey trip every time."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your solar system trips repeatedly, the cause fit be overload, faulty breaker, wiring problem or inverter fault. Reduce the electrical load and check whether the system still trips. If the problem continues, make verified solar technician inspect the entire system.",
  "normalizedQuery":"solar system keeps tripping",
  "language":"pcm",
  "categoryId":"solar",
  "subcategoryId":"system_tripping",
  "urgency":"high",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":70000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":93
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Solar Technician",
    "materials":[
      "Circuit breaker",
      "Fuse"
    ],
    "tools":[
      "Digital multimeter",
      "Solar tester"
    ],
    "maintenanceTips":[
      "Avoid connecting loads beyond the system capacity and service the inverter regularly."
    ],
    "marketplaceItems":[
      "Circuit breaker",
      "Fuse"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Solar Technicians"
}


`.trim();