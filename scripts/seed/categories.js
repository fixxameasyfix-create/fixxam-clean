const icons = require("./icons");
const fs = require("fs");
const path = require("path");

const { db } = require("./firebase");

const categories = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      "../../assets/data/categories.json"
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

async function seedCategories() {
  const batch = db.batch();

  let order = 1;

  categories.forEach((name) => {

    const categoryId = slug(name);

    const ref = db
      .collection("categories")
      .doc(categoryId);

    const categoryIcon =
      icons.categories[categoryId] ||
      icons.default;

    batch.set(ref, {
      id: categoryId,

      name,

      image: "",

      active: true,

      order: order++,

      createdAt: new Date(),

      icon: categoryIcon.icon,

      color: categoryIcon.color,

      backgroundColor:
        categoryIcon.backgroundColor,
    });

  });

  await batch.commit();

  console.log(
    `✅ ${categories.length} Categories Seeded`
  );
}

module.exports = seedCategories;