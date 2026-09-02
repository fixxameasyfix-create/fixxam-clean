import type { HeroBannerItem } from "./HeroTypes";

export const heroData: HeroBannerItem[] = [
  {
    id: "jobs-1",
    type: "book",

    image: require(
      "@/assets/images/customer-banners/book-1.png",
    ),

    route:
      "/(customer)/contact-worker/contact",
  },

  {
    id: "jobs-2",
    type: "book",

    image: require(
      "@/assets/images/customer-banners/book-2.png",
    ),

    route:
      "/(customer)/promotions",
  },

  {
    id: "market-1",
    type: "market",

    image: require(
      "@/assets/images/customer-banners/customer-market-1.png",
    ),

    route:
      "/(customer)/search",
  },

  {
    id: "market-2",
    type: "market",

    image: require(
      "@/assets/images/customer-banners/customer-market-2.png",
    ),

    route:
      "/(customer)/market/popular",
  },

  {
    id: "market-3",
    type: "market",

    image: require(
      "@/assets/images/customer-banners/customer-market-4.png",
    ),

    route:
      "/(customer)/nearby-workers",
  },
];