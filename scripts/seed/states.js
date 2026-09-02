const fs = require("fs");
const path = require("path");

const { db } = require("./firebase");

const states = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      "../../assets/data/states.json"
    ),
    "utf8"
  )
);

function slug(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function seedStates() {
  const batch = db.batch();

  states.forEach((state, index) => {
    const name =
      typeof state === "string"
        ? state
        : state.name;

    const id = slug(name);

    batch.set(
      db.collection("states").doc(id),
      {
        id,
        name,
        active: true,
        order: index + 1,
        createdAt: new Date(),
      }
    );
  });

  await batch.commit();

  console.log(
    `✅ ${states.length} States Seeded`
  );
}

module.exports = seedStates;