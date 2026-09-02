const resolveServiceIcon = require("./icons/resolver");
const icons = require("./icons");

const fs = require("fs");
const path = require("path");

const { db } = require("./firebase");

const mapping = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      "../../assets/data/service-mapping.json"
    ),
    "utf8"
  )
);

const subcategories = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      "../../assets/data/subcategories.json"
    ),
    "utf8"
  )
);

const servicesFolder = path.join(
  __dirname,
  "../../assets/services"
);

function slug(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function seedServices() {

  const batch = db.batch();

  let order = 1;

  for (const [categoryName, subs] of Object.entries(subcategories)) {

    const categoryId = slug(categoryName);

    for (const subcategoryName of subs) {

      const subcategoryId = slug(subcategoryName);

      const fileName = mapping[subcategoryName];

      if (!fileName) {
        console.log(`⚠ No mapping for ${subcategoryName}`);
        continue;
      }

      const filePath = path.join(
        servicesFolder,
        `${fileName}.json`
      );

      if (!fs.existsSync(filePath)) {
        console.log(`⚠ Missing: ${fileName}.json`);
        continue;
      }

      const services = JSON.parse(
        fs.readFileSync(filePath, "utf8")
      );

      services.forEach((service) => {

        const serviceId =
          service.id || slug(service.name);

        const serviceName =
          service.name || service;

        const ref = db
          .collection("services")
          .doc(serviceId);

        const serviceIcon = resolveServiceIcon(
          serviceId,
          icons.subcategories[subcategoryId],
          icons.categories[categoryId],
          icons.default
        );

        batch.set(ref, {
          id: serviceId,

          name: serviceName,

          categoryId,

          subcategoryId,

          fileName,

          active: true,

          order: order++,

          createdAt: new Date(),

          icon: serviceIcon.icon,

          color: serviceIcon.color,

          backgroundColor:
            serviceIcon.backgroundColor,

       enrichment: {
  status: "pending",
  version: 1,
  attempts: 0,
},

        });

      });

    }

  }

  await batch.commit();

  console.log("✅ Services Seeded");

}

module.exports = seedServices;