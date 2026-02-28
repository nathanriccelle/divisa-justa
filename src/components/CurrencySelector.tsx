import { Banknote, ChevronDown, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { theme } from "../theme";
const T = theme.colors;

export type Currency = {
  code: string;
  name: string;
  symbol: string;
};

// 2. Exportamos a lista para podermos definir o valor inicial no ecrã principal
export const CURRENCY_LIST: Currency[] = [
  { code: "BRL", name: "Real Brasileiro", symbol: "R$" },
  { code: "USD", name: "Dólar Americano", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "Libra Esterlina", symbol: "£" },
  { code: "JPY", name: "Iene Japonês", symbol: "¥" },
  { code: "AUD", name: "Dólar Australiano", symbol: "A$" },
  { code: "CAD", name: "Dólar Canadense", symbol: "C$" },
  { code: "CHF", name: "Franco Suíço", symbol: "CHF" },
  { code: "CNY", name: "Yuan Chinês", symbol: "¥" },
  { code: "INR", name: "Rúpia Indiana", symbol: "₹" },
];

type CurrencySelectorProps = {
  selectedCurrency: Currency;
  onSelectCurrency: (currency: Currency) => void;
};

export function CurrencySelector({
  selectedCurrency,
  onSelectCurrency,
}: CurrencySelectorProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleSelect = (currency: Currency) => {
    onSelectCurrency(currency);
    setIsVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setIsVisible(true)}
        style={({ pressed }) => [
          styles.inputContainer,
          { backgroundColor: T.bgCardRaised, borderColor: T.border },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Banknote size={20} color={T.textSecondary} style={styles.inputIcon} />
        <Text style={[styles.textInput, { color: T.textPrimary, flex: 1 }]}>
          {selectedCurrency.name} ({selectedCurrency.symbol})
        </Text>
        <ChevronDown size={20} color={T.textSecondary} />
      </Pressable>

      {/* O MODAL (BOTTOM SHEET) */}
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: T.bgCardRaised }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[theme.textStyles.title3, { color: T.textPrimary }]}>
                Selecionar Moeda
              </Text>
              <Pressable
                onPress={() => setIsVisible(false)}
                style={({ pressed }) => [pressed && { opacity: 0.5 }]}
              >
                <X size={24} color={T.textSecondary} />
              </Pressable>
            </View>

            <FlatList
              data={CURRENCY_LIST}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item.code === selectedCurrency.code;

                return (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    style={({ pressed }) => [
                      styles.currencyItem,
                      { borderBottomColor: T.border },
                      pressed && { backgroundColor: T.bgCard },
                    ]}
                  >
                    <View style={styles.currencyInfo}>
                      <Text
                        style={[
                          theme.textStyles.body,
                          {
                            color: T.textPrimary,
                            fontWeight: isSelected ? "bold" : "normal",
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          theme.textStyles.subheadline,
                          { color: T.textSecondary },
                        ]}
                      >
                        {item.code}
                      </Text>
                    </View>
                    <Text
                      style={[
                        theme.textStyles.headline,
                        { color: isSelected ? T.primary : T.textSecondary },
                      ]}
                    >
                      {item.symbol}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing[4],
  },
  inputIcon: { marginRight: theme.spacing[3] },
  textInput: { fontFamily: "Inter_500Medium", fontSize: theme.fontSize.md },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[10],
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  currencyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
  },
  currencyInfo: { flex: 1 },
});
