module.exports = {

  // Default
  default: require("./default"),

  // Categories
  categories: require("./categories"),

  // Subcategories
  subcategories: require("./subcategories"),

  // Services
  services: {

    // Home Services
    ...require("./home"),

    // Construction
    ...require("./construction"),

    // Electrical
    ...require("./electrical"),

    // Security
    ...require("./security"),

    // Automotive
    ...require("./automotive"),

    // Technology
    ...require("./technology"),

    // Beauty
    ...require("./beauty"),

    // Fashion
    ...require("./fashion"),

    // Events
    ...require("./events"),

    // Business
    ...require("./business"),

    // Healthcare
    ...require("./healthcare"),

    // Agriculture
    ...require("./agriculture"),

    // Food
    ...require("./food"),

    // Logistics
    ...require("./logistics"),

    // Education
    ...require("./education"),

  },

};