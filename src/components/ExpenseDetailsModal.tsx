// Caminho: src/components/ExpenseDetailsModal.tsx
import { ArrowRight, X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

const T = theme.colors;

type ParticipantType = { id: string; name: string; initials: string };
type ExpenseType = {
  id: string;
  title: string;
  amount: number;
  quantity: number;
  payerId: string;
  splitWithIds: string;
};

type ExpenseDetailsModalProps = {
  visible: boolean;
  expense: ExpenseType | null;
  participants: ParticipantType[];
  currencySymbol: string;
  onClose: () => void;
};

export function ExpenseDetailsModal({
  visible,
  expense,
  participants,
  currencySymbol,
  onClose,
}: ExpenseDetailsModalProps) {
  if (!expense) return null;

  const total = expense.amount * expense.quantity;
  const consumerIds: string[] = JSON.parse(expense.splitWithIds);
  const costPerPerson = total / consumerIds.length;

  const payer = participants.find((p) => p.id === expense.payerId);
  // Pega todo mundo que consumiu, mas tira o pagante (pois ele não deve para ele mesmo)
  const debtors = participants.filter(
    (p) => consumerIds.includes(p.id) && p.id !== expense.payerId,
  );
  const consumersNames = participants
    .filter((p) => consumerIds.includes(p.id))
    .map((p) => p.name)
    .join(", ");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: T.bgCardRaised }]}>
          <View style={[styles.header, { borderBottomColor: T.border }]}>
            <Text style={[theme.textStyles.title3, { color: T.textPrimary }]}>
              Detalhes do Item
            </Text>
            <Pressable onPress={onClose}>
              <X size={24} color={T.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.body}>
            <Text
              style={[
                theme.textStyles.largeTitle,
                {
                  color: T.textPrimary,
                  textAlign: "center",
                  marginBottom: theme.spacing[6],
                },
              ]}
            >
              {expense.title}
            </Text>

            {/* RESUMO RÁPIDO */}
            <View
              style={[
                styles.infoCard,
                { backgroundColor: T.bgCard, borderColor: T.border },
              ]}
            >
              <Text
                style={[
                  theme.textStyles.body,
                  { color: T.textSecondary, marginBottom: 4 },
                ]}
              >
                Valor Total:{" "}
                <Text style={{ color: T.textPrimary, fontWeight: "bold" }}>
                  {currencySymbol} {total.toFixed(2).replace(".", ",")}
                </Text>
              </Text>
              <Text
                style={[
                  theme.textStyles.body,
                  { color: T.textSecondary, marginBottom: 4 },
                ]}
              >
                Pago por:{" "}
                <Text style={{ color: T.primary, fontWeight: "bold" }}>
                  {payer?.name}
                </Text>
              </Text>
              <Text style={[theme.textStyles.body, { color: T.textSecondary }]}>
                Consumido por:{" "}
                <Text style={{ color: T.textPrimary }}>{consumersNames}</Text>
              </Text>
            </View>

            {/* MATEMÁTICA / QUEM DEVE QUEM */}
            <Text style={[styles.sectionTitle, { color: T.textDisabled }]}>
              COMO FICA A DIVISÃO
            </Text>

            {debtors.length > 0 ? (
              debtors.map((debtor) => (
                <View
                  key={debtor.id}
                  style={[styles.debtRow, { borderBottomColor: T.border }]}
                >
                  <Text
                    style={[
                      theme.textStyles.body,
                      { color: T.textPrimary, fontWeight: "bold" },
                    ]}
                  >
                    {debtor.name}
                  </Text>
                  <ArrowRight
                    size={16}
                    color={T.textSecondary}
                    style={{ marginHorizontal: 8 }}
                  />
                  <Text
                    style={[
                      theme.textStyles.body,
                      { color: T.primary, fontWeight: "bold" },
                    ]}
                  >
                    {payer?.name}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Text
                    style={[theme.textStyles.headline, { color: T.negative }]}
                  >
                    {currencySymbol}{" "}
                    {costPerPerson.toFixed(2).replace(".", ",")}
                  </Text>
                </View>
              ))
            ) : (
              <Text
                style={[
                  theme.textStyles.body,
                  {
                    color: T.textSecondary,
                    textAlign: "center",
                    marginTop: theme.spacing[4],
                  },
                ]}
              >
                {payer?.name} pagou e consumiu sozinho. Ninguém deve nada!
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  content: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing[6],
    borderBottomWidth: 1,
  },
  body: { padding: theme.spacing[6] },
  infoCard: {
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: "bold",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginBottom: theme.spacing[4],
  },
  debtRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
  },
});
