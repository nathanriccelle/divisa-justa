import { router } from "expo-router";
import { ChevronLeft, Trash2 } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUser } from "@/src/contexts/UserContext";
import { theme } from "../src/theme";

const T = theme.colors;

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { clearData } = useUser();

  // Verifica se o idioma atual é português (trata pt, pt-BR, pt-PT)
  const isPt = i18n.language.startsWith("pt");
  const isEn = i18n.language.startsWith("en");
  const isEs = i18n.language.startsWith("es");
  const isFr = i18n.language.startsWith("fr");
  const isDe = i18n.language.startsWith("de");

  const handleClearData = async () => {
    await clearData();
    router.replace("/onboard");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgScreen }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={{ padding: theme.spacing[2], flexDirection: "row" }}
        >
          <ChevronLeft size={28} color={T.primary} />
        </Pressable>
        <Text
          style={[
            theme.textStyles.title3,
            { color: T.textPrimary, flex: 1, textAlign: "center" },
          ]}
        >
          {t("settings.title")}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {/* SEÇÃO DE IDIOMA */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: T.textDisabled }]}>
            {t("settings.language")}
          </Text>

          <View
            style={[
              styles.card,
              { backgroundColor: T.bgCardRaised, borderColor: T.border },
            ]}
          >
            <Pressable
              style={[
                styles.row,
                { borderBottomWidth: 1, borderBottomColor: T.border },
              ]}
              onPress={() => i18n.changeLanguage("pt-BR")}
            >
              <Text style={[theme.textStyles.body, { color: T.textPrimary }]}>
                {t("settings.portuguese")}
              </Text>
              <View style={[styles.radio, isPt && { borderColor: T.primary }]}>
                {isPt && (
                  <View
                    style={[styles.radioInner, { backgroundColor: T.primary }]}
                  />
                )}
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.row,
                { borderBottomWidth: 1, borderBottomColor: T.border },
              ]}
              onPress={() => i18n.changeLanguage("en-US")}
            >
              <Text style={[theme.textStyles.body, { color: T.textPrimary }]}>
                {t("settings.english")}
              </Text>
              <View style={[styles.radio, isEn && { borderColor: T.primary }]}>
                {isEn && (
                  <View
                    style={[styles.radioInner, { backgroundColor: T.primary }]}
                  />
                )}
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.row,
                { borderBottomWidth: 1, borderBottomColor: T.border },
              ]}
              onPress={() => i18n.changeLanguage("es-ES")}
            >
              <Text style={[theme.textStyles.body, { color: T.textPrimary }]}>
                {t("settings.spanish")}
              </Text>
              <View style={[styles.radio, isEs && { borderColor: T.primary }]}>
                {isEs && (
                  <View
                    style={[styles.radioInner, { backgroundColor: T.primary }]}
                  />
                )}
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.row,
                { borderBottomWidth: 1, borderBottomColor: T.border },
              ]}
              onPress={() => i18n.changeLanguage("fr-FR")}
            >
              <Text style={[theme.textStyles.body, { color: T.textPrimary }]}>
                {t("settings.french")}
              </Text>
              <View style={[styles.radio, isFr && { borderColor: T.primary }]}>
                {isFr && (
                  <View
                    style={[styles.radioInner, { backgroundColor: T.primary }]}
                  />
                )}
              </View>
            </Pressable>

            <Pressable
              style={styles.row}
              onPress={() => i18n.changeLanguage("de-DE")}
            >
              <Text style={[theme.textStyles.body, { color: T.textPrimary }]}>
                {t("settings.german")}
              </Text>
              <View style={[styles.radio, isDe && { borderColor: T.primary }]}>
                {isDe && (
                  <View
                    style={[styles.radioInner, { backgroundColor: T.primary }]}
                  />
                )}
              </View>
            </Pressable>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* ZONA DE PERIGO (Limpar Dados) */}
        <Pressable
          style={({ pressed }) => [
            styles.dangerButton,
            { backgroundColor: pressed ? T.negativeBg : "transparent" },
          ]}
          onPress={handleClearData}
        >
          <Trash2 size={20} color={T.negative} style={{ marginRight: 12 }} />
          <Text
            style={[
              theme.textStyles.body,
              { color: T.negative, fontWeight: "bold" },
            ]}
          >
            {t("settings.reset_app")}
          </Text>
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
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[4],
  },
  content: { flex: 1, padding: theme.spacing[6] },
  section: { marginBottom: theme.spacing[8] },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: theme.spacing[3],
  },
  card: { borderRadius: theme.borderRadius.lg, borderWidth: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing[4],
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.textDisabled,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
  },
});
