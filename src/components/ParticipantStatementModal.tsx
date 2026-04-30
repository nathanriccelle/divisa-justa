import { X } from "lucide-react-native";
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

// ─── types ───────────────────────────────────────────────────────────────────

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
  assumptions?: Record<string, string>;
  participantsList?: { id: string; name: string }[];
  taxOptOutIds?: string[];
  onClose: () => void;
};

// ─── component ───────────────────────────────────────────────────────────────

export function ParticipantStatementModal({
  visible,
  participant,
  allExpenses,
  currencySymbol,
  taxMultiplier,
  taxPerPerson,
  isPayingTax,
  assumptions,
  participantsList,
  taxOptOutIds,
  onClose,
}: ParticipantStatementModalProps) {
  const { t } = useTranslation();
  if (!participant) return null;

  const formatMoney = (val: number) =>
    `${currencySymbol} ${val.toFixed(2).replace(".", ",")}`;

  // ── build details list ────────────────────────────────────────────────────

  const localConsumed = participant.consumed;
  const localPaid = participant.paid;
  const localBalance = participant.balance;

  const details: {
    id: string;
    title: string;
    consumed: number;
    paid: number;
    consumersCount: number;
    isTax?: boolean;
    assumedFrom?: string;
    payersNames?: string;
  }[] = [];

  const assumedUsersIds = assumptions
    ? Object.keys(assumptions).filter((k) => assumptions[k] === participant.id)
    : [];

  const isAssumedBySomeone =
    assumptions && Object.keys(assumptions).includes(participant.id);

  if (!isAssumedBySomeone) {
    allExpenses.forEach((exp) => {
      const consumers: string[] = JSON.parse(exp.splitWithIds);
      let payerIds: string[] = [];
      try {
        const parsed = JSON.parse(exp.payerId);
        payerIds = Array.isArray(parsed) ? parsed : [exp.payerId];
      } catch {
        payerIds = [exp.payerId];
      }

      const totalBase = exp.amount * exp.quantity;
      const totalWithTax = totalBase * taxMultiplier;

      const portionValue = totalBase / consumers.length;
      const paidPortionValue = totalWithTax / payerIds.length;

      let myConsumed = 0;
      let myPaid = 0;
      let assumedNames: string[] = [];

      if (consumers.includes(participant.id)) {
        myConsumed += portionValue;
      }
      if (payerIds.includes(participant.id)) {
        myPaid += paidPortionValue;
      }

      assumedUsersIds.forEach((assumeeId) => {
        if (consumers.includes(assumeeId)) {
          myConsumed += portionValue;
          const name = participantsList?.find((p) => p.id === assumeeId)?.name;
          if (name) assumedNames.push(name);
        }
        if (payerIds.includes(assumeeId)) {
          myPaid += paidPortionValue;
        }
      });

      if (myConsumed > 0 || myPaid > 0) {
        const payerNamesList = payerIds.map(
          (id) =>
            participantsList?.find((p) => p.id === id)?.name ||
            t("expense_details_modal.unknown", "Desconhecido"),
        );
        const payersNames = payerNamesList.join(", ");

        details.push({
          id: exp.id,
          title: exp.title,
          consumed: myConsumed,
          paid: myPaid,
          consumersCount: consumers.length,
          assumedFrom:
            assumedNames.length > 0 ? assumedNames.join(", ") : undefined,
          payersNames,
        });
      }
    });

    let myTaxConsumed = isPayingTax ? taxPerPerson : 0;
    assumedUsersIds.forEach((assumeeId) => {
      const assumeePayingTax = taxOptOutIds
        ? !taxOptOutIds.includes(assumeeId)
        : false;
      if (assumeePayingTax) {
        myTaxConsumed += taxPerPerson;
      }
    });

    if (myTaxConsumed > 0) {
      details.push({
        id: "tax_fee",
        title: t("participant_statement_modal.service_fee"),
        consumed: myTaxConsumed,
        paid: 0,
        consumersCount: 1,
        isTax: true,
      });
    }
  }

  const progressPercentage =
    localConsumed > 0 ? Math.min((localPaid / localConsumed) * 100, 100) : 0;

  const pendingItems = details.filter(
    (item) => item.paid - item.consumed < -0.001,
  );
  const completedItems = details.filter(
    (item) => item.paid - item.consumed >= -0.001,
  );

  const renderItem = (
    item: (typeof details)[0],
    index: number,
    isLast: boolean,
  ) => {
    const itemBalance = item.paid - item.consumed;

    let subtitle = "";
    if (item.isTax) {
      subtitle = t("participant_statement_modal.tax_fee_desc");
    } else if (item.assumedFrom) {
      subtitle = t("participant_statement_modal.friend_help", {
        name: item.assumedFrom,
      });
    } else if (item.consumed > 0 && item.paid === 0) {
      subtitle = t("participant_statement_modal.covered_for_you", {
        name: item.payersNames,
      });
    } else if (item.consumed > 0 && item.paid > 0) {
      subtitle = t("participant_statement_modal.paid_your_part", {
        paid: formatMoney(item.paid),
        consumed: formatMoney(item.consumed),
      });
    } else if (item.consumed === 0 && item.paid > 0) {
      subtitle = t("participant_statement_modal.friend_adjustment");
    }

    let statusText = "";
    let statusColor: string = T.textSecondary;
    let valueToShow = item.consumed;

    if (itemBalance < -0.001) {
      statusText = t("participant_statement_modal.to_pay_item");
      statusColor = T.negative;
      valueToShow = Math.abs(itemBalance);
    } else if (itemBalance > 0.001) {
      statusText = t("participant_statement_modal.credit_item");
      statusColor = T.primary;
      valueToShow = itemBalance;
    } else {
      statusText = t("participant_statement_modal.paid_item");
      statusColor = T.textSecondary;
      valueToShow = item.consumed;
    }

    return (
      <View
        key={item.id}
        style={[styles.detailRow, !isLast && styles.detailRowBorder]}
      >
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.detailTitle}>{item.title}</Text>
          <Text style={styles.detailSubtitle}>{subtitle}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.detailValue, { color: statusColor }]}>
            {formatMoney(valueToShow)}
          </Text>
          <Text style={[styles.detailStatus, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: T.bg }]}>
          {/* HEADER */}
          <View style={[styles.header, { borderBottomColor: T.border }]}>
            <Text
              style={[theme.textStyles.largeTitle, { color: T.textPrimary }]}
            >
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
              <X size={28} color={T.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* CARD 1: RESUMO COM BARRA DE PROGRESSO */}
            <View style={styles.card1}>
              <Text style={styles.card1Title}>
                {t("participant_statement_modal.total_consumed")}
              </Text>
              <Text style={styles.card1Amount}>
                {formatMoney(localConsumed)}
              </Text>

              {localBalance < -0.001 && (
                <View style={styles.owedContainer}>
                  <Text style={styles.owedLabel}>
                    {t("participant_statement_modal.left_to_pay")}
                  </Text>
                  <Text style={styles.owedAmount}>
                    {formatMoney(Math.abs(localBalance))}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.progressTrack,
                  localBalance < -0.001 && { backgroundColor: T.bg },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressText, { color: T.textPrimary }]}>
                  ✓ Pago {formatMoney(localPaid)}
                </Text>
                <Text
                  style={[
                    styles.progressText,
                    localBalance < -0.001
                      ? { color: T.textSecondary }
                      : { color: T.textSecondary },
                  ]}
                >
                  Falta {formatMoney(Math.max(0, localConsumed - localPaid))}
                </Text>
              </View>
            </View>

            {/* DETALHAMENTO DOS ITENS EM GRUPOS */}
            {details.length === 0 ? (
              <View style={styles.groupCard}>
                <Text style={styles.sectionTitle}>
                  {t("participant_statement_modal.detailing")}
                </Text>
                <Text style={[theme.textStyles.body, styles.emptyText]}>
                  {t("participant_statement_modal.no_consumed")}
                </Text>
              </View>
            ) : (
              <>
                {pendingItems.length > 0 && (
                  <View style={styles.groupCard}>
                    <Text style={styles.sectionTitle}>
                      {t("participant_statement_modal.pending_items")}
                    </Text>
                    {pendingItems.map((item, index) =>
                      renderItem(
                        item,
                        index,
                        index === pendingItems.length - 1,
                      ),
                    )}
                  </View>
                )}

                {completedItems.length > 0 && (
                  <View style={styles.groupCard}>
                    <Text style={styles.sectionTitle}>
                      {t("participant_statement_modal.completed_items")}
                    </Text>
                    {completedItems.map((item, index) =>
                      renderItem(
                        item,
                        index,
                        index === completedItems.length - 1,
                      ),
                    )}
                  </View>
                )}
              </>
            )}

            {/* CARD: TRANSPARÊNCIA MATEMÁTICA */}
            <View style={styles.mathCard}>
              <Text style={styles.mathTitle}>
                {t("participant_statement_modal.understand_math")}
              </Text>

              <View style={styles.mathRow}>
                <Text style={styles.mathLabel}>
                  {t("participant_statement_modal.total_consumed")}
                </Text>
                <Text style={styles.mathValue}>
                  {formatMoney(localConsumed)}
                </Text>
              </View>

              <View style={styles.mathRow}>
                <Text style={styles.mathLabel}>
                  {t("participant_statement_modal.total_paid_by_you")}
                </Text>
                <Text style={styles.mathValue}>- {formatMoney(localPaid)}</Text>
              </View>

              <View style={styles.mathDivider} />

              <View style={styles.mathRowTotal}>
                <Text style={styles.mathLabelTotal}>
                  {localBalance < -0.001
                    ? t("participant_statement_modal.left_to_pay")
                    : t("participant_statement_modal.to_receive")}
                </Text>
                <Text
                  style={[
                    styles.mathValueTotal,
                    localBalance < -0.001
                      ? { color: T.negative }
                      : { color: T.primary },
                  ]}
                >
                  {formatMoney(Math.abs(localBalance))}
                </Text>
              </View>

              {/* EXPLICAÇÃO DE DÍVIDAS: PARA QUEM PAGAR E POR QUE */}
              {localBalance < -0.001 && pendingItems.length > 0 && (
                <View style={styles.mathExplanationBox}>
                  {localPaid > 0 ? (
                    <Text style={styles.mathExplanationBody}>
                      {t(
                        "participant_statement_modal.who_and_why_paid_something",
                        {
                          paid: formatMoney(localPaid),
                          balance: formatMoney(Math.abs(localBalance)),
                        },
                      )}
                    </Text>
                  ) : (
                    <Text style={styles.mathExplanationBody}>
                      {t(
                        "participant_statement_modal.who_and_why_paid_nothing",
                      )}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* CARD 3: CRÉDITO EXTRA (somente se aplicável) */}
            {localBalance > 0.001 && (
              <View style={styles.card3}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={styles.card3Title}>
                    {t("participant_statement_modal.credit_card_title")}
                  </Text>
                  <Text style={styles.card3Subtitle}>
                    {t("participant_statement_modal.paid_more_than_part", {
                      name: participant.name,
                    })}
                  </Text>
                </View>
                <Text style={styles.card3Value}>
                  {formatMoney(localBalance)}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

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
  body: {
    padding: theme.spacing[6],
  },

  // ── card 1 ──
  card1: {
    backgroundColor: T.bgScreen,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },
  card1Title: {
    ...theme.textStyles.subheadline,
    color: T.textSecondary,
    marginBottom: 4,
  },
  card1Amount: {
    ...theme.textStyles.largeTitle,
    color: T.textPrimary,
  },
  owedContainer: {
    marginTop: theme.spacing[4],
    backgroundColor: T.bg,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  owedLabel: {
    ...theme.textStyles.headline,
    color: T.textSecondary,
  },
  owedAmount: {
    ...theme.textStyles.title2,
    color: T.textSecondary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: T.bgCard,
    borderRadius: 4,
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[2],
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: T.primary,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    ...theme.textStyles.footnote,
    color: T.textSecondary,
    fontWeight: "bold",
  },

  // ── groups ──
  groupCard: {
    backgroundColor: T.bgScreen,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    ...theme.textStyles.title3,
    color: T.textPrimary,
    marginBottom: theme.spacing[4],
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing[4],
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  detailTitle: {
    ...theme.textStyles.headline,
    color: T.textPrimary,
    marginBottom: 4,
  },
  detailSubtitle: {
    ...theme.textStyles.footnote,
    color: T.textSecondary,
  },
  detailValue: {
    ...theme.textStyles.headline,
    marginBottom: 2,
  },
  detailStatus: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  // ── math card ──
  mathCard: {
    backgroundColor: T.bgCardRaised,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[6],
  },
  mathTitle: {
    ...theme.textStyles.headline,
    color: T.textPrimary,
    marginBottom: theme.spacing[4],
  },
  mathRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  mathLabel: {
    ...theme.textStyles.body,
    color: T.textSecondary,
  },
  mathValue: {
    ...theme.textStyles.body,
    color: T.textPrimary,
    fontWeight: "500",
  },
  mathDivider: {
    height: 1,
    backgroundColor: T.border,
    marginVertical: theme.spacing[3],
  },
  mathRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mathLabelTotal: {
    ...theme.textStyles.headline,
    color: T.textPrimary,
  },
  mathValueTotal: {
    ...theme.textStyles.title3,
    fontWeight: "bold",
  },

  // ── math explanation ──
  mathExplanationBox: {
    marginTop: theme.spacing[6],
    paddingTop: theme.spacing[5],
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  mathExplanationTitle: {
    ...theme.textStyles.headline,
    color: T.textPrimary,
    marginBottom: theme.spacing[2],
  },
  mathExplanationBody: {
    ...theme.textStyles.headline,
    color: T.textSecondary,
    lineHeight: 20,
  },
  mathExplanationItemRow: {
    flexDirection: "row",
    marginBottom: 6,
    paddingRight: theme.spacing[4],
  },
  mathExplanationBullet: {
    ...theme.textStyles.footnote,
    color: T.bg,
    marginRight: 6,
  },
  mathExplanationItemText: {
    ...theme.textStyles.headline,
    color: T.textPrimary,
    lineHeight: 20,
    backgroundColor: T.bg,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
  },

  // ── card 3 ──
  card3: {
    backgroundColor: "rgba(190, 255, 108, 0.1)",
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[5],
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.primary,
    marginBottom: theme.spacing[6],
  },
  card3Title: {
    ...theme.textStyles.headline,
    color: T.primary,
    marginBottom: 2,
  },
  card3Subtitle: {
    ...theme.textStyles.footnote,
    color: T.textPrimary,
  },
  card3Value: {
    ...theme.textStyles.title2,
    color: T.primary,
  },

  // ── misc ──
  emptyText: {
    color: T.textDisabled,
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
});
