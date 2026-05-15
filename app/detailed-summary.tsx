import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  ArrowRight,
  ChevronLeft,
  DollarSign,
  Share2,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { eq } from "drizzle-orm";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { db } from "../src/db";
import { events, expenses, participants } from "../src/db/schema";
import { theme } from "../src/theme";

import { useTranslation } from "react-i18next";
import { ExportModal } from "../src/components/ExportModal";
import {
  ConsumedItemProps,
  ParticipantSummaryCard,
} from "../src/components/ParticipantSummaryCard";
import { useRewardedAd } from "../src/hooks/useRewardedAd";

const T = theme.colors;

type ParticipantSummary = {
  id: string;
  name: string;
  initials: string;
  consumedItems: ConsumedItemProps[];
  totalConsumed: number;
  totalPaid: number;
};

export default function DetailedSummaryScreen() {
  const { t, i18n } = useTranslation();
  const {
    eventId,
    taxMultiplier,
    taxPerPerson: taxPerPersonParam,
    taxOptOutIds: taxOptOutIdsParam,
    assumptions,
    isTaxProportional: isTaxProportionalParam,
    finalTaxAmount: finalTaxAmountParam,
  } = useLocalSearchParams<{
    eventId: string;
    taxMultiplier: string;
    taxPerPerson: string;
    taxOptOutIds: string;
    assumptions: string;
    isTaxProportional: string;
    finalTaxAmount: string;
  }>();

  const formatarDataCurta = (dataBanco: any) => {
    if (!dataBanco) return "";
    const d = new Date(dataBanco);
    return d.toLocaleDateString(i18n.language, {
      day: "2-digit",
      month: "short",
    });
  };

  const effectiveTaxMultiplier = parseFloat(taxMultiplier || "1");
  const parsedTaxPerPerson = parseFloat(taxPerPersonParam || "0");
  const parsedOptOutIds: string[] = taxOptOutIdsParam
    ? JSON.parse(taxOptOutIdsParam)
    : [];
  const parsedAssumptions: Record<string, string> = assumptions
    ? JSON.parse(assumptions)
    : {};
  const isTaxProportional = isTaxProportionalParam === "true";
  const finalTaxAmount = parseFloat(finalTaxAmountParam || "0");

  const [currencySymbol, setCurrencySymbol] = useState("R$");
  const [eventName, setEventName] = useState("");
  const [summaryData, setSummaryData] = useState<ParticipantSummary[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  const [shouldGeneratePDF, setShouldGeneratePDF] = useState(false);

  const rewardEarnedRef = useRef(false);

  const onRewardEarned = useCallback(() => {
    rewardEarnedRef.current = true;
  }, []);

  const onAdClosed = useCallback(() => {
    if (rewardEarnedRef.current) {
      rewardEarnedRef.current = false;
      // Pequeno atraso para garantir que a tela do anúncio fechou por completo
      setTimeout(() => {
        setShouldGeneratePDF(true);
      }, 300);
    }
  }, []);

  const { isLoaded, showAd } = useRewardedAd(onRewardEarned, onAdClosed);

  const handleExportPDFClick = () => {
    setShowExportModal(false);
    if (isLoaded) {
      rewardEarnedRef.current = false;
      showAd();
    } else {
      setShouldGeneratePDF(true);
    }
  };

  // Efeito necessário para evitar problemas de "stale closure"
  // e garantir que os dados atualizados sejam sempre lidos.
  useEffect(() => {
    if (shouldGeneratePDF) {
      setShouldGeneratePDF(false);
      handleGeneratePDF();
    }
  }, [shouldGeneratePDF]);

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
            : t("detailed_summary.unknown");

        const itemTotalWithTax =
          exp.amount * exp.quantity * effectiveTaxMultiplier;

        const paidPortion = itemTotalWithTax / payerIds.length;
        payerIds.forEach((pid) => {
          if (summaries[pid]) {
            summaries[pid].totalPaid += paidPortion;
          }
        });

        const itemTotalBase = exp.amount * exp.quantity;
        const portionAmount = itemTotalBase / consumersIds.length;

        const dataFormatada = formatarDataCurta(exp.date);

        consumersIds.forEach((cid) => {
          if (summaries[cid]) {
            summaries[cid].consumedItems.push({
              id: exp.id,
              title: exp.title,
              portionAmount: portionAmount,
              totalItemAmount: itemTotalBase,
              splitCount: consumersIds.length,
              payerName: payerName,
              isPayer: payerIds.includes(cid),
              date: dataFormatada,
            });
            summaries[cid].totalConsumed += portionAmount;
          }
        });
      });

      let totalConsumptionOfPayingPeople = 0;
      if (isTaxProportional) {
        participantsData.forEach((p) => {
          if (summaries[p.id] && !parsedOptOutIds.includes(p.id)) {
            totalConsumptionOfPayingPeople += summaries[p.id].totalConsumed;
          }
        });
      }

      // Aplica a Taxa de Serviço
      if (parsedTaxPerPerson > 0 || finalTaxAmount > 0) {
        const taxSplitCount = participantsData.length - parsedOptOutIds.length;
        const totalTaxAmount = isTaxProportional
          ? finalTaxAmount
          : parsedTaxPerPerson * taxSplitCount;
        participantsData.forEach((p) => {
          if (summaries[p.id] && !parsedOptOutIds.includes(p.id)) {
            let myTax = 0;
            if (isTaxProportional) {
              myTax =
                totalConsumptionOfPayingPeople > 0
                  ? finalTaxAmount *
                    (summaries[p.id].totalConsumed /
                      totalConsumptionOfPayingPeople)
                  : 0;
            } else {
              myTax = parsedTaxPerPerson;
            }

            if (myTax > 0) {
              summaries[p.id].consumedItems.push({
                id: `tax_${p.id}`,
                title: t("balances.service_fee"),
                portionAmount: myTax,
                totalItemAmount: totalTaxAmount,
                splitCount: taxSplitCount,
                payerName: "",
                isPayer: false,
                date: "-",
              });
              summaries[p.id].totalConsumed += myTax;
            }
          }
        });
      }

      // Aplica a mesclagem de contas para os que assumiram as dívidas dos outros
      Object.entries(parsedAssumptions).forEach(([assumeeId, assumerId]) => {
        const assumee = summaries[assumeeId];
        const assumer = summaries[assumerId];
        if (assumee && assumer) {
          assumer.totalConsumed += assumee.totalConsumed;
          assumer.totalPaid += assumee.totalPaid;

          assumee.consumedItems.forEach((item) => {
            assumer.consumedItems.push({
              ...item,
              id: `${item.id}_${assumeeId}`,
              assumedFromName: assumee.name,
            });
          });

          assumee.totalConsumed = 0;
          assumee.totalPaid = 0;
          assumee.consumedItems = [];
        }
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

  const handleGenerateText = async () => {
    try {
      let text = `${t("pdf_export.closing")} ${eventName}\n\n`;
      text += `💸 ${t("detailed_summary.who_pays_who")}\n`;
      if (settlements.length > 0) {
        settlements.forEach((s) => {
          text += `${s.from} ➔ ${s.to}: ${currencySymbol} ${s.amount.toFixed(2).replace(".", ",")}\n`;
        });
      } else {
        text += `${t("detailed_summary.all_settled")}\n`;
      }

      text += `\n👤 ${t("detailed_summary.individual_summary")}\n`;
      summaryData.forEach((p) => {
        const balance = p.totalPaid - p.totalConsumed;
        text += `\n${p.name}\n`;
        text += `- ${t("detailed_summary.total_consumed")}: ${currencySymbol} ${p.totalConsumed.toFixed(2).replace(".", ",")}\n`;
        text += `- ${t("detailed_summary.total_paid")}: ${currencySymbol} ${p.totalPaid.toFixed(2).replace(".", ",")}\n`;
        if (balance > 0.001) {
          text += `- ${t("detailed_summary.to_receive")}: ${currencySymbol} ${Math.abs(balance).toFixed(2).replace(".", ",")}\n`;
        } else if (balance < -0.001) {
          text += `- ${t("detailed_summary.to_pay")}: ${currencySymbol} ${Math.abs(balance).toFixed(2).replace(".", ",")}\n`;
        } else {
          text += `- ${t("detailed_summary.settled")}\n`;
        }
      });

      await Share.share({ message: text });
      setShowExportModal(false);
    } catch (error) {
      console.error("Erro ao exportar texto:", error);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      // Cria um layout HTML limpo e responsivo para o PDF
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
              body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; padding: 24px; background-color: #ffffff; margin: 0; line-height: 1.5; font-size: 18px; }
              .header-title { text-align: center; font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
              .header-subtitle { text-align: center; color: #64748b; font-size: 18px; margin-bottom: 32px; font-weight: 500; }
              
              .settlements-card { background-color: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid #e2e8f0; }
              .section-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 20px 0; display: flex; align-items: center; gap: 8px; }
              
              .settlement-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #cbd5e1; }
              .settlement-row:last-child { border-bottom: none; padding-bottom: 0; }
              .person-container { display: flex; align-items: center; flex: 1; }
              .person { font-weight: 700; color: #334155; font-size: 20px; }
              .arrow { color: #94a3b8; font-weight: bold; margin: 0 12px; font-size: 20px; }
              .amount-transfer { font-weight: 800; color: #16a34a; font-size: 22px; background: #dcfce7; padding: 8px 16px; border-radius: 12px; white-space: nowrap; }

              .participant { border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px; page-break-inside: avoid; }
              .participant-name { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 20px 0; padding-bottom: 16px; border-bottom: 2px solid #f1f5f9; }
              
              .item { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 18px; color: #334155; align-items: flex-start; }
              .item-title { flex: 1; padding-right: 16px; font-weight: 600; }
              .item-split { display: block; font-size: 16px; color: #64748b; margin-top: 4px; font-weight: 500; }
              .item-amount { font-weight: 700; color: #0f172a; }
              
              .totals { margin-top: 24px; font-size: 18px; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
              .totals div { display: flex; justify-content: space-between; margin-bottom: 12px; color: #475569; font-weight: 600; }
              .totals div:last-child { margin-bottom: 0; }
              .balance { font-weight: 800 !important; font-size: 24px !important; margin-top: 16px !important; padding-top: 16px; border-top: 2px dashed #cbd5e1; }
              .positive { color: #16a34a !important; }
              .negative { color: #dc2626 !important; }
              .neutral { color: #64748b !important; }
            </style>
          </head>
          <body>
            <h1 class="header-title">${t("pdf_export.closing")} ${eventName}</h1>
            <div class="header-subtitle">${t("pdf_export.subtitle")}</div>

            <div class="settlements-card">
              <h2 class="section-title">${t("pdf_export.who_pays_who")}</h2>
              ${
                settlements.length > 0
                  ? settlements
                      .map(
                        (s) => `
                <div class="settlement-row">
                  <div class="person-container">
                    <span class="person">${s.from}</span>
                    <span class="arrow">➔</span>
                    <span class="person">${s.to}</span>
                  </div>
                  <span class="amount-transfer">${currencySymbol} ${s.amount.toFixed(2).replace(".", ",")}</span>
                </div>
              `,
                      )
                      .join("")
                  : `<div style="color: #64748b; font-style: italic; font-size: 18px;">${t("detailed_summary.all_settled")}</div>`
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
                    ? t("detailed_summary.to_receive")
                    : balance < -0.001
                      ? t("detailed_summary.to_pay")
                      : t("detailed_summary.settled");

                let itemsHtml =
                  p.consumedItems.length > 0
                    ? p.consumedItems
                        .map((item) => {
                          const assumedHtml = item.assumedFromName
                            ? `<span class="item-split" style="color: #8b5cf6; font-weight: 700; margin-top: 6px;">${t("pdf_export.help_from", { name: item.assumedFromName })}</span>`
                            : "";
                          return `
                  <div class="item">
                    <div class="item-title">
                      ${item.title} 
                      ${item.splitCount > 1 ? `<span class="item-split">${t("detailed_summary.divided_by", { count: item.splitCount })} • ${t("participant_summary_card.total_item", { amount: `${currencySymbol} ${item.totalItemAmount.toFixed(2).replace(".", ",")}` })}</span>` : ""}
                      ${assumedHtml}
                    </div>
                    <div class="item-amount">${currencySymbol} ${item.portionAmount.toFixed(2).replace(".", ",")}</div>
                  </div>
                `;
                        })
                        .join("")
                    : `<div class="item"><span style="color: #94a3b8; font-style: italic;">${t("detailed_summary.no_items_consumed")}</span></div>`;

                return `
              <div class="participant">
                <h3 class="participant-name">${p.name}</h3>
                ${itemsHtml}
                <div class="totals">
                  <div><span>${t("detailed_summary.total_consumed")}</span> <span>${currencySymbol} ${p.totalConsumed.toFixed(2).replace(".", ",")}</span></div>
                  <div><span>${t("detailed_summary.total_paid")}</span> <span>${currencySymbol} ${p.totalPaid.toFixed(2).replace(".", ",")}</span></div>
                  <div class="balance ${statusColor}"><span>${statusText}</span> <span>${currencySymbol} ${Math.abs(balance).toFixed(2).replace(".", ",")}</span></div>
                </div>
              </div>
            `;
              })
              .join("")}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // Pega o diretório atual do arquivo gerado e apenas troca o nome final
      const uriParts = uri.split("/");
      uriParts.pop(); // Remove o nome do arquivo temporário (ex: UUID.pdf)
      const directoryUri = uriParts.join("/") + "/";

      const safeEventName = eventName.replace(/[^a-zA-Z0-9]/g, "");
      const newUri = `${directoryUri}${t("pdf_export.filename_prefix")}${safeEventName || "DivisaJusta"}.pdf`;

      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      // Abre a tela nativa de compartilhamento para o usuário enviar para o WhatsApp, Salvar, etc.
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, {
          mimeType: "application/pdf",
          dialogTitle: t("detailed_summary.pdf_share_title", {
            eventName: eventName || "DivisaJusta",
          }),
          UTI: "com.adobe.pdf", // Identificador nativo para iOS reconhecer como PDF
        });
      }
    } catch (error) {
      console.error("Erro ao gerar/compartilhar PDF:", error);
      alert("Ocorreu um erro ao tentar compartilhar o PDF.");
    }
  };

  const renderHeader = () => (
    <View style={{ marginBottom: theme.spacing[6] }}>
      <View style={[styles.settlementsCard, { backgroundColor: T.bgCard }]}>
        <View style={styles.settlementsHeader}>
          <DollarSign size={24} color={T.primary} />
          <Text
            style={[
              theme.textStyles.title3,
              { color: T.textPrimary, marginLeft: theme.spacing[3] },
            ]}
          >
            {t("detailed_summary.who_pays_who")}
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
            {t("detailed_summary.all_settled")}
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
        {t("detailed_summary.individual_summary")}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
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
          {t("detailed_summary.title")}
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
          onPress={() => setShowExportModal(true)}
        >
          <Share2
            size={20}
            color={T.textOnLime}
            style={{ marginRight: theme.spacing[2] }}
          />
          <Text style={[theme.textStyles.headline, { color: T.textOnLime }]}>
            {t("detailed_summary.export_summary")}
          </Text>
        </Pressable>
      </View>

      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportText={handleGenerateText}
        onExportPDF={handleExportPDFClick}
      />
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
