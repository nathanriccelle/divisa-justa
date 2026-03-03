import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, MoreHorizontal, Plus } from "lucide-react-native";
import React from "react";
import {
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
import { theme } from "../src/theme";

const T = theme.colors;

export default function EventDetailsScreen() {
  // Recebe os dados da tela anterior
  const { eventName, currencySymbol, participantsStr } = useLocalSearchParams<{
    eventName: string;
    currencySymbol: string;
    participantsStr: string;
  }>();

  // Converte a string de volta para uma lista
  const participants = participantsStr ? JSON.parse(participantsStr) : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgScreen }]}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
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
          {eventName || "Evento"}
        </Text>

        <Pressable
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
        {/* COMPONENTE DO CARTÃO DE RESUMO */}
        <EventSummaryCard
          currencySymbol={currencySymbol || "R$"}
          participants={participants}
        />

        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <Text style={[styles.sectionTitle, { color: T.textDisabled }]}>
              ITENS ADICIONADOS
            </Text>
            <Text style={[theme.textStyles.footnote, { color: T.primary }]}>
              0 itens
            </Text>
          </View>

          {/* COMPONENTE DO ESTADO VAZIO */}
          <EmptyItemsState />
        </View>
      </ScrollView>

      {/* BOTÃO FLUTUANTE PARA ADICIONAR ITEM */}
      <View style={styles.fabContainer}>
        <Pressable
          onPress={() => {
            router.push({
              pathname: "/add-expense",
              params: {
                participantsStr: JSON.stringify(participants),
                currencySymbol: currencySymbol,
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
