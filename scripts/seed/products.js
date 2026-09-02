const { db } = require("./firebase");

/* ============================================================
   PRODUCT SEED DATA
============================================================ */

const PRODUCTS = [
  {
    id: "seed-premium-led-bulb",
    name: "Premium LED Bulb",
    description:
      "Energy-saving LED bulb suitable for home electrical work.",
    category: "Electrical & Energy",
    price: 3500,
    stock: 25,
    delivery: true,
    condition: "new",
    featured: true,
    serviceIds: [],
    thumbnail:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
    ],
  },

  {
    id: "seed-wall-paint-20l",
    name: "Wall Paint 20L",
    description:
      "High-quality interior wall paint for professional finishing.",
    category: "Home Services",
    price: 28500,
    stock: 12,
    delivery: true,
    condition: "new",
    featured: true,
    serviceIds: [],
    thumbnail:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828",
    images: [
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828",
    ],
  },

  {
    id: "seed-plumbing-repair-kit",
    name: "Plumbing Repair Kit",
    description:
      "Professional plumbing repair tools and fittings.",
    category: "Home Services",
    price: 18000,
    stock: 10,
    delivery: true,
    condition: "new",
    featured: false,
    serviceIds: [],
    thumbnail:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7",
    images: [
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7",
    ],
  },

  {
    id: "seed-security-camera",
    name: "Security Camera",
    description:
      "Indoor and outdoor security camera for home and business.",
    category: "Security Services",
    price: 45000,
    stock: 8,
    delivery: true,
    condition: "new",
    featured: true,
    serviceIds: [],
    thumbnail:
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9",
    images: [
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9",
    ],
  },

  {
    id: "seed-car-battery",
    name: "Car Battery",
    description:
      "Reliable replacement battery for compatible vehicles.",
    category: "Automotive Services",
    price: 95000,
    stock: 6,
    delivery: true,
    condition: "new",
    featured: true,
    serviceIds: [],
    thumbnail:
      "https://images.unsplash.com/photo-1625047509248-ec889cbff17f",
    images: [
      "https://images.unsplash.com/photo-1625047509248-ec889cbff17f",
    ],
  },

  {
    id: "seed-laptop-stand",
    name: "Laptop Stand",
    description:
      "Adjustable laptop stand for office and professional use.",
    category: "Technology Services",
    price: 12500,
    stock: 15,
    delivery: true,
    condition: "new",
    featured: false,
    serviceIds: [],
    thumbnail:
      "https://images.unsplash.com/photo-1523206489230-c012c64b2b48",
    images: [
      "https://images.unsplash.com/photo-1523206489230-c012c64b2b48",
    ],
  },

  {
    id: "seed-tailoring-measuring-kit",
    name: "Tailoring Measuring Kit",
    description:
      "Professional measuring tools for tailoring and fashion work.",
    category: "Fashion & Tailoring",
    price: 6500,
    stock: 20,
    delivery: true,
    condition: "new",
    featured: false,
    serviceIds: [],
    thumbnail:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
    ],
  },

  {
    id: "seed-event-decoration-set",
    name: "Event Decoration Set",
    description:
      "Reusable decoration materials for events and celebrations.",
    category: "Events & Entertainment",
    price: 32000,
    stock: 5,
    delivery: true,
    condition: "new",
    featured: true,
    serviceIds: [],
    thumbnail:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
    ],
  },
];

/* ============================================================
   SEED PRODUCTS
============================================================ */

async function seedProducts() {
  console.log("🛍️ Starting Products Seeder...\n");

  /* ==========================================================
     FIND WORKERS
  ========================================================== */

  const workersSnapshot = await db
    .collection("workerPublicProfiles")
    .limit(8)
    .get();

  if (workersSnapshot.empty) {
    throw new Error(
      "No workers found in workerPublicProfiles.",
    );
  }

  const workers = workersSnapshot.docs;

  /* ==========================================================
     BATCH
  ========================================================== */

  const batch = db.batch();

  PRODUCTS.forEach((product, index) => {
    const worker =
      workers[index % workers.length];

    const productRef = db
      .collection("products")
      .doc(product.id);

    batch.set(
      productRef,
      {
        workerId: worker.id,

        storeId: "",

        name: product.name,

        description:
          product.description,

        category:
          product.category,

        price:
          product.price,

        stock:
          product.stock,

        thumbnail:
          product.thumbnail,

        images:
          product.images,

        delivery:
          product.delivery,

        condition:
          product.condition,

        featured:
          product.featured,

        serviceIds:
          product.serviceIds,

        rating: 0,

        sold: 0,

        status: "active",

        createdAt: new Date(),

        updatedAt: new Date(),
      },
      {
        merge: true,
      },
    );
  });

  /* ==========================================================
     COMMIT
  ========================================================== */

  await batch.commit();

  console.log(
    `✅ ${PRODUCTS.length} Products Seeded Successfully`,
  );

  console.log(
    `👷 Products assigned to ${workers.length} workers`,
  );
}

/* ============================================================
   EXPORT
============================================================ */

module.exports = seedProducts;