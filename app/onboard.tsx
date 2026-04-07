import { useUser } from "@/src/contexts/UserContext";
import { router } from "expo-router";
import { ArrowRight, Check } from "lucide-react-native";
import React, { useState } from "react";
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
import { CURRENCY_LIST } from "../src/components/CurrencySelector";
import { theme } from "../src/theme";

const T = theme.colors;

const CURRENCIES = [
  { label: "Real Brasileiro", symbol: "R$" },
  { label: "Dólar Americano", symbol: "$" },
  { label: "Euro", symbol: "€" },
  { label: "Libra Esterlina", symbol: "£" },
  { label: "Iene Japonês", symbol: "¥" },
  { label: "Dólar Australiano", symbol: "A$" },
  { label: "Dólar Canadense", symbol: "C$" },
  { label: "Franco Suíço", symbol: "CHF" },
  { label: "Yuan Chinês", symbol: "CN¥" },
  { label: "Rúpia Indiana", symbol: "₹" },
  { label: "Peso Argentino", symbol: "AR$" },
  { label: "Peso Chileno", symbol: "CL$" },
  { label: "Peso Colombiano", symbol: "CO$" },
  { label: "Sol Peruano", symbol: "S/" },
  { label: "Peso Uruguaio", symbol: "$U" },
  { label: "Guarani Paraguaio", symbol: "₲" },
  { label: "Boliviano", symbol: "Bs." },
  { label: "Peso Mexicano", symbol: "MX$" },
  { label: "Dólar de Singapura", symbol: "S$" },
  { label: "Dólar Neozelandês", symbol: "NZ$" },
  { label: "Rand Sul-Africano", symbol: "R" },
  { label: "Rublo Russo", symbol: "₽" },
  { label: "Dirham dos Emirados", symbol: "د.إ" },
];

export default function OnboardScreen() {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState("BRL");
  const { saveOnboardData } = useUser();

  const handleFinishOnboarding = async () => {
    if (!userName.trim()) {
      Alert.alert(
        "Nome não informado",
        "É necessário informar o seu nome para prosseguir com o acesso ao aplicativo.",
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bgScreen }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              step === 1
                ? "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop"
                : "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop",
          }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
      </View>

      <View style={[styles.bottomSheet, { backgroundColor: T.bgScreen }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={[styles.title, { color: T.textPrimary }]}>
                Dividir a conta nunca foi tão{" "}
                <Text style={{ color: T.primary }}>justo</Text>.
              </Text>

              <Text style={[styles.subtitle, { color: T.textSecondary }]}>
                Crie eventos, adicione despesas e saiba exatamente quem deve
                para quem. Sem matemática complicada, sem estresse.
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
                  Começar agora
                </Text>
                <ArrowRight size={20} color={T.textOnLime} />
              </Pressable>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={[styles.title, { color: T.textPrimary }]}>
                Como podemos te chamar?
              </Text>

              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: T.bgCardRaised, borderColor: T.border },
                  ]}
                >
                  <TextInput
                    style={[styles.textInput, { color: T.textPrimary }]}
                    placeholder="Digite aqui o seu nome"
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
                  Moeda Principal
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.currencyRow}
                >
                  {CURRENCY_LIST.map((currency) => {
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
                              color: isSelected ? T.textOnLime : T.textPrimary,
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
                          {currency.name}
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
                  Entrar no App
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1.2,
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    flex: 1,
    marginTop: -40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    ...theme.shadow.lg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepContainer: {
    flex: 1,
    padding: theme.spacing[8],
    paddingTop: theme.spacing[8],
  },
  title: {
    ...theme.textStyles.largeTitle,
  },
  subtitle: {
    ...theme.textStyles.title3,
    marginTop: 10,
  },
  inputGroup: {
    width: "100%",
    marginTop: 14,
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing[8],
  },
  textInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: theme.fontSize.md,
  },
  currencyRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  currencyChip: {
    minWidth: 110, // Garante que a caixinha não fique muito pequena
    paddingHorizontal: theme.spacing[4], // A caixinha cresce se o nome for grande
    height: 64, // Voltei para 64 para caber o texto confortavelmente
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainButton: {
    flexDirection: "row",
    height: 50,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing[8],
  },
});
