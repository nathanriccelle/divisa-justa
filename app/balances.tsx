import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ConciergeBell,
  Minus,
  Plus,
  Receipt,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { events, expenses, participants } from "../src/db/schema";
import { theme } from "../src/theme";

import { ParticipantStatementModal } from "@/src/components/ParticipantStatementModal";

const T = theme.colors;

type ParticipantStats = {
  id: string;
  name: string;
  initials: string;
  paid: number;
  consumed: number;
  balance: number;
};

type ExpenseType = {
  id: string;
  title: string;
  amount: number;
  quantity: number;
  payerId: string;
  splitWithIds: string;
};

export default function BalancesScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const [currencySymbol, setCurrencySymbol] = useState("R$");
  const [isTaxEnabled, setIsTaxEnabled] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState(10);

  const [totalBase, setTotalBase] = useState(0);
  const [userStats, setUserStats] = useState<ParticipantStats[]>([]);

  const [allExpenses, setAllExpenses] = useState<ExpenseType[]>([]);
  const [selectedParticipant, setSelectedParticipant] =
    useState<ParticipantStats | null>(null);

  const fetchBalances = async () => {
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

      setAllExpenses(expensesData as ExpenseType[]);

      let baseTotal = 0;
      let statsMap: Record<string, ParticipantStats> = {};

      participantsData.forEach((p) => {
        statsMap[p.id] = {
          id: p.id,
          name: p.name,
          initials: p.initials,
          paid: 0,
          consumed: 0,
          balance: 0,
        };
      });

      expensesData.forEach((exp) => {
        const expTotal = exp.amount * exp.quantity;
        baseTotal += expTotal;

        let payerIds: string[] = [];
        try {
          const parsed = JSON.parse(exp.payerId);
          payerIds = Array.isArray(parsed) ? parsed : [exp.payerId];
        } catch {
          payerIds = [exp.payerId];
        }

        const paidPortion = expTotal / payerIds.length;
        payerIds.forEach((pid) => {
          if (statsMap[pid]) {
            statsMap[pid].paid += paidPortion;
          }
        });

        const consumersIds: string[] = JSON.parse(exp.splitWithIds);
        if (consumersIds.length > 0) {
          const splitAmount = expTotal / consumersIds.length;
          consumersIds.forEach((cid) => {
            if (statsMap[cid]) statsMap[cid].consumed += splitAmount;
          });
        }
      });

      setTotalBase(baseTotal);
      setUserStats(Object.values(statsMap));
    } catch (error) {
      console.error("Erro ao calcular saldos:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBalances();
    }, [eventId]),
  );

  const taxMultiplier = isTaxEnabled ? 1 + taxPercentage / 100 : 1.0;
  const finalTotal = totalBase * taxMultiplier;
  const taxAmount = finalTotal - totalBase;

  const finalStats = userStats.map((stat) => {
    const finalPaid = stat.paid * taxMultiplier;
    const finalConsumed = stat.consumed * taxMultiplier;
    const balance = finalPaid - finalConsumed;
    return { ...stat, paid: finalPaid, consumed: finalConsumed, balance };
  });

  finalStats.sort((a, b) => b.balance - a.balance);

  const formatMoney = (val: number) =>
    `${currencySymbol} ${Math.abs(val).toFixed(2).replace(".", ",")}`;

  // 👇 CABEÇALHO DA LISTA
  const renderHeader = () => (
    <>
      <View
        style={[
          styles.totalCard,
          { backgroundColor: T.bgCardRaised, borderColor: T.border },
        ]}
      >
        <Text
          style={[
            theme.textStyles.subheadline,
            { color: T.textSecondary, letterSpacing: 1 },
          ]}
        >
          TOTAL DA CONTA
        </Text>
        <Text
          style={[
            theme.textStyles.largeTitle,
            {
              color: T.textPrimary,
              fontSize: 40,
              marginTop: 4,
              marginBottom: theme.spacing[6],
            },
          ]}
        >
          {formatMoney(finalTotal)}
        </Text>

        <View style={styles.totalRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                theme.textStyles.footnote,
                { color: T.textSecondary, fontWeight: "bold" },
              ]}
            >
              CONSUMIDO
            </Text>
            <Text
              style={[
                theme.textStyles.headline,
                { color: T.textPrimary, marginTop: 2 },
              ]}
            >
              {formatMoney(totalBase)}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: T.border }]} />
          <View style={{ flex: 1, paddingLeft: theme.spacing[4] }}>
            <Text
              style={[
                theme.textStyles.footnote,
                { color: T.primary, fontWeight: "bold" },
              ]}
            >
              TAXA {isTaxEnabled ? `${taxPercentage}%` : "0%"}
            </Text>
            <Text
              style={[
                theme.textStyles.headline,
                { color: T.primary, marginTop: 2 },
              ]}
            >
              {formatMoney(taxAmount)}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.taxToggleCard,
          { backgroundColor: T.bgCard, borderColor: T.border },
        ]}
      >
        <View style={[styles.iconBox]}>
          <ConciergeBell size={20} color={T.primary} />
        </View>

        <View style={{ flex: 1, marginLeft: theme.spacing[3] }}>
          <Text style={[theme.textStyles.headline, { color: T.textPrimary }]}>
            Taxa de Serviço
          </Text>
          <Text style={[theme.textStyles.footnote, { color: T.textSecondary }]}>
            {isTaxEnabled ? `Ativada (${taxPercentage}%)` : "Desativada"}
          </Text>
        </View>

        {isTaxEnabled && (
          <View style={styles.stepperContainer}>
            <Pressable
              onPress={() => setTaxPercentage((p) => Math.max(0, p - 1))}
              style={({ pressed }) => [
                styles.stepperBtn,
                { borderColor: T.border },
                pressed && { backgroundColor: T.bgCardRaised },
              ]}
            >
              <Minus size={14} color={T.textPrimary} />
            </Pressable>
            <Text
              style={[
                theme.textStyles.subheadline,
                {
                  color: T.textPrimary,
                  marginHorizontal: 8,
                  fontWeight: "bold",
                },
              ]}
            >
              {taxPercentage}%
            </Text>
            <Pressable
              onPress={() => setTaxPercentage((p) => p + 1)}
              style={({ pressed }) => [
                styles.stepperBtn,
                { borderColor: T.border },
                pressed && { backgroundColor: T.bgCardRaised },
              ]}
            >
              <Plus size={14} color={T.textPrimary} />
            </Pressable>
          </View>
        )}

        <View style={{ marginLeft: theme.spacing[3] }}>
          <Switch
            value={isTaxEnabled}
            onValueChange={setIsTaxEnabled}
            trackColor={{ false: T.border, true: T.primary }}
            thumbColor={Platform.OS === "ios" ? "#FFF" : "#FFF"}
          />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: T.textDisabled }]}>
          PARTICIPANTES
        </Text>
        <Text style={[theme.textStyles.footnote, { color: T.textSecondary }]}>
          {finalStats.length} pessoas
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgScreen }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: theme.spacing[2],
          }}
        >
          <ChevronLeft size={24} color={T.primary} />
        </Pressable>
        <Text
          style={[
            theme.textStyles.title3,
            { color: T.textPrimary, flex: 1, textAlign: "center" },
          ]}
        >
          Painel de Saldos
        </Text>
      </View>

      <FlatList
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        data={finalStats}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item: stat }) => {
          const isToReceive = stat.balance > 0.001;
          const isToPay = stat.balance < -0.001;
          const isSettled = !isToReceive && !isToPay;

          let statusColor: string = T.textSecondary;
          let statusBg: string = T.bgCardRaised;
          let statusText: string = "QUITADO";

          if (isToReceive) {
            statusColor = T.primary;
            statusBg = "rgba(50, 205, 50, 0.1)";
            statusText = "RECEBER";
          } else if (isToPay) {
            statusColor = T.negative;
            statusBg = T.negativeBg;
            statusText = "DEVE";
          }

          return (
            <Pressable
              onPress={() => setSelectedParticipant(stat)}
              style={({ pressed }) => [
                styles.participantRow,
                { borderBottomColor: T.border },
                pressed && { backgroundColor: T.bgCardRaised },
              ]}
            >
              <View
                style={[styles.avatar, { backgroundColor: T.bgCardRaised }]}
              >
                <Text
                  style={[
                    theme.textStyles.subheadline,
                    { fontWeight: "bold", color: T.textPrimary },
                  ]}
                >
                  {stat.initials}
                </Text>
              </View>

              <View style={{ flex: 1, marginLeft: theme.spacing[3] }}>
                <Text
                  style={[theme.textStyles.headline, { color: T.textPrimary }]}
                >
                  {stat.name}
                </Text>
                <Text
                  style={[
                    theme.textStyles.footnote,
                    { color: T.textSecondary, marginTop: 2 },
                  ]}
                >
                  {stat.paid > 0
                    ? `Pagou ${formatMoney(stat.paid)}`
                    : `Consumiu ${formatMoney(stat.consumed)}`}
                </Text>
              </View>

              <View
                style={{
                  alignItems: "flex-end",
                  marginRight: theme.spacing[3],
                }}
              >
                <Text
                  style={[
                    theme.textStyles.headline,
                    { color: statusColor, marginBottom: 4 },
                  ]}
                >
                  {formatMoney(stat.balance)}
                </Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: statusBg }]}
                >
                  {isSettled && (
                    <Check
                      size={10}
                      color={statusColor}
                      style={{ marginRight: 2 }}
                    />
                  )}
                  {isToPay && (
                    <View
                      style={[styles.dot, { backgroundColor: statusColor }]}
                    />
                  )}
                  {isToReceive && (
                    <View
                      style={[styles.dot, { backgroundColor: statusColor }]}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "bold",
                      color: statusColor,
                    }}
                  >
                    {statusText}
                  </Text>
                </View>
              </View>

              <ChevronRight size={20} color={T.textDisabled} />
            </Pressable>
          );
        }}
      />

      <ParticipantStatementModal
        visible={selectedParticipant !== null}
        participant={selectedParticipant}
        allExpenses={allExpenses}
        currencySymbol={currencySymbol}
        taxMultiplier={taxMultiplier}
        onClose={() => setSelectedParticipant(null)}
      />

      <View style={[styles.footer, { backgroundColor: T.bgScreen }]}>
        <Pressable
          onPress={() => {
            router.push({
              pathname: "/detailed-summary",
              params: {
                eventId: eventId,
                taxMultiplier: taxMultiplier.toString(),
              },
            });
          }}
          style={({ pressed }) => [
            styles.mainButton,
            { backgroundColor: pressed ? T.primaryPress : T.primary },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <Receipt
            size={20}
            color={T.textOnLime}
            style={{ marginRight: theme.spacing[2] }}
          />
          <Text style={[theme.textStyles.headline, { color: T.textOnLime }]}>
            Finalizar Evento
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
  },
  content: { flex: 1, paddingHorizontal: theme.spacing[6] },
  totalCard: {
    alignItems: "center",
    padding: theme.spacing[6],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    marginTop: theme.spacing[4],
  },
  totalRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    marginTop: theme.spacing[4],
  },
  divider: { width: 1, height: 30 },
  taxToggleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    marginTop: theme.spacing[6],
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperContainer: { flexDirection: "row", alignItems: "center" },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Header da Seção de Participantes
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing[8],
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: "bold",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },

  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[2],
    borderBottomWidth: 1,
    borderRadius: theme.borderRadius.md,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  footer: {
    padding: theme.spacing[6],
    paddingBottom: Platform.OS === "ios" ? 0 : theme.spacing[6],
  },
  mainButton: {
    flexDirection: "row",
    height: 56,
    borderRadius: theme.borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
  },
});
