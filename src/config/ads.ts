import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

// Em ambiente de desenvolvimento, SEMPRE usamos as IDs de teste.
// Posteriormente, você substituirá as strings vazias pelas suas IDs reais de produção do AdMob.
export const adUnitIds = {
  banner: __DEV__
    ? TestIds.BANNER
    : Platform.OS === "ios"
      ? "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy" // TODO: Inserir ID Real do iOS
      : "ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz", // TODO: Inserir ID Real do Android
  rewarded: __DEV__
    ? TestIds.REWARDED
    : Platform.OS === "ios"
      ? "ca-app-pub-xxxxxxxxxxxxxxxx/aaaaaaaaaa" // TODO: Inserir ID Real do iOS
      : "ca-app-pub-xxxxxxxxxxxxxxxx/bbbbbbbbbb", // TODO: Inserir ID Real do Android
};
