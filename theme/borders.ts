const radiusScale = {
  none: 0,

  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,

  full: 999,
} as const;

export const Borders = {
  /*
   * Base Radius Scale
   */
  ...radiusScale,

  /*
   * Fixxam Component Radius
   */
  button: radiusScale.md,
  buttonSmall: radiusScale.sm,

  input: radiusScale.md,
  search: radiusScale.md,

  card: radiusScale.lg,
  cardSmall: radiusScale.md,

  iconButton: radiusScale.md,

  image: radiusScale.md,
  media: radiusScale.lg,

  modal: radiusScale.xl,
  bottomSheet: radiusScale.xl,

  badge: radiusScale.full,
  chip: radiusScale.full,
  pill: radiusScale.full,

  avatar: radiusScale.full,
} as const;

export type FixxamBorders = typeof Borders;

export default Borders;