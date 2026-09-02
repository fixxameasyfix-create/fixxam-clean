const { db } = require("./firebase");

async function seedPromotions() {
  const promotions = [
    {
      id: "welcome-offer",
      title: "Save up to 20%",
      subtitle: "Book your first service today",
      buttonText: "Book Now",
      image: "",
      active: true,
      order: 1,
    },
    {
      id: "trusted-workers",
      title: "Verified Workers",
      subtitle: "Hire trusted professionals",
      buttonText: "Explore",
      image: "",
      active: true,
      order: 2,
    },
  ];

  const batch = db.batch();

  promotions.forEach((item) => {
    batch.set(
      db.collection("promotions").doc(item.id),
      item
    );
  });

  await batch.commit();

  console.log("✅ Promotions Seeded");
}

module.exports = seedPromotions;