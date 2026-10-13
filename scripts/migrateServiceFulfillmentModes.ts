import {
  applicationDefault,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  getFirestore,
  type WriteBatch,
} from "firebase-admin/firestore";

import {
  writeFileSync,
} from "node:fs";

/* ============================================================
   CONFIGURATION
============================================================ */

const EXPECTED_FIREBASE_PROJECT_ID =
  "fixxam-clean";

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  EXPECTED_FIREBASE_PROJECT_ID;

const SERVICES_COLLECTION =
  "services";

const MEDIUM_REVIEW_FILE =
  "service-fulfillment-medium-review.txt";

const FULFILLMENT_BACKUP_FILE =
  "service-fulfillment-backup.json";

const VALID_FULFILLMENT_MODES =
  [
    "worker_visits_customer",
    "customer_visits_worker",
    "flexible",
    "remote",
    "needs_review",
  ] as const;

const CLASSIFICATION_PREVIEW_LIMIT =
  100;

const WRITE_BATCH_SIZE =
  400;

const APPLY_MODE =
  process.argv.includes(
    "--apply",
  );

/* ============================================================
   TYPES
============================================================ */

type ServiceFulfillmentMode =
  (typeof VALID_FULFILLMENT_MODES)[number];

type ClassificationConfidence =
  | "high"
  | "medium"
  | "review";

type ServiceDocument = {
  name?: unknown;
  categoryId?: unknown;
  subcategoryId?: unknown;
  fulfillmentMode?: unknown;
};

type AuditedService = {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId: string;
  fulfillmentMode:
    ServiceFulfillmentMode | null;
  rawFulfillmentMode: string;
};

type ClassificationResult = {
  mode: ServiceFulfillmentMode;
  confidence:
    ClassificationConfidence;
  reason: string;
};

type ClassifiedService = {
  service: AuditedService;
  classification:
    ClassificationResult;
};

type AuditStats = {
  total: number;
  withValidFulfillmentMode: number;
  withoutFulfillmentMode: number;
  invalidFulfillmentMode: number;
  missingName: number;
  missingCategoryId: number;
  missingSubcategoryId: number;
};

type ApprovedInvalidCorrection = {
  service: AuditedService;
  mode: ServiceFulfillmentMode;
};

type PendingWrite = {
  serviceId: string;
  mode: ServiceFulfillmentMode;
  source:
    | "missing_classification"
    | "invalid_correction";
};

type MediumConfidenceGroup = {
  categoryId: string;
  subcategoryId: string;
  count: number;
};

type FulfillmentBackupItem = {
  serviceId: string;
  fulfillmentMode: unknown;
};

/* ============================================================
   FIREBASE ADMIN
============================================================ */

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  console.log("");
  console.log(
    "Initializing Firebase Admin...",
  );

  console.log(
    `Project ID: ${FIREBASE_PROJECT_ID}`,
  );

  return initializeApp({
    credential:
      applicationDefault(),

    projectId:
      FIREBASE_PROJECT_ID,
  });
}

const firebaseApp =
  initializeFirebaseAdmin();

const db =
  getFirestore(firebaseApp);

/* ============================================================
   BASIC HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeText(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[_-]+/g,
      " ",
    )
    .replace(
      /[^a-z0-9\s]/g,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function isServiceFulfillmentMode(
  value: unknown,
): value is ServiceFulfillmentMode {
  return (
    typeof value === "string" &&
    VALID_FULFILLMENT_MODES.some(
      (mode) => mode === value,
    )
  );
}

function getServiceFulfillmentMode(
  value: unknown,
): ServiceFulfillmentMode | null {
  if (
    !isServiceFulfillmentMode(value)
  ) {
    return null;
  }

  return value;
}

function includesAny(
  value: string,
  terms: readonly string[],
): boolean {
  return terms.some(
    (term) =>
      value.includes(term),
  );
}

/* ============================================================
   INVALID MODE SUGGESTIONS
============================================================ */

function suggestFulfillmentMode(
  value: unknown,
): ServiceFulfillmentMode | null {
  const normalized =
    cleanString(value)
      .toLowerCase()
      .replace(
        /[\s-]+/g,
        "_",
      );

  if (!normalized) {
    return null;
  }

  if (
    isServiceFulfillmentMode(
      normalized,
    )
  ) {
    return normalized;
  }

  const typoCorrections: Record<
    string,
    ServiceFulfillmentMode
  > = {
    flexbile:
      "flexible",

    flexibile:
      "flexible",

    flexiable:
      "flexible",

    worker_visit_customer:
      "worker_visits_customer",

    worker_visits_customers:
      "worker_visits_customer",

    worker_visit_customers:
      "worker_visits_customer",

    customer_visit_worker:
      "customer_visits_worker",

    customer_visits_workers:
      "customer_visits_worker",

    customer_visit_workers:
      "customer_visits_worker",

    need_review:
      "needs_review",

    needs_reviews:
      "needs_review",
  };

  return (
    typoCorrections[
      normalized
    ] ?? null
  );
}

/* ============================================================
   SUBCATEGORY DEFAULTS
============================================================ */

const ON_SITE_SUBCATEGORIES =
  new Set<string>([
    "air-conditioning",
    "building",
    "cleaning",
    "construction",
    "electrical",
    "flooring",
    "gardening",
    "gate-automation",
    "glass-work",
    "home-moving",
    "land-surveying",
    "landscaping",
    "masonry",
    "painting",
    "property-maintenance",
    "roofing",
    "security-guards",
    "security-systems",
    "solar-energy",
    "waste-management",
    "water-treatment",
    "welding",
  ]);

const FLEXIBLE_SUBCATEGORIES =
  new Set<string>([
    "accounting",
    "agriculture",
    "aluminium",
    "appliance-repair",
    "automotive",
    "automotives",
    "baking",
    "barbing",
    "beauty",
    "caregiving",
    "catering",
    "computer-repair",
    "consulting",
    "dj-services",
    "education",
    "event-decoration",
    "event-planning",
    "fashion-design",
    "graphic-design",
    "hairdressing",
    "healthcare",
    "hospitality",
    "interlocking",
    "jewelry-making",
    "laundry",
    "legal-services",
    "livestock",
    "locksmith",
    "logistics",
    "makeup",
    "mechanic",
    "music-production",
    "nail-care",
    "networking",
    "phone-repair",
    "photography",
    "physiotherapy",
    "pop-and-ceiling",
    "real-estate",
    "software-services",
    "spa",
    "tailoring",
    "travel-services",
    "tutoring",
    "videography",
    "voice-over",
    "web-development",
  ]);


