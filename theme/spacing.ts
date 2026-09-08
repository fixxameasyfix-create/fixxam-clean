export const Spacing = {
  /*
   * Base spacing scale
   * Fixxam uses a consistent 4pt grid.
   */
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  huge: 40,
  massive: 48,

  /*
   * Screen Layout
   */
  screenPadding: 20,
  screenPaddingCompact: 16,
  screenPaddingLarge: 24,

  /*
   * Sections
   */
  sectionGap: 24,
  sectionGapLarge: 32,

  /*
   * Cards
   */
  cardPadding: 16,
  cardPaddingLarge: 20,
  cardGap: 12,

  /*
   * Forms
   */
  inputGap: 8,
  formGap: 16,
  fieldGroupGap: 20,

  /*
   * Buttons
   */
  buttonPadding: 16,
  buttonPaddingHorizontal: 20,
  buttonPaddingVertical: 14,

  /*
   * Lists
   */
  listItemGap: 12,
  listSectionGap: 20,

  /*
   * Icons
   */
  iconGap: 8,
  iconTextGap: 8,

  /*
   * Content
   */
  contentGap: 16,
  inlineGap: 8,
} as const;

export type FixxamSpacing = typeof Spacing;

export default Spacing;