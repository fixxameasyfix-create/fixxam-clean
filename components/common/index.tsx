/*
 * Fixxam Common Components
 *
 * Public entry point for shared composed components.
 */

export { default as AppAvatar } from "./AppAvatar";
export { default as AppBadge } from "./AppBadge";
export { default as AppBottomSheet } from "./AppBottomSheet";
export { default as AppChip } from "./AppChip";
export { default as AppDialog } from "./AppDialog";
export { default as AppDivider } from "./AppDivider";
export { default as AppEmpty } from "./AppEmpty";
export { default as AppError } from "./AppError";
export { default as AppFilterSheet } from "./AppFilterSheet";
export { default as AppFloatingButton } from "./AppFloatingButton";
export { default as AppHeader } from "./AppHeader";
export { default as AppIcon } from "./AppIcon";
export { default as AppLoader } from "./AppLoader";
export { default as AppOffline } from "./AppOffline";
export { default as AppRating } from "./AppRating";
export { default as AppSearch } from "./AppSearch";
export { default as AppSection } from "./AppSection";
export { default as AppSkeleton } from "./AppSkeleton";
export { default as AppStatus } from "./AppStatus";
export { default as AppSuccess } from "./AppSuccess";

export { default as LoadingOverlay } from "./LoadingOverlay";
export { default as SectionHeader } from "./SectionHeader";

export {
  toastConfig,
} from "./AppToast";

/*
 * Legacy aliases
 *
 * Keep old imports working during migration.
 * New code should use the App* names above.
 */
export { default as Divider } from "./AppDivider";
export { default as EmptyState } from "./AppEmpty";
export { default as ErrorState } from "./AppError";