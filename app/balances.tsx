import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ConciergeBell,
  HeartHandshake,
  Minus,
  Plus,
  Receipt,
  Users,
  X,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
import { useTranslation } from "react-i18next";
import { ParticipantCheckbox } from "../src/components/ParticipantCheckbox";

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
  const { t } = useTranslation();

  const [currencySymbol, setCurrencySymbol] = useState("R$");
  const [isTaxEnabled, setIsTaxEnabled] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState(10);

  const [totalBase, setTotalBase] = useState(0);
  const [userStats, setUserStats] = useState<ParticipantStats[]>([]);

  const [allExpenses, setAllExpenses] = useState<ExpenseType[]>([]);
  const [selectedParticipant, setSelectedParticipant] =
    useState<ParticipantStats | null>(null);

  const [showTaxModal, setShowTaxModal] = useState(false);
  const [taxOptOutIds, setTaxOptOutIds] = useState<string[]>([]);
  const [absorbTax, setAbsorbTax] = useState(false);

  // NOVO: Estados para Assumir Contas
  const [assumptions, setAssumptions] = useState<Record<string, string>>({});
  const [showAssumeModal, setShowAssumeModal] = useState(false);
  const [newAssumerId, setNewAssumerId] = useState<string | null>(null);
  const [newAssumeeId, setNewAssumeeId] = useState<string | null>(null);

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

  const originalTaxAmount = isTaxEnabled
    ? totalBase * (taxPercentage / 100)
    : 0;
  const totalPeople = userStats.length;
  const payingPeopleCount = Math.max(0, totalPeople - taxOptOutIds.length);

  let finalTaxAmount = 0;
  let taxPerPerson = 0;

  if (isTaxEnabled && payingPeopleCount > 0) {
    if (absorbTax) finalTaxAmount = originalTaxAmount;
    else finalTaxAmount = originalTaxAmount * (payingPeopleCount / totalPeople);
    taxPerPerson = finalTaxAmount / payingPeopleCount;
  }

  const effectiveTaxMultiplier =
    totalBase > 0 ? 1 + finalTaxAmount / totalBase : 1;
  const finalTotal = totalBase + finalTaxAmount;

  const processedStats = userStats.map((stat) => {
    const finalPaid = stat.paid * effectiveTaxMultiplier;
    const isPayingTax = isTaxEnabled && !taxOptOutIds.includes(stat.id);
    const finalConsumed = stat.consumed + (isPayingTax ? taxPerPerson : 0);
    const balance = finalPaid - finalConsumed;
    return {
      ...stat,
      paid: finalPaid,
      consumed: finalConsumed,
      balance,
      isAssumedBy: null as string | null,
    };
  });

  Object.entries(assumptions).forEach(([assumeeId, assumerId]) => {
    const assumee = processedStats.find((s) => s.id === assumeeId);
    const assumer = processedStats.find((s) => s.id === assumerId);
    if (assumee && assumer) {
      assumer.consumed += assumee.consumed;
      assumer.paid += assumee.paid;
      assumer.balance = assumer.paid - assumer.consumed;

      assumee.consumed = 0;
      assumee.paid = 0;
      assumee.balance = 0;
      assumee.isAssumedBy = assumerId;
    }
  });

  const finalStats = [...processedStats].sort((a, b) => b.balance - a.balance);

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
          {t("balances.total_bill")}
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
              {t("balances.consumed")}
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
              {t("balances.tax", {
                percentage: isTaxEnabled ? taxPercentage : 0,
              })}
            </Text>
            <Text
              style={[
                theme.textStyles.headline,
                { color: T.primary, marginTop: 2 },
              ]}
            >
              {formatMoney(finalTaxAmount)}
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={[styles.iconBox, { backgroundColor: T.bgCardRaised }]}>
            <ConciergeBell size={20} color={T.primary} />
          </View>

          <View style={{ flex: 1, marginLeft: theme.spacing[3] }}>
            <Text style={[theme.textStyles.headline, { color: T.textPrimary }]}>
              {t("balances.service_fee")}
            </Text>
            <Text
              style={[theme.textStyles.footnote, { color: T.textSecondary }]}
            >
              {isTaxEnabled
                ? t("balances.tax_enabled", {
                    percentage: taxPercentage,
                    amount: formatMoney(finalTaxAmount),
                  })
                : t("balances.tax_disabled")}
            </Text>
          </View>

          <View style={{ marginLeft: theme.spacing[3] }}>
            <Switch
              value={isTaxEnabled}
              onValueChange={setIsTaxEnabled}
              trackColor={{ false: T.border, true: T.primary }}
              thumbColor={Platform.OS === "ios" ? "#FFF" : "#FFF"}
            />
          </View>
        </View>

        {isTaxEnabled && (
          <View
            style={{
              marginTop: theme.spacing[4],
              paddingTop: theme.spacing[4],
              borderTopWidth: 1,
              borderTopColor: T.border,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={styles.stepperContainer}>
              <Pressable
                onPress={() => setTaxPercentage((p) => Math.max(0, p - 1))}
                style={({ pressed }) => [
                  styles.stepperBtn,
                  { borderColor: T.border, backgroundColor: T.bgCardRaised },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Minus size={14} color={T.textPrimary} />
              </Pressable>
              <Text
                style={[
                  theme.textStyles.subheadline,
                  {
                    color: T.textPrimary,
                    marginHorizontal: 12,
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
                  { borderColor: T.border, backgroundColor: T.bgCardRaised },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Plus size={14} color={T.textPrimary} />
              </Pressable>
            </View>

            <Pressable
              onPress={() => setShowTaxModal(true)}
              style={({ pressed }) => [
                {
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: T.bgCardRaised,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: T.border,
                },
                pressed && { backgroundColor: T.border },
              ]}
            >
              <Users size={14} color={T.primary} style={{ marginRight: 6 }} />
              <Text
                style={{
                  color: T.textPrimary,
                  fontSize: 12,
                  fontWeight: "bold",
                  marginRight: 4,
                }}
              >
                {taxOptOutIds.length === 0
                  ? t("balances.tax_everyone")
                  : t("balances.tax_custom", { count: payingPeopleCount })}
              </Text>
              <ChevronRight size={14} color={T.textSecondary} />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.sectionTitle, { color: T.textDisabled }]}>
            {t("balances.participants")}
          </Text>
          <Text
            style={[
              theme.textStyles.footnote,
              { color: T.textSecondary, marginLeft: 8 },
            ]}
          >
            {t("balances.people_count", { count: finalStats.length })}
          </Text>
        </View>

        <Pressable
          onPress={() => setShowAssumeModal(true)}
          style={({ pressed }) => [
            { flexDirection: "row", alignItems: "center", padding: 4 },
            pressed && { opacity: 0.7 },
          ]}
        >
          <HeartHandshake size={16} color={T.primary} />
          <Text
            style={{
              color: T.primary,
              fontSize: 12,
              fontWeight: "bold",
              marginLeft: 6,
            }}
          >
            {t("balances.assume_account")}
          </Text>
        </Pressable>
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
          {t("balances.title")}
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
          let statusText: string = t("balances.settled");

          if (isToReceive) {
            statusColor = T.primary;
            statusBg = "rgba(50, 205, 50, 0.1)";
            statusText = t("balances.to_receive");
          } else if (isToPay) {
            statusColor = T.negative;
            statusBg = T.negativeBg;
            statusText = t("balances.to_pay");
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
                  {stat.isAssumedBy
                    ? t("balances.assumed_by", {
                        name: finalStats.find((s) => s.id === stat.isAssumedBy)
                          ?.name,
                      })
                    : stat.paid > 0
                      ? t("balances.paid_amount", {
                          amount: formatMoney(stat.paid),
                        })
                      : t("balances.consumed_amount", {
                          amount: formatMoney(stat.consumed),
                        })}
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
        taxMultiplier={effectiveTaxMultiplier}
        taxPerPerson={taxPerPerson}
        isPayingTax={
          selectedParticipant
            ? !taxOptOutIds.includes(selectedParticipant.id)
            : false
        }
        onClose={() => setSelectedParticipant(null)}
      />

      <View style={[styles.footer, { backgroundColor: T.bgScreen }]}>
        <Pressable
          onPress={() => {
            router.push({
              pathname: "/detailed-summary",
              params: {
                eventId: eventId,
                taxMultiplier: effectiveTaxMultiplier.toString(),
                taxPerPerson: taxPerPerson.toString(),
                taxOptOutIds: JSON.stringify(taxOptOutIds),
                assumptions: JSON.stringify(assumptions),
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
            {t("balances.finish_event")}
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={showTaxModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTaxModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: T.bgCardRaised }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: T.border }]}>
              <Text style={[theme.textStyles.title3, { color: T.textPrimary }]}>
                {t("balances.tax_modal_title")}
              </Text>
              <Pressable onPress={() => setShowTaxModal(false)}>
                <X size={24} color={T.textSecondary} />
              </Pressable>
            </View>
            <ScrollView
              style={{ maxHeight: 650 }}
              contentContainerStyle={{
                padding: theme.spacing[6],
                paddingBottom: theme.spacing[8],
              }}
              showsVerticalScrollIndicator={false}
            >
              {userStats.map((stat) => {
                const isSelected = !taxOptOutIds.includes(stat.id);
                return (
                  <ParticipantCheckbox
                    key={stat.id}
                    name={stat.name}
                    initials={stat.initials}
                    isOwner={false}
                    isSelected={isSelected}
                    onToggle={() => {
                      if (isSelected)
                        setTaxOptOutIds((prev) => [...prev, stat.id]);
                      else
                        setTaxOptOutIds((prev) =>
                          prev.filter((id) => id !== stat.id),
                        );
                    }}
                  />
                );
              })}
              {taxOptOutIds.length > 0 && (
                <View
                  style={{
                    marginTop: 24,
                    padding: 16,
                    backgroundColor: T.bgCard,
                    borderRadius: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={[
                        theme.textStyles.headline,
                        { color: T.textPrimary, flex: 1, paddingRight: 8 },
                      ]}
                    >
                      {t("balances.absorb_tax_title")}
                    </Text>
                    <Switch
                      value={absorbTax}
                      onValueChange={setAbsorbTax}
                      trackColor={{ false: T.border, true: T.primary }}
                    />
                  </View>
                  <Text
                    style={[
                      theme.textStyles.footnote,
                      { color: T.textSecondary },
                    ]}
                  >
                    {t("balances.absorb_tax_desc")}
                  </Text>
                </View>
              )}
            </ScrollView>
            <View style={{ padding: theme.spacing[6], paddingTop: 0 }}>
              <Pressable
                style={({ pressed }) => [
                  styles.mainButton,
                  { backgroundColor: pressed ? T.primaryPress : T.primary },
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => setShowTaxModal(false)}
              >
                <Text
                  style={{
                    color: T.textOnLime,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {t("balances.confirm_btn")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAssumeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAssumeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: T.bgCardRaised }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: T.border }]}>
              <Text style={[theme.textStyles.title3, { color: T.textPrimary }]}>
                {t("balances.assume_account")}
              </Text>
              <Pressable onPress={() => setShowAssumeModal(false)}>
                <X size={24} color={T.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 600 }}>
              <View style={{ padding: theme.spacing[6] }}>
                <Text
                  style={[
                    theme.textStyles.body,
                    { color: T.textSecondary, marginBottom: 24 },
                  ]}
                >
                  {t("balances.assume_account_desc")}
                </Text>

                <Text
                  style={[
                    theme.textStyles.headline,
                    { color: T.textPrimary, marginBottom: 12 },
                  ]}
                >
                  {t("balances.who_pays")}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 24 }}
                >
                  {userStats
                    .filter((u) => !assumptions[u.id])
                    .map((u) => (
                      <Pressable
                        key={u.id}
                        onPress={() => setNewAssumerId(u.id)}
                        style={[
                          styles.avatarChip,
                          { backgroundColor: T.bgCard, borderColor: T.border },
                          newAssumerId === u.id && {
                            borderColor: T.primary,
                            backgroundColor: "rgba(190, 255, 108, 0.1)",
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.chipAvatar,
                            { backgroundColor: T.bgCardRaised },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "bold",
                              color: T.textPrimary,
                            }}
                          >
                            {u.initials}
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: T.textPrimary,
                            fontWeight:
                              newAssumerId === u.id ? "bold" : "normal",
                          }}
                        >
                          {u.name}
                        </Text>
                      </Pressable>
                    ))}
                </ScrollView>

                <Text
                  style={[
                    theme.textStyles.headline,
                    { color: T.textPrimary, marginBottom: 12 },
                  ]}
                >
                  {t("balances.whose_bill")}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 32 }}
                >
                  {userStats
                    .filter(
                      (u) =>
                        u.id !== newAssumerId &&
                        !Object.values(assumptions).includes(u.id) &&
                        !assumptions[u.id],
                    )
                    .map((u) => (
                      <Pressable
                        key={u.id}
                        onPress={() => setNewAssumeeId(u.id)}
                        style={[
                          styles.avatarChip,
                          { backgroundColor: T.bgCard, borderColor: T.border },
                          newAssumeeId === u.id && {
                            borderColor: T.primary,
                            backgroundColor: "rgba(190, 255, 108, 0.1)",
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.chipAvatar,
                            { backgroundColor: T.bgCardRaised },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "bold",
                              color: T.textPrimary,
                            }}
                          >
                            {u.initials}
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: T.textPrimary,
                            fontWeight:
                              newAssumeeId === u.id ? "bold" : "normal",
                          }}
                        >
                          {u.name}
                        </Text>
                      </Pressable>
                    ))}
                </ScrollView>

                <Pressable
                  style={({ pressed }) => [
                    styles.mainButton,
                    { backgroundColor: pressed ? T.primaryPress : T.primary },
                    (!newAssumerId || !newAssumeeId) && { opacity: 0.5 },
                  ]}
                  disabled={!newAssumerId || !newAssumeeId}
                  onPress={() => {
                    if (newAssumerId && newAssumeeId) {
                      setAssumptions((prev) => ({
                        ...prev,
                        [newAssumeeId]: newAssumerId,
                      }));
                      setNewAssumerId(null);
                      setNewAssumeeId(null);
                    }
                  }}
                >
                  <Text
                    style={{
                      color: T.textOnLime,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {t("common.confirm")}
                  </Text>
                </Pressable>

                {Object.keys(assumptions).length > 0 && (
                  <View style={{ marginTop: 40 }}>
                    <Text
                      style={[
                        theme.textStyles.headline,
                        { color: T.textPrimary, marginBottom: 12 },
                      ]}
                    >
                      {t("balances.active_assumptions")}
                    </Text>
                    {Object.entries(assumptions).map(([eeId, erId]) => {
                      const ee = userStats.find((u) => u.id === eeId);
                      const er = userStats.find((u) => u.id === erId);
                      return (
                        <View key={eeId} style={styles.assumptionRow}>
                          <Text style={{ color: T.textSecondary }}>
                            {er?.name} assumiu {ee?.name}
                          </Text>
                          <Pressable
                            onPress={() => {
                              const newAssump = { ...assumptions };
                              delete newAssump[eeId];
                              setAssumptions(newAssump);
                            }}
                          >
                            <Text
                              style={{ color: T.negative, fontWeight: "bold" }}
                            >
                              {t("balances.undo")}
                            </Text>
                          </Pressable>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing[6],
    borderBottomWidth: 1,
  },
  avatarChip: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    paddingRight: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginRight: 12,
  },
  chipAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  assumptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
});
