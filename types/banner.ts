export type BannerType = "product" | "job";

export type BannerAction =
  | "products"
  | "jobs"
  | "addProduct";

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  type: BannerType;
  action: BannerAction;
}