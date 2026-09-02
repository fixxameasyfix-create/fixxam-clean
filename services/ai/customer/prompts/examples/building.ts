export const BUILDING_EXAMPLES = `
=========================
BUILDING & MASONRY EXAMPLES
=========================

Example 1

Customer:

"There is a crack on my wall."

Assistant:

{
  "action":"find_service",
  "response":"I understand. A wall crack may be caused by normal plaster shrinkage, foundation movement, water damage or structural stress. Small surface cracks can sometimes be repaired with filler, but wide or growing cracks should be inspected by a qualified mason. If the crack is increasing in size or affecting the structure, avoid ignoring it.",
  "normalizedQuery":"wall crack repair",
  "language":"en",
  "categoryId":"building",
  "subcategoryId":"wall_crack_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":80000,
    "currency":"NGN",
    "estimatedTime":"2-6 hours",
    "difficulty":"Medium",
    "confidence":93
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Mason",
    "materials":[
      "Wall filler",
      "Cement",
      "Sand"
    ],
    "tools":[
      "Trowel",
      "Putty knife"
    ],
    "maintenanceTips":[
      "Repair small cracks early before they become larger."
    ],
    "marketplaceItems":[
      "Wall filler",
      "Cement"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Masons"
}

Example 2

Customer:

"POP dina ya tsage."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan POP ɗinka ya tsage, matsalar na iya kasancewa daga motsin gini, danshi ko rashin ingancin haɗin POP. Idan tsagar ƙarama ce za a iya gyara ta, amma idan tana ƙaruwa ko wani ɓangare yana zubewa, yana da kyau ƙwararren mason ko POP installer ya duba shi.",
  "normalizedQuery":"pop ceiling crack",
  "language":"ha",
  "categoryId":"building",
  "subcategoryId":"pop_ceiling_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":15000,
    "maximumPrice":100000,
    "currency":"NGN",
    "estimatedTime":"3-8 hours",
    "difficulty":"Medium",
    "confidence":94
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"POP Installer",
    "materials":[
      "POP compound",
      "Joint tape"
    ],
    "tools":[
      "Putty knife",
      "Sanding block"
    ],
    "maintenanceTips":[
      "Ka gyara ƙananan tsage-tsage da wuri domin kada su ƙaru."
    ],
    "marketplaceItems":[
      "POP compound",
      "Joint tape"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren POP Installer"
}

Example 3

Customer:

"My roof dey leak when rain fall."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your roof dey leak during rain, e fit be damaged roofing sheets, loose roofing nails, worn flashing or blocked drainage. Put a bucket under the leak if necessary and avoid climbing onto the roof during rain. Make verified roofing technician inspect am before the damage gets worse.",
  "normalizedQuery":"roof leaking",
  "language":"pcm",
  "categoryId":"building",
  "subcategoryId":"roof_repair",
  "urgency":"high",
  "estimate":{
    "minimumPrice":15000,
    "maximumPrice":150000,
    "currency":"NGN",
    "estimatedTime":"2-8 hours",
    "difficulty":"Medium",
    "confidence":95
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Roofing Contractor",
    "materials":[
      "Roofing sheet",
      "Roofing nails",
      "Sealant"
    ],
    "tools":[
      "Ladder",
      "Hammer"
    ],
    "maintenanceTips":[
      "Inspect your roof before and after every rainy season."
    ],
    "marketplaceItems":[
      "Roofing sheet",
      "Roofing nails",
      "Roof sealant"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Roofing Experts"
}

Example 4

Customer:

"My floor tiles are coming off."

Assistant:

{
  "action":"find_service",
  "response":"I understand. Floor tiles can become loose because of poor adhesive, moisture, movement of the floor or improper installation. Avoid walking heavily on the affected area until it has been repaired. A qualified tiling technician should inspect and replace any loose tiles before the damage spreads.",
  "normalizedQuery":"floor tiles coming off",
  "language":"en",
  "categoryId":"building",
  "subcategoryId":"tile_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":15000,
    "maximumPrice":80000,
    "currency":"NGN",
    "estimatedTime":"2-6 hours",
    "difficulty":"Medium",
    "confidence":93
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Tiler",
    "materials":[
      "Floor tiles",
      "Tile adhesive",
      "Tile grout"
    ],
    "tools":[
      "Tile cutter",
      "Notched trowel"
    ],
    "maintenanceTips":[
      "Repair loose tiles early to prevent further damage."
    ],
    "marketplaceItems":[
      "Floor tiles",
      "Tile adhesive"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Tilers"
}

Example 5

Customer:

"Tiles dina suna cirewa."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan tiles ɗinka suna cirewa, matsalar na iya kasancewa daga rashin ingancin adhesive, danshi ko matsalar shimfiɗa tiles. Ka guji taka wurin da tiles suka fara cirewa. Yana da kyau ƙwararren tiler ya gyara su kafin matsalar ta ƙaru.",
  "normalizedQuery":"floor tile repair",
  "language":"ha",
  "categoryId":"building",
  "subcategoryId":"tile_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":15000,
    "maximumPrice":80000,
    "currency":"NGN",
    "estimatedTime":"2-6 hours",
    "difficulty":"Medium",
    "confidence":93
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Tiler",
    "materials":[
      "Floor tiles",
      "Tile adhesive",
      "Tile grout"
    ],
    "tools":[
      "Tile cutter",
      "Notched trowel"
    ],
    "maintenanceTips":[
      "Ka gyara tiles da suka saki tun da wuri domin kada su ƙara lalacewa."
    ],
    "marketplaceItems":[
      "Floor tiles",
      "Tile adhesive"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren Tiler"
}

Example 6

Customer:

"My door no dey close well."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your door no dey close properly, e fit be loose hinges, swollen wood, bad alignment or damaged lock. Avoid forcing the door shut because e fit make the damage worse. Make verified carpenter inspect and adjust am.",
  "normalizedQuery":"door not closing properly",
  "language":"pcm",
  "categoryId":"building",
  "subcategoryId":"door_repair",
  "urgency":"low",
  "estimate":{
    "minimumPrice":5000,
    "maximumPrice":30000,
    "currency":"NGN",
    "estimatedTime":"30-90 minutes",
    "difficulty":"Easy",
    "confidence":91
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Carpenter",
    "materials":[
      "Door hinges",
      "Door lock"
    ],
    "tools":[
      "Screwdriver",
      "Wood plane"
    ],
    "maintenanceTips":[
      "Tighten loose hinges regularly and keep wooden doors away from excessive moisture."
    ],
    "marketplaceItems":[
      "Door hinges",
      "Door lock"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Carpenters"
}

Example 7

Customer:

"My window is broken."

Assistant:

{
  "action":"find_service",
  "response":"I understand. A broken window can expose your home to rain, dust and security risks. Avoid touching broken glass with bare hands and keep children away from the area. If possible, temporarily cover the opening until a qualified technician replaces the glass.",
  "normalizedQuery":"broken window repair",
  "language":"en",
  "categoryId":"building",
  "subcategoryId":"window_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":60000,
    "currency":"NGN",
    "estimatedTime":"1-4 hours",
    "difficulty":"Medium",
    "confidence":94
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Glazier",
    "materials":[
      "Glass panel",
      "Window sealant"
    ],
    "tools":[
      "Glass cutter",
      "Safety gloves"
    ],
    "maintenanceTips":[
      "Replace cracked glass early to prevent further damage."
    ],
    "marketplaceItems":[
      "Glass panel",
      "Window sealant"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Glass Repair Experts"
}

Example 8

Customer:

"Window dina ta karye."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan window ɗinka ta karye, ka guji taɓa gilashin da hannu saboda yana iya jikkata ka. Idan zai yiwu, ka rufe wajen na ɗan lokaci domin hana ruwa ko ƙura shiga. Yana da kyau ƙwararren mai gyaran gilashi ya maye gurbin gilashin.",
  "normalizedQuery":"broken window repair",
  "language":"ha",
  "categoryId":"building",
  "subcategoryId":"window_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":60000,
    "currency":"NGN",
    "estimatedTime":"1-4 hours",
    "difficulty":"Medium",
    "confidence":94
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Glazier",
    "materials":[
      "Glass panel",
      "Window sealant"
    ],
    "tools":[
      "Safety gloves"
    ],
    "maintenanceTips":[
      "Ka maye gurbin gilashin da ya tsage kafin ya ƙara karyewa."
    ],
    "marketplaceItems":[
      "Glass panel"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Mai Gyaran Gilashi"
}

Example 9

Customer:

"Wall dey peel after rain."

Assistant:

{
  "action":"find_service",
  "response":"No wahala. If your wall dey peel after rain, e fit mean say water dey enter the wall through roof leakage, cracked plaster or poor waterproofing. Allow the wall to dry before repainting. Make verified mason inspect the source of the moisture before any repair.",
  "normalizedQuery":"wall peeling after rain",
  "language":"pcm",
  "categoryId":"building",
  "subcategoryId":"wall_repair",
  "urgency":"normal",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":70000,
    "currency":"NGN",
    "estimatedTime":"2-6 hours",
    "difficulty":"Medium",
    "confidence":92
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Mason",
    "materials":[
      "Wall filler",
      "Waterproof compound",
      "Primer"
    ],
    "tools":[
      "Scraper",
      "Paint roller"
    ],
    "maintenanceTips":[
      "Always repair water leaks before repainting damaged walls."
    ],
    "marketplaceItems":[
      "Waterproof compound",
      "Primer"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Masons"
}

Example 10

Customer:

"My ceiling is leaking whenever it rains."

Assistant:

{
  "action":"find_service",
  "response":"I understand. A leaking ceiling usually means water is entering through the roof, damaged flashing or blocked roof drainage. Place a bucket under the leak to reduce water damage and move electrical appliances away from the affected area. If the ceiling is bulging or sagging, stay away from that area until it has been inspected.",
  "normalizedQuery":"ceiling leaking",
  "language":"en",
  "categoryId":"building",
  "subcategoryId":"ceiling_leak_repair",
  "urgency":"high",
  "estimate":{
    "minimumPrice":20000,
    "maximumPrice":150000,
    "currency":"NGN",
    "estimatedTime":"2-8 hours",
    "difficulty":"Hard",
    "confidence":96
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Roofing Contractor",
    "materials":[
      "Roofing sheet",
      "Roof sealant",
      "Flashing"
    ],
    "tools":[
      "Ladder",
      "Hammer",
      "Sealant gun"
    ],
    "maintenanceTips":[
      "Inspect your roof before every rainy season and repair small leaks immediately."
    ],
    "marketplaceItems":[
      "Roof sealant",
      "Roofing sheet"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Roofing Experts"
}

Example 11

Customer:

"Rufin gidana yana zub da ruwa idan an yi ruwa."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan rufin gidanka yana zub da ruwa lokacin damina, akwai yiwuwar roofing sheet ta lalace, sealant ya tsufa ko kuma flashing ya buɗe. Ka sanya guga a wurin da ruwa ke zubowa sannan ka nisantar da kayan lantarki daga wurin. Kada ka hau saman rufi lokacin da ake ruwa. Yana da kyau ƙwararren roofer ya duba matsalar.",
  "normalizedQuery":"roof leaking",
  "language":"ha",
  "categoryId":"building",
  "subcategoryId":"roof_repair",
  "urgency":"high",
  "estimate":{
    "minimumPrice":20000,
    "maximumPrice":150000,
    "currency":"NGN",
    "estimatedTime":"2-8 hours",
    "difficulty":"Hard",
    "confidence":96
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Roofing Contractor",
    "materials":[
      "Roofing sheet",
      "Roof sealant",
      "Roofing nails"
    ],
    "tools":[
      "Ladder",
      "Hammer"
    ],
    "maintenanceTips":[
      "Ka duba rufi kafin damina domin gano matsaloli tun da wuri."
    ],
    "marketplaceItems":[
      "Roof sealant",
      "Roofing sheet"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren Roofer"
}

Example 12

Customer:

"Foundation dey crack."

Assistant:

{
  "action":"emergency",
  "response":"This fit be serious. If the foundation of your building dey crack, avoid ignoring am because structural damage fit get worse. If you notice wide cracks, doors no dey close again or part of the building dey sink, make everybody stay away from the affected area until qualified building professional inspect am.",
  "normalizedQuery":"building foundation crack",
  "language":"pcm",
  "categoryId":"building",
  "subcategoryId":"foundation_repair",
  "urgency":"high",
  "estimate":{
    "minimumPrice":50000,
    "maximumPrice":500000,
    "currency":"NGN",
    "estimatedTime":"1-7 days",
    "difficulty":"Hard",
    "confidence":98
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Structural Engineer",
    "materials":[
      "Cement",
      "Steel reinforcement",
      "Concrete"
    ],
    "tools":[
      "Level",
      "Concrete tools"
    ],
    "maintenanceTips":[
      "Inspect foundation cracks early before they become structural problems."
    ],
    "marketplaceItems":[
      "Cement",
      "Steel reinforcement"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Structural Experts"
}

Example 13

Customer:

"My fence gate is difficult to open."

Assistant:

{
  "action":"find_service",
  "response":"I understand. A gate that is difficult to open may be caused by rust, worn hinges, poor alignment or ground movement. Avoid forcing the gate because it can damage the hinges or lock. A qualified welder or gate technician should inspect and adjust it.",
  "normalizedQuery":"gate difficult to open",
  "language":"en",
  "categoryId":"building",
  "subcategoryId":"gate_repair",
  "urgency":"low",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":60000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Easy",
    "confidence":92
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Welder",
    "materials":[
      "Gate hinges",
      "Gate lock",
      "Lubricant"
    ],
    "tools":[
      "Welding machine",
      "Spanner"
    ],
    "maintenanceTips":[
      "Lubricate hinges regularly and repair rust before it spreads."
    ],
    "marketplaceItems":[
      "Gate hinges",
      "Gate lock"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Gate Repair Experts"
}

Example 14

Customer:

"Gate dina baya rufewa da kyau."

Assistant:

{
  "action":"find_service",
  "response":"Na gane. Idan gate ɗinka baya rufewa da kyau, matsalar na iya kasancewa daga hinges, lock ko kuma gate ɗin ya kauce daga daidaito. Kada ka matsa shi da ƙarfi saboda hakan na iya ƙara lalacewa. Ƙwararren welder ko gate technician zai iya gyara matsalar.",
  "normalizedQuery":"gate not closing properly",
  "language":"ha",
  "categoryId":"building",
  "subcategoryId":"gate_repair",
  "urgency":"low",
  "estimate":{
    "minimumPrice":10000,
    "maximumPrice":60000,
    "currency":"NGN",
    "estimatedTime":"1-3 hours",
    "difficulty":"Easy",
    "confidence":92
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Welder",
    "materials":[
      "Gate hinges",
      "Gate lock"
    ],
    "tools":[
      "Spanner",
      "Welding machine"
    ],
    "maintenanceTips":[
      "Ka rika shafa mai a hinges domin su riƙa aiki cikin sauƙi."
    ],
    "marketplaceItems":[
      "Gate hinges",
      "Gate lock"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren Gate Technician"
}

Example 15

Customer:

"My balcony railing dey shake."

Assistant:

{
  "action":"emergency",
  "response":"This is a safety risk. Avoid leaning on the railing or allowing anyone to use it until it has been repaired. Loose balcony railings can fail without warning. Make a qualified welder or building technician inspect and secure it immediately.",
  "normalizedQuery":"loose balcony railing",
  "language":"pcm",
  "categoryId":"building",
  "subcategoryId":"balcony_railing_repair",
  "urgency":"high",
  "estimate":{
    "minimumPrice":15000,
    "maximumPrice":100000,
    "currency":"NGN",
    "estimatedTime":"2-6 hours",
    "difficulty":"Hard",
    "confidence":98
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Welder",
    "materials":[
      "Steel railing",
      "Anchor bolts",
      "Welding rods"
    ],
    "tools":[
      "Welding machine",
      "Angle grinder"
    ],
    "maintenanceTips":[
      "Inspect balcony railings regularly and repair loose fittings immediately."
    ],
    "marketplaceItems":[
      "Anchor bolts",
      "Welding rods"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Structural Repair Experts"
}

Example 16

Customer:

"The concrete on my staircase is breaking."

Assistant:

{
  "action":"find_service",
  "response":"I understand. Damaged concrete steps can become a serious trip and fall hazard. Avoid using the damaged section if possible until it has been repaired. The damage may be caused by poor concrete mix, water penetration or heavy wear. A qualified mason should inspect the staircase and repair or rebuild the affected area.",
  "normalizedQuery":"concrete staircase repair",
  "language":"en",
  "categoryId":"building",
  "subcategoryId":"staircase_repair",
  "urgency":"high",
  "estimate":{
    "minimumPrice":20000,
    "maximumPrice":150000,
    "currency":"NGN",
    "estimatedTime":"1-3 days",
    "difficulty":"Medium",
    "confidence":96
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Mason",
    "materials":[
      "Cement",
      "Sharp sand",
      "Concrete",
      "Steel reinforcement"
    ],
    "tools":[
      "Trowel",
      "Concrete mixer",
      "Level"
    ],
    "maintenanceTips":[
      "Repair damaged concrete early to prevent further cracking and reduce accident risks."
    ],
    "marketplaceItems":[
      "Cement",
      "Sharp sand",
      "Steel reinforcement"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Available Masons"
}

Example 17

Customer:

"Matakalar gidana tana rushewa."

Assistant:

{
  "action":"emergency",
  "response":"Na gane. Idan matakalar gidanka tana rushewa ko tana motsi, wannan na iya zama haɗari. Kada a ci gaba da amfani da matakalar har sai an gyara ta. Ka nisantar da yara da sauran mutane daga wurin sannan ka kira ƙwararren mason domin ya duba ta cikin gaggawa.",
  "normalizedQuery":"damaged staircase",
  "language":"ha",
  "categoryId":"building",
  "subcategoryId":"staircase_repair",
  "urgency":"high",
  "estimate":{
    "minimumPrice":20000,
    "maximumPrice":150000,
    "currency":"NGN",
    "estimatedTime":"1-3 days",
    "difficulty":"Hard",
    "confidence":98
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Mason",
    "materials":[
      "Cement",
      "Steel reinforcement",
      "Concrete blocks"
    ],
    "tools":[
      "Concrete mixer",
      "Level"
    ],
    "maintenanceTips":[
      "Ka dinga duba matakala lokaci-lokaci domin gano matsala tun kafin ta zama babba."
    ],
    "marketplaceItems":[
      "Cement",
      "Steel reinforcement"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Nemo Kwararren Mason"
}

Example 18

Customer:

"My veranda floor don sink."

Assistant:

{
  "action":"emergency",
  "response":"This fit be a structural problem. Avoid using the affected area until it has been inspected. A sinking veranda may be caused by foundation movement, poor soil support or water damage. Make a qualified structural engineer or experienced mason inspect it immediately.",
  "normalizedQuery":"veranda floor sinking",
  "language":"pcm",
  "categoryId":"building",
  "subcategoryId":"foundation_repair",
  "urgency":"high",
  "estimate":{
    "minimumPrice":50000,
    "maximumPrice":500000,
    "currency":"NGN",
    "estimatedTime":"2-7 days",
    "difficulty":"Hard",
    "confidence":99
  },
  "recommendation":{
    "professionalRequired":true,
    "serviceCategory":"Structural Engineer",
    "materials":[
      "Concrete",
      "Steel reinforcement",
      "Cement"
    ],
    "tools":[
      "Level",
      "Concrete tools"
    ],
    "maintenanceTips":[
      "Investigate foundation movement immediately before carrying out cosmetic repairs."
    ],
    "marketplaceItems":[
      "Cement",
      "Steel reinforcement"
    ]
  },
  "followUpRequired":false,
  "followUpQuestions":[],
  "showWorkerButton":true,
  "buttonLabel":"Find Structural Experts"
}


`.trim();