import { router, useLocalSearchParams } from "expo-router";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  PlusCircle,
  Receipt,
  User,
  Users,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
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

import { DatePickerModal } from "@/src/components/DatePickerModal";
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

const obterDataFormatada = (dataParaFormatar: Date) => {
  const dia = dataParaFormatar.getDate();
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

  // Verifica se a data escolhida é exatamente hoje
  const hoje = new Date();
  const isHoje =
    dataParaFormatar.getDate() === hoje.getDate() &&
    dataParaFormatar.getMonth() === hoje.getMonth() &&
    dataParaFormatar.getFullYear() === hoje.getFullYear();

  return isHoje
    ? `Hoje, ${dia} ${meses[dataParaFormatar.getMonth()]}`
    : `${dia} ${meses[dataParaFormatar.getMonth()]}`;
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

  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [payerIds, setPayerIds] = useState<string[]>([defaultPayer?.id || ""]);
  const [showPayerModal, setShowPayerModal] = useState(false); // Controla a janelinha

  const isMultiplePayers = payerIds.length > 1;
  const firstPayer = participants.find((p) => p.id === `payerIds`);

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

  // função para alternar pagantes no modal
  const togglePayer = (id: string) => {
    if (payerIds.includes(id)) {
      // Não deixa remover se for o último (a despesa precisa de pelo menos 1 pagante)
      if (payerIds.length > 1) {
        setPayerIds(payerIds.filter((item) => item !== id));
      } else {
        Alert.alert("Ops!", "A despesa precisa ter pelo menos um pagante.");
      }
    } else {
      setPayerIds([...payerIds, id]);

      // Magia de UX: Se a pessoa entrou como pagante, entra na divisão por padrão
      if (!splitWithIds.includes(id)) {
        setSplitWithIds([...splitWithIds, id]);
      }
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

      if (!payerIds) throw new Error("Pagante não selecionado");

      await db.insert(expenses).values({
        id: `exp_${Date.now()}`,
        eventId: eventId,
        payerId: JSON.stringify(payerIds),
        title: title.trim(),
        amount: numericAmount,
        quantity: quantity,
        date: expenseDate,
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
          <ChevronLeft size={28} color={T.primary} />
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
        ></Pressable>
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
                  {isMultiplePayers ? (
                    <Users size={16} color={T.primary} />
                  ) : (
                    <User size={16} color={T.primary} />
                  )}
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

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {isMultiplePayers ? (
                  <View style={styles.payerBadge}>
                    <Text
                      style={[
                        theme.textStyles.subheadline,
                        {
                          color: T.primary,
                          fontWeight: "bold",
                          marginRight: 8,
                        },
                      ]}
                    >
                      {payerIds.length} pagantes
                    </Text>
                  </View>
                ) : (
                  <View style={styles.payerBadge}>
                    <View
                      style={[
                        styles.miniAvatar,
                        { backgroundColor: T.primary },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "bold",
                          color: T.textOnLime,
                        }}
                      >
                        {firstPayer?.initials}
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
                        },
                      ]}
                    >
                      {firstPayer?.id === defaultPayer?.id
                        ? "Você"
                        : firstPayer?.name}
                    </Text>
                  </View>
                )}

                <ChevronRight size={18} color={T.textSecondary} />
              </View>
            </Pressable>

            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={({ pressed }) => [
                styles.optionRow,
                pressed && { backgroundColor: T.bgCardRaised },
              ]}
            >
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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={[
                    styles.dateBadge,
                    { backgroundColor: T.bgCardRaised },
                  ]}
                >
                  <Text
                    style={[
                      theme.textStyles.subheadline,
                      { color: T.textSecondary },
                    ]}
                  >
                    {obterDataFormatada(expenseDate)}
                  </Text>
                </View>
                <ChevronRight
                  size={18}
                  color={T.textSecondary}
                  style={{ marginLeft: 8 }}
                />
              </View>
            </Pressable>
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

            {participants.map((person) => {
              // Verifica se essa pessoa é UMA DAS pagantes
              const isPayer = payerIds.includes(person.id);

              return (
                <ParticipantCheckbox
                  key={person.id}
                  name={person.name}
                  initials={person.initials}
                  isOwner={person.isOwner}
                  role={isPayer ? "Pagante" : undefined}
                  isSelected={splitWithIds.includes(person.id)}
                  onToggle={() => toggleParticipant(person.id)}
                />
              );
            })}

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

      {/* MODAL DE SELECIONAR QUEM PAGOU */}
      <Modal
        visible={showPayerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPayerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowPayerModal(false)}
          >
            <Pressable
              style={[styles.modalContent, { backgroundColor: T.bgCardRaised }]}
              onPress={() => {}}
            >
              <View
                style={[styles.modalHeader, { borderBottomColor: T.border }]}
              >
                <Text
                  style={[theme.textStyles.title3, { color: T.textPrimary }]}
                >
                  Quem pagou a conta?
                </Text>
                <Pressable
                  onPress={() => setShowPayerModal(false)}
                  style={({ pressed }) => [pressed && { opacity: 0.5 }]}
                >
                  <X size={24} color={T.textSecondary} />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 300 }}
              >
                {participants.map((person) => {
                  const isSelected = payerIds.includes(person.id);

                  return (
                    <Pressable
                      key={person.id}
                      onPress={() => togglePayer(person.id)}
                      style={({ pressed }) => [
                        styles.payerOption,
                        { borderBottomColor: T.border },
                        pressed && { backgroundColor: T.bgCard },
                      ]}
                    >
                      {/* Checkbox visual para os pagantes */}
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: isSelected
                              ? T.primary
                              : T.textDisabled,
                            backgroundColor: isSelected
                              ? T.primary
                              : "transparent",
                          },
                        ]}
                      >
                        {isSelected && <Check size={14} color={T.textOnLime} />}
                      </View>

                      <View
                        style={[
                          styles.miniAvatar,
                          {
                            backgroundColor: T.bgCard,
                            width: 32,
                            height: 32,
                            marginRight: theme.spacing[2],
                          },
                        ]}
                      >
                        <Text
                          style={[
                            theme.textStyles.subheadline,
                            { fontWeight: "bold", color: T.textPrimary },
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
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Botão de Confirmar no final do modal */}
              <View style={{ padding: theme.spacing[2] }}>
                <Pressable
                  onPress={() => setShowPayerModal(false)}
                  style={({ pressed }) => [
                    styles.mainButton,
                    {
                      height: 48,
                      backgroundColor: pressed ? T.primaryPress : T.primary,
                    },
                    pressed && { transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <Text
                    style={[theme.textStyles.headline, { color: T.textOnLime }]}
                  >
                    Confirmar Pagantes
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
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
      <DatePickerModal
        visible={showDatePicker}
        currentDate={expenseDate}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(date) => {
          setExpenseDate(date);
          setShowDatePicker(false);
        }}
      />
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: theme.spacing[4],
    justifyContent: "center",
    alignItems: "center",
  },
});
