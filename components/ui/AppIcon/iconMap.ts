// components/ui/AppIcon/iconMap.ts

import {
  AirVent,
  ArrowUp,
  Bell,
  BriefcaseBusiness,
  BrushCleaning,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  Clock3,
  CookingPot,
  CreditCard,
  Droplets,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Fingerprint,
  Grid3X3,
  Hammer,
  Headphones,
  Heart,
  House,
  Image,
  Info,
  Laptop,
  LocateFixed,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Navigation,
  Package,
  Paintbrush,
  Phone,
  Plus,
  RefreshCw,
  Scissors,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  Truck,
  Upload,
  User,
  Users,
  Wallet,
  WifiOff,
  Wrench,
  X,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react-native";

/*
 * Official Fixxam icon registry.
 *
 * New screens/components should use these semantic names
 * instead of importing icon libraries directly.
 */
const icons = {
  /* ============================================================
     NAVIGATION
  ============================================================ */

  home: House,
  search: Search,
  profile: User,
  users: Users,
  jobs: BriefcaseBusiness,
  messages: MessageCircle,
  notifications: Bell,
  settings: Settings,

  /* ============================================================
     NAVIGATION ACTIONS
  ============================================================ */

  back: ChevronLeft,
  next: ChevronRight,
  down: ChevronDown,
  "arrow-up": ArrowUp,
  close: X,
  menu: Menu,
  more: MoreHorizontal,

  /* ============================================================
     COMMON ACTIONS
  ============================================================ */

  add: Plus,
  check: Check,
  delete: Trash2,
  filter: Filter,
  upload: Upload,
  refresh: RefreshCw,

  /* ============================================================
     LOCATION
  ============================================================ */

  location: MapPin,
  locate: LocateFixed,
  navigation: Navigation,

  /* ============================================================
     MEDIA
  ============================================================ */

  camera: Camera,
  image: Image,
  file: FileText,

  /* ============================================================
     CONTACT
  ============================================================ */

  phone: Phone,
  mail: Mail,

  /* ============================================================
     FINANCE
  ============================================================ */

  wallet: Wallet,
  payment: CreditCard,

  /* ============================================================
     DATE / TIME
  ============================================================ */

  calendar: CalendarDays,
  clock: Clock3,

  /* ============================================================
     AUTHENTICATION / SECURITY
  ============================================================ */

  lock: LockKeyhole,
  shield: Shield,
  verified: ShieldCheck,

  eye: Eye,
  "eye-off": EyeOff,

  fingerprint: Fingerprint,

  logout: LogOut,

  /* ============================================================
     CONNECTION
  ============================================================ */

  "wifi-off": WifiOff,

  /* ============================================================
     FEEDBACK / STATUS
  ============================================================ */

  success: CheckCircle2,
  error: XCircle,
  warning: CircleAlert,
  info: Info,
  help: CircleHelp,

  /* ============================================================
     SOCIAL / RATING
  ============================================================ */

  star: Star,
  heart: Heart,

  /* ============================================================
     SERVICES
  ============================================================ */

  "air-conditioner": AirVent,
  cleaning: BrushCleaning,
  plumbing: Droplets,
  electrician: Zap,
  carpenter: Hammer,
  mechanic: Wrench,
  painting: Paintbrush,
  delivery: Truck,

  "phone-repair": Smartphone,
  "computer-repair": Laptop,

  security: Shield,
  photography: Camera,
  catering: CookingPot,
  beauty: Scissors,

  package: Package,

  /* ============================================================
     BOOK / DISCOVERY
  ============================================================ */

  grid: Grid3X3,
  headset: Headphones,
  cart: ShoppingCart,

  /* ============================================================
     GENERAL SERVICE
  ============================================================ */

  service: Wrench,
  professional: Sparkles,
} satisfies Record<string, LucideIcon>;

export type AppIconName =
  keyof typeof icons;

/*
 * Backwards-compatible aliases.
 *
 * These allow existing screens, service records,
 * Ionicons names and MaterialCommunityIcons names
 * to continue working while the app is migrated.
 */
const aliases: Record<
  string,
  AppIconName
> = {
  /* ============================================================
     PROFILE / AUTH LEGACY
  ============================================================ */

  user: "profile",
  account: "profile",
  person: "profile",

  "person-circle": "profile",
  "person-circle-outline":
    "profile",

  "person-outline":
    "profile",

  "person-add": "add",
  "person-add-outline":
    "add",

  construct: "service",
  "construct-outline":
    "service",

  /* ============================================================
     NAVIGATION LEGACY
  ============================================================ */

  house: "home",

  "chevron-back": "back",
  "chevron-back-outline":
    "back",

  "chevron-forward":
    "next",
  "chevron-forward-outline":
    "next",

  "chevron-down": "down",
  "chevron-down-outline":
    "down",

  /* ============================================================
     COMMON ACTION LEGACY
  ============================================================ */

  plus: "add",

  checkmark: "check",
  "checkmark-outline":
    "check",

  trash: "delete",
  "trash-outline":
    "delete",

  "refresh-cw":
    "refresh",

  reload: "refresh",

  /* ============================================================
     JOBS / WORK
  ============================================================ */

  job: "jobs",
  work: "jobs",
  briefcase: "jobs",

  /* ============================================================
     NOTIFICATIONS / MESSAGES
  ============================================================ */

  bell: "notifications",

  notification:
    "notifications",

  message: "messages",
  chat: "messages",

  "message-circle":
    "messages",

  /* ============================================================
     LOCATION
  ============================================================ */

  map: "location",
  pin: "location",
  "map-pin": "location",

  "location-outline":
    "location",

  "map-marker":
    "location",

  "map-marker-outline":
    "location",

  "map-marker-radius":
    "location",

  "map-marker-radius-outline":
    "location",

  /* ============================================================
     CONTACT
  ============================================================ */

  email: "mail",

  "email-outline":
    "mail",

  "mail-outline":
    "mail",

  "phone-outline":
    "phone",

  "call-outline":
    "phone",

  call: "phone",

  /* ============================================================
     AUTH / SECURITY LEGACY
  ============================================================ */

  "lock-outline":
    "lock",

  "lock-closed":
    "lock",

  "lock-closed-outline":
    "lock",

  "eye-outline":
    "eye",

  "eye-off-outline":
    "eye-off",

  "shield-check":
    "verified",

  fingerprint:
    "fingerprint",

  "log-out":
    "logout",

  "log-out-outline":
    "logout",

  /*
   * Temporary compatibility for old
   * Ionicons login icon usage.
   */
  "log-in":
    "profile",

  "log-in-outline":
    "profile",

  /* ============================================================
     STATUS LEGACY
  ============================================================ */

  "check-circle":
    "success",

  "check-circle-outline":
    "success",

  "checkmark-circle":
    "success",

  "checkmark-circle-outline":
    "success",

  alert:
    "warning",

  "alert-circle":
    "warning",

  "alert-circle-outline":
    "warning",

  "information-circle":
    "info",

  "information-circle-outline":
    "info",

  /* ============================================================
     CONNECTION
  ============================================================ */

  wifioff:
    "wifi-off",

  "wifi-off-outline":
    "wifi-off",

  /* ============================================================
     FINANCE
  ============================================================ */

  card:
    "payment",

  "credit-card":
    "payment",

  /* ============================================================
     BOOK SCREEN LEGACY ICONS
  ============================================================ */

  "grid-outline":
    "grid",

  "view-grid":
    "grid",

  "view-grid-outline":
    "grid",

  headset:
    "headset",

  "headset-outline":
    "headset",

  cart:
    "cart",

  "cart-outline":
    "cart",

  shoppingcart:
    "cart",

  "shopping-cart":
    "cart",

  cube:
    "package",

  "cube-outline":
    "package",

  tools:
    "service",

  "tools-outline":
    "service",

  "hammer-wrench":
    "service",

  /* ============================================================
     SERVICES
  ============================================================ */

  "air-conditioning":
    "air-conditioner",

  ac:
    "air-conditioner",

  fan:
    "air-conditioner",

  "spray-bottle":
    "cleaning",

  cleaner:
    "cleaning",

  plumber:
    "plumbing",

  electrical:
    "electrician",

  carpentry:
    "carpenter",

  painter:
    "painting",

  courier:
    "delivery",

  mobile:
    "phone-repair",

  smartphone:
    "phone-repair",

  laptop:
    "computer-repair",

  computer:
    "computer-repair",

  photographer:
    "photography",

  food:
    "catering",

  salon:
    "beauty",
};

/*
 * Normalize icon names coming from:
 * - Firestore
 * - legacy components
 * - service registry
 * - APIs
 */
function normalizeIconKey(
  value: string,
): string {
  return value
    .trim()
    .replace(
      /([a-z])([A-Z])/g,
      "$1-$2",
    )
    .replace(
      /[_\s]+/g,
      "-",
    )
    .replace(
      /-+/g,
      "-",
    )
    .toLowerCase();
}

function hasIcon(
  key: string,
): key is AppIconName {
  return key in icons;
}

/*
 * Resolve both official Fixxam icon names
 * and legacy/service icon names through
 * one controlled registry.
 */
export function resolveServiceIcon(
  iconName?: string | null,
): LucideIcon {
  const key =
    normalizeIconKey(
      iconName ?? "",
    );

  if (!key) {
    return icons.help;
  }

  if (hasIcon(key)) {
    return icons[key];
  }

  const alias =
    aliases[key];

  if (alias) {
    return icons[alias];
  }

  return icons.help;
}

export const iconMap =
  icons;

export const iconAliases =
  aliases;