/* ============================================================
   STRONG SERVICE RULES
============================================================ */

const WORKER_VISITS_STRONG_KEYWORDS =
  [
    /* Construction / property */

    "electric gate installation",
    "electric fence installation",
    "cctv installation",
    "video door phone installation",
    "solar installation",
    "roof installation",
    "roofing installation",
    "floor installation",
    "home appliance installation",
    "generator installation",

    "ceiling repair",
    "floor repair",
    "roof repair",
    "gutter repair",
    "masonry repair",
    "structural repair",
    "crack repair",
    "glass repair",
    "window frame repair",
    "interlocking repair",
    "welding repair",
    "gate repair",
    "water pump repair",

    "cctv maintenance",
    "cctv upgrade",
    "cctv monitoring setup",
    "remote viewing setup",
    "security camera networking",

    "generator maintenance",
    "generator overhaul",
    "generator fault diagnosis",

    "home appliance inspection",

    "borehole drilling",
    "land survey",

    /* Logistics */

    "home moving",
    "house moving",
    "local moving",
    "office moving",

    "airport pickup",
    "airport dropoff",
    "airport drop off",
    "ambulance service",
    "emergency ambulance",
    "medical transport",

    "waste collection",
    "waste disposal",

    "appliance delivery",
    "home delivery",
    "local delivery",
    "parcel delivery",
    "package delivery",
    "food delivery",
    "goods delivery",
    "furniture delivery",
    "laundry delivery",

    "loading service",
    "loading services",
    "unloading service",
    "unloading services",

    "cargo transportation",
    "distribution services",
    "freight services",
    "interstate logistics",
    "truck hire services",

    "bus hire",
    "car hire",
    "chauffeur service",
    "corporate transportation",
    "event transportation",
    "school transportation",
    "staff transportation",
    "truck hire",

    /* Security */

    "security guard",

    /* Events */

    "award night mc",
    "birthday event mc",
    "wedding mc",
    "event mc",
    "master of ceremony",
    "master of ceremonies",

    "birthday party dj",
    "club dj",
    "concert dj",
    "corporate event dj",
    "engagement party dj",
    "house party dj",
    "live dj performance",
    "mobile dj services",
    "religious event sound",
    "school event dj",
    "traditional event dj",
    "wedding dj",
    "event sound management",
    "lighting and sound setup",
    "pa system setup",
    "karaoke services",

    "artificial flower decoration",
    "backdrop decoration",
    "balloon decoration",
    "birthday decoration",
    "conference decoration",
    "corporate event decoration",
    "engagement decoration",
    "entrance decoration",
    "flower decoration",
    "hall decoration",
    "indoor event decoration",
    "lighting decoration",
    "outdoor event decoration",
    "stage decoration",
    "table decoration",
    "tent decoration",
    "traditional wedding decoration",
    "wedding decoration",

    /* Agriculture */

    "bee keeping",
    "beekeeping",
    "farm inspection",
    "farm maintenance",
    "farm treatment",
    "farm spraying",
    "crop spraying",
    "livestock inspection",
    "livestock vaccination",

    "farm management",
"fish health management",

    "fish pond maintenance",
    "fish harvesting",
    "soybean farming",
    "water quality testing",

    "cassava farming",
    "crop farming",
    "farm harvesting",
    "farm irrigation",
    "greenhouse farming",
    "groundnut farming",
    "land clearing",
    "livestock farming",
    "maize farming",
    "rice farming",
    "soil testing",
    "tractor services",
    "vegetable farming",
    "wheat farming",
    "yam farming",

    "cattle farming",
    "goat farming",
    "livestock breeding",
    "pig farming",
    "poultry farming",
    "rabbit farming",
    "sheep farming",

    /* Caregiving / Home Healthcare */

    "child care assistant",
    "companionship care",
    "disability support",
    "elderly care",
    "home caregiver",
    "home health support",
    "home beauty service",
    "hospital caregiver",
    "live in caregiver",
    "meal preparation care",
    "mobility assistance",
    "newborn care support",
    "night care service",
    "part time caregiver",
    "patient care assistance",
    "personal hygiene assistance",
    "post surgery care",
    "respite care",
    "special needs care",

    "caregiver services",
    "home healthcare",
    "home nursing",
    "laboratory sample collection",
    "home physiotherapy",

    /* Locksmith / On-site access */

    "automotive locksmith",
    "door lock replacement",
    "emergency lockout service",
    "security lock upgrade",

    /* Networking / On-site infrastructure */

    "lan setup",
    "network cabling",
    "network maintenance",
    "network security setup",
    "server network setup",
    "wan setup",

    /* Hospitality / On-site operations */

    "bar management",
    "event hosting",
    "front desk services",
    "guest house management",
    "hotel management",
    "housekeeping services",
    "restaurant management",
    "room attendant services",
    "shortlet management",

    /* Real Estate / Property site services */

    "facility management",
    "property management",
    "property valuation",
  ] as const;

const CUSTOMER_VISITS_STRONG_KEYWORDS =
  [
    "battery charging",
    "document printing",
    "photocopying",
    "photocopy service",
    "printing service",
  ] as const;

const FLEXIBLE_STRONG_KEYWORDS =
  [
    /* Consultation */

    "building consultation",
    "construction consultation",
    "logistics consultation",
    "agricultural consultation",
    "agriculture consultation",
    "farm consultation",
    "livestock consultation",
    "veterinary consultation",

    /* Portable repair */

    "aluminium repair",
    "aluminum repair",
    "kettle repair",
    "cooker repair",
    "phone repair",
    "laptop repair",
    "computer repair",
    "television repair",
    "tv repair",
    "radio repair",
    "iron repair",
    "blender repair",
    "microwave repair",
    "fan repair",
    "small appliance repair",

    /* Automotive */

    "car detailing",
    "car servicing",
    "vehicle servicing",
    "auto servicing",
    "car repair",
    "vehicle repair",
    "mechanic service",
    "mechanical repair",

    /* Agriculture */

    "animal health management",

    "fish farm management",

    /* Beauty */

    "dreadlocks installation",
    "hair extension installation",
    "weaving installation",
    "wig installation",

    /* Design */

    "ceiling light channel design",
    "decorative ceiling design",
    "garden design",
    "landscape design",
  ] as const;

/* ============================================================
   GENERIC KEYWORD RULES
============================================================ */

const WORKER_VISITS_KEYWORDS =
  [
    "installation",
    "install",
    "inspection",
    "site inspection",
    "home inspection",
    "building inspection",
    "construction",
    "roofing",
    "flooring",
    "painting",
    "plumbing",
    "cleaning",
    "gardening",
    "landscaping",
    "fumigation",
    "pest control",
    "moving",
    "relocation",
    "loading",
    "unloading",
    "delivery",
    "courier",
    "haulage",
    "towing",
    "surveying",
    "land survey",
    "gate automation",
    "electric gate",
    "electric fence",
    "security guard",
    "cctv installation",
    "solar installation",
    "generator installation",
    "wiring",
    "rewiring",
    "fault diagnosis",
    "fish health management",
    "water treatment",
    "fish farming",
    "borehole",
    "waste collection",
    "waste disposal",
  ] as const;

const FLEXIBLE_KEYWORDS =
  [
    "repair",
    "diagnosis",
    "diagnostic",
    "consultation",
    "consulting",
    "audit",
    "design",
    "planning",
    "training",
    "tutoring",
    "lesson",
    "coaching",
    "makeup",
    "barbing",
    "hair",
    "nail",
    "spa",
    "massage",
    "tailoring",
    "fashion",
    "photography",
    "videography",
    "catering",
    "baking",
    "laundry",
    "computer",
    "phone",
    "laptop",
    "appliance",
    "legal",
    "accounting",
    "bookkeeping",
    "graphic design",
    "logo design",
    "web design",
    "web development",
    "software",
    "voice over",
    "music production",
    "servicing",
    "storage service",
"storage services",
    "detailing",
    "veterinary",
    "animal health",
  ] as const;

/* ============================================================
   SERVICE CLASSIFIER
============================================================ */

function classifyMissingService(
  service: AuditedService,
): ClassificationResult {
  const name =
    normalizeText(
      service.name,
    );

  const id =
    normalizeText(
      service.id,
    );

  const categoryId =
    cleanString(
      service.categoryId,
    ).toLowerCase();

  const subcategoryId =
    cleanString(
      service.subcategoryId,
    ).toLowerCase();

  if (
    !name ||
    !categoryId ||
    !subcategoryId
  ) {
    return {
      mode:
        "needs_review",

      confidence:
        "review",

      reason:
        "Missing required service metadata.",
    };
  }

  const searchableText =
    [
      name,
      id,
      normalizeText(
        categoryId,
      ),
      normalizeText(
        subcategoryId,
      ),
    ].join(" ");


/* ----------------------------------------------------------
   REMOTE-ONLY SERVICES
---------------------------------------------------------- */

if (
  includesAny(
    searchableText,
    [
      "telemedicine",
    ],
  )
) {
  return {
    mode:
      "remote",

    confidence:
      "high",

    reason:
      "Telemedicine is delivered remotely and does not require a physical service location.",
  };
}



  if (
    includesAny(
      searchableText,
      WORKER_VISITS_STRONG_KEYWORDS,
    )
  ) {
    return {
      mode:
        "worker_visits_customer",

      confidence:
        "high",

      reason:
        "Specific service rule indicates work at the customer's/event/site location.",
    };
  }

  if (
    includesAny(
      searchableText,
      CUSTOMER_VISITS_STRONG_KEYWORDS,
    )
  ) {
    return {
      mode:
        "customer_visits_worker",

      confidence:
        "high",

      reason:
        "Specific service rule indicates the customer normally brings the item/request to the provider.",
    };
  }

  if (
    includesAny(
      searchableText,
      FLEXIBLE_STRONG_KEYWORDS,
    )
  ) {
    return {
      mode:
        "flexible",

      confidence:
        "high",

      reason:
        "Specific service rule supports either customer or provider travel.",
    };
  }

  /* ----------------------------------------------------------
     MC / EVENT PRESENCE
  ---------------------------------------------------------- */

  if (
    subcategoryId ===
      "mc-services" ||
    (
      categoryId ===
        "events-and-entertainment" &&
      includesAny(
        searchableText,
        [
          " mc ",
          " mc",
          "master of ceremony",
          "master of ceremonies",
        ],
      )
    )
  ) {
    return {
      mode:
        "worker_visits_customer",

      confidence:
        "high",

      reason:
        "MC service is performed at the customer's event location.",
    };
  }

  /* ----------------------------------------------------------
     DELIVERY / COURIER
  ---------------------------------------------------------- */

  if (
    subcategoryId ===
      "delivery" ||
    subcategoryId ===
      "courier"
  ) {
    return {
      mode:
        "worker_visits_customer",

      confidence:
        "high",

      reason:
        "Delivery/courier service requires provider movement to pickup/drop-off locations.",
    };
  }

  /* ----------------------------------------------------------
     CONSULTATIONS
  ---------------------------------------------------------- */

  if (
    includesAny(
      searchableText,
      [
        "consultation",
        "consulting",
        "advisory",
      ],
    )
  ) {
    return {
      mode:
        "flexible",

      confidence:
        "high",

      reason:
        "Consultation/advisory service can reasonably happen at either location.",
    };
  }

  /* ----------------------------------------------------------
     DUVET CLEANING
  ---------------------------------------------------------- */

  if (
    includesAny(
      searchableText,
      [
        "duvet cleaning",
        "duvet washing",
      ],
    )
  ) {
    return {
      mode:
        "flexible",

      confidence:
        "high",

      reason:
        "Duvet service can support customer drop-off or provider pickup/on-site service.",
    };
  }

  /* ----------------------------------------------------------
     AUTOMOTIVE
  ---------------------------------------------------------- */

  if (
    categoryId ===
      "automotive-services" ||
    subcategoryId ===
      "automotive" ||
    subcategoryId ===
      "automotives" ||
    subcategoryId ===
      "mechanic"
  ) {
    if (
      includesAny(
        searchableText,
        [
          "towing",
          "vehicle recovery",
          "car recovery",
          "roadside assistance",
          "breakdown assistance",
        ],
      )
    ) {
      return {
        mode:
          "worker_visits_customer",

        confidence:
          "high",

        reason:
          "Roadside/recovery service requires the provider to reach the vehicle.",
      };
    }

    if (
      includesAny(
        searchableText,
        [
          "battery charging",
        ],
      )
    ) {
      return {
        mode:
          "customer_visits_worker",

        confidence:
          "high",

        reason:
          "Battery charging normally requires the battery/vehicle to be brought to the provider.",
      };
    }



    /* --------------------------------------------------------
       AUTOMOTIVE — WORKSHOP-DEPENDENT SERVICES

       These normally require fixed workshop equipment,
       alignment/balancing machines, paint/body facilities,
       or substantial workshop disassembly.
    -------------------------------------------------------- */

    if (
      includesAny(
        searchableText,
        [
          "wheel alignment",
          "wheel balancing",
          "car painting",
          "panel beating",
          "engine overhaul",
        ],
      )
    ) {
      return {
        mode:
          "customer_visits_worker",

        confidence:
          "high",

        reason:
          "Service normally requires fixed workshop equipment or facilities.",
      };
    }

    /* --------------------------------------------------------
       AUTOMOTIVE — CLEARLY FLEXIBLE SERVICES

       These can reasonably be performed either at a workshop
       or through a mobile mechanic/service provider.
    -------------------------------------------------------- */

    if (
      includesAny(
        searchableText,
        [
          "alternator repair",
          "auto electrical repair",
          "brake repair",
          "bus repair",
          "car ac installation",
          "car ac repair",
          "car wash",
          "clutch repair",
          "cooling system repair",
          "engine repair",
          "fuel system repair",
          "general mechanic",
          "interior cleaning",
          "motorcycle repair",
          "oil change",
          "pre purchase inspection",
          "radiator repair",
          "starter repair",
          "steering repair",
          "suspension repair",
          "truck repair",
          "tyre repair",
          "tyre replacement",
          "vehicle diagnostics",
          "vehicle inspection",
          "windshield replacement",
          "exhaust system repair",
          "general auto repair",
          "bumper repair",
"gearbox repair",
"vehicle registration assistance",
        ],
      )
    ) {
      return {
        mode:
          "flexible",

        confidence:
          "high",

        reason:
          "Service can reasonably be performed at a workshop or by a mobile automotive provider.",
      };
    }



    return {
      mode:
        "flexible",

      confidence:
        "medium",

      reason:
        "Automotive service may be workshop-based or mobile.",
    };
  }

  /* ----------------------------------------------------------
     AGRICULTURE / FARMING
  ---------------------------------------------------------- */

  if (
    categoryId ===
      "agriculture-and-farming"
  ) {
    if (
      includesAny(
        searchableText,
        [
          "feed supply",
          "animal feed supply",
          "fish feed supply",
          "fish fingerlings supply",
          "fingerlings supply",
          "seed supply",
          "fertilizer supply",
          "fertiliser supply",
          "equipment supply",
        ],
      )
    ) {
      return {
        mode:
          "flexible",

        confidence:
          "medium",

        reason:
          "Supply service may support either customer pickup or provider delivery.",
      };
    }

    if (
      subcategoryId ===
        "fish-farming"
    ) {
      if (
        includesAny(
          searchableText,
          [
            "fish pond maintenance",
            "fish harvesting",
            "water quality testing",
          ],
        )
      ) {
        return {
          mode:
            "worker_visits_customer",

          confidence:
            "high",

          reason:
            "Service requires work or inspection at the customer's fish farm.",
        };
      }

      if (
        includesAny(
          searchableText,
          [
            "catfish farming",
            "tilapia farming",
            "commercial fish farming",
            "ornamental fish farming",
            "recirculating aquaculture system",
            "fish hatchery services",
          ],
        )
      ) {
        return {
          mode:
            "worker_visits_customer",

          confidence:
            "medium",

          reason:
            "Fish-farming service generally requires work at the customer's farm facility.",
        };
      }

      if (
        includesAny(
          searchableText,
          [
            "fish processing",
            "fish smoking",
            "fish packaging",
          ],
        )
      ) {
        return {
          mode:
            "flexible",

          confidence:
            "medium",

          reason:
            "Fish processing may happen at the provider's facility or customer's production location.",
        };
      }
    }

    if (
      includesAny(
        searchableText,
        [
          "farm inspection",
          "farm maintenance",
          "farm treatment",
          "farm spraying",
          "crop spraying",
          "vaccination",
          "livestock treatment",
          "animal treatment",
          "bee keeping",
          "beekeeping",
        ],
      )
    ) {
      return {
        mode:
          "worker_visits_customer",

        confidence:
          "high",

        reason:
          "Agricultural service requires work at the farm/livestock location.",
      };
    }

    if (
      includesAny(
        searchableText,
        [
          "management",
          "consultation",
          "consulting",
          "advisory",
          "training",
        ],
      )
    ) {
      return {
        mode:
          "flexible",

        confidence:
          "medium",

        reason:
          "Agricultural management/advisory service can reasonably happen at either location.",
      };
    }
  }

  /* ----------------------------------------------------------
     GENERIC KEYWORD SIGNALS
  ---------------------------------------------------------- */

  const hasWorkerVisitKeyword =
    includesAny(
      searchableText,
      WORKER_VISITS_KEYWORDS,
    );

  const hasFlexibleKeyword =
    includesAny(
      searchableText,
      FLEXIBLE_KEYWORDS,
    );

  if (
    hasWorkerVisitKeyword &&
    hasFlexibleKeyword
  ) {
    return {
      mode:
        "needs_review",

      confidence:
        "review",

      reason:
        "Service contains conflicting fulfillment signals not covered by a specific rule.",
    };
  }

  if (
    hasWorkerVisitKeyword
  ) {
    return {
      mode:
        "worker_visits_customer",

      confidence:
        "high",

      reason:
        "Service indicates physical/on-site work.",
    };
  }

  if (
    hasFlexibleKeyword
  ) {
    return {
      mode:
        "flexible",

      confidence:
        "high",

      reason:
        "Service can reasonably be provided at either location.",
    };
  }

  /* ----------------------------------------------------------
     SUBCATEGORY DEFAULTS
  ---------------------------------------------------------- */

  if (
    ON_SITE_SUBCATEGORIES.has(
      subcategoryId,
    )
  ) {
    return {
      mode:
        "worker_visits_customer",

      confidence:
        "medium",

      reason:
        `On-site subcategory default: ${subcategoryId}.`,
    };
  }

  if (
    FLEXIBLE_SUBCATEGORIES.has(
      subcategoryId,
    )
  ) {
    return {
      mode:
        "flexible",

      confidence:
        "medium",

      reason:
        `Flexible subcategory default: ${subcategoryId}.`,
    };
  }

  /* ----------------------------------------------------------
     CATEGORY FALLBACKS
  ---------------------------------------------------------- */

  if (
    categoryId ===
      "construction-and-buildings" ||
    categoryId ===
      "home-services"
  ) {
    return {
      mode:
        "worker_visits_customer",

      confidence:
        "medium",

      reason:
        `Physical-service category default: ${categoryId}.`,
    };
  }

  return {
    mode:
      "needs_review",

    confidence:
      "review",

    reason:
      "No sufficiently reliable deterministic rule matched.",
  };
}

