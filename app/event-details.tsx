import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronLeft, MoreHorizontal, Plus } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyItemsState } from "../src/components/EmptyItemsState";
import { EventSummaryCard } from "../src/components/EventSummaryCard";
import { ExpenseDetailsModal } from "../src/components/ExpenseDetailsModal";
import { ExpenseItem } from "../src/components/ExpenseItem";
import { FinishEventModal } from "../src/components/FinishEventModal";
import { theme } from "../src/theme";

import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { events, expenses, participants } from "../src/db/schema";

const T = theme.colors;

type ParticipantType = {
  id: string;
  name: string;
  initials: string;
  isOwner: boolean;
};

type ExpenseType = {
  id: string;
  title: string;
  amount: number;
  quantity: number;
  payerId: string;
  splitWithIds: string;
};

export default function EventDetailsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const [eventName, setEventName] = useState("Carregando...");
  const [currencySymbol, setCurrencySymbol] = useState("R$");
  const [eventParticipants, setEventParticipants] = useState<ParticipantType[]>(
    [],
  );
  const [eventExpenses, setEventExpenses] = useState<ExpenseType[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [selectedExpense, setSelectedExpense] = useState<ExpenseType | null>(
    null,
  );

  const [showFinishModal, setShowFinishModal] = useState(false);

  const fetchEventData = async () => {
    if (!eventId) return;

    try {
      const eventData = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId));
      if (eventData.length > 0) {
        setEventName(eventData[0].name);
        setCurrencySymbol(eventData[0].currencySymbol);
      }

      const participantsData = await db
        .select()
        .from(participants)
        .where(eq(participants.eventId, eventId));
      const formattedParticipants = participantsData.map((p) => ({
        id: p.id,
        name: p.name,
        initials: p.initials,
        isOwner: Boolean(p.isOwner),
      }));
      setEventParticipants(formattedParticipants);

      const expensesData = await db
        .select()
        .from(expenses)
        .where(eq(expenses.eventId, eventId));
      setEventExpenses(expensesData as ExpenseType[]);

      const total = expensesData.reduce(
        (acc, curr) => acc + curr.amount * curr.quantity,
        0,
      );
      setTotalAmount(total);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEventData();
    }, [eventId]),
  );

  // 👇 2. FUNÇÃO DE EXCLUSÃO COM CONFIRMAÇÃO
  const handleDeleteEvent = () => {
    Alert.alert(
      "Excluir Evento",
      "Tem certeza que deseja apagar este evento? Todas as despesas e a lista de participantes serão apagadas permanentemente.",
      [
        {
          text: "Cancelar",
          style: "cancel", // No iOS, esse botão fica com estilo amigável
        },
        {
          text: "Sim, excluir",
          style: "destructive", // No iOS, o texto fica vermelho!
          onPress: async () => {
            try {
              // A mágica do "Cascade" no banco fará o resto!
              await db.delete(events).where(eq(events.id, eventId));
              // Depois de apagar, voltamos para a tela inicial
              router.push("/");
            } catch (error) {
              console.error("Erro ao apagar evento:", error);
              Alert.alert("Erro", "Não foi possível apagar o evento.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgScreen }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push("/")}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <ChevronLeft size={28} color={T.primary} />
        </Pressable>

        <Text
          style={[
            theme.textStyles.title3,
            { color: T.textPrimary, flex: 1, textAlign: "center" },
          ]}
          numberOfLines={1}
        >
          {eventName}
        </Text>

        {/* 👇 3. LIGAMOS A FUNÇÃO AO BOTÃO DE OPÇÕES (Três pontinhos) */}
        <Pressable
          onPress={handleDeleteEvent}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <MoreHorizontal size={28} color={T.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <EventSummaryCard
          currencySymbol={currencySymbol}
          participants={eventParticipants}
          totalAmount={totalAmount.toFixed(2).replace(".", ",")}
          onFinishEvent={() => setShowFinishModal(true)}
        />

        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <Text style={[styles.sectionTitle, { color: T.textDisabled }]}>
              ITENS ADICIONADOS
            </Text>
            <Text style={[theme.textStyles.footnote, { color: T.primary }]}>
              {eventExpenses.length}{" "}
              {eventExpenses.length === 1 ? "item" : "itens"}
            </Text>
          </View>

          {eventExpenses.length === 0 ? (
            <EmptyItemsState />
          ) : (
            <View>
              {eventExpenses.map((expense) => {
                const payer = eventParticipants.find(
                  (p) => p.id === expense.payerId,
                );

                return (
                  <ExpenseItem
                    key={expense.id}
                    title={expense.title}
                    amount={expense.amount}
                    quantity={expense.quantity}
                    currencySymbol={currencySymbol}
                    payerName={payer?.name || "Desconhecido"}
                    onPress={() => setSelectedExpense(expense)}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <ExpenseDetailsModal
        visible={selectedExpense !== null}
        expense={selectedExpense}
        participants={eventParticipants}
        currencySymbol={currencySymbol}
        onClose={() => setSelectedExpense(null)}
      />

      <FinishEventModal
        visible={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={() => {
          setShowFinishModal(false);
          router.push({
            pathname: "/balances",
            params: { eventId: eventId },
          });
        }}
      />

      <View style={styles.fabContainer}>
        <Pressable
          onPress={() => {
            router.push({
              pathname: "/add-expense",
              params: {
                eventId: eventId,
                currencySymbol: currencySymbol,
                participantsStr: JSON.stringify(eventParticipants),
              },
            });
          }}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: pressed ? T.primaryPress : T.primary,
              ...theme.shadow.lg,
            },
            pressed && { transform: [{ scale: 0.95 }] },
          ]}
        >
          <Plus size={32} color={T.textOnLime} />
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
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { flex: 1, paddingHorizontal: theme.spacing[6] },
  itemsSection: { marginTop: theme.spacing[8] },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  fabContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
});
