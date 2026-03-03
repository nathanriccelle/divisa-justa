import { Check } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

const T = theme.colors;

type ParticipantCheckboxProps = {
  name: string;
  initials: string;
  isOwner: boolean;
  isSelected: boolean;
  onToggle: () => void;
  role?: string;
};

export function ParticipantCheckbox({
  name,
  initials,
  isOwner,
  isSelected,
  onToggle,
  role,
}: ParticipantCheckboxProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.container,
        pressed && { backgroundColor: T.bgCardRaised },
      ]}
    >
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          { backgroundColor: isOwner ? T.primary : T.bgCardRaised },
        ]}
      >
        <Text
          style={[
            theme.textStyles.subheadline,
            {
              fontWeight: "bold",
              color: isOwner ? T.textOnLime : T.textPrimary,
            },
          ]}
        >
          {initials}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text
          style={[
            theme.textStyles.body,
            { color: T.textPrimary, fontWeight: "bold" },
          ]}
        >
          {name}
        </Text>
        {role ? (
          <Text style={[theme.textStyles.footnote, { color: T.textSecondary }]}>
            {role}
          </Text>
        ) : null}
      </View>

      {/* Checkbox Customizada */}
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: isSelected ? T.primary : "transparent",
            borderColor: isSelected ? T.primary : T.border,
          },
        ]}
      >
        {isSelected && <Check size={14} color={T.textOnLime} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing[3],
  },
  info: { flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
