import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type UserContextData = {
  userName: string;
  userCurrency: string;
  hasOnboarded: boolean | null; // null significa "pensando/carregando"
  saveOnboardData: (name: string, currency: string) => Promise<void>;
  clearData: () => Promise<void>;
};

const UserContext = createContext<UserContextData>({} as UserContextData);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState("");
  const [userCurrency, setUserCurrency] = useState("R$");
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [hasOnboardedStr, userNameStr, userCurrencyStr] =
          await Promise.all([
            AsyncStorage.getItem("hasOnboarded"),
            AsyncStorage.getItem("userName"),
            AsyncStorage.getItem("userCurrency"),
          ]);

        setHasOnboarded(hasOnboardedStr === "true");
        setUserName(userNameStr ?? "");
        setUserCurrency(userCurrencyStr ?? "R$");
      } catch (error) {
        console.error("Erro ao carregar contexto", error);
        setHasOnboarded(false);
      }
    }
    loadData();
  }, []);

  // Função para a tela de Onboard usar
  const saveOnboardData = async (name: string, currency: string) => {
    await AsyncStorage.multiSet([
      ["hasOnboarded", "true"],
      ["userName", name.trim()],
      ["userCurrency", currency],
    ]);
    setUserName(name.trim());
    setUserCurrency(currency);
    setHasOnboarded(true);
  };

  // Função para o botão de Configurações apagar a memória
  const clearData = async () => {
    await AsyncStorage.clear();
    setHasOnboarded(false);
    setUserName("");
  };

  return (
    <UserContext.Provider
      value={{
        userName,
        userCurrency,
        hasOnboarded,
        saveOnboardData,
        clearData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// O Hook mágico de 1 linha para as telas usarem:
export const useUser = () => useContext(UserContext);