/* ============================================================
   STATS
============================================================ */

function createEmptyStats(): AuditStats {
  return {
    total: 0,
    withValidFulfillmentMode: 0,
    withoutFulfillmentMode: 0,
    invalidFulfillmentMode: 0,
    missingName: 0,
    missingCategoryId: 0,
    missingSubcategoryId: 0,
  };
}

/* ============================================================
   PRINT HELPERS
============================================================ */

function printDivider(): void {
  console.log(
    "==================================================",
  );
}

function printService(
  service: AuditedService,
): void {
  console.log(
    [
      `ID: ${service.id}`,
      `Name: ${service.name || "(missing)"}`,
      `Category: ${service.categoryId || "(missing)"}`,
      `Subcategory: ${service.subcategoryId || "(missing)"}`,
      `Mode: ${service.rawFulfillmentMode || "(missing)"}`,
    ].join(" | "),
  );
}

function printClassification(
  item: ClassifiedService,
): void {
  printService(
    item.service,
  );

  console.log(
    [
      `Suggested: ${item.classification.mode}`,
      `Confidence: ${item.classification.confidence}`,
      `Reason: ${item.classification.reason}`,
    ].join(" | "),
  );

  console.log("");
}

/* ============================================================
   MEDIUM REVIEW EXPORT
============================================================ */

function writeMediumConfidenceReview(
  classifiedServices:
    ClassifiedService[],
  groups:
    MediumConfidenceGroup[],
): void {
  const mediumServices =
    classifiedServices.filter(
      (item) =>
        item.classification.confidence ===
        "medium",
    );

  const lines: string[] = [
    "FIXXAM SERVICE FULFILLMENT - MEDIUM CONFIDENCE REVIEW",
    "",
    `Total medium confidence: ${mediumServices.length}`,
    `Total groups: ${groups.length}`,
    "",
  ];

  for (
    const group of groups
  ) {
    lines.push(
      "==================================================",
      `CATEGORY: ${group.categoryId}`,
      `SUBCATEGORY: ${group.subcategoryId}`,
      `COUNT: ${group.count}`,
      "==================================================",
      "",
    );

    const groupServices =
      mediumServices
        .filter(
          (item) =>
            item.service.categoryId ===
              group.categoryId &&
            item.service.subcategoryId ===
              group.subcategoryId,
        )
        .sort(
          (a, b) =>
            a.service.name.localeCompare(
              b.service.name,
            ),
        );

    for (
      const item of
      groupServices
    ) {
      lines.push(
        `ID: ${item.service.id}`,
        `Name: ${item.service.name}`,
        `Suggested: ${item.classification.mode}`,
        `Reason: ${item.classification.reason}`,
        "",
      );
    }
  }

  writeFileSync(
    MEDIUM_REVIEW_FILE,
    lines.join("\n"),
    {
      encoding: "utf8",
    },
  );
}

/* ============================================================
   FULFILLMENT BACKUP
============================================================ */

function writeFulfillmentBackup(
  services: FulfillmentBackupItem[],
): void {
  const backup = {
    projectId:
      FIREBASE_PROJECT_ID,

    collection:
      SERVICES_COLLECTION,

    createdAt:
      new Date().toISOString(),

    totalServices:
      services.length,

    services,
  };

  writeFileSync(
    FULFILLMENT_BACKUP_FILE,
    JSON.stringify(
      backup,
      null,
      2,
    ),
    {
      encoding: "utf8",

      /*
       * Never silently overwrite an existing
       * migration backup.
       */
      flag: "wx",
    },
  );
}

/* ============================================================
   APPLY SAFETY
============================================================ */

function validateApplySafety(
  classifiedMissingServices:
    ClassifiedService[],
  unapprovedInvalidServices:
    AuditedService[],
): void {
  if (!APPLY_MODE) {
    return;
  }

  if (
    FIREBASE_PROJECT_ID !==
    EXPECTED_FIREBASE_PROJECT_ID
  ) {
    throw new Error(
      [
        "Apply blocked.",
        `Expected Firebase project: ${EXPECTED_FIREBASE_PROJECT_ID}`,
        `Current Firebase project: ${FIREBASE_PROJECT_ID}`,
      ].join(" "),
    );
  }

  const reviewServices =
    classifiedMissingServices.filter(
      (item) =>
        item.classification.mode ===
          "needs_review" ||
        item.classification.confidence ===
          "review",
    );

  if (
    reviewServices.length > 0
  ) {
    throw new Error(
      `Apply blocked: ${reviewServices.length} service(s) still require manual review.`,
    );
  }

  if (
    unapprovedInvalidServices.length >
    0
  ) {
    throw new Error(
      `Apply blocked: ${unapprovedInvalidServices.length} invalid fulfillmentMode value(s) do not have an approved correction.`,
    );
  }
}

/* ============================================================
   WRITE HELPERS
============================================================ */

async function commitWriteChunk(
  writes: PendingWrite[],
): Promise<void> {
  if (
    writes.length === 0
  ) {
    return;
  }

  const batch: WriteBatch =
    db.batch();

  for (
    const write of writes
  ) {
    const ref =
      db
        .collection(
          SERVICES_COLLECTION,
        )
        .doc(
          write.serviceId,
        );

    batch.set(
      ref,
      {
        fulfillmentMode:
          write.mode,
      },
      {
        merge: true,
      },
    );
  }

  await batch.commit();
}

async function applyWrites(
  writes: PendingWrite[],
): Promise<void> {
  if (
    writes.length === 0
  ) {
    console.log(
      "No writes required.",
    );

    return;
  }

  let committed = 0;

  for (
    let index = 0;
    index < writes.length;
    index += WRITE_BATCH_SIZE
  ) {
    const chunk =
      writes.slice(
        index,
        index +
          WRITE_BATCH_SIZE,
      );

    await commitWriteChunk(
      chunk,
    );

    committed +=
      chunk.length;

    console.log(
      `Committed ${committed}/${writes.length} writes.`,
    );
  }
}

/* ============================================================
   AUDIT + MIGRATION
============================================================ */

async function auditServiceFulfillmentModes(): Promise<void> {
  console.log("");

  printDivider();

  console.log(
    "FIXXAM SERVICE FULFILLMENT MIGRATION",
  );

  printDivider();

  console.log("");

  if (APPLY_MODE) {
    console.log(
      "MODE: APPLY",
    );

    console.log(
      "Firestore writes are ENABLED.",
    );
  } else {
    console.log(
      "MODE: DRY RUN / READ ONLY",
    );

    console.log(
      "No Firestore documents will be modified.",
    );
  }

  console.log("");

  console.log(
    `Firebase project: ${FIREBASE_PROJECT_ID}`,
  );

  console.log(
    `Collection: ${SERVICES_COLLECTION}`,
  );

  console.log("");

  console.log(
    "Reading services from Firestore...",
  );

  const snapshot =
    await db
      .collection(
        SERVICES_COLLECTION,
      )
      .get();

  console.log(
    `Services found: ${snapshot.size}`,
  );

  console.log("");

  if (snapshot.empty) {
    console.log(
      "No services found.",
    );

    return;
  }

  /*
   * Backup is created only in APPLY mode.
   * Dry-run remains read-only with respect to Firestore.
   */
  if (APPLY_MODE) {
    const fulfillmentBackup:
      FulfillmentBackupItem[] =
      snapshot.docs.map(
        (document) => {
          const data =
            document.data() as ServiceDocument;

          return {
            serviceId:
              document.id,

            fulfillmentMode:
              data.fulfillmentMode ??
              null,
          };
        },
      );

    writeFulfillmentBackup(
      fulfillmentBackup,
    );

    console.log(
      `Rollback backup created: ${FULFILLMENT_BACKUP_FILE}`,
    );

    console.log(
      `Services backed up: ${fulfillmentBackup.length}`,
    );

    console.log("");
  }

  const stats =
    createEmptyStats();

  const servicesWithoutMode:
    AuditedService[] = [];

  const servicesWithInvalidMode:
    AuditedService[] = [];

  const modeCounts =
    new Map<
      ServiceFulfillmentMode,
      number
    >();

  for (
    const document of
    snapshot.docs
  ) {
    const data =
      document.data() as ServiceDocument;

    const name =
      cleanString(
        data.name,
      );

    const categoryId =
      cleanString(
        data.categoryId,
      );

    const subcategoryId =
      cleanString(
        data.subcategoryId,
      );

    const rawFulfillmentMode =
      cleanString(
        data.fulfillmentMode,
      );

    const fulfillmentMode =
      getServiceFulfillmentMode(
        data.fulfillmentMode,
      );

    const service: AuditedService = {
      id:
        document.id,

      name,

      categoryId,

      subcategoryId,

      fulfillmentMode,

      rawFulfillmentMode,
    };

    stats.total++;

    if (!name) {
      stats.missingName++;
    }

    if (!categoryId) {
      stats.missingCategoryId++;
    }

    if (!subcategoryId) {
      stats.missingSubcategoryId++;
    }

    if (!rawFulfillmentMode) {
      stats.withoutFulfillmentMode++;

      servicesWithoutMode.push(
        service,
      );
    } else if (!fulfillmentMode) {
      stats.invalidFulfillmentMode++;

      servicesWithInvalidMode.push(
        service,
      );
    } else {
      stats.withValidFulfillmentMode++;

      modeCounts.set(
        fulfillmentMode,
        (
          modeCounts.get(
            fulfillmentMode,
          ) ?? 0
        ) + 1,
      );
    }
  }

  servicesWithoutMode.sort(
    (a, b) =>
      a.id.localeCompare(
        b.id,
      ),
  );

  servicesWithInvalidMode.sort(
    (a, b) =>
      a.id.localeCompare(
        b.id,
      ),
  );

  const classifiedMissingServices:
    ClassifiedService[] =
    servicesWithoutMode.map(
      (service) => ({
        service,

        classification:
          classifyMissingService(
            service,
          ),
      }),
    );

  const suggestedModeCounts =
    new Map<
      ServiceFulfillmentMode,
      number
    >();

  const confidenceCounts =
    new Map<
      ClassificationConfidence,
      number
    >();

  for (
    const item of
    classifiedMissingServices
  ) {
    const mode =
      item.classification.mode;

    const confidence =
      item.classification.confidence;

    suggestedModeCounts.set(
      mode,
      (
        suggestedModeCounts.get(
          mode,
        ) ?? 0
      ) + 1,
    );

    confidenceCounts.set(
      confidence,
      (
        confidenceCounts.get(
          confidence,
        ) ?? 0
      ) + 1,
    );
  }

  const approvedInvalidCorrections:
    ApprovedInvalidCorrection[] =
    [];

  const unapprovedInvalidServices:
    AuditedService[] =
    [];

  for (
    const service of
    servicesWithInvalidMode
  ) {
    const suggestion =
      suggestFulfillmentMode(
        service.rawFulfillmentMode,
      );

    if (suggestion) {
      approvedInvalidCorrections.push({
        service,
        mode:
          suggestion,
      });
    } else {
      unapprovedInvalidServices.push(
        service,
      );
    }
  }

  /* ==========================================================
     MEDIUM CONFIDENCE GROUPS
  ========================================================== */

  const mediumConfidenceGroups =
    new Map<
      string,
      MediumConfidenceGroup
    >();

  for (
    const item of
    classifiedMissingServices
  ) {
    if (
      item.classification.confidence !==
      "medium"
    ) {
      continue;
    }

    const categoryId =
      item.service.categoryId ||
      "(missing)";

    const subcategoryId =
      item.service.subcategoryId ||
      "(missing)";

    const key =
      `${categoryId}::${subcategoryId}`;

    const existing =
      mediumConfidenceGroups.get(
        key,
      );

    if (existing) {
      existing.count++;
    } else {
      mediumConfidenceGroups.set(
        key,
        {
          categoryId,
          subcategoryId,
          count: 1,
        },
      );
    }
  }

  const sortedMediumConfidenceGroups =
    Array.from(
      mediumConfidenceGroups.values(),
    ).sort(
      (a, b) =>
        b.count - a.count ||
        a.categoryId.localeCompare(
          b.categoryId,
        ) ||
        a.subcategoryId.localeCompare(
          b.subcategoryId,
        ),
    );

  writeMediumConfidenceReview(
    classifiedMissingServices,
    sortedMediumConfidenceGroups,
  );

  /* ==========================================================
     CURRENT SUMMARY
  ========================================================== */

  printDivider();

  console.log(
    "CURRENT FIRESTORE SUMMARY",
  );

  printDivider();

  console.log("");

  console.log(
    `Total services             : ${stats.total}`,
  );

  console.log(
    `Valid fulfillment mode     : ${stats.withValidFulfillmentMode}`,
  );

  console.log(
    `Missing fulfillment mode   : ${stats.withoutFulfillmentMode}`,
  );

  console.log(
    `Invalid fulfillment mode   : ${stats.invalidFulfillmentMode}`,
  );

  console.log("");

  for (
    const mode of
    VALID_FULFILLMENT_MODES
  ) {
    console.log(
      `${mode.padEnd(28)}: ${
        modeCounts.get(
          mode,
        ) ?? 0
      }`,
    );
  }

  /* ==========================================================
     CLASSIFICATION SUMMARY
  ========================================================== */

  console.log("");

  printDivider();

  console.log(
    "CLASSIFICATION SUMMARY",
  );

  printDivider();

  console.log("");

  console.log(
    `Missing services classified: ${classifiedMissingServices.length}`,
  );

  console.log("");

  for (
    const mode of
    VALID_FULFILLMENT_MODES
  ) {
    console.log(
      `${mode.padEnd(28)}: ${
        suggestedModeCounts.get(
          mode,
        ) ?? 0
      }`,
    );
  }

  console.log("");

  console.log(
    `High confidence             : ${
      confidenceCounts.get(
        "high",
      ) ?? 0
    }`,
  );

  console.log(
    `Medium confidence           : ${
      confidenceCounts.get(
        "medium",
      ) ?? 0
    }`,
  );

  console.log(
    `Needs manual review         : ${
      confidenceCounts.get(
        "review",
      ) ?? 0
    }`,
  );

  /* ==========================================================
     MEDIUM CONFIDENCE GROUP REPORT
  ========================================================== */

  console.log("");

  printDivider();

  console.log(
    "MEDIUM CONFIDENCE GROUPS",
  );

  printDivider();

  console.log("");

  console.log(
    `Total medium confidence: ${
      confidenceCounts.get(
        "medium",
      ) ?? 0
    }`,
  );

  console.log(
    `Total groups: ${sortedMediumConfidenceGroups.length}`,
  );

  console.log("");

  if (
    sortedMediumConfidenceGroups.length ===
    0
  ) {
    console.log(
      "None.",
    );
  } else {
    for (
      const group of
      sortedMediumConfidenceGroups
    ) {
      console.log(
        [
          `Count: ${String(group.count).padStart(3, " ")}`,
          `Category: ${group.categoryId}`,
          `Subcategory: ${group.subcategoryId}`,
        ].join(" | "),
      );
    }
  }

  console.log("");

  console.log(
    `Medium review file: ${MEDIUM_REVIEW_FILE}`,
  );

  /* ==========================================================
     DATA QUALITY
  ========================================================== */

  console.log("");

  printDivider();

  console.log(
    "DATA QUALITY",
  );

  printDivider();

  console.log("");

  console.log(
    `Missing name               : ${stats.missingName}`,
  );

  console.log(
    `Missing categoryId         : ${stats.missingCategoryId}`,
  );

  console.log(
    `Missing subcategoryId      : ${stats.missingSubcategoryId}`,
  );

  /* ==========================================================
     INVALID MODES
  ========================================================== */

  console.log("");

  printDivider();

  console.log(
    "INVALID FULFILLMENT MODES",
  );

  printDivider();

  console.log("");

  console.log(
    `Total invalid: ${servicesWithInvalidMode.length}`,
  );

  console.log("");

  if (
    servicesWithInvalidMode.length ===
    0
  ) {
    console.log(
      "None.",
    );
  } else {
    for (
      const service of
      servicesWithInvalidMode
    ) {
      printService(
        service,
      );

      const suggestion =
        suggestFulfillmentMode(
          service.rawFulfillmentMode,
        );

      console.log(
        `Suggested correction: ${
          suggestion ??
          "(manual review required)"
        }`,
      );

      console.log("");
    }
  }

  /* ==========================================================
     APPROVED INVALID CORRECTIONS
  ========================================================== */

  printDivider();

  console.log(
    "APPROVED INVALID CORRECTIONS",
  );

  printDivider();

  console.log("");

  console.log(
    `Approved invalid corrections: ${approvedInvalidCorrections.length}`,
  );

  console.log(
    `Unapproved invalid values    : ${unapprovedInvalidServices.length}`,
  );

  /* ==========================================================
     CLASSIFICATION PREVIEW
  ========================================================== */

  console.log("");

  printDivider();

  console.log(
    "MISSING SERVICE CLASSIFICATION PREVIEW",
  );

  printDivider();

  console.log("");

  console.log(
    `Showing up to ${CLASSIFICATION_PREVIEW_LIMIT} services.`,
  );

  console.log("");

  const classificationPreview =
    classifiedMissingServices.slice(
      0,
      CLASSIFICATION_PREVIEW_LIMIT,
    );

  for (
    const item of
    classificationPreview
  ) {
    printClassification(
      item,
    );
  }

  if (
    classifiedMissingServices.length >
    classificationPreview.length
  ) {
    console.log("");

    console.log(
      `${
        classifiedMissingServices.length -
        classificationPreview.length
      } additional classifications not shown.`,
    );
  }

  /* ==========================================================
     NEEDS REVIEW
  ========================================================== */

  const reviewServices =
    classifiedMissingServices.filter(
      (item) =>
        item.classification.mode ===
          "needs_review" ||
        item.classification.confidence ===
          "review",
    );

  console.log("");

  printDivider();

  console.log(
    "SERVICES REQUIRING MANUAL REVIEW",
  );

  printDivider();

  console.log("");

  console.log(
    `Total requiring review: ${reviewServices.length}`,
  );

  console.log("");

  const reviewPreview =
    reviewServices.slice(
      0,
      CLASSIFICATION_PREVIEW_LIMIT,
    );

  if (
    reviewPreview.length ===
    0
  ) {
    console.log(
      "None.",
    );
  } else {
    for (
      const item of
      reviewPreview
    ) {
      printClassification(
        item,
      );
    }
  }

  /* ==========================================================
     BUILD SAFE WRITE PLAN
  ========================================================== */

  const pendingWrites:
    PendingWrite[] = [];

  for (
    const item of
    classifiedMissingServices
  ) {
    if (
      item.classification.mode ===
        "needs_review" ||
      item.classification.confidence ===
        "review"
    ) {
      continue;
    }

    pendingWrites.push({
      serviceId:
        item.service.id,

      mode:
        item.classification.mode,

      source:
        "missing_classification",
    });
  }

  for (
    const correction of
    approvedInvalidCorrections
  ) {
    pendingWrites.push({
      serviceId:
        correction.service.id,

      mode:
        correction.mode,

      source:
        "invalid_correction",
    });
  }

  const missingClassificationWriteCount =
    pendingWrites.filter(
      (write) =>
        write.source ===
        "missing_classification",
    ).length;

  const invalidCorrectionWriteCount =
    pendingWrites.filter(
      (write) =>
        write.source ===
        "invalid_correction",
    ).length;

  console.log("");

  printDivider();

  console.log(
    "WRITE PLAN",
  );

  printDivider();

  console.log("");

  console.log(
    `Missing mode writes         : ${missingClassificationWriteCount}`,
  );

  console.log(
    `Invalid correction writes   : ${invalidCorrectionWriteCount}`,
  );

  console.log(
    `Total planned writes        : ${pendingWrites.length}`,
  );

  console.log(
    `Batch size                  : ${WRITE_BATCH_SIZE}`,
  );

  /* ==========================================================
     SAFETY VALIDATION
  ========================================================== */

  validateApplySafety(
    classifiedMissingServices,
    unapprovedInvalidServices,
  );

  /* ==========================================================
     DRY RUN
  ========================================================== */

  if (!APPLY_MODE) {
    console.log("");

    printDivider();

    console.log(
      "DRY RUN COMPLETE",
    );

    printDivider();

    console.log("");

    console.log(
      "Firestore writes performed: 0",
    );

    console.log(
      "Existing valid fulfillmentMode values changed: 0",
    );

    console.log(
      "Invalid fulfillmentMode values changed: 0",
    );

    console.log(
      "Missing fulfillmentMode values changed: 0",
    );

    console.log("");

    console.log(
      `Medium confidence review saved to: ${MEDIUM_REVIEW_FILE}`,
    );

    console.log("");

    console.log(
      "Review the medium-confidence file before using --apply.",
    );

    console.log("");

    return;
  }

  /* ==========================================================
     APPLY
  ========================================================== */

  console.log("");

  printDivider();

  console.log(
    "APPLYING MIGRATION",
  );

  printDivider();

  console.log("");

  console.log(
    `Project verified: ${FIREBASE_PROJECT_ID}`,
  );

  console.log(
    `Rollback backup: ${FULFILLMENT_BACKUP_FILE}`,
  );

  console.log(
    `Writes to perform: ${pendingWrites.length}`,
  );

  console.log("");

  await applyWrites(
    pendingWrites,
  );

  /* ==========================================================
     VERIFY AFTER WRITE
  ========================================================== */

  console.log("");

  console.log(
    "Verifying Firestore after migration...",
  );

  const verificationSnapshot =
    await db
      .collection(
        SERVICES_COLLECTION,
      )
      .get();

  let remainingMissing = 0;
  let remainingInvalid = 0;
  let validAfterMigration = 0;

  const verificationModeCounts =
    new Map<
      ServiceFulfillmentMode,
      number
    >();

  for (
    const document of
    verificationSnapshot.docs
  ) {
    const data =
      document.data() as ServiceDocument;

    const rawMode =
      cleanString(
        data.fulfillmentMode,
      );

    if (!rawMode) {
      remainingMissing++;
      continue;
    }

    const mode =
      getServiceFulfillmentMode(
        data.fulfillmentMode,
      );

    if (!mode) {
      remainingInvalid++;
      continue;
    }

    validAfterMigration++;

    verificationModeCounts.set(
      mode,
      (
        verificationModeCounts.get(
          mode,
        ) ?? 0
      ) + 1,
    );
  }

  console.log("");

  printDivider();

  console.log(
    "MIGRATION VERIFICATION",
  );

  printDivider();

  console.log("");

  console.log(
    `Total services             : ${verificationSnapshot.size}`,
  );

  console.log(
    `Valid fulfillment mode     : ${validAfterMigration}`,
  );

  console.log(
    `Missing fulfillment mode   : ${remainingMissing}`,
  );

  console.log(
    `Invalid fulfillment mode   : ${remainingInvalid}`,
  );

  console.log("");

  for (
    const mode of
    VALID_FULFILLMENT_MODES
  ) {
    console.log(
      `${mode.padEnd(28)}: ${
        verificationModeCounts.get(
          mode,
        ) ?? 0
      }`,
    );
  }

  console.log("");

  if (
    remainingMissing > 0 ||
    remainingInvalid > 0
  ) {
    throw new Error(
      [
        "Migration writes completed, but verification found unresolved data.",
        `Missing: ${remainingMissing}.`,
        `Invalid: ${remainingInvalid}.`,
      ].join(" "),
    );
  }

  printDivider();

  console.log(
    "MIGRATION COMPLETE",
  );

  printDivider();

  console.log("");

  console.log(
    `Firestore writes performed: ${pendingWrites.length}`,
  );

  console.log(
    "Existing valid fulfillmentMode values changed: 0",
  );

  console.log(
    `Invalid fulfillmentMode values corrected: ${invalidCorrectionWriteCount}`,
  );

  console.log(
    `Missing fulfillmentMode values populated: ${missingClassificationWriteCount}`,
  );

  console.log("");

  console.log(
    `Rollback backup saved at: ${FULFILLMENT_BACKUP_FILE}`,
  );

  console.log("");

  console.log(
    "All service fulfillmentMode values are now valid.",
  );

  console.log("");
}

/* ============================================================
   RUN
============================================================ */

auditServiceFulfillmentModes()
  .then(() => {
    console.log(
      APPLY_MODE
        ? "Fulfillment migration finished successfully."
        : "Fulfillment audit finished successfully.",
    );

    process.exit(0);
  })
  .catch(
    (error: unknown) => {
      console.error("");

      printDivider();

      console.error(
        APPLY_MODE
          ? "FULFILLMENT MIGRATION FATAL ERROR"
          : "FULFILLMENT AUDIT FATAL ERROR",
      );

      printDivider();

      console.error("");

      if (
        error instanceof Error
      ) {
        console.error(
          error.message,
        );
      } else {
        console.error(
          error,
        );
      }

      console.error("");

      console.error(
        APPLY_MODE
          ? "Migration stopped. Review the error before running --apply again."
          : "Audit stopped.",
      );

      console.error("");

      process.exit(1);
    },
  );