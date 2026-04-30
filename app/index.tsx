import { Redirect, router, useFocusEffect } from "expo-router";
import { Plus, Receipt, Settings } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HistoryEventCard } from "../src/components/HistoryEventCard";
import { theme } from "../src/theme";

import { useUser } from "@/src/contexts/UserContext";
import { desc } from "drizzle-orm";
import { db } from "../src/db";
import { events } from "../src/db/schema";

//TRADUÇÂO
import { useTranslation } from "react-i18next";

const T = theme.colors;

function getGreetingPeriod() {
  const horaAtual = new Date().getHours();
  if (horaAtual >= 0 && horaAtual < 12) return "morning";
  if (horaAtual >= 12 && horaAtual < 18) return "afternoon";
  return "night";
}

type EventData = {
  id: string;
  name: string;
  currencySymbol: string;
  createdAt: string | Date;
};

export default function HomeScreen() {
  const period = getGreetingPeriod();
  const [historyEvents, setHistoryEvents] = useState<EventData[]>([]);
  const { userName, hasOnboarded } = useUser();
  const { t } = useTranslation();

  const fetchHistory = async () => {
    try {
      const data = await db
        .select()
        .from(events)
        .orderBy(desc(events.createdAt));

      setHistoryEvents(data as EventData[]);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (hasOnboarded) {
        fetchHistory();
      }
    }, [hasOnboarded]),
  );

  if (hasOnboarded === null)
    return <View style={{ flex: 1, backgroundColor: T.bgScreen }} />;
  if (hasOnboarded === false) return <Redirect href="/onboard" />;

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View>
          <Text
            style={[
              theme.textStyles.title1,
              { color: T.textSecondary, marginBottom: theme.spacing[1] },
            ]}
          >
            {t(`home.greeting_${period}`, {
              name: userName || t("home.friend"),
            })}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing[4],
          }}
        >
          <Pressable onPress={() => router.push("/settings")}>
            <Settings size={24} color={T.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* CARTÃO PRINCIPAL */}
      <View style={[styles.mainCard, { backgroundColor: T.bgScreen }]}>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: pressed ? T.primaryPress : T.primary },
            pressed && { transform: [{ scale: 0.96 }] },
          ]}
          onPress={() => router.push("/create-event")}
        >
          <Plus size={theme.spacing[10]} color={T.textOnLime} />
        </Pressable>

        <Text
          style={[
            theme.textStyles.largeTitle,
            { color: T.textPrimary, marginBottom: theme.spacing[2] },
          ]}
        >
          {t("home.start_split")}
        </Text>
        <Text style={[theme.textStyles.headline, { color: T.textSecondary }]}>
          {t("home.create_new_split")}
        </Text>
      </View>

      {/* TÍTULO DA SEÇÃO DE HISTÓRICO */}
      <View style={styles.historySection}>
        <Text style={[styles.sectionTitle, { color: T.textDisabled }]}>
          {t("home.ongoing_events")}
        </Text>
      </View>
    </>
  );

  // 👇 ESTADO VAZIO DA LISTA
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyStateCard,
          { backgroundColor: T.bgCard, borderColor: T.border },
        ]}
      >
        <View
          style={[
            styles.emptyStateIconWrapper,
            { backgroundColor: T.bgCardRaised },
          ]}
        >
          <Receipt size={32} color={T.primary} />
        </View>
        <Text
          style={[
            theme.textStyles.title3,
            {
              color: T.textPrimary,
              textAlign: "center",
              marginBottom: theme.spacing[2],
            },
          ]}
        >
          {t("home.empty_state_title")}
        </Text>
        <Text
          style={[
            theme.textStyles.body,
            { color: T.textSecondary, textAlign: "center", lineHeight: 22 },
          ]}
        >
          {t("home.empty_state_desc")}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={T.bgScreen} />

      {/* FLATLIST */}
      <FlatList
        data={historyEvents}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: theme.spacing[6] }}>
            <HistoryEventCard
              name={item.name}
              date={new Date(item.createdAt)}
              onPress={() => {
                router.push({
                  pathname: "/event-details",
                  params: { eventId: item.id },
                });
              }}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[10],
    paddingBottom: theme.spacing[5],
  },
  mainCard: {
    marginHorizontal: theme.spacing[6],
    marginTop: theme.spacing[2],
    paddingVertical: theme.spacing[12],
    borderRadius: theme.borderRadius.xl,
    alignItems: "center",
    ...theme.shadow.lg,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing[6],
  },

  historySection: {
    marginTop: theme.spacing[10],
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  emptyContainer: { paddingHorizontal: theme.spacing[6] },
  emptyStateCard: {
    padding: theme.spacing[6],
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
  },
  emptyStateIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing[4],
  },
});
