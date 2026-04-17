import { Calculator, X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

const T = theme.colors;

type FinishEventModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function FinishEventModal({
  visible,
  onClose,
  onConfirm,
}: FinishEventModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.content,
            { backgroundColor: T.bgCardRaised, borderColor: T.border },
          ]}
        >
          <View style={styles.header}>
            <View style={[styles.iconWrapper, { backgroundColor: T.bgCard }]}>
              <Calculator size={28} color={T.primary} />
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [pressed && { opacity: 0.5 }]}
            >
              <X size={24} color={T.textSecondary} />
            </Pressable>
          </View>

          <Text
            style={[
              theme.textStyles.title2,
              { color: T.textPrimary, marginTop: theme.spacing[4] },
            ]}
          >
            Encerrar Divisão?
          </Text>

          <Text
            style={[
              theme.textStyles.body,
              {
                color: T.textSecondary,
                marginTop: theme.spacing[2],
                lineHeight: 22,
              },
            ]}
          >
            Você está prestes a fechar esta conta. Iremos calcular exatamente
            quem pagou o quê e quem deve para quem.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelButton,
                { borderColor: T.border },
                pressed && { backgroundColor: T.bgCard },
              ]}
            >
              <Text
                style={[theme.textStyles.headline, { color: T.textSecondary }]}
              >
                Voltar
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.confirmButton,
                { backgroundColor: pressed ? T.primaryPress : T.primary },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text
                style={[theme.textStyles.headline, { color: T.textOnLime }]}
              >
                Sim, calcular!
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing[6],
  },
  content: {
    width: "100%",
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[6],
    borderWidth: 1,
    ...theme.shadow.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: theme.spacing[8],
    gap: theme.spacing[3],
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    height: 52,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
});
