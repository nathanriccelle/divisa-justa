// Caminho: src/components/DatePickerModal.tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { theme } from "../theme";

const T = theme.colors;

type DatePickerModalProps = {
  visible: boolean;
  currentDate: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

export function DatePickerModal({
  visible,
  currentDate,
  onClose,
  onConfirm,
}: DatePickerModalProps) {
  // Estado temporário para o iOS (enquanto ele gira o spinner antes de confirmar)
  const [tempDate, setTempDate] = useState(currentDate);

  // 🤖 ANDROID: O calendário nativo do Android já é um Modal por si só!
  if (Platform.OS === "android") {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={currentDate}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            onConfirm(selectedDate); // Se clicou em OK
          } else {
            onClose(); // Se clicou fora ou em Cancelar
          }
        }}
      />
    );
  }

  // 🍎 iOS: Precisamos montar o Bottom Sheet em volta do spinner
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.content, { backgroundColor: T.bgCardRaised }]}
          onPress={() => {}} // Impede que o clique feche o modal
        >
          <View style={[styles.header, { borderBottomColor: T.border }]}>
            <Pressable onPress={onClose}>
              <Text style={[theme.textStyles.body, { color: T.textSecondary }]}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onConfirm(tempDate);
              }}
            >
              <Text
                style={[
                  theme.textStyles.body,
                  { color: T.primary, fontWeight: "bold" },
                ]}
              >
                Confirmar
              </Text>
            </Pressable>
          </View>

          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            textColor={T.textPrimary}
            onChange={(event, selectedDate) => {
              if (selectedDate) setTempDate(selectedDate);
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  content: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing[2],
    borderBottomWidth: 1,
  },
});
