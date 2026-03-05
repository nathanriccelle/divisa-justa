// Caminho: src/components/ParticipantSummaryCard.tsx
import { ArrowRight, CheckCircle2, PieChart, User } from "lucide-react-native";
import React from "react";
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
};

type ParticipantSummaryCardProps = {
  name: string;
  initials: string;
  consumedItems: ConsumedItemProps[];
  totalConsumed: number;
  currencySymbol: string;
};

export function ParticipantSummaryCard({
  name,
  initials,
  consumedItems,
  totalConsumed,
  currencySymbol,
}: ParticipantSummaryCardProps) {
  const formatMoney = (val: number) =>
    `${currencySymbol} ${val.toFixed(2).replace(".", ",")}`;

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
            Resumo de consumo
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
            Não consumiu nada neste evento.
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
                  {/* Título e Valor Lado a Lado */}
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
                        { color: T.textPrimary, fontWeight: "bold", flex: 1 },
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        theme.textStyles.headline,
                        { color: T.textPrimary },
                      ]}
                    >
                      {formatMoney(item.portionAmount)}
                    </Text>
                  </View>

                  {/* Detalhe da Divisão */}
                  <View style={styles.detailRow}>
                    {item.splitCount === 1 ? (
                      <User size={12} color={T.textSecondary} />
                    ) : (
                      <PieChart size={12} color={T.textSecondary} />
                    )}
                    <Text
                      style={[
                        theme.textStyles.footnote,
                        { color: T.textSecondary, marginLeft: 4 },
                      ]}
                    >
                      {item.splitCount === 1
                        ? "Consumo Individual"
                        : `Dividido para ${item.splitCount} pessoas`}
                    </Text>
                  </View>

                  {/* Ação / Quem pagou */}
                  <View style={[styles.detailRow, { marginTop: 4 }]}>
                    {item.isPayer ? (
                      <>
                        <CheckCircle2 size={14} color={T.textSecondary} />
                        <Text
                          style={[
                            theme.textStyles.footnote,
                            { color: T.textSecondary, marginLeft: 4 },
                          ]}
                        >
                          Você pagou este item
                        </Text>
                      </>
                    ) : (
                      <>
                        <ArrowRight size={14} color={T.primary} />
                        <Text
                          style={[
                            theme.textStyles.footnote,
                            {
                              color: T.primary,
                              marginLeft: 4,
                              fontWeight: "bold",
                            },
                          ]}
                        >
                          Pagar a {item.payerName} (Comprou)
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* RODAPÉ DO CARTÃO (TOTAL) */}
      <View style={[styles.footer, { backgroundColor: T.bgCardRaised }]}>
        <Text style={[theme.textStyles.body, { color: T.textSecondary }]}>
          Total Consumido
        </Text>
        <Text style={[theme.textStyles.title2, { color: T.primary }]}>
          {formatMoney(totalConsumed)}
        </Text>
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
  itemsList: { paddingHorizontal: theme.spacing[4] },
  itemRow: { paddingVertical: theme.spacing[4] },
  detailRow: { flexDirection: "row", alignItems: "center" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
});
