// Caminho: src/components/ParticipantSummaryCard.tsx
import {
  CheckCircle2,
  CreditCard,
  HeartHandshake,
  PieChart,
  User,
} from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

const T = theme.colors;

export type ConsumedItemProps = {
  id: string;
  title: string;
  portionAmount: number;
  splitCount: number;
  payerName: string;
  isPayer: boolean;
  date: string;
  assumedFromName?: string;
  totalItemAmount: number;
};

type ParticipantSummaryCardProps = {
  name: string;
  initials: string;
  consumedItems: ConsumedItemProps[];
  totalConsumed: number;
  totalPaid: number;
  currencySymbol: string;
};

export function ParticipantSummaryCard({
  name,
  initials,
  consumedItems,
  totalConsumed,
  totalPaid,
  currencySymbol,
}: ParticipantSummaryCardProps) {
  const { t } = useTranslation();

  const formatMoney = (val: number) =>
    `${currencySymbol} ${val.toFixed(2).replace(".", ",")}`;

  const balance = totalPaid - totalConsumed;
  const isToReceive = balance > 0.001;
  const isToPay = balance < -0.001;

  let statusColor: string = T.textSecondary;
  let statusText: string = "QUITADO";

  if (isToReceive) {
    statusColor = T.primary;
    statusText = "A RECEBER";
  } else if (isToPay) {
    statusColor = T.negative;
    statusText = "A PAGAR";
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: T.bgCard, borderColor: T.border },
      ]}
    >
      {/* CABEÇALHO DO CARTÃO */}
      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <View style={[styles.avatar, { backgroundColor: T.bgCardRaised }]}>
          <Text
            style={[
              theme.textStyles.subheadline,
              { fontWeight: "bold", color: T.textPrimary },
            ]}
          >
            {initials}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: theme.spacing[3] }}>
          <Text style={[theme.textStyles.title3, { color: T.textPrimary }]}>
            {name}
          </Text>
          <Text style={[theme.textStyles.footnote, { color: T.textSecondary }]}>
            {t("participant_summary_card.consumption_summary")}
          </Text>
        </View>
      </View>

      {/* LISTA DE ITENS */}
      <View style={styles.itemsList}>
        {consumedItems.length === 0 ? (
          <Text
            style={[
              theme.textStyles.body,
              {
                color: T.textDisabled,
                fontStyle: "italic",
                textAlign: "center",
                padding: 16,
              },
            ]}
          >
            {t("participant_summary_card.no_consumption")}
          </Text>
        ) : (
          consumedItems.map((item, index) => {
            const isLast = index === consumedItems.length - 1;

            return (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  !isLast && {
                    borderBottomWidth: 1,
                    borderBottomColor: T.border,
                  },
                ]}
              >
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemAmount}>
                      {formatMoney(item.portionAmount)}
                    </Text>
                  </View>

                  <View style={styles.badgesContainer}>
                    {item.assumedFromName && (
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: "rgba(139, 92, 246, 0.15)" },
                        ]}
                      >
                        <HeartHandshake size={12} color="#8b5cf6" />
                        <Text style={[styles.badgeText, { color: "#8b5cf6" }]}>
                          {t("participant_summary_card.assumed_from", {
                            name: item.assumedFromName,
                          })}
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: T.bgCardRaised },
                      ]}
                    >
                      {item.splitCount === 1 ? (
                        <User size={12} color={T.textSecondary} />
                      ) : (
                        <PieChart size={12} color={T.textSecondary} />
                      )}
                      <Text
                        style={[styles.badgeText, { color: T.textSecondary }]}
                      >
                        {item.splitCount === 1
                          ? t("participant_summary_card.individual_consumption")
                          : `${t("participant_summary_card.divided_by", {
                              count: item.splitCount,
                            })} • ${t("participant_summary_card.total_item", {
                              amount: formatMoney(item.totalItemAmount),
                            })}`}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: item.isPayer
                            ? "rgba(190, 255, 108, 0.15)"
                            : T.bgCardRaised,
                        },
                      ]}
                    >
                      {item.isPayer ? (
                        <CheckCircle2 size={12} color={T.primary} />
                      ) : (
                        <CreditCard size={12} color={T.textSecondary} />
                      )}
                      <Text
                        style={[
                          styles.badgeText,
                          { color: item.isPayer ? T.primary : T.textSecondary },
                        ]}
                      >
                        {t("participant_summary_card.paid_by", {
                          name: item.payerName,
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* RODAPÉ DO CARTÃO (TOTAL) */}
      <View style={[styles.footer, { backgroundColor: T.bgCardRaised }]}>
        <View style={styles.footerRow}>
          <Text style={[theme.textStyles.body, { color: T.textSecondary }]}>
            {t("participant_summary_card.total_consumed")}
          </Text>
          <Text style={[theme.textStyles.body, { color: T.textPrimary }]}>
            {formatMoney(totalConsumed)}
          </Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={[theme.textStyles.body, { color: T.textSecondary }]}>
            {t("participant_summary_card.total_paid")}
          </Text>
          <Text style={[theme.textStyles.body, { color: T.textPrimary }]}>
            {formatMoney(totalPaid)}
          </Text>
        </View>
        <View
          style={[
            styles.footerRow,
            {
              marginTop: 8,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: T.border,
            },
          ]}
        >
          <Text style={[theme.textStyles.headline, { color: statusColor }]}>
            {statusText}
          </Text>
          <Text style={[theme.textStyles.title2, { color: statusColor }]}>
            {formatMoney(Math.abs(balance))}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    marginBottom: theme.spacing[6],
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing[4],
    borderBottomWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  itemsList: {
    paddingHorizontal: theme.spacing[4],
  },
  itemRow: {
    paddingVertical: theme.spacing[4],
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemTitle: {
    ...theme.textStyles.title3,
    color: T.textPrimary,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  itemAmount: {
    ...theme.textStyles.headline,
    color: T.textPrimary,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  footer: {
    padding: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
});
