import { ShoppingBasket } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

const T = theme.colors;

export function EmptyItemsState() {
  return (
    <View
      style={[
        styles.emptyStateCard,
        { backgroundColor: T.bgCard, borderColor: T.border },
      ]}
    >
      <View
        style={[
          styles.emptyStateIconWrapper,
          { backgroundColor: T.bgCardRaised },
        ]}
      >
        <ShoppingBasket size={32} color={T.primary} />
      </View>
      <Text
        style={[
          theme.textStyles.title3,
          {
            color: T.textPrimary,
            textAlign: "center",
            marginBottom: theme.spacing[2],
          },
        ]}
      >
        A conta está zerada!
      </Text>
      <Text
        style={[
          theme.textStyles.body,
          { color: T.textSecondary, textAlign: "center", lineHeight: 22 },
        ]}
      >
        Nenhum gasto foi adicionado a este evento. Toque no botão de "+" abaixo
        para registar o primeiro consumo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyStateCard: {
    padding: theme.spacing[8],
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    marginBottom: theme.spacing[4],
  },
  emptyStateIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing[4],
  },
});
