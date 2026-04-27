import { CreditCard, ShoppingBag, X } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
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
  taxPerPerson: number;
  isPayingTax: boolean;
  onClose: () => void;
};

export function ParticipantStatementModal({
  visible,
  participant,
  allExpenses,
  currencySymbol,
  taxMultiplier,
  taxPerPerson,
  isPayingTax,
  onClose,
}: ParticipantStatementModalProps) {
  const { t } = useTranslation();
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

  // Soma exatamente os itens da lista de consumo SEM A TAXA primeiro
  const baseConsumed = consumedExpenses.reduce((acc, exp) => {
    const consumers: string[] = JSON.parse(exp.splitWithIds);
    return acc + (exp.amount * exp.quantity) / consumers.length;
  }, 0);
  const taxConsumedAmount = isPayingTax ? taxPerPerson : 0;
  const localConsumed = baseConsumed + taxConsumedAmount;

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
  let statusLabel: string = t("participant_statement_modal.settled");

  if (isToReceive) {
    statusColor = T.primary;
    statusLabel = t("participant_statement_modal.to_receive");
  } else if (isToPay) {
    statusColor = T.negative;
    statusLabel = t("participant_statement_modal.to_pay");
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
              {t("participant_statement_modal.title", {
                name: participant.name,
              })}
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
              {/* MOSTRAR TAXA SEPARADA SE HOUVER */}
              {taxMultiplier > 1 && (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={[
                        theme.textStyles.body,
                        { color: T.textSecondary },
                      ]}
                    >
                      {t("participant_statement_modal.subtotal_consumed")}
                    </Text>
                    <Text
                      style={[theme.textStyles.body, { color: T.textPrimary }]}
                    >
                      {formatMoney(baseConsumed)}
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
                      style={[
                        theme.textStyles.body,
                        { color: T.textSecondary },
                      ]}
                    >
                      {t("participant_statement_modal.service_fee")}
                    </Text>
                    <Text style={[theme.textStyles.body, { color: T.primary }]}>
                      {formatMoney(taxConsumedAmount)}
                    </Text>
                  </View>
                </>
              )}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={[
                    theme.textStyles.body,
                    {
                      color:
                        taxMultiplier > 1 ? T.textPrimary : T.textSecondary,
                      fontWeight: taxMultiplier > 1 ? "bold" : "normal",
                    },
                  ]}
                >
                  {t("participant_statement_modal.total_consumed")}
                </Text>
                <Text
                  style={[
                    theme.textStyles.body,
                    {
                      color: T.textPrimary,
                      fontWeight: taxMultiplier > 1 ? "bold" : "normal",
                    },
                  ]}
                >
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
                  {t("participant_statement_modal.total_paid")}
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
                  {t("participant_statement_modal.consumed_items")}
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
                  {t("participant_statement_modal.no_consumed")}
                </Text>
              ) : (
                <View style={[styles.card, { backgroundColor: T.bgCard }]}>
                  {consumedExpenses.map((exp, index) => {
                    const consumers: string[] = JSON.parse(exp.splitWithIds);
                    const totalItemValue = exp.amount * exp.quantity;
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
                            {t("participant_statement_modal.divided_by", {
                              count: consumers.length,
                            })}
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
                  {t("participant_statement_modal.paid_bills")}
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
                  {t("participant_statement_modal.no_paid")}
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
                              {t("participant_statement_modal.divided_with", {
                                count: payerCount - 1,
                              })}
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
