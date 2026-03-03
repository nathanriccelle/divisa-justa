import { router } from "expo-router";
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  PenLine,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../src/theme";
const T = theme.colors;

import {
  CURRENCY_LIST,
  CurrencySelector,
} from "../src/components/CurrencySelector";

type Participant = {
  id: string;
  name: string;
  role: string;
  initials: string;
  isOwner: boolean;
};

export default function CreateEventScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCY_LIST[0]);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "owner-1",
      name: "Você",
      role: "Organizador",
      initials: "EU",
      isOwner: true,
    },
  ]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [eventName, setEventName] = useState("");

  // ESTADOS DO AVISO
  const [showError, setShowError] = useState(false);
  // O motor que controla a posição Y (altura) do nosso aviso
  const slideAnim = useRef(new Animated.Value(-100)).current;

  // Lógica da Animação do Aviso
  useEffect(() => {
    if (showError) {
      Vibration.vibrate(50);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
      }).start();

      // Esconde automaticamente após 3 segundos
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100, // Volta a esconder lá em cima
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowError(false));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showError]);

  const handleAddParticipant = () => {
    if (newParticipantName.trim() === "") return;
    const initials = newParticipantName.trim().substring(0, 2).toUpperCase();
    const newPerson: Participant = {
      id: Date.now().toString(),
      name: newParticipantName.trim(),
      role: "",
      initials: initials,
      isOwner: false,
    };
    setParticipants([...participants, newPerson]);
    setNewParticipantName("");
  };

  const handleRemoveParticipant = (idToRemove: string) => {
    setParticipants(participants.filter((person) => person.id !== idToRemove));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgScreen }]}>
      {/* COMPONENTE DE AVISO (FLUTUANTE) */}
      {showError && (
        <Animated.View
          style={[
            styles.errorToast,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View
            style={[
              styles.errorToastContent,
              { backgroundColor: T.negativeBg, borderColor: T.negative },
            ]}
          >
            <AlertTriangle size={24} color={T.negative} />
            <View style={{ marginLeft: theme.spacing[3], flex: 1 }}>
              <Text
                style={[
                  theme.textStyles.subheadline,
                  { color: T.negative, fontWeight: "bold" },
                ]}
              >
                Faltou o Nome!
              </Text>
              <Text
                style={[theme.textStyles.footnote, { color: T.textPrimary }]}
              >
                Até um "Churrasco sem nome" precisa de nome. Digita algo para
                prosseguirmos!
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* CABECALHO */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <ChevronLeft size={28} color={T.primary} />
        </Pressable>
        <Text style={[theme.textStyles.title3, { color: T.textPrimary }]}>
          Configurar Evento
        </Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: theme.spacing[16] }}
        >
          {/* NOME DO EVENTO */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: T.textSecondary }]}>
              NOME DO EVENTO
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: T.bgCardRaised,
                  borderColor: showError ? T.negative : T.border,
                },
              ]}
            >
              <PenLine
                size={20}
                color={showError ? T.negative : T.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, { color: T.textPrimary }]}
                placeholder="Ex: Churrasco da Turma"
                placeholderTextColor={T.textDisabled}
                value={eventName}
                onChangeText={(text) => {
                  setEventName(text);
                  if (showError) setShowError(false);
                }}
              />
            </View>
          </View>

          {/* MOEDA */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: T.textSecondary }]}>
              MOEDA
            </Text>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onSelectCurrency={setSelectedCurrency}
            />
          </View>

          {/* PARTICIPANTES */}
          <View style={styles.participantsSection}>
            <View style={styles.participantsHeader}>
              <Text style={[theme.textStyles.title3, { color: T.textPrimary }]}>
                Participantes
              </Text>
              <View style={[styles.badge, { backgroundColor: T.bgAccent }]}>
                <Text style={[theme.textStyles.footnote, { color: T.primary }]}>
                  {participants.length}{" "}
                  {participants.length === 1 ? "pessoa" : "pessoas"}
                </Text>
              </View>
            </View>

            <View style={styles.addParticipantRow}>
              <View
                style={[
                  styles.inputContainer,
                  styles.addParticipantInput,
                  { backgroundColor: T.bgCardRaised, borderColor: T.border },
                ]}
              >
                <UserPlus
                  size={20}
                  color={T.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.textInput, { color: T.textPrimary }]}
                  placeholder="Nome da pessoa"
                  placeholderTextColor={T.textDisabled}
                  value={newParticipantName}
                  onChangeText={setNewParticipantName}
                  onSubmitEditing={handleAddParticipant}
                />
              </View>
              <Pressable
                onPress={handleAddParticipant}
                style={({ pressed }) => [
                  styles.addButton,
                  { backgroundColor: pressed ? T.primaryPress : T.primary },
                  pressed && { transform: [{ scale: 0.96 }] },
                ]}
              >
                <Plus size={24} color={T.textOnLime} />
              </Pressable>
            </View>

            {participants.map((person) => (
              <View
                key={person.id}
                style={[
                  styles.participantCard,
                  { backgroundColor: T.bgCard, borderColor: T.border },
                ]}
              >
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: person.isOwner
                        ? T.primary
                        : T.bgCardRaised,
                    },
                  ]}
                >
                  <Text
                    style={[
                      theme.textStyles.subheadline,
                      {
                        fontWeight: "bold",
                        color: person.isOwner ? T.textOnLime : T.textPrimary,
                      },
                    ]}
                  >
                    {person.initials}
                  </Text>
                </View>
                <View style={styles.participantInfo}>
                  <Text
                    style={[
                      theme.textStyles.body,
                      { color: T.textPrimary, fontWeight: "bold" },
                    ]}
                  >
                    {person.name}
                  </Text>
                  {person.role ? (
                    <Text
                      style={[
                        theme.textStyles.footnote,
                        { color: T.textSecondary },
                      ]}
                    >
                      {person.role}
                    </Text>
                  ) : null}
                </View>
                {!person.isOwner ? (
                  <Pressable
                    onPress={() => handleRemoveParticipant(person.id)}
                    style={({ pressed }) => [pressed && { opacity: 0.5 }]}
                  >
                    <Trash2 size={20} color={T.textDisabled} />
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* RODAPE */}
      <View style={[styles.footer, { backgroundColor: T.bgScreen }]}>
        <Pressable
          onPress={() => {
            // VALIDAÇÃO
            if (eventName.trim() === "") {
              setShowError(true);
              return;
            }

            router.push({
              pathname: "/event-details",
              params: {
                eventName: eventName.trim(),
                currencySymbol: selectedCurrency.symbol,
                participantsStr: JSON.stringify(participants),
              },
            });
          }}
          style={({ pressed }) => [
            styles.mainButton,
            { backgroundColor: pressed ? T.primaryPress : T.primary },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text
            style={[
              theme.textStyles.headline,
              { color: T.textOnLime, marginRight: theme.spacing[2] },
            ]}
          >
            Próximo
          </Text>
          <ArrowRight size={20} color={T.textOnLime} />
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
  backButton: { width: 40, height: 40, justifyContent: "center" },
  content: { flex: 1, paddingHorizontal: theme.spacing[6] },
  inputGroup: { marginTop: theme.spacing[6] },
  label: {
    fontSize: theme.fontSize.xs,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: theme.spacing[2],
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing[4],
  },
  inputIcon: { marginRight: theme.spacing[3] },
  textInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: theme.fontSize.md,
  },
  participantsSection: { marginTop: theme.spacing[10] },
  participantsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing[4],
  },
  badge: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
  },
  addParticipantRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing[6],
  },
  addParticipantInput: { flex: 1, marginRight: theme.spacing[3] },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing[3],
  },
  participantInfo: { flex: 1 },
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

  errorToast: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: theme.spacing[6],
    right: theme.spacing[6],
    zIndex: 100,
  },
  errorToastContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    ...theme.shadow.lg,
  },
});
