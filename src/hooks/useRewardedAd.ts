import { useCallback, useEffect, useState } from "react";
import {
    AdEventType,
    RewardedAd,
    RewardedAdEventType,
} from "react-native-google-mobile-ads";
import { adUnitIds } from "../config/ads";

export function useRewardedAd(
  onRewardEarned?: () => void,
  onAdClosed?: () => void,
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);

  // Função interna para instanciar e solicitar o carregamento do anúncio
  const loadAd = useCallback(() => {
    setIsLoaded(false);
    const ad = RewardedAd.createForAdRequest(adUnitIds.rewarded, {
      requestNonPersonalizedAdsOnly: true,
    });
    setRewardedAd(ad);
  }, []);

  // Carrega o primeiro anúncio ao montar o hook
  useEffect(() => {
    loadAd();
  }, [loadAd]);

  // Configura os Listeners
  useEffect(() => {
    if (!rewardedAd) return;

    const unsubscribeLoaded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setIsLoaded(true);
      },
    );

    const unsubscribeEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        if (onRewardEarned) onRewardEarned();
      },
    );

    const unsubscribeClosed = rewardedAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setIsLoaded(false);
        if (onAdClosed) onAdClosed();
        // Quando o anúncio atual é fechado, já deixamos o próximo pré-carregando!
        loadAd();
      },
    );

    rewardedAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, [rewardedAd, onRewardEarned, onAdClosed, loadAd]);

  // Função exposta para acionar a exibição do vídeo
  const showAd = useCallback(() => {
    if (isLoaded && rewardedAd) {
      rewardedAd.show();
    }
  }, [isLoaded, rewardedAd]);

  return { isLoaded, showAd };
}
