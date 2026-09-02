const { db } = require("./firebase");

async function seedBanners() {
  const banners = [
    {
      id: "home-banner",
      title: "Need a Professional?",
      subtitle: "Book trusted workers near you",
      image: "",
      buttonText: "Book Now",
      link: "/book",
      active: true,
      order: 1,
    },
  ];

  const batch = db.batch();

  banners.forEach((item) => {
    batch.set(
      db.collection("banners").doc(item.id),
      item
    );
  });

  await batch.commit();

  console.log("✅ Banners Seeded");
}

module.exports = seedBanners;