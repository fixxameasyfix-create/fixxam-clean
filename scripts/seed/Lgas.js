const fs = require("fs");
const path = require("path");

const { db } = require("./firebase");

const lgas = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      "../../assets/data/lgas.json"
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

async function seedLgas() {
  const batch = db.batch();

  let order = 1;

  Object.entries(lgas).forEach(([stateName, stateLgas]) => {

    const stateId = slug(stateName);

    stateLgas.forEach((lgaName) => {

      const id = `${stateId}-${slug(lgaName)}`;

      batch.set(
        db.collection("lgas").doc(id),
        {
          id,
          name: lgaName,

          stateId,

          active: true,

          order: order++,

          createdAt: new Date(),
        }
      );

    });

  });

  await batch.commit();

  console.log("✅ LGAs Seeded");
}

module.exports = seedLgas;