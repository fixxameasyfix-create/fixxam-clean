const { db } = require("./firebase");

async function seedSettings() {
  await db.collection("settings").doc("app").set({
    appName: "Fixxam",

    maintenance: false,

    latestVersion: "1.0.0",

    minimumVersion: "1.0.0",

    supportEmail: "support@fixxam.com",

    supportPhone: "+234000000000",

    currency: "NGN",

    paymentMethod: "cash",

    marketPayment: "cash_on_delivery",

    bookingPayment: "cash",

    country: "Nigeria",
  });

  console.log("✅ Settings Seeded");
}

module.exports = seedSettings;