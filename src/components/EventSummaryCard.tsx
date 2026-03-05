import { CheckCircle2, ReceiptText } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

const T = theme.colors;

type Participant = {
  id: string;
  initials: string;
  isOwner: boolean;
};

type EventSummaryCardProps = {
  currencySymbol: string;
  totalAmount?: string;
  participants: Participant[];
  onFinishEvent: () => void;
};

export function EventSummaryCard({
  currencySymbol,
  totalAmount = "0,00",
  participants,
  onFinishEvent,
}: EventSummaryCardProps) {
  const displayAvatars = participants.slice(0, 3);
  const extraCount = participants.length > 3 ? participants.length - 3 : 0;

  return (
    <View
      style={[
        styles.summaryCard,
        { backgroundColor: T.bgCardRaised, borderColor: T.border },
      ]}
    >
      <View style={styles.summaryTopRow}>
        <Text
          style={[theme.textStyles.subheadline, { color: T.textSecondary }]}
        >
          Total do Evento
        </Text>
        <ReceiptText size={24} color={T.textDisabled} />
      </View>

      <Text
        style={[
          theme.textStyles.largeTitle,
          { color: T.textPrimary, marginTop: theme.spacing[1] },
        ]}
      >
        <Text style={{ color: T.primary }}>{currencySymbol}</Text> {totalAmount}
      </Text>

      {/* AVATARES DOS PARTICIPANTES */}
      <View style={styles.avatarsRow}>
        <View style={styles.avatarsContainer}>
          {displayAvatars.map((p, index) => (
            <View
              key={p.id}
              style={[
                styles.avatarMini,
                {
                  backgroundColor: p.isOwner ? T.primary : T.bgCard,
                  borderColor: T.bgCardRaised,
                  zIndex: 3 - index,
                },
              ]}
            >
              <Text
                style={[
                  theme.textStyles.footnote,
                  {
                    fontWeight: "bold",
                    color: p.isOwner ? T.textOnLime : T.textPrimary,
                  },
                ]}
              >
                {p.initials}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.badge, { backgroundColor: T.bgAccent }]}>
          <Text style={[theme.textStyles.footnote, { color: T.primary }]}>
            {extraCount > 0
              ? `+${extraCount} amigos`
              : `${participants.length} pessoas`}
          </Text>
        </View>
      </View>

      {/* BOTÃO DE ENCERRAR DIVISÃO */}
      <Pressable
        onPress={onFinishEvent}
        style={({ pressed }) => [
          styles.finishButton,
          { backgroundColor: pressed ? T.primaryPress : T.primary },
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <CheckCircle2
          size={20}
          color={T.textOnLime}
          style={{ marginRight: 8 }}
        />
        <Text style={[theme.textStyles.headline, { color: T.textOnLime }]}>
          Encerrar Divisão
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginTop: theme.spacing[4],
    padding: theme.spacing[6],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
  },
  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing[6],
  },
  avatarsContainer: { flexDirection: "row", marginRight: theme.spacing[3] },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    marginLeft: -10,
  },
  badge: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
  },

  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing[6],
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
  },
});
