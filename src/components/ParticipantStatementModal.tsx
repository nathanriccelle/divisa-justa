import { CreditCard, ShoppingBag, X } from "lucide-react-native";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { theme } from "../theme";

const T = theme.colors;

type ExpenseType = {
  id: string;
  title: string;
  amount: number;
  quantity: number;
  payerId: string;
  splitWithIds: string;
};

type ParticipantStats = {
  id: string;
  name: string;
  initials: string;
  paid: number;
  consumed: number;
  balance: number;
};

type ParticipantStatementModalProps = {
  visible: boolean;
  participant: ParticipantStats | null;
  allExpenses: ExpenseType[];
  currencySymbol: string;
  taxMultiplier: number;
  onClose: () => void;
};

export function ParticipantStatementModal({
  visible,
  participant,
  allExpenses,
  currencySymbol,
  taxMultiplier,
  onClose,
}: ParticipantStatementModalProps) {
  if (!participant) return null;

  const consumedExpenses = allExpenses.filter((exp) => {
    const consumers: string[] = JSON.parse(exp.splitWithIds);
    return consumers.includes(participant.id);
  });

  const paidExpenses = allExpenses.filter((exp) => {
    try {
      const payerIds = JSON.parse(exp.payerId);
      if (Array.isArray(payerIds)) {
        return payerIds.includes(participant.id);
      }
      return exp.payerId === participant.id;
    } catch {
      return exp.payerId === participant.id;
    }
  });

  // Soma exatamente os itens da lista de consumo
  const localConsumed = consumedExpenses.reduce((acc, exp) => {
    const consumers: string[] = JSON.parse(exp.splitWithIds);
    return acc + (exp.amount * exp.quantity * taxMultiplier) / consumers.length;
  }, 0);

  // Soma exatamente os itens da lista de contas pagas
  const localPaid = paidExpenses.reduce((acc, exp) => {
    let payerCount = 1;
    try {
      const parsed = JSON.parse(exp.payerId);
      if (Array.isArray(parsed)) payerCount = parsed.length;
    } catch {}
    return acc + (exp.amount * exp.quantity * taxMultiplier) / payerCount;
  }, 0);

  const localBalance = localPaid - localConsumed;

  const formatMoney = (val: number) =>
    `${currencySymbol} ${val.toFixed(2).replace(".", ",")}`;

  const isToReceive = localBalance > 0.001;
  const isToPay = localBalance < -0.001;
  let statusColor: string = T.textSecondary;
  let statusLabel: string = "QUITADO";

  if (isToReceive) {
    statusColor = T.primary;
    statusLabel = "A RECEBER";
  } else if (isToPay) {
    statusColor = T.negative;
    statusLabel = "A PAGAR";
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: T.bgScreen }]}>
          {/* CABEÇALHO DO MODAL */}
          <View style={[styles.header, { borderBottomColor: T.border }]}>
            <Text style={[theme.textStyles.title3, { color: T.textPrimary }]}>
              Extrato de {participant.name}
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                pressed && { opacity: 0.5 },
                { padding: 4 },
              ]}
            >
              <X size={24} color={T.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* RESUMO FINANCEIRO */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: T.bgCardRaised,
                  borderColor: T.border,
                  padding: theme.spacing[4],
                  marginBottom: theme.spacing[8],
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={[theme.textStyles.body, { color: T.textSecondary }]}
                >
                  Total Consumido
                </Text>
                <Text style={[theme.textStyles.body, { color: T.textPrimary }]}>
                  {formatMoney(localConsumed)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={[theme.textStyles.body, { color: T.textSecondary }]}
                >
                  Total Pago
                </Text>
                <Text style={[theme.textStyles.body, { color: T.textPrimary }]}>
                  {formatMoney(localPaid)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: T.border,
                  marginTop: 4,
                }}
              >
                <Text
                  style={[theme.textStyles.headline, { color: statusColor }]}
                >
                  {statusLabel}
                </Text>
                <Text style={[theme.textStyles.title2, { color: statusColor }]}>
                  {formatMoney(Math.abs(localBalance))}
                </Text>
              </View>
            </View>

            {/* SEÇÃO: O QUE CONSUMIU */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <ShoppingBag size={18} color={T.textSecondary} />
                <Text style={[styles.sectionTitle, { color: T.textSecondary }]}>
                  ITENS CONSUMIDOS
                </Text>
              </View>

              {consumedExpenses.length === 0 ? (
                <Text
                  style={[
                    theme.textStyles.body,
                    {
                      color: T.textDisabled,
                      fontStyle: "italic",
                      marginTop: 8,
                    },
                  ]}
                >
                  Não consumiu nada.
                </Text>
              ) : (
                <View style={[styles.card, { backgroundColor: T.bgCard }]}>
                  {consumedExpenses.map((exp, index) => {
                    const consumers: string[] = JSON.parse(exp.splitWithIds);
                    const totalItemValue =
                      exp.amount * exp.quantity * taxMultiplier;
                    const portionValue = totalItemValue / consumers.length;
                    const isLast = index === consumedExpenses.length - 1;

                    return (
                      <View
                        key={exp.id}
                        style={[
                          styles.itemRow,
                          !isLast && {
                            borderBottomWidth: 1,
                            borderBottomColor: T.border,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              theme.textStyles.body,
                              { color: T.textPrimary, fontWeight: "bold" },
                            ]}
                          >
                            {exp.title}
                          </Text>
                          <Text
                            style={[
                              theme.textStyles.footnote,
                              { color: T.textSecondary, marginTop: 2 },
                            ]}
                          >
                            Dividido por {consumers.length}
                          </Text>
                        </View>
                        <Text
                          style={[
                            theme.textStyles.headline,
                            { color: T.textPrimary },
                          ]}
                        >
                          {formatMoney(portionValue)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* SEÇÃO: O QUE PAGOU */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <CreditCard size={18} color={T.primary} />
                <Text style={[styles.sectionTitle, { color: T.primary }]}>
                  CONTAS QUE PAGOU
                </Text>
              </View>

              {paidExpenses.length === 0 ? (
                <Text
                  style={[
                    theme.textStyles.body,
                    {
                      color: T.textSecondary,
                      fontStyle: "italic",
                      marginTop: 8,
                    },
                  ]}
                >
                  Não pagou nenhuma conta.
                </Text>
              ) : (
                <View style={[styles.card, { backgroundColor: T.bgCard }]}>
                  {paidExpenses.map((exp, index) => {
                    let payerCount = 1;
                    try {
                      const parsed = JSON.parse(exp.payerId);
                      if (Array.isArray(parsed)) payerCount = parsed.length;
                    } catch {}

                    const totalItemValue =
                      (exp.amount * exp.quantity * taxMultiplier) / payerCount;
                    const isLast = index === paidExpenses.length - 1;

                    return (
                      <View
                        key={exp.id}
                        style={[
                          styles.itemRow,
                          !isLast && {
                            borderBottomWidth: 1,
                            borderBottomColor: T.border,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              theme.textStyles.body,
                              {
                                color: T.textPrimary,
                                fontWeight: "bold",
                              },
                            ]}
                          >
                            {exp.title}
                          </Text>
                          {payerCount > 1 && (
                            <Text
                              style={[
                                theme.textStyles.footnote,
                                { color: T.textSecondary, marginTop: 2 },
                              ]}
                            >
                              Dividido com {payerCount - 1}{" "}
                              {payerCount - 1 === 1 ? "pessoa" : "pessoas"}
                            </Text>
                          )}
                        </View>
                        <Text
                          style={[
                            theme.textStyles.headline,
                            { color: T.primary },
                          ]}
                        >
                          {formatMoney(totalItemValue)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
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
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing[6],
    borderBottomWidth: 1,
  },
  body: { padding: theme.spacing[6] },

  section: { marginBottom: theme.spacing[8] },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing[3],
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: "bold",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginLeft: theme.spacing[2],
  },

  card: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing[4],
  },
});
