// ─────────────────────────────────────────────
//  COLOR SYSTEM — Dark Only
// ─────────────────────────────────────────────

const palette = {
  // Neutros
  black: "#141416", // fundo mais profundo
  dark100: "#1A1C1A", // fundo principal de telas
  dark200: "#222422", // cards e seções
  dark300: "#2C2E2C", // cards elevados / inputs
  dark400: "#3A3C3A", // bordas e divisores
  dark500: "#5A5C5A", // texto desabilitado
  gray400: "#8A8C8A", // texto secundário
  white: "#F4F4F4", // texto primário (não puro)

  // Lime green — cor primária da marca
  lime: "#BEFF6C", // primário — botões, badges, destaques
  limeDark: "#BEFF6C", // pressed / hover
  limeSubtle: "#1E2910", // fundo sutil com tom lime (cards tintados)

  // Estados financeiros
  red: "#EF4444", // negativo
  redSubtle: "#2A0A0A", // fundo negativo
  redText: "#FF5A5A", // texto negativo
} as const;

// ─────────────────────────────────────────────
// TEMA ÚNICO — DARK
// ─────────────────────────────────────────────
export const theme = {
  // Fundos
  bg: palette.black, // fundo do app
  bgScreen: palette.dark100, // fundo de telas
  bgCard: palette.dark200, // cards padrão
  bgCardRaised: palette.dark300, // cards elevados, inputs
  bgAccent: palette.limeSubtle, // card com destaque lime

  // Textos
  textPrimary: palette.white, // títulos, valores
  textSecondary: palette.gray400, // labels, subtítulos
  textDisabled: palette.dark500, // desabilitado
  textOnLime: palette.black, // texto sobre fundo lime (preto no lime)

  // Marca
  primary: palette.lime, // #C5F135 — botões, ícones ativos
  primaryPress: palette.limeDark, // estado pressionado

  // Bordas
  border: palette.dark400,
  borderFocus: palette.lime,

  // Financeiro
  positive: palette.lime, // valor positivo "+R$ 1.200"
  positiveBg: palette.limeSubtle,
  negative: palette.redText, // valor negativo "−R$ 340"
  negativeBg: palette.redSubtle,
  pending: palette.gray400, // pendente / neutro

  // Overlay
  overlay: "rgba(0,0,0,0.70)",
} as const;

export type Theme = typeof theme;

// ─────────────────────────────────────────────
// EXEMPLO DE USO
// ─────────────────────────────────────────────
//
//  import { theme as T } from "@/theme/colors";
//
//  <View style={{ backgroundColor: T.bgScreen }}>
//    <Text style={{ color: T.textPrimary }}>$ 112,933.42</Text>
//    <Text style={{ color: T.textSecondary }}>Main account</Text>
//    <Text style={{ color: T.positive }}>+R$ 1.200,00</Text>
//    <Text style={{ color: T.negative }}>−R$ 340,00</Text>
//
//    {/* Botão primário */}
//    <View style={{ backgroundColor: T.primary }}>
//      <Text style={{ color: T.textOnLime }}>Send</Text>
//    </View>
//  </View>

// ─────────────────────────────────────────────
// REFERÊNCIA RÁPIDA
// ─────────────────────────────────────────────
//
//  bg           #111111   fundo do app
//  bgScreen     #1A1C1A   telas
//  bgCard       #222422   cards
//  bgCardRaised #2C2E2C   cards elevados
//  primary      #C5F135   lime — ações, destaques
//  textPrimary  #F4F4F4   títulos
//  textSecondary#8A8C8A   labels
//  positive     #C5F135   saldo positivo
//  negative     #FF8080   saldo negativo
