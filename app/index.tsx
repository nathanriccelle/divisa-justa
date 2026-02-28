import {
  Gift,
  LucideIcon,
  Plane,
  Plus,
  ShoppingCart,
  Utensils,
  Wine,
} from "lucide-react-native";
import React from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";
import { theme } from "../src/theme";
import { Theme } from "../src/theme/colors";

const T = theme.colors;

type QuickStartItem = {
  id: string;
  title: string;
  Icon: LucideIcon;
  colorSelector: (t: Theme) => string;
};

// DADOS DA LISTA
const QUICK_START_ITEMS: QuickStartItem[] = [
  { id: "1", title: "Jantar", Icon: Utensils, colorSelector: (t) => t.primary },
  { id: "2", title: "Bar", Icon: Wine, colorSelector: (t) => t.primary },
  { id: "3", title: "Viagem", Icon: Plane, colorSelector: (t) => t.primary },
  {
    id: "4",
    title: "Mercado",
    Icon: ShoppingCart,
    colorSelector: (t) => t.primary,
  },
  { id: "5", title: "Presente", Icon: Gift, colorSelector: (t) => t.primary },
];

//Saudação com base na hora local
function obterSaudacao() {
  const horaAtual = new Date().getHours();

  if (horaAtual >= 0 && horaAtual < 12) {
    return "Bom dia";
  } else if (horaAtual >= 12 && horaAtual < 18) {
    return "Boa tarde";
  } else {
    return "Boa noite";
  }
}

export default function HomeScreen() {
  //Chamada da função de saudação
  const saudacao = obterSaudacao();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgScreen }]}>
      <StatusBar barStyle="light-content" backgroundColor={T.bgScreen} />

      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View>
          <Text
            style={[
              theme.textStyles.title1,
              { color: T.textSecondary, marginBottom: theme.spacing[1] },
            ]}
          >
            {saudacao}, Nathan
          </Text>
        </View>
      </View>

      {/* CARTÃO PRINCIPAL */}
      <View
        style={[
          styles.mainCard,
          {
            backgroundColor: T.bgCard,
            borderColor: T.border,
            borderWidth: 1,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: pressed ? T.primaryPress : T.primary },
            pressed && { transform: [{ scale: 0.96 }] },
          ]}
          onPress={() => router.push("/create-event")}
        >
          <Plus size={theme.spacing[10]} color={T.textOnLime} />
        </Pressable>

        <Text
          style={[
            theme.textStyles.largeTitle,
            { color: T.textPrimary, marginBottom: theme.spacing[2] },
          ]}
        >
          Começar Divisão
        </Text>
        <Text style={[theme.textStyles.body, { color: T.textSecondary }]}>
          Crie uma nova conta compartilhada
        </Text>
      </View>

      {/* INÍCIO RÁPIDO */}
      <View style={styles.quickStartSection}>
        <Text style={[styles.quickStartTitle, { color: T.textDisabled }]}>
          INÍCIO RÁPIDO
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {QUICK_START_ITEMS.map((item) => {
            const { Icon } = item;
            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.quickStartItem,
                  pressed && { opacity: 0.7 },
                ]}
              >
                {/* Aqui usei o bgCardRaised para destacar o ícone em relação ao fundo da tela */}
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: T.bgCardRaised,
                      borderColor: T.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Icon size={theme.spacing[6]} color={item.colorSelector(T)} />
                </View>
                <Text
                  style={[
                    theme.textStyles.subheadline,
                    { color: T.textSecondary },
                  ]}
                >
                  {item.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ESTILOS DE ESTRUTURA
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[10],
    paddingBottom: theme.spacing[5],
  },
  avatarContainer: { position: "relative" },
  avatar: {
    width: theme.spacing[12],
    height: theme.spacing[12],
    borderRadius: theme.borderRadius.full,
  },
  notificationDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
  },
  mainCard: {
    marginHorizontal: theme.spacing[6],
    marginTop: theme.spacing[8],
    paddingVertical: theme.spacing[12],
    borderRadius: theme.borderRadius.xl,
    alignItems: "center",
    ...theme.shadow.lg,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing[6],
  },
  quickStartSection: { marginTop: theme.spacing[10] },
  quickStartTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    fontFamily: "Inter_700Bold",
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[4],
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  scrollContainer: { paddingHorizontal: theme.spacing[5] },
  quickStartItem: { alignItems: "center", marginHorizontal: theme.spacing[2] },
  iconBox: {
    width: theme.spacing[16],
    height: theme.spacing[16],
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing[2],
    ...theme.shadow.sm,
  },
});
