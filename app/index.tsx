import { router, useFocusEffect } from "expo-router";
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

// Importações do Banco de Dados
import { desc } from "drizzle-orm";
import { db } from "../src/db";
import { events } from "../src/db/schema";

const T = theme.colors;

function obterSaudacao() {
  const horaAtual = new Date().getHours();
  if (horaAtual >= 0 && horaAtual < 12) return "Bom dia";
  if (horaAtual >= 12 && horaAtual < 18) return "Boa tarde";
  return "Boa noite";
}

type EventData = {
  id: string;
  name: string;
  createdAt: Date;
};

export default function HomeScreen() {
  const saudacao = obterSaudacao();
  const [historyEvents, setHistoryEvents] = useState<EventData[]>([]);

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
      fetchHistory();
    }, []),
  );

  // 👇 1. CABEÇALHO DA LISTA (Tudo que fica ACIMA dos eventos)
  const renderHeader = () => (
    <>
      {/* CABEÇALHO SUPERIOR (Saudação) */}
      <View style={styles.header}>
        <View>
          <Text
            style={[
              theme.textStyles.title1,
              { color: T.textSecondary, marginBottom: theme.spacing[1] },
            ]}
          >
            {saudacao}, Nathan
          </Text>
        </View>
        <Pressable>
          <Settings size={theme.spacing[8]} color={T.textSecondary} />
        </Pressable>
      </View>

      {/* CARTÃO PRINCIPAL (Começar Divisão) */}
      <View
        style={[
          styles.mainCard,
          { backgroundColor: T.bgCard, borderColor: T.border, borderWidth: 1 },
        ]}
      >
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
          Começar Divisão
        </Text>
        <Text style={[theme.textStyles.body, { color: T.textSecondary }]}>
          Crie uma nova conta compartilhada
        </Text>
      </View>

      {/* TÍTULO DA SEÇÃO DE HISTÓRICO */}
      <View style={styles.historySection}>
        <Text style={[styles.sectionTitle, { color: T.textDisabled }]}>
          EVENTOS EM ANDAMENTO
        </Text>
      </View>
    </>
  );

  // 👇 2. ESTADO VAZIO DA LISTA (Se não tiver eventos)
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
          Nenhum evento ainda
        </Text>
        <Text
          style={[
            theme.textStyles.body,
            { color: T.textSecondary, textAlign: "center", lineHeight: 22 },
          ]}
        >
          Seu histórico está limpo. Que tal organizar aquele churrasco ou viagem
          com os amigos? Toque no botão acima para começar.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgScreen }]}>
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
              date={item.createdAt}
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
    fontSize: theme.fontSize.xs,
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
