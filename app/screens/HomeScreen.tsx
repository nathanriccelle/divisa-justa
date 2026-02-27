import { colors } from "@/src/theme";
import {
    Gift,
    LucideIcon,
    Plane,
    Plus,
    ShoppingCart,
    Utensils,
    Wine,
} from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type QuickStartItem = {
  id: string;
  title: string;
  Icon: LucideIcon;
  color: string;
};

const QUICK_START_ITEMS: QuickStartItem[] = [
  { id: "1", title: "Jantar", Icon: Utensils, color: colors.text.secondary },
  { id: "2", title: "Bar", Icon: Wine, color: colors.text.secondary },
  { id: "3", title: "Viagem", Icon: Plane, color: colors.text.secondary },
  {
    id: "4",
    title: "Mercado",
    Icon: ShoppingCart,
    color: colors.text.secondary,
  },
  { id: "5", title: "Presente", Icon: Gift, color: colors.text.secondary },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />

      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Boa tarde, Lucas</Text>
          <Text style={styles.title}>Divisa Justa</Text>
        </View>
      </View>

      {/* CARTÃO PRINCIPAL */}
      <View style={styles.mainCard}>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
          <Plus size={40} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.cardTitle}>Começar Divisão</Text>
        <Text style={styles.cardSubtitle}>
          Crie uma nova conta compartilhada
        </Text>
      </View>

      {/* INÍCIO RÁPIDO */}
      <View style={styles.quickStartSection}>
        <Text style={styles.quickStartTitle}>INÍCIO RÁPIDO</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {QUICK_START_ITEMS.map((item) => {
            const { Icon } = item;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.quickStartItem}
                activeOpacity={0.7}
              >
                <View style={styles.iconBox}>
                  <Icon size={24} color={item.color} />
                </View>
                <Text style={styles.quickStartText}>{item.title}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ESTILOS DA TELA
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: "#8A94A6",
    marginBottom: 4,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    color: "#1A1D1E",
    fontWeight: "bold",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  notificationDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    backgroundColor: "#FF4B4B",
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#F8FAFF",
  },
  mainCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 24,
    marginTop: 30,
    paddingVertical: 50,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#4A88F6",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 10,
  },
  addButton: {
    width: 80,
    height: 80,
    backgroundColor: "#4A88F6",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1D1E",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#8A94A6",
  },
  quickStartSection: {
    marginTop: 40,
  },
  quickStartTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#A0AABF",
    paddingHorizontal: 24,
    marginBottom: 16,
    letterSpacing: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  quickStartItem: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  iconBox: {
    width: 64,
    height: 64,
    backgroundColor: "#FFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  quickStartText: {
    fontSize: 13,
    color: "#8A94A6",
    fontWeight: "500",
  },
});
