import { useUser } from "@/src/contexts/UserContext";
import { router } from "expo-router";
import { ArrowRight, Check } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { getSortedCurrencies } from "../src/components/CurrencySelector";
import { theme } from "../src/theme";

const T = theme.colors;

export default function OnboardScreen() {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState("");
  const sortedCurrencies = React.useMemo(
    () => getSortedCurrencies(i18n.language),
    [i18n.language],
  );
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(
    sortedCurrencies[0].code,
  );
  const { saveOnboardData } = useUser();
  const insets = useSafeAreaInsets();

  const handleFinishOnboarding = async () => {
    if (!userName.trim()) {
      Alert.alert(
        t("onboard.alert_no_name_title"),
        t("onboard.alert_no_name_desc"),
      );
      return;
    }

    try {
      await saveOnboardData(userName, selectedCurrencyCode);
      router.replace("/");
    } catch (error) {
      console.error("Erro ao salvar dados de onboard:", error);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: T.bgScreen }}
      edges={["bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <View style={[styles.imageContainer, { paddingTop: insets.top }]}>
          <Image
            source={
              step === 1
                ? require("../assets/images/amigos.png")
                : step === 2
                  ? require("../assets/images/money.png")
                  : require("../assets/images/hand.png")
            }
            style={styles.image}
            resizeMode="contain"
          />
          <View style={styles.imageOverlay} />
        </View>
        <View style={[styles.bottomSheet, { backgroundColor: T.bgScreen }]}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom + 24, 40) },
            ]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {step === 1 && (
              <View style={styles.stepContainer}>
                <Text style={[styles.title, { color: T.textPrimary }]}>
                  {t("onboard.title_part1")}
                  <Text style={{ color: T.primary }}>
                    {t("onboard.title_highlight")}
                  </Text>
                  {t("onboard.title_part2")}
                </Text>

                <Text style={[styles.subtitle, { color: T.textSecondary }]}>
                  {t("onboard.subtitle")}
                </Text>

                <View style={{ flex: 1 }} />

                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    setStep(2);
                  }}
                  style={({ pressed }) => [
                    styles.mainButton,
                    { backgroundColor: pressed ? T.primaryPress : T.primary },
                    pressed && { transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <Text
                    style={[
                      theme.textStyles.title2,
                      { color: T.textOnLime, marginRight: theme.spacing[4] },
                    ]}
                  >
                    {t("onboard.start_now")}
                  </Text>
                  <ArrowRight size={20} color={T.textOnLime} />
                </Pressable>
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContainer}>
                <Text style={[styles.title, { color: T.textPrimary }]}>
                  {t("onboard.title_part3")}
                </Text>

                <Text style={[styles.subtitle, { color: T.textSecondary }]}>
                  {t("onboard.subtitle_part3")}
                </Text>

                <View style={{ flex: 1 }} />

                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    setStep(3);
                  }}
                  style={({ pressed }) => [
                    styles.mainButton,
                    { backgroundColor: pressed ? T.primaryPress : T.primary },
                    pressed && { transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <Text
                    style={[
                      theme.textStyles.title2,
                      { color: T.textOnLime, marginRight: theme.spacing[4] },
                    ]}
                  >
                    {t("onboard.next_btn")}
                  </Text>
                  <ArrowRight size={20} color={T.textOnLime} />
                </Pressable>
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepContainer}>
                <Text style={[styles.title, { color: T.textPrimary }]}>
                  {t("onboard.step3_title")}
                </Text>

                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: T.bgCardRaised,
                        borderColor: T.border,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.textInput, { color: T.textPrimary }]}
                      placeholder={t("onboard.name_placeholder")}
                      placeholderTextColor={T.textDisabled}
                      value={userName}
                      onChangeText={setUserName}
                      autoFocus={false}
                      maxLength={12}
                    />
                  </View>
                </View>

                <View
                  style={[styles.inputGroup, { marginTop: theme.spacing[2] }]}
                >
                  <Text style={[styles.label, { color: T.textSecondary }]}>
                    {t("onboard.main_currency")}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.currencyRow}
                  >
                    {sortedCurrencies.map((currency) => {
                      if (!currency) return null;
                      const isSelected = selectedCurrencyCode === currency.code;
                      return (
                        <Pressable
                          key={currency.code}
                          onPress={() => setSelectedCurrencyCode(currency.code)}
                          style={({ pressed }) => [
                            styles.currencyChip,
                            {
                              backgroundColor: isSelected
                                ? T.primary
                                : T.bgCardRaised,
                              borderColor: isSelected ? T.primary : T.border,
                            },
                            pressed && { opacity: 0.8 },
                          ]}
                        >
                          <Text
                            style={[
                              theme.textStyles.headline,
                              {
                                color: isSelected
                                  ? T.textOnLime
                                  : T.textPrimary,
                                marginBottom: 2,
                              },
                            ]}
                          >
                            {currency.code}
                          </Text>
                          <Text
                            style={[
                              theme.textStyles.footnote,
                              {
                                color: isSelected
                                  ? T.textOnLime
                                  : T.textSecondary,
                                fontSize: 10,
                              },
                            ]}
                          >
                            {t(`currencies.${currency.code}`, currency.name)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={{ flex: 1 }} />

                <Pressable
                  onPress={handleFinishOnboarding}
                  style={({ pressed }) => [
                    styles.mainButton,
                    { backgroundColor: pressed ? T.primaryPress : T.primary },
                    pressed && { transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <Check
                    size={20}
                    color={T.textOnLime}
                    style={{ marginRight: theme.spacing[2] }}
                  />
                  <Text
                    style={[theme.textStyles.headline, { color: T.textOnLime }]}
                  >
                    {t("onboard.enter_app")}
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: theme.colors.primary,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bottomSheet: {
    height: "55%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingTop: theme.spacing[8],
    paddingHorizontal: theme.spacing[6],
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing[8],
  },
  stepContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  title: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 32,
    lineHeight: 40,
    marginBottom: theme.spacing[4],
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: theme.fontSize.lg,
    lineHeight: 28,
  },
  inputGroup: {
    marginTop: theme.spacing[6],
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: theme.spacing[3],
  },
  inputContainer: {
    height: 64,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: theme.spacing[4],
    justifyContent: "center",
  },
  textInput: {
    fontFamily: "Inter_500Medium",
    fontSize: theme.fontSize.lg,
  },
  currencyRow: {
    paddingVertical: theme.spacing[2],
    gap: theme.spacing[3],
  },
  currencyChip: {
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    alignItems: "center",
    marginTop: theme.spacing[8],
    justifyContent: "center",
    minWidth: 100,
  },
  mainButton: {
    flexDirection: "row",
    height: 64,
    borderRadius: theme.borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
  },
});
