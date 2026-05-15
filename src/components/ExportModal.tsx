import { FileDown, FileText, Sparkles, X } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../theme";

const T = theme.colors;

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExportText: () => void;
  onExportPDF: () => void;
}

export function ExportModal({
  visible,
  onClose,
  onExportText,
  onExportPDF,
}: ExportModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable
            style={[
              styles.modalContent,
              {
                backgroundColor: T.bgCard,
                paddingBottom: Math.max(insets.bottom + 24, 24),
              },
            ]}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text
                  style={[
                    theme.textStyles.title2,
                    { color: T.textPrimary, marginBottom: 4 },
                  ]}
                >
                  {t("detailed_summary.export_options_title")}
                </Text>
                <Text
                  style={[
                    theme.textStyles.footnote,
                    { color: T.textSecondary },
                  ]}
                >
                  {t("detailed_summary.export_options_subtitle")}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  { backgroundColor: T.bgCardRaised },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <X size={20} color={T.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Pressable
                onPress={onExportText}
                style={({ pressed }) => [
                  styles.exportOptionCard,
                  { borderColor: T.border, backgroundColor: T.bgScreen },
                  pressed && {
                    backgroundColor: T.bgCardRaised,
                    transform: [{ scale: 0.98 }],
                  },
                ]}
              >
                <View
                  style={[
                    styles.exportIconBox,
                    { backgroundColor: "rgba(255, 255, 255, 0.05)" },
                  ]}
                >
                  <FileText size={24} color={T.textPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      theme.textStyles.headline,
                      { color: T.textPrimary, marginBottom: 2 },
                    ]}
                  >
                    {t("detailed_summary.export_text_option")}
                  </Text>
                  <Text
                    style={[
                      theme.textStyles.footnote,
                      { color: T.textSecondary, lineHeight: 18 },
                    ]}
                  >
                    {t("detailed_summary.export_text_desc")}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={onExportPDF}
                style={({ pressed }) => [
                  styles.exportOptionCard,
                  styles.highlightedCard,
                  {
                    borderColor: T.primary,
                    backgroundColor: "rgba(190, 255, 108, 0.05)",
                  },
                  pressed && {
                    backgroundColor: "rgba(190, 255, 108, 0.1)",
                    transform: [{ scale: 0.98 }],
                  },
                ]}
              >
                <View
                  style={[styles.exportIconBox, { backgroundColor: T.primary }]}
                >
                  <FileDown size={24} color={T.textOnLime} />
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 2,
                    }}
                  >
                    <Text
                      style={[
                        theme.textStyles.headline,
                        { color: T.primary, marginRight: 8 },
                      ]}
                    >
                      {t("detailed_summary.export_pdf_option")}
                    </Text>
                    <View
                      style={[styles.badge, { backgroundColor: T.primary }]}
                    >
                      <Sparkles
                        size={10}
                        color={T.textOnLime}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "bold",
                          color: T.textOnLime,
                          textTransform: "uppercase",
                        }}
                      >
                        {t("detailed_summary.recommended")}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      theme.textStyles.footnote,
                      { color: T.textSecondary, lineHeight: 18 },
                    ]}
                  >
                    {t("detailed_summary.export_pdf_desc")}
                  </Text>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...theme.shadow.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    paddingHorizontal: 24,
    gap: 16,
  },
  exportOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  highlightedCard: {
    borderWidth: 2,
  },
  exportIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
