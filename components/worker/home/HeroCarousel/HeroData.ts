import { HeroBannerItem } from "./HeroTypes";

export const heroData: HeroBannerItem[] = [
  {
    id: "jobs-1",
    type: "job",
    title: "Find New Jobs",
    subtitle: "Discover nearby service requests that match your skills.",
    buttonLabel: "View Jobs",
    icon: "construct",
    image: require("@/assets/images/banners/jobs-1.png"),
    route: "/(worker)/jobs",
    colors: ["#FF7A00", "#FF5A00"],
  },

  {
    id: "jobs-2",
    type: "job",
    title: "Track Your Earnings",
    subtitle: "Manage active jobs, completed work, and your income.",
    buttonLabel: "Open Dashboard",
    icon: "wallet",
    image: require("@/assets/images/banners/jobs-2.png"),
    route: "/(worker)/wallet",
    colors: ["#2563EB", "#1D4ED8"],
  },

  {
    id: "market-1",
    type: "market",
    title: "Sell Your Products",
    subtitle: "Reach more customers by listing your products on Fixxam Market.",
    buttonLabel: "Add Product",
    icon: "storefront",
    image: require("@/assets/images/banners/market-1.png"),
    route: "/(worker)/market/add-product",
    colors: ["#10B981", "#059669"],
  },

  {
    id: "market-2",
    type: "market",
    title: "Grow Your Store",
    subtitle: "Manage inventory, orders, and product performance.",
    buttonLabel: "Manage Store",
    icon: "cube",
    image: require("@/assets/images/banners/market-2.png"),
    route: "/(worker)/market",
    colors: ["#7C3AED", "#6D28D9"],
  },

  {
    id: "market-3",
    type: "market",
    title: "Boost Your Sales",
    subtitle: "Promote your products and attract more buyers every day.",
    buttonLabel: "Explore Market",
    icon: "trending-up",
    image: require("@/assets/images/banners/market-3.png"),
    route: "/(worker)/market",
    colors: ["#F97316", "#EA580C"],
  },
];