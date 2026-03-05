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

  // 1. Filtra o que a pessoa CONSUMIU
  const consumedExpenses = allExpenses.filter((exp) => {
    const consumers: string[] = JSON.parse(exp.splitWithIds);
    return consumers.includes(participant.id);
  });

  // 2. Filtra o que a pessoa PAGOU
  const paidExpenses = allExpenses.filter(
    (exp) => exp.payerId === participant.id,
  );

  const formatMoney = (val: number) =>
    `${currencySymbol} ${val.toFixed(2).replace(".", ",")}`;

  const isToReceive = participant.balance > 0.01;
  const isToPay = participant.balance < -0.01;
  let statusColor: string = T.textSecondary;
  let statusText: string = "QUITADO (R$ 0,00)";

  if (isToReceive) {
    statusColor = T.primary;
    statusText = `A RECEBER ${formatMoney(participant.balance)}`;
  } else if (isToPay) {
    statusColor = T.negative;
    statusText = `A PAGAR ${formatMoney(Math.abs(participant.balance))}`;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: T.bgCardRaised }]}>
          {/* CABEÇALHO DO MODAL */}
          <View style={[styles.header, { borderBottomColor: T.border }]}>
            <View>
              <Text style={[theme.textStyles.title3, { color: T.textPrimary }]}>
                Extrato de {participant.name}
              </Text>
              <Text
                style={[
                  theme.textStyles.headline,
                  { color: statusColor, marginTop: 4 },
                ]}
              >
                {statusText}
              </Text>
            </View>
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
                <View
                  style={[
                    styles.card,
                    { backgroundColor: T.bgCard, borderColor: T.border },
                  ]}
                >
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
                      color: T.textDisabled,
                      fontStyle: "italic",
                      marginTop: 8,
                    },
                  ]}
                >
                  Não pagou nenhuma conta.
                </Text>
              ) : (
                <View
                  style={[
                    styles.card,
                    { backgroundColor: T.bgCard, borderColor: T.border },
                  ]}
                >
                  {paidExpenses.map((exp, index) => {
                    const totalItemValue =
                      exp.amount * exp.quantity * taxMultiplier;
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
                        <Text
                          style={[
                            theme.textStyles.body,
                            {
                              color: T.textPrimary,
                              fontWeight: "bold",
                              flex: 1,
                            },
                          ]}
                        >
                          {exp.title}
                        </Text>
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
