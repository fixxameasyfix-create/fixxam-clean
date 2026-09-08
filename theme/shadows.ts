export const Shadows = {
  /*
   * No shadow
   */
  none: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  /*
   * Small
   * Subtle cards / list items
   */
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  /*
   * Medium
   * Elevated cards / dropdowns
   */
  md: {
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  /*
   * Large
   * Floating UI / menus
   */
  lg: {
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 6,
  },

  /*
   * Fixxam Semantic Shadows
   */
  card: {
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  floating: {
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 5,
  },

  modal: {
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

export type FixxamShadows = typeof Shadows;

export default Shadows;