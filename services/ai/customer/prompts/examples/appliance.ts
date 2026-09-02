export const APPLIANCE_EXAMPLES = `
=========================
HOME APPLIANCE EXAMPLES
=========================

Example 1

Customer:

"My refrigerator is not cooling."

Assistant:

{
  "action":"find_service",
  "response":"I understand. If your refrigerator is no longer cooling, the problem may be caused by dirty condenser coils, a faulty thermostat, low refrigerant or a compressor fault. First, make sure the refrigerator is plugged in properly and the temperature setting has not changed. If it still does not cool, a qualified refrigerator technician should inspect it.",
  "normalizedQuery":"refrigerator not cooling",
  "language":"en",
  "categoryId":"appliance",
  "subcategoryId":"refrigerator_repair",
  "urgency":"normal",
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
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Thermostat",
      "Compressor relay"
    ],
    "tools":[
      "Digital multimeter",
      "Refrigeration gauge"
    ],
    "maintenanceTips":[
      "Clean the condenser coils regularly and avoid overloading the refrigerator."
    ],
    "marketplaceItems":[
      "Thermostat",
      "Compressor relay"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Refrigerator Technicians"
}

Example 2

Customer:

"Fridge dina baya yin sanyi."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan fridge ɗinka baya yin sanyi, matsalar na iya kasancewa daga thermostat, compressor, ƙarancin gas ko datti a condenser. Ka fara tabbatar cewa an kunna shi kuma an saita yanayin sanyi yadda ya kamata. Idan har yanzu bai yi sanyi ba, yana da kyau ƙwararren mai gyaran fridge ya duba shi.",
  "normalizedQuery":"refrigerator not cooling",
  "language":"ha",
  "categoryId":"appliance",
  "subcategoryId":"refrigerator_repair",
  "urgency":"normal",
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
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Thermostat",
      "Compressor relay"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Ka rika tsaftace condenser kuma kada ka cika fridge fiye da kima."
    ],
    "marketplaceItems":[
      "Thermostat",
      "Compressor relay"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Mai Gyaran Fridge"
}

Example 3

Customer:

"My washing machine no dey spin."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your washing machine no dey spin, e fit be because the load too much, the lid switch faulty, the drive belt bad or the motor get problem. Remove some clothes and try again. If e still no spin, make verified appliance technician check am.",
  "normalizedQuery":"washing machine not spinning",
  "language":"pcm",
  "categoryId":"appliance",
  "subcategoryId":"washing_machine_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":8000,
    "maximumPrice":45000,
    "currency":"NGN",
    "estimatedTime":"1-2 hours",
    "difficulty":"Medium",
    "confidence":91
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Drive belt",
      "Lid switch"
    ],
    "tools":[
      "Digital multimeter",
      "Screwdriver set"
    ],
    "maintenanceTips":[
      "No overload your washing machine and clean am regularly."
    ],
    "marketplaceItems":[
      "Drive belt",
      "Lid switch"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Appliance Technicians"
}

Example 4

Customer:

"My microwave is not heating."

Assistant:

{
  "action":"find_service",
  "response":"I understand. If your microwave turns on but does not heat food, the problem may be caused by a faulty magnetron, door switch, high-voltage diode or capacitor. Do not attempt to open the microwave because it contains high-voltage components that can remain dangerous even after it is unplugged. A qualified appliance technician should inspect it.",
  "normalizedQuery":"microwave not heating",
  "language":"en",
  "categoryId":"appliance",
  "subcategoryId":"microwave_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":50000,
    "currency":"NGN",
    "estimatedTime":"1-2 hours",
    "difficulty":"Hard",
    "confidence":94
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Magnetron",
      "Door switch"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Never operate a microwave when the door does not close properly."
    ],
    "marketplaceItems":[
      "Door switch"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Appliance Technicians"
}

Example 5

Customer:

"Cooker dina baya kunna."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan cooker ɗinka baya kunna, matsalar na iya kasancewa daga rashin wuta, fuse da ya ƙone, heating element ko internal wiring. Da farko ka tabbatar socket yana aiki kuma plug ɗin yana da kyau. Idan har yanzu bai kunna ba, yana da kyau ƙwararren mai gyaran kayan lantarki ya duba shi.",
  "normalizedQuery":"electric cooker not working",
  "language":"ha",
  "categoryId":"appliance",
  "subcategoryId":"electric_cooker_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":8000,
    "maximumPrice":45000,
    "currency":"NGN",
    "estimatedTime":"1-2 hours",
    "difficulty":"Medium",
    "confidence":92
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Heating element",
      "Fuse"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Ka guji amfani da cooker idan kana zargin akwai matsalar wuta."
    ],
    "marketplaceItems":[
      "Heating element",
      "Fuse"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Mai Gyaran Kayan Lantarki"
}

Example 6

Customer:

"My blender no dey blend."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your blender no dey blend, e fit be dull blade, overloaded jar, worn coupling or motor problem. Switch am off before checking anything. If the blade no dey rotate freely or the motor just dey hum, make appliance technician inspect am.",
  "normalizedQuery":"blender not blending",
  "language":"pcm",
  "categoryId":"appliance",
  "subcategoryId":"blender_repair",
  "urgency":"low",
  "estimate":{
    "minimumPrice":5000,
    "maximumPrice":25000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Easy",
    "confidence":91
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Blender blade",
      "Drive coupling"
    ],
    "tools":[
      "Screwdriver set"
    ],
    "maintenanceTips":[
      "No overload your blender and always clean the blade after use."
    ],
    "marketplaceItems":[
      "Blender blade",
      "Drive coupling"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Appliance Technicians"
}

Example 7

Customer:

"My TV is on but the screen is black."

Assistant:

{
  "action":"find_service",
  "response":"I understand. If your TV has sound or the power light is on but the screen remains black, the problem may be caused by a faulty backlight, display panel, power board or internal connection. Try disconnecting the TV from power for a few minutes and reconnecting it. If the screen is still black, a qualified TV repair technician should inspect it.",
  "normalizedQuery":"tv black screen",
  "language":"en",
  "categoryId":"appliance",
  "subcategoryId":"television_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":90000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":93
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "LED backlight",
      "Power board"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Use a surge protector to reduce damage from unstable electricity."
    ],
    "marketplaceItems":[
      "Surge protector"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find TV Repair Technicians"
}

Example 8

Customer:

"Water dispenser dina baya sanyaya ruwa."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan water dispenser ɗinka baya sanyaya ruwa, matsalar na iya kasancewa daga compressor, thermostat ko cooling system. Ka tabbatar an kunna dispenser ɗin kuma yana samun isasshen iska a bayansa. Idan har yanzu baya sanyaya, ƙwararren mai gyaran kayan lantarki ya kamata ya duba shi.",
  "normalizedQuery":"water dispenser not cooling",
  "language":"ha",
  "categoryId":"appliance",
  "subcategoryId":"water_dispenser_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":8000,
    "maximumPrice":45000,
    "currency":"NGN",
    "estimatedTime":"1-2 hours",
    "difficulty":"Medium",
    "confidence":91
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Thermostat",
      "Compressor relay"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Ka tabbatar akwai sararin iska a bayan dispenser domin sanyaya ya yi aiki yadda ya kamata."
    ],
    "marketplaceItems":[
      "Thermostat"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Mai Gyaran Kayan Lantarki"
}

Example 9

Customer:

"My electric kettle no dey boil water."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your electric kettle no dey boil water, e fit be faulty heating element, bad thermostat or power connection problem. First check whether the socket dey work with another appliance. If the kettle still no heat, make appliance technician inspect am.",
  "normalizedQuery":"electric kettle not heating",
  "language":"pcm",
  "categoryId":"appliance",
  "subcategoryId":"electric_kettle_repair",
  "urgency":"low",
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
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Heating element",
      "Thermostat"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Always descale your kettle regularly and avoid boiling without enough water."
    ],
    "marketplaceItems":[
      "Heating element"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Appliance Technicians"
}

Example 10

Customer:

"My ceiling fan is not spinning."

Assistant:

{
  "action":"find_service",
  "response":"I understand. If your ceiling fan is not spinning, the problem may be caused by a faulty capacitor, worn motor, loose wiring or a defective speed regulator. Switch off the power before inspecting the fan. If the blades do not rotate freely or the fan only hums, a qualified technician should inspect it.",
  "normalizedQuery":"ceiling fan not spinning",
  "language":"en",
  "categoryId":"appliance",
  "subcategoryId":"ceiling_fan_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":5000,
    "maximumPrice":30000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Easy",
    "confidence":93
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Fan capacitor",
      "Speed regulator"
    ],
    "tools":[
      "Digital multimeter",
      "Screwdriver set"
    ],
    "maintenanceTips":[
      "Clean the fan regularly and tighten loose mounting screws."
    ],
    "marketplaceItems":[
      "Fan capacitor",
      "Speed regulator"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Appliance Technicians"
}

Example 11

Customer:

"Standing fan dina na yin ƙara sosai."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan standing fan ɗinka yana yin ƙara sosai, matsalar na iya kasancewa daga datti, bushings da suka lalace, ko kuma blades da suka yi sako-sako. Kashe fan ɗin kafin ka tsaftace shi. Idan ƙarar ta ci gaba, yana da kyau ƙwararren mai gyaran kayan lantarki ya duba shi.",
  "normalizedQuery":"standing fan making noise",
  "language":"ha",
  "categoryId":"appliance",
  "subcategoryId":"standing_fan_repair",
  "urgency":"low",
  "estimate":{
    "minimumPrice":4000,
    "maximumPrice":20000,
    "currency":"NGN",
    "estimatedTime":"30-60 minutes",
    "difficulty":"Easy",
    "confidence":92
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Fan bushing",
      "Fan blade"
    ],
    "tools":[
      "Screwdriver set",
      "Cleaning brush"
    ],
    "maintenanceTips":[
      "Ka rika tsaftace fan akai-akai kuma ka matse duk screws idan sun yi sako-sako."
    ],
    "marketplaceItems":[
      "Fan blade",
      "Fan bushing"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Mai Gyaran Kayan Lantarki"
}

Example 12

Customer:

"My water heater no dey hot again."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your water heater no dey heat water again, e fit be faulty heating element, bad thermostat or power supply problem. First check whether power dey reach the heater. If e still no heat, make verified appliance technician inspect am.",
  "normalizedQuery":"water heater not heating",
  "language":"pcm",
  "categoryId":"appliance",
  "subcategoryId":"water_heater_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":8000,
    "maximumPrice":40000,
    "currency":"NGN",
    "estimatedTime":"1-2 hours",
    "difficulty":"Medium",
    "confidence":93
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Heating element",
      "Thermostat"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Service your water heater regularly and avoid switching it on when the tank is empty."
    ],
    "marketplaceItems":[
      "Heating element",
      "Thermostat"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Appliance Technicians"
}

Example 13

Customer:

"My pressing iron is not heating."

Assistant:

{
  "action":"find_service",
  "response":"I understand. If your pressing iron is not heating, the problem may be caused by a faulty heating element, thermostat, power cord or plug. First, test the socket with another appliance. If the socket works but the iron still does not heat, a qualified appliance technician should inspect it.",
  "normalizedQuery":"electric iron not heating",
  "language":"en",
  "categoryId":"appliance",
  "subcategoryId":"electric_iron_repair",
  "urgency":"low",
  "estimate":{
    "minimumPrice":5000,
    "maximumPrice":25000,
    "currency":"NGN",
    "estimatedTime":"30-60 minutes",
    "difficulty":"Easy",
    "confidence":93
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Heating element",
      "Thermostat",
      "Power cord"
    ],
    "tools":[
      "Digital multimeter",
      "Screwdriver set"
    ],
    "maintenanceTips":[
      "Always unplug the iron after use and avoid wrapping the cord tightly around the appliance."
    ],
    "marketplaceItems":[
      "Power cord",
      "Thermostat"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Appliance Technicians"
}

Example 14

Customer:

"Air fryer dina baya aiki."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan air fryer ɗinka baya aiki, matsalar na iya kasancewa daga socket, fuse, heating element ko thermostat. Ka fara tabbatar socket yana aiki. Idan har yanzu air fryer bai kunna ba, yana da kyau ƙwararren mai gyaran kayan lantarki ya duba shi.",
  "normalizedQuery":"air fryer not working",
  "language":"ha",
  "categoryId":"appliance",
  "subcategoryId":"air_fryer_repair",
  "urgency":"low",
  "estimate":{
    "minimumPrice":7000,
    "maximumPrice":30000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Easy",
    "confidence":92
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Heating element",
      "Fuse"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Ka rika tsaftace air fryer bayan amfani kuma kada ka toshe ramukan iska."
    ],
    "marketplaceItems":[
      "Heating element",
      "Fuse"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Mai Gyaran Kayan Lantarki"
}

Example 15

Customer:

"Fridge dina no dey cool again."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Tunda fridge ɗinka no dey cool again, matsalar na iya kasancewa daga thermostat, compressor ko refrigerant. Ka fara tabbatar an saita temperature daidai kuma ƙofar fridge tana rufewa sosai. Idan matsalar ta ci gaba, zan iya taimaka maka samun ƙwararren mai gyaran fridge.",
  "normalizedQuery":"refrigerator not cooling",
  "language":"ha",
  "categoryId":"appliance",
  "subcategoryId":"refrigerator_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":70000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Medium",
    "confidence":94
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Thermostat",
      "Compressor relay"
    ],
    "tools":[
      "Digital multimeter",
      "Refrigeration gauge"
    ],
    "maintenanceTips":[
      "Ka rika tsaftace condenser kuma ka tabbatar ƙofar fridge tana rufewa sosai."
    ],
    "marketplaceItems":[
      "Thermostat",
      "Compressor relay"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Mai Gyaran Fridge"
}

Example 16

Customer:

"My microwave dey smell like something dey burn."

Assistant:

{
  "action":"emergency",
  "response":"This could be a serious electrical problem. Switch off the microwave immediately and unplug it if it is safe to do so. Do not continue using it, as a burning smell may indicate overheating electrical components or damaged wiring. Arrange for a qualified appliance technician to inspect it before using it again.",
  "normalizedQuery":"microwave burning smell",
  "language":"en",
  "categoryId":"appliance",
  "subcategoryId":"microwave_electrical_fault",
  "urgency":"high",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":50000,
    "currency":"NGN",
    "estimatedTime":"1-2 hours",
    "difficulty":"Hard",
    "confidence":98
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Appliance Repair Technician",
    "materials":[
      "Internal fuse",
      "High-voltage diode",
      "Magnetron"
    ],
    "tools":[
      "Digital multimeter"
    ],
    "maintenanceTips":[
      "Stop using any appliance immediately if you notice a burning smell or smoke."
    ],
    "marketplaceItems":[
      "Internal fuse"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Appliance Technicians"
}


`.trim();