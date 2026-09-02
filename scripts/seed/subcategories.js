const icons = require("./icons");
const fs = require("fs");
const path = require("path");

const { db } = require("./firebase");

const subcategories = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      "../../assets/data/subcategories.json"
    ),
    "utf8"
  )
);

function slug(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function seedSubcategories() {
  const batch = db.batch();

  let order = 1;

  Object.entries(subcategories).forEach(
    ([categoryName, items]) => {

      const categoryId = slug(categoryName);

      items.forEach((name) => {

        const subcategoryId = slug(name);

        const ref = db
          .collection("subcategories")
          .doc(subcategoryId);

        const subcategoryIcon =
          icons.subcategories[subcategoryId] ||
          icons.categories[categoryId] ||
          icons.default;

        batch.set(ref, {
          id: subcategoryId,

          name,

          categoryId,

          image: "",

          active: true,

          order: order++,

          createdAt: new Date(),

          icon: subcategoryIcon.icon,

          color: subcategoryIcon.color,

          backgroundColor:
            subcategoryIcon.backgroundColor,
        });

      });

    }
  );

  await batch.commit();

  console.log("✅ Subcategories Seeded");
}

module.exports = seedSubcategories;