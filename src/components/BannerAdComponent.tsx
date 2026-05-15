import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { adUnitIds } from "../config/ads";
import { theme } from "../theme";

const T = theme.colors;

interface BannerAdComponentProps {
  style?: object;
}

export function BannerAdComponent({ style }: BannerAdComponentProps) {
  const [isFailed, setIsFailed] = useState(false);

  if (isFailed) return null; // Se falhar ao carregar, ocultamos o container

  return (
    <View style={[styles.container, { backgroundColor: T.bg }, style]}>
      <BannerAd
        unitId={adUnitIds.banner}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true, // Importante para conformidade com a LGPD/GDPR sem consentimento prévio
        }}
        onAdFailedToLoad={(error) => {
          console.warn("Banner Ad Failed to load: ", error);
          setIsFailed(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});
