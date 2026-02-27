export * from "./colors";
export * from "./spacing";
export * from "./typography";

import { colors } from "./colors";
import { borderRadius, shadow, spacing } from "./spacing";
import { fontSize, fontWeight, textStyles } from "./typography";

export const theme = {
  colors,
  fontSize,
  textStyles,
  fontWeight,
  spacing,
  borderRadius,
  shadow,
} as const;
