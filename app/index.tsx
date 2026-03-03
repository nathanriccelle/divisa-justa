import React from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Importamos o ícone Receipt (Recibo) para o histórico
import { router } from "expo-router";
import { Plus, Receipt, Settings } from "lucide-react-native";

import { theme } from "../src/theme";

const T = theme.colors;

// Função de Saudação com base na hora local
function obterSaudacao() {
  const horaAtual = new Date().getHours();
  if (horaAtual >= 0 && horaAtual < 12) {
    return "Bom dia";
  } else if (horaAtual >= 12 && horaAtual < 18) {
    return "Boa tarde";
  } else {
    return "Boa noite";
  }
}

export default function HomeScreen() {
  const saudacao = obterSaudacao();

  // Simulação: Se o histórico está vazio ou não (no futuro isto virá da tua base de dados)
  const historicoVazio = true;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bgScreen }]}>
      <StatusBar barStyle="light-content" backgroundColor={T.bgScreen} />

      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View>
          <Text
            style={[
              theme.textStyles.title1,
              { color: T.textSecondary, marginBottom: theme.spacing[1] },
            ]}
          >
            {saudacao}, Nathan
          </Text>
        </View>
        <Pressable>
          <Settings size={theme.spacing[8]} color={T.textSecondary} />
        </Pressable>
      </View>

      {/* CARTÃO PRINCIPAL */}
      <View
        style={[
          styles.mainCard,
          {
            backgroundColor: T.bgCard,
            borderColor: T.border,
            borderWidth: 1,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: pressed ? T.primaryPress : T.primary },
            pressed && { transform: [{ scale: 0.96 }] },
          ]}
          onPress={() => router.push("/create-event")}
        >
          <Plus size={theme.spacing[10]} color={T.textOnLime} />
        </Pressable>

        <Text
          style={[
            theme.textStyles.largeTitle,
            { color: T.textPrimary, marginBottom: theme.spacing[2] },
          ]}
        >
          Começar Divisão
        </Text>
        <Text style={[theme.textStyles.body, { color: T.textSecondary }]}>
          Crie uma nova conta compartilhada
        </Text>
      </View>

      {/* HISTÓRICO RECENTE */}
      <View style={styles.historySection}>
        <Text style={[styles.sectionTitle, { color: T.textDisabled }]}>
          HISTÓRICO RECENTE
        </Text>

        {historicoVazio ? (
          <View
            style={[
              styles.emptyStateCard,
              { backgroundColor: T.bgCard, borderColor: T.border },
            ]}
          >
            <View
              style={[
                styles.emptyStateIconWrapper,
                { backgroundColor: T.bgCardRaised },
              ]}
            >
              <Receipt size={32} color={T.primary} />
            </View>

            <Text
              style={[
                theme.textStyles.title3,
                {
                  color: T.textPrimary,
                  textAlign: "center",
                  marginBottom: theme.spacing[2],
                },
              ]}
            >
              Nenhum evento ainda
            </Text>

            {/* Mensagem de orientação */}
            <Text
              style={[
                theme.textStyles.body,
                { color: T.textSecondary, textAlign: "center", lineHeight: 22 },
              ]}
            >
              Seu histórico está limpo. Que tal organizar aquele churrasco ou
              viagem com os amigos? Toque no botão acima para começar.
            </Text>
          </View>
        ) : (
          /* Futura lista de histórico entrará aqui */
          <View>{/* Componente de lista irá aqui */}</View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[10],
    paddingBottom: theme.spacing[5],
  },
  mainCard: {
    marginHorizontal: theme.spacing[6],
    marginTop: theme.spacing[8],
    paddingVertical: theme.spacing[12],
    borderRadius: theme.borderRadius.xl,
    alignItems: "center",
    ...theme.shadow.lg,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing[6],
  },

  historySection: {
    marginTop: theme.spacing[10],
    paddingHorizontal: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    fontFamily: "Inter_700Bold",
    marginBottom: theme.spacing[4],
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  emptyStateCard: {
    padding: theme.spacing[6],
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
  },
  emptyStateIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing[4],
  },
});
