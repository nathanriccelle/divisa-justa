import { router, useLocalSearchParams } from "expo-router";
import {
    Calendar,
    Check,
    Minus,
    Plus,
    PlusCircle,
    Receipt,
    User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ParticipantCheckbox } from "../src/components/ParticipantCheckbox";
import { theme } from "../src/theme";

const T = theme.colors;

type Participant = {
  id: string;
  name: string;
  initials: string;
  isOwner: boolean;
};

export default function AddExpenseScreen() {
  // Recebe as pessoas da tela anterior
  const { participantsStr, currencySymbol } = useLocalSearchParams<{
    participantsStr: string;
    currencySymbol: string;
  }>();

  const participants: Participant[] = participantsStr
    ? JSON.parse(participantsStr)
    : [];
  const symbol = currencySymbol || "R$";

  // ESTADOS DO FORMULÁRIO
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Array com os IDs de quem vai dividir a conta (por padrão, todos marcados)
  const [splitWithIds, setSplitWithIds] = useState<string[]>(
    participants.map((p) => p.id),
  );

  // Função para marcar/desmarcar pessoas na divisão
  const toggleParticipant = (id: string) => {
    if (splitWithIds.includes(id)) {
      setSplitWithIds(splitWithIds.filter((item) => item !== id));
    } else {
      setSplitWithIds([...splitWithIds, id]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgScreen }]}>
      {/* CABEÇALHO COM BOTÕES DE TEXTO */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={{ padding: theme.spacing[2] }}
        >
          <Text style={[theme.textStyles.body, { color: T.primary }]}>
            Cancelar
          </Text>
        </Pressable>

        <Text
          style={[
            theme.textStyles.title3,
            { color: T.textPrimary, fontWeight: "bold" },
          ]}
        >
          Adicionar Despesa
        </Text>

        <Pressable style={{ padding: theme.spacing[2] }}>
          {/* Botão Salvar do topo (desabilitado se não tiver título ou valor) */}
          <Text
            style={[
              theme.textStyles.body,
              {
                color: title && amount ? T.primary : T.textDisabled,
                fontWeight: "bold",
              },
            ]}
          >
            Salvar
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* INPUT: TÍTULO */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: T.textSecondary }]}>
              Título do Item
            </Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: T.bgCardRaised, borderColor: T.border },
              ]}
            >
              <Receipt
                size={20}
                color={T.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, { color: T.textPrimary }]}
                placeholder="Ex: Jantar, Gasolina"
                placeholderTextColor={T.textDisabled}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* INPUT: VALOR */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: T.textSecondary }]}>
              Valor Unitário
            </Text>
            <View
              style={[
                styles.amountContainer,
                { backgroundColor: T.bgCardRaised, borderColor: T.border },
              ]}
            >
              <Text style={[styles.amountSymbol, { color: T.textPrimary }]}>
                {symbol}
              </Text>
              <TextInput
                style={[styles.amountInput, { color: T.textPrimary }]}
                placeholder="0,00"
                placeholderTextColor={T.textDisabled}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* BLOCO DE OPÇÕES (Quantidade, Quem pagou, Data) */}
          <View
            style={[
              styles.optionsBlock,
              { backgroundColor: T.bgCard, borderColor: T.border },
            ]}
          >
            {/* Linha 1: Quantidade */}
            <View
              style={[
                styles.optionRow,
                { borderBottomColor: T.border, borderBottomWidth: 1 },
              ]}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[styles.iconBox, { backgroundColor: T.bgCardRaised }]}
                >
                  <Text style={{ color: T.primary }}>#</Text>
                </View>
                <Text
                  style={[
                    theme.textStyles.body,
                    { color: T.textPrimary, fontWeight: "bold" },
                  ]}
                >
                  Quantidade
                </Text>
              </View>

              <View style={styles.qtySelector}>
                <Pressable
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={[styles.qtyBtn, { borderColor: T.border }]}
                >
                  <Minus size={16} color={T.textPrimary} />
                </Pressable>
                <Text
                  style={[
                    theme.textStyles.headline,
                    {
                      color: T.textPrimary,
                      marginHorizontal: theme.spacing[4],
                    },
                  ]}
                >
                  {quantity}
                </Text>
                <Pressable
                  onPress={() => setQuantity(quantity + 1)}
                  style={[styles.qtyBtn, { borderColor: T.border }]}
                >
                  <Plus size={16} color={T.textPrimary} />
                </Pressable>
              </View>
            </View>

            {/* Linha 2: Quem pagou? */}
            <View
              style={[
                styles.optionRow,
                { borderBottomColor: T.border, borderBottomWidth: 1 },
              ]}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[styles.iconBox, { backgroundColor: T.bgCardRaised }]}
                >
                  <User size={16} color={T.primary} />
                </View>
                <Text
                  style={[
                    theme.textStyles.body,
                    { color: T.textPrimary, fontWeight: "bold" },
                  ]}
                >
                  Quem pagou?
                </Text>
              </View>
              <View style={styles.payerBadge}>
                <View
                  style={[styles.miniAvatar, { backgroundColor: T.primary }]}
                >
                  <Text style={{ fontSize: 10, fontWeight: "bold" }}>EU</Text>
                </View>
                <Text
                  style={[
                    theme.textStyles.subheadline,
                    { color: T.primary, fontWeight: "bold", marginLeft: 4 },
                  ]}
                >
                  Você
                </Text>
              </View>
            </View>

            {/* Linha 3: Data */}
            <View style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <View
                  style={[styles.iconBox, { backgroundColor: T.bgCardRaised }]}
                >
                  <Calendar size={16} color={T.primary} />
                </View>
                <Text
                  style={[
                    theme.textStyles.body,
                    { color: T.textPrimary, fontWeight: "bold" },
                  ]}
                >
                  Data
                </Text>
              </View>
              <View
                style={[styles.dateBadge, { backgroundColor: T.bgCardRaised }]}
              >
                <Text
                  style={[
                    theme.textStyles.subheadline,
                    { color: T.textSecondary },
                  ]}
                >
                  Hoje, 24 Out
                </Text>
              </View>
            </View>
          </View>

          {/* SECÇÃO: DIVIDIR COM */}
          <View style={styles.splitSection}>
            <Text
              style={[
                styles.label,
                { color: T.textDisabled, marginBottom: theme.spacing[4] },
              ]}
            >
              DIVIDIR COM
            </Text>

            {/* Lista renderizada */}
            {participants.map((person) => (
              <ParticipantCheckbox
                key={person.id}
                name={person.name}
                initials={person.initials}
                isOwner={person.isOwner}
                role={person.isOwner ? "Pagante" : undefined}
                isSelected={splitWithIds.includes(person.id)}
                onToggle={() => toggleParticipant(person.id)}
              />
            ))}

            {/* Botão Extra: Adicionar nova pessoa */}
            <Pressable style={styles.addPersonBtn}>
              <PlusCircle size={20} color={T.primary} />
              <Text
                style={[
                  theme.textStyles.body,
                  {
                    color: T.primary,
                    marginLeft: theme.spacing[2],
                    fontWeight: "500",
                  },
                ]}
              >
                Adicionar nova pessoa
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTÃO SALVAR */}
      <View style={[styles.footer, { backgroundColor: T.bgScreen }]}>
        <Pressable
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
          <Text style={[theme.textStyles.headline, { color: T.textOnLime }]}>
            Salvar Item
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
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
  },
  content: { flex: 1, paddingHorizontal: theme.spacing[6] },

  inputGroup: { marginTop: theme.spacing[6] },
  label: {
    fontSize: theme.fontSize.xs,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing[4],
    marginTop: theme.spacing[2],
  },
  inputIcon: { marginRight: theme.spacing[3] },
  textInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: theme.fontSize.md,
  },

  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 72,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing[4],
    marginTop: theme.spacing[2],
  },
  amountSymbol: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginRight: theme.spacing[2],
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    padding: 0,
  },

  optionsBlock: {
    marginTop: theme.spacing[8],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing[4],
  },
  optionLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing[3],
  },

  qtySelector: { flexDirection: "row", alignItems: "center" },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  payerBadge: { flexDirection: "row", alignItems: "center" },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  dateBadge: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
  },

  splitSection: { marginTop: theme.spacing[8] },
  addPersonBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[4],
    marginTop: theme.spacing[2],
  },

  footer: {
    padding: theme.spacing[6],
    paddingBottom: Platform.OS === "ios" ? 0 : theme.spacing[6],
  },
  mainButton: {
    flexDirection: "row",
    height: 56,
    borderRadius: theme.borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
  },
});
