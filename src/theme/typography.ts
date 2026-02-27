export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 34,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const textStyles = {
  largeTitle: {
    fontSize: 34,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  title1: {
    fontSize: 28,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  title2: {
    fontSize: 24,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  title3: {
    fontSize: 20,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  headline: {
    fontSize: 17,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  body: {
    fontSize: 15,
    fontWeight: "400" as const,
    fontFamily: "Inter_400Regular",
  },
  callout: {
    fontSize: 15,
    fontWeight: "500" as const,
    fontFamily: "Inter_500Medium",
  },
  subheadline: {
    fontSize: 13,
    fontWeight: "400" as const,
    fontFamily: "Inter_400Regular",
  },
  footnote: {
    fontSize: 11,
    fontWeight: "400" as const,
    fontFamily: "Inter_400Regular",
  },
} as const;
