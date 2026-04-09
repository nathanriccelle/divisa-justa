import { router, useLocalSearchParams } from "expo-router";
import {
  Calendar,
  Check,
  ChevronRight,
  Minus,
  Plus,
  PlusCircle,
  Receipt,
  User,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
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

import { db } from "../src/db";
import { expenses, participants as participantsTable } from "../src/db/schema";

const T = theme.colors;

type Participant = {
  id: string;
  name: string;
  initials: string;
  isOwner: boolean;
};

// 👇 1. FUNÇÃO PARA PEGAR A DATA ATUAL
const obterDataFormatada = () => {
  const data = new Date();
  const dia = data.getDate();
  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return `Hoje, ${dia} ${meses[data.getMonth()]}`;
};

export default function AddExpenseScreen() {
  const { participantsStr, currencySymbol, eventId } = useLocalSearchParams<{
    participantsStr: string;
    currencySymbol: string;
    eventId: string;
  }>();

  const initialParticipants: Participant[] = participantsStr
    ? JSON.parse(participantsStr)
    : [];
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);
  const symbol = currencySymbol || "R$";

  // Encontra quem é o organizador para ser o pagante por padrão
  const defaultPayer = participants.find((p) => p.isOwner) || participants[0];

  // ESTADOS DO FORMULÁRIO
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState(1);

  // 👇 2. ESTADOS DO PAGANTE
  const [payerId, setPayerId] = useState<string>(defaultPayer?.id || "");
  const [showPayerModal, setShowPayerModal] = useState(false); // Controla a janelinha

  // Pegamos o objeto completo do pagante atual para mostrar na tela
  const currentPayer = participants.find((p) => p.id === payerId);

  // Lista de quem vai dividir (todos marcados por padrão)
  const [splitWithIds, setSplitWithIds] = useState<string[]>(
    participants.map((p) => p.id),
  );

  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");

  const toggleParticipant = (id: string) => {
    if (splitWithIds.includes(id)) {
      setSplitWithIds(splitWithIds.filter((item) => item !== id));
    } else {
      setSplitWithIds([...splitWithIds, id]);
    }
  };

  const handleAddNewPerson = async () => {
    if (!newPersonName.trim()) return;

    const initials = newPersonName.trim().substring(0, 2).toUpperCase();
    const newPersonId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newPerson: Participant = {
      id: newPersonId,
      name: newPersonName.trim(),
      initials: initials,
      isOwner: false,
    };

    try {
      // Salva no banco de dados
      await db.insert(participantsTable).values({
        id: newPersonId,
        eventId: eventId,
        name: newPerson.name,
        initials: newPerson.initials,
        isOwner: false,
      });

      // Atualiza a tela instantaneamente
      setParticipants([...participants, newPerson]);
      // Já coloca a pessoa para dividir a conta automaticamente
      setSplitWithIds([...splitWithIds, newPersonId]);

      // Limpa e fecha
      setNewPersonName("");
      setShowAddPersonModal(false);
    } catch (error) {
      console.error("Erro ao adicionar nova pessoa:", error);
    }
  };

  const handleSaveExpense = async () => {
    if (!title.trim() || !amount.trim()) return;

    try {
      const numericAmount = parseFloat(amount.replace(",", "."));
      if (isNaN(numericAmount)) return;

      if (!payerId) throw new Error("Pagante não selecionado");

      await db.insert(expenses).values({
        id: `exp_${Date.now()}`,
        eventId: eventId,
        payerId: payerId, // 👈 Agora usamos o pagante que o usuário escolheu!
        title: title.trim(),
        amount: numericAmount,
        quantity: quantity,
        date: new Date(),
        splitWithIds: JSON.stringify(splitWithIds),
      });

      router.back();
    } catch (error) {
      console.error("Erro ao salvar a despesa no banco:", error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgScreen }]}>
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

        <Pressable
          style={{ padding: theme.spacing[2] }}
          onPress={handleSaveExpense}
        >
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

          <View
            style={[
              styles.optionsBlock,
              { backgroundColor: T.bgCard, borderColor: T.border },
            ]}
          >
            {/* Quantidade */}
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

            {/* Quem pagou? */}
            <Pressable
              onPress={() => setShowPayerModal(true)}
              style={({ pressed }) => [
                styles.optionRow,
                { borderBottomColor: T.border, borderBottomWidth: 1 },
                pressed && { backgroundColor: T.bgCardRaised },
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

              {/* Lado Direito: Badge + Setinha */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.payerBadge}>
                  <View
                    style={[styles.miniAvatar, { backgroundColor: T.primary }]}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "bold",
                        color: T.textOnLime,
                      }}
                    >
                      {currentPayer?.initials}
                    </Text>
                  </View>
                  <Text
                    style={[
                      theme.textStyles.subheadline,
                      {
                        color: T.primary,
                        fontWeight: "bold",
                        marginLeft: 4,
                        marginRight: 8,
                      }, // Adicionei marginRight aqui
                    ]}
                  >
                    {currentPayer?.id === defaultPayer?.id
                      ? "Você"
                      : currentPayer?.name}
                  </Text>
                </View>

                {/* 👈 A setinha mágica que mostra que é clicável! */}
                <ChevronRight size={18} color={T.textSecondary} />
              </View>
            </Pressable>

            {/* 👇 4. Data (AGORA É DINÂMICA) */}
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
                  {obterDataFormatada()}
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

            {participants.map((person) => (
              <ParticipantCheckbox
                key={person.id}
                name={person.name}
                initials={person.initials}
                isOwner={person.isOwner}
                // 👇 5. MAGIA DA UX: A etiqueta "Pagante" acompanha dinamicamente quem está no payerId!
                role={person.id === payerId ? "Pagante" : undefined}
                isSelected={splitWithIds.includes(person.id)}
                onToggle={() => toggleParticipant(person.id)}
              />
            ))}

            <Pressable
              style={styles.addPersonBtn}
              onPress={() => setShowAddPersonModal(true)}
            >
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

      <View style={[styles.footer, { backgroundColor: T.bgScreen }]}>
        <Pressable
          onPress={handleSaveExpense}
          style={({ pressed }) => [
            styles.mainButton,
            { backgroundColor: pressed ? T.primaryPress : T.primary },
            pressed && { transform: [{ scale: 0.98 }] },
            (!title || !amount) && { opacity: 0.5 },
          ]}
          disabled={!title || !amount}
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

      {/* 👇 6. O MODAL DE SELECIONAR QUEM PAGOU */}
      <Modal
        visible={showPayerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPayerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: T.bgCardRaised }]}
          >
            {/* Cabeçalho do Modal */}
            <View style={[styles.modalHeader, { borderBottomColor: T.border }]}>
              <Text style={[theme.textStyles.title3, { color: T.textPrimary }]}>
                Quem pagou a conta?
              </Text>
              <Pressable
                onPress={() => setShowPayerModal(false)}
                style={({ pressed }) => [pressed && { opacity: 0.5 }]}
              >
                <X size={24} color={T.textSecondary} />
              </Pressable>
            </View>

            {/* Lista de pessoas para escolher */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 300 }}
            >
              {participants.map((person) => {
                const isSelected = person.id === payerId;
                return (
                  <Pressable
                    key={person.id}
                    onPress={() => {
                      setPayerId(person.id); // Muda o pagante

                      // Dica de UX: Se a pessoa pagou, automaticamente marcamos ela na divisão de consumos (caso esteja desmarcada)
                      if (!splitWithIds.includes(person.id)) {
                        setSplitWithIds([...splitWithIds, person.id]);
                      }

                      setShowPayerModal(false); // Fecha o modal
                    }}
                    style={({ pressed }) => [
                      styles.payerOption,
                      { borderBottomColor: T.border },
                      pressed && { backgroundColor: T.bgCard },
                    ]}
                  >
                    <View
                      style={[
                        styles.miniAvatar,
                        {
                          backgroundColor: isSelected ? T.primary : T.bgCard,
                          width: 32,
                          height: 32,
                          marginRight: theme.spacing[3],
                        },
                      ]}
                    >
                      <Text
                        style={[
                          theme.textStyles.subheadline,
                          {
                            fontWeight: "bold",
                            color: isSelected ? T.textOnLime : T.textPrimary,
                          },
                        ]}
                      >
                        {person.initials}
                      </Text>
                    </View>

                    <Text
                      style={[
                        theme.textStyles.body,
                        {
                          color: T.textPrimary,
                          flex: 1,
                          fontWeight: isSelected ? "bold" : "normal",
                        },
                      ]}
                    >
                      {person.id === defaultPayer?.id
                        ? "Você (Organizador)"
                        : person.name}
                    </Text>

                    {isSelected && <Check size={20} color={T.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showAddPersonModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddPersonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={[styles.modalContent, { backgroundColor: T.bgCardRaised }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: T.border }]}>
              <Text style={[theme.textStyles.title3, { color: T.textPrimary }]}>
                Adicionar Pessoa
              </Text>
              <Pressable
                onPress={() => setShowAddPersonModal(false)}
                style={({ pressed }) => [pressed && { opacity: 0.5 }]}
              >
                <X size={24} color={T.textSecondary} />
              </Pressable>
            </View>
            <View style={{ padding: theme.spacing[2] }}>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: T.bgCard,
                    borderColor: T.border,
                    marginTop: 0,
                    marginBottom: theme.spacing[2],
                  },
                ]}
              >
                <User
                  size={20}
                  color={T.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.textInput, { color: T.textPrimary }]}
                  placeholder="Nome do participante"
                  placeholderTextColor={T.textDisabled}
                  value={newPersonName}
                  onChangeText={setNewPersonName}
                  autoFocus
                  onSubmitEditing={handleAddNewPerson}
                />
              </View>
              <Pressable
                onPress={handleAddNewPerson}
                style={({ pressed }) => [
                  styles.mainButton,
                  {
                    height: 48,
                    backgroundColor: pressed ? T.primaryPress : T.primary,
                  },
                  pressed && { transform: [{ scale: 0.98 }] },
                  !newPersonName.trim() && { opacity: 0.5 },
                ]}
                disabled={!newPersonName.trim()}
              >
                <Text
                  style={[theme.textStyles.headline, { color: T.textOnLime }]}
                >
                  Adicionar
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (Todos os estilos antigos continuam aqui iguais)
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

  // 👇 Novos estilos para o Modal de Pagante
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: theme.spacing[8],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing[6],
    borderBottomWidth: 1,
  },
  payerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing[4],
    borderBottomWidth: 1,
  },
});
