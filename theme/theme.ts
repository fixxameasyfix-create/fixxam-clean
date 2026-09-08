import { Borders } from "./borders";
import { CustomerColors } from "./customerColors";
import { FixxamTokens } from "./fixxamtokens";
import { Shadows } from "./shadows";
import { Spacing } from "./spacing";
import { Typography } from "./typography";
import { WorkerColors } from "./workerColors";

export type FixxamRole = "customer" | "worker";

/*
 * Shared structure.
 * Customer and Worker use the same design language.
 * Only role-specific colors change.
 */
export const CustomerTheme = {
  role: "customer",

  colors: CustomerColors,
  spacing: Spacing,
  borders: Borders,
  typography: Typography,
  shadows: Shadows,
  tokens: FixxamTokens,
} as const;

export const WorkerTheme = {
  role: "worker",

  colors: WorkerColors,
  spacing: Spacing,
  borders: Borders,
  typography: Typography,
  shadows: Shadows,
  tokens: FixxamTokens,
} as const;

export type FixxamTheme =
  | typeof CustomerTheme
  | typeof WorkerTheme;

/*
 * Get the correct Fixxam theme by role.
 */
export const getFixxamTheme = (
  role: FixxamRole,
): FixxamTheme => {
  return role === "worker"
    ? WorkerTheme
    : CustomerTheme;
};

/*
 * Keep existing exports working.
 */
export {
  CustomerColors,
  WorkerColors,
  Typography,
  Spacing,
  Borders,
  Shadows,
};