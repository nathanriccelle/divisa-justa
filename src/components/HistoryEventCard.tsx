// Caminho: src/components/HistoryEventCard.tsx
import { ChevronRight, Users } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

const T = theme.colors;

type HistoryEventCardProps = {
  name: string;
  date: Date;
  onPress: () => void;
};

export function HistoryEventCard({
  name,
  date,
  onPress,
}: HistoryEventCardProps) {
  // Formata a data (ex: "3 de Março de 2026")
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: T.bgCard, borderColor: T.border },
        pressed && { backgroundColor: T.bgCardRaised },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: T.bgCardRaised }]}>
        <Users size={20} color={T.primary} />
      </View>

      <View style={styles.infoBox}>
        <Text
          style={[
            theme.textStyles.body,
            { color: T.textPrimary, fontWeight: "bold" },
          ]}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text
          style={[
            theme.textStyles.footnote,
            { color: T.textSecondary, marginTop: 2 },
          ]}
        >
          {formattedDate}
        </Text>
      </View>

      <ChevronRight size={20} color={T.textDisabled} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    marginBottom: theme.spacing[3],
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing[3],
  },
  infoBox: { flex: 1, paddingRight: theme.spacing[3] },
});
