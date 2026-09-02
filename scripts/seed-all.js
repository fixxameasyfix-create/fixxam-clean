const seedCategories = require("./seed/categories");
const seedSubcategories = require("./seed/subcategories");
const seedServices = require("./seed/services");
const seedStates = require("./seed/states");
const seedLgas = require("./seed/lgas");
const seedSettings = require("./seed/settings");
const seedPromotions = require("./seed/promotions");
const seedBanners = require("./seed/banners");
const seedWorkers = require("./seed/workers");
const seedProducts = require("./seed/products");

async function seedAll() {
  try {
    console.log(
      "🚀 Starting FIXXAM Database Seed...\n"
    );

    await seedCategories();

    await seedSubcategories();

    await seedServices();

    await seedStates();

    await seedLgas();

    await seedSettings();

    await seedPromotions();

    await seedBanners();

    await seedWorkers();

    await seedProducts();

    console.log(
      "\n🎉 FIXXAM Database Seed Completed Successfully."
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ Seed Failed"
    );

    console.error(error);

    process.exit(1);
  }
}

seedAll();