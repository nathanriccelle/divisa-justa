import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Share2 } from "lucide-react-native";
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
  const [summaryData, setSummaryData] = useState<ParticipantSummary[]>([]);

  const fetchDetailedSummary = async () => {
    if (!eventId) return;

    try {
      const eventData = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId));

      if (eventData.length > 0) setCurrencySymbol(eventData[0].currencySymbol);

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
        };
      });

      expensesData.forEach((exp) => {
        const consumersIds: string[] = JSON.parse(exp.splitWithIds);
        if (consumersIds.length === 0) return;

        const payer = participantsMap.get(exp.payerId);
        const payerName = payer ? payer.name : "Alguém";

        const itemTotalWithTax = exp.amount * exp.quantity * multiplier;
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
              isPayer: cid === exp.payerId,
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
        renderItem={({ item }) => (
          <ParticipantSummaryCard
            name={item.name}
            initials={item.initials}
            consumedItems={item.consumedItems}
            totalConsumed={item.totalConsumed}
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
          onPress={() => {
            console.log("Gerar PDF disparado!");
          }}
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
});
