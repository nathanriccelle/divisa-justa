import { Utensils } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

const T = theme.colors;

type ExpenseItemProps = {
  title: string;
  amount: number;
  quantity: number;
  payerName: string;
  currencySymbol: string;
  onPress: () => void;
};

export function ExpenseItem({
  title,
  amount,
  quantity,
  payerName,
  currencySymbol,
  onPress,
}: ExpenseItemProps) {
  const total = amount * quantity;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: T.bgCard, borderColor: T.border },
        pressed && { backgroundColor: T.bgCardRaised },
      ]}
    >
      {/* Ícone (No futuro você pode mudar dependendo da categoria) */}
      <View
        style={[styles.iconBox, { backgroundColor: "rgba(255, 140, 0, 0.1)" }]}
      >
        <Utensils size={24} color="#FF8C00" />
      </View>

      {/* Título e Quantidade */}
      <View style={styles.infoBox}>
        <Text
          style={[
            theme.textStyles.body,
            { color: T.textPrimary, fontWeight: "bold" },
          ]}
        >
          {title}
        </Text>
        <View style={styles.qtyRow}>
          <View style={[styles.qtyBadge, { backgroundColor: T.bgCardRaised }]}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                color: T.textSecondary,
              }}
            >
              {quantity}x
            </Text>
          </View>
          <Text
            style={[
              theme.textStyles.footnote,
              { color: T.textSecondary, marginLeft: theme.spacing[2] },
            ]}
          >
            {currencySymbol} {amount.toFixed(2).replace(".", ",")}/un
          </Text>
        </View>
      </View>

      {/* Valores e Pagante */}
      <View style={styles.priceBox}>
        <Text style={[theme.textStyles.headline, { color: T.textPrimary }]}>
          {currencySymbol} {total.toFixed(2).replace(".", ",")}
        </Text>
        <Text style={[theme.textStyles.footnote, { color: T.textSecondary }]}>
          Pago por <Text style={{ color: T.primary }}>{payerName}</Text>
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    marginBottom: theme.spacing[3],
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing[3],
  },
  infoBox: { flex: 1 },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  qtyBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priceBox: { alignItems: "flex-end" },
});
