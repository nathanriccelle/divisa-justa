import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  ArrowRight,
  ChevronLeft,
  DollarSign,
  Share2,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { eq } from "drizzle-orm";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { db } from "../src/db";
import { events, expenses, participants } from "../src/db/schema";
import { theme } from "../src/theme";

import {
  ConsumedItemProps,
  ParticipantSummaryCard,
} from "../src/components/ParticipantSummaryCard";

const T = theme.colors;

type ParticipantSummary = {
  id: string;
  name: string;
  initials: string;
  consumedItems: ConsumedItemProps[];
  totalConsumed: number;
  totalPaid: number;
};

const formatarDataCurta = (dataBanco: any) => {
  if (!dataBanco) return "";
  const d = new Date(dataBanco);
  const dia = d.getDate().toString().padStart(2, "0");
  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return `${dia} ${meses[d.getMonth()]}`;
};

export default function DetailedSummaryScreen() {
  const { eventId, taxMultiplier } = useLocalSearchParams<{
    eventId: string;
    taxMultiplier: string;
  }>();

  const multiplier = parseFloat(taxMultiplier || "1");

  const [currencySymbol, setCurrencySymbol] = useState("R$");
  const [eventName, setEventName] = useState("");
  const [summaryData, setSummaryData] = useState<ParticipantSummary[]>([]);

  const fetchDetailedSummary = async () => {
    if (!eventId) return;

    try {
      const eventData = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId));

      if (eventData.length > 0) {
        setCurrencySymbol(eventData[0].currencySymbol);
        setEventName(eventData[0].name);
      }

      const participantsData = await db
        .select()
        .from(participants)
        .where(eq(participants.eventId, eventId));

      const expensesData = await db
        .select()
        .from(expenses)
        .where(eq(expenses.eventId, eventId));

      const participantsMap = new Map(participantsData.map((p) => [p.id, p]));

      const summaries: Record<string, ParticipantSummary> = {};

      participantsData.forEach((p) => {
        summaries[p.id] = {
          id: p.id,
          name: p.name,
          initials: p.initials,
          consumedItems: [],
          totalConsumed: 0,
          totalPaid: 0,
        };
      });

      expensesData.forEach((exp) => {
        const consumersIds: string[] = JSON.parse(exp.splitWithIds);
        if (consumersIds.length === 0) return;

        let payerIds: string[] = [];
        try {
          const parsed = JSON.parse(exp.payerId);
          payerIds = Array.isArray(parsed) ? parsed : [exp.payerId];
        } catch {
          payerIds = [exp.payerId];
        }

        const payers = payerIds
          .map((id) => participantsMap.get(id))
          .filter((p) => p !== undefined);
        const payerName =
          payers.length > 0
            ? payers.map((p) => p.name).join(", ")
            : "Desconhecido";

        const itemTotalWithTax = exp.amount * exp.quantity * multiplier;

        const paidPortion = itemTotalWithTax / payerIds.length;
        payerIds.forEach((pid) => {
          if (summaries[pid]) {
            summaries[pid].totalPaid += paidPortion;
          }
        });

        const portionAmount = itemTotalWithTax / consumersIds.length;

        const dataFormatada = formatarDataCurta(exp.date);

        consumersIds.forEach((cid) => {
          if (summaries[cid]) {
            summaries[cid].consumedItems.push({
              id: exp.id,
              title: exp.title,
              portionAmount: portionAmount,
              splitCount: consumersIds.length,
              payerName: payerName,
              isPayer: payerIds.includes(cid),
              date: dataFormatada,
            });
            summaries[cid].totalConsumed += portionAmount;
          }
        });
      });

      setSummaryData(Object.values(summaries));
    } catch (error) {
      console.error("Erro ao gerar resumo detalhado:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetailedSummary();
    }, [eventId]),
  );

  const settlements = React.useMemo(() => {
    const debtors = summaryData
      .filter((p) => p.totalPaid - p.totalConsumed < -0.001)
      .map((p) => ({
        name: p.name,
        amount: Math.abs(p.totalPaid - p.totalConsumed),
      }))
      .sort((a, b) => b.amount - a.amount);

    const creditors = summaryData
      .filter((p) => p.totalPaid - p.totalConsumed > 0.001)
      .map((p) => ({ name: p.name, amount: p.totalPaid - p.totalConsumed }))
      .sort((a, b) => b.amount - a.amount);

    const result: { from: string; to: string; amount: number }[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      result.push({ from: debtor.name, to: creditor.name, amount });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.001) i++;
      if (creditor.amount < 0.001) j++;
    }
    return result;
  }, [summaryData]);

  const handleGeneratePDF = async () => {
    try {
      // Cria um layout HTML limpo e responsivo para o PDF
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; color: #333; padding: 20px; background-color: #f4f4f5; margin: 0; }
              .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
              h1 { text-align: center; font-size: 26px; color: #111; margin-top: 0; margin-bottom: 8px; }
              .subtitle { text-align: center; color: #666; font-size: 14px; margin-bottom: 30px; }
              
              .settlements-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 30px; }
              .settlements-card h2 { margin-top: 0; font-size: 18px; color: #0f172a; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
              .settlement-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
              .settlement-row:last-child { border-bottom: none; padding-bottom: 0; }
              .person { font-weight: 600; color: #334155; font-size: 15px; }
              .arrow { color: #94a3b8; font-weight: bold; margin: 0 10px; }
              .amount-transfer { font-weight: 700; color: #16a34a; font-size: 16px; }

              .participant { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
              .header { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px; display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
              .item { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #475569; align-items: flex-start; }
              .item-title { flex: 1; padding-right: 10px; }
              .item-split { display: block; font-size: 12px; color: #94a3b8; margin-top: 2px; }
              .totals { margin-top: 16px; font-size: 14px; background-color: #f8fafc; padding: 16px; border-radius: 8px; }
              .totals div { display: flex; justify-content: space-between; margin-bottom: 8px; color: #475569; }
              .totals div:last-child { margin-bottom: 0; }
              .balance { font-weight: 800; font-size: 16px; margin-top: 12px !important; padding-top: 12px; border-top: 1px solid #cbd5e1; }
              .positive { color: #16a34a !important; }
              .negative { color: #dc2626 !important; }
              .neutral { color: #64748b !important; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Fechamento: ${eventName}</h1>
              <div class="subtitle">Resumo completo gerado pelo Divisa Justa</div>

              <div class="settlements-card">
                <h2>💸 Quem paga quem?</h2>
                ${
                  settlements.length > 0
                    ? settlements
                        .map(
                          (s) => `
                  <div class="settlement-row">
                    <span class="person">${s.from}</span>
                    <span class="arrow">➔</span>
                    <span class="person">${s.to}</span>
                    <span class="amount-transfer">${currencySymbol} ${s.amount.toFixed(2).replace(".", ",")}</span>
                  </div>
                `,
                        )
                        .join("")
                    : '<div style="color: #64748b; font-style: italic;">Ninguém deve nada. Tudo resolvido! 🎉</div>'
                }
              </div>

            ${summaryData
              .map((p) => {
                const balance = p.totalPaid - p.totalConsumed;
                const statusColor =
                  balance > 0.001
                    ? "positive"
                    : balance < -0.001
                      ? "negative"
                      : "neutral";
                const statusText =
                  balance > 0.001
                    ? "A RECEBER"
                    : balance < -0.001
                      ? "A PAGAR"
                      : "QUITADO";

                let itemsHtml =
                  p.consumedItems.length > 0
                    ? p.consumedItems
                        .map(
                          (item) => `
                    <div class="item">
                      <div class="item-title">
                        ${item.title} ${item.splitCount > 1 ? `<span class="item-split">Dividido por ${item.splitCount}</span>` : ""}
                      </div>
                      <div style="font-weight: 600;">${currencySymbol} ${item.portionAmount.toFixed(2).replace(".", ",")}</div>
                    </div>
                  `,
                        )
                        .join("")
                    : `<div class="item"><span>Nenhum item consumido</span></div>`;

                return `
                <div class="participant">
                  <div class="header">${p.name}</div>
                  ${itemsHtml}
                  <div class="totals">
                    <div><span>Total Consumido</span> <span>${currencySymbol} ${p.totalConsumed.toFixed(2).replace(".", ",")}</span></div>
                    <div><span>Total Pago</span> <span>${currencySymbol} ${p.totalPaid.toFixed(2).replace(".", ",")}</span></div>
                    <div class="balance ${statusColor}"><span>${statusText}</span> <span>${currencySymbol} ${Math.abs(balance).toFixed(2).replace(".", ",")}</span></div>
                  </div>
                </div>
              `;
              })
              .join("")}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Resumo da Divisão - ${eventName}`,
          UTI: "com.adobe.pdf", // Identificador de tipo de arquivo no iOS
        });
      }
    } catch (error) {
      console.error("Erro ao gerar/compartilhar PDF:", error);
    }
  };

  const renderHeader = () => (
    <View style={{ marginBottom: theme.spacing[6] }}>
      <View
        style={[
          styles.settlementsCard,
          { backgroundColor: T.bgCardRaised, borderColor: T.border },
        ]}
      >
        <View style={styles.settlementsHeader}>
          <DollarSign size={24} color={T.primary} />
          <Text
            style={[
              theme.textStyles.title3,
              { color: T.textPrimary, marginLeft: theme.spacing[3] },
            ]}
          >
            Quem paga quem?
          </Text>
        </View>

        {settlements.length > 0 ? (
          settlements.map((s, index) => {
            const isLast = index === settlements.length - 1;
            return (
              <View
                key={index}
                style={[
                  styles.settlementRow,
                  !isLast && {
                    borderBottomWidth: 1,
                    borderBottomColor: T.border,
                  },
                ]}
              >
                <Text
                  style={[
                    theme.textStyles.body,
                    { color: T.textPrimary, fontWeight: "bold" },
                  ]}
                >
                  {s.from}
                </Text>
                <ArrowRight
                  size={16}
                  color={T.textSecondary}
                  style={{ marginHorizontal: 8 }}
                />
                <Text
                  style={[
                    theme.textStyles.body,
                    { color: T.textPrimary, fontWeight: "bold" },
                  ]}
                >
                  {s.to}
                </Text>
                <View style={{ flex: 1 }} />
                <Text style={[theme.textStyles.headline, { color: T.primary }]}>
                  {currencySymbol} {s.amount.toFixed(2).replace(".", ",")}
                </Text>
              </View>
            );
          })
        ) : (
          <Text
            style={[
              theme.textStyles.body,
              {
                color: T.textSecondary,
                fontStyle: "italic",
                textAlign: "center",
                paddingVertical: 8,
              },
            ]}
          >
            Ninguém deve nada. Tudo resolvido! 🎉
          </Text>
        )}
      </View>

      <Text
        style={[
          theme.textStyles.footnote,
          {
            color: T.textDisabled,
            marginTop: theme.spacing[8],
            marginBottom: theme.spacing[2],
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: "bold",
          },
        ]}
      >
        RESUMO INDIVIDUAL
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgScreen }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={{
            padding: theme.spacing[2],
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ChevronLeft size={28} color={T.primary} />
        </Pressable>

        <Text
          style={[
            theme.textStyles.title3,
            { color: T.textPrimary, flex: 1, textAlign: "center" },
          ]}
        >
          Resumo Detalhado
        </Text>

        <View style={{ width: 44 }} />
      </View>

      <FlatList
        style={styles.content}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingTop: theme.spacing[4],
        }}
        showsVerticalScrollIndicator={false}
        data={summaryData}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <ParticipantSummaryCard
            name={item.name}
            initials={item.initials}
            consumedItems={item.consumedItems}
            totalConsumed={item.totalConsumed}
            totalPaid={item.totalPaid}
            currencySymbol={currencySymbol}
          />
        )}
      />

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.pdfButton,
            { backgroundColor: pressed ? T.primaryPress : T.primary },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleGeneratePDF}
        >
          <Share2
            size={20}
            color={T.textOnLime}
            style={{ marginRight: theme.spacing[2] }}
          />
          <Text style={[theme.textStyles.headline, { color: T.textOnLime }]}>
            Exportar Resumo em PDF
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[4],
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[6],
  },
  footer: {
    padding: theme.spacing[6],
    paddingBottom: Platform.OS === "ios" ? 0 : theme.spacing[6],
  },
  pdfButton: {
    flexDirection: "row",
    height: 56,
    borderRadius: theme.borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadow.lg,
  },
  settlementsCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    padding: theme.spacing[6],
  },
  settlementsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing[4],
  },
  settlementRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[3],
  },
});
