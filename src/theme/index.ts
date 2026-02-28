export * from "./colors";
export * from "./spacing";
export * from "./typography";

import { theme as colorTheme } from "./colors";
import { borderRadius, shadow, spacing } from "./spacing";
import { fontSize, fontWeight, textStyles } from "./typography";

export const theme = {
  colors: colorTheme,
  fontSize,
  textStyles,
  fontWeight,
  spacing,
  borderRadius,
  shadow,
} as const;
