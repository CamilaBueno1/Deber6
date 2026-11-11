import { useIsFocused } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';

type Variant = 'growth' | 'store' | 'sales' | 'cash' | 'business' | 'profile';

const animations = {
  growth: require('../../../assets/lottie/empty.json'),
  store: require('../../../assets/lottie/boxes.json'),
  sales: require('../../../assets/lottie/cart.json'),
  cash: require('../../../assets/lottie/coins.json'),
  business: require('../../../assets/lottie/welcome.json'),
  profile: require('../../../assets/lottie/profile.json'),
};

const surfaces: Record<Variant, { background: string; border: string }> = {
  growth: { background: '#FFF0E4', border: '#F2D2BF' },
  store: { background: '#fff2d7', border: '#f0dfb8' },
  sales: { background: '#ffede6', border: '#f4d8ca' },
  cash: { background: '#FFF1E3', border: '#F2D4C1' },
  business: { background: '#FFF0E5', border: '#F2D6C1' },
  profile: { background: '#f8edcf', border: '#eadcb5' },
};

type Props = {
  variant: Variant;
  title: string;
  caption: string;
};

export default function SectionLottie({ variant, title, caption }: Props) {
  const surface = surfaces[variant];
  const isFocused = useIsFocused();
  const animation = useRef<LottieView>(null);

  useEffect(() => {
    if (isFocused) animation.current?.play();
    else animation.current?.pause();
  }, [isFocused]);

  return (
    <View
      className="min-h-[82px] flex-row items-center gap-3 rounded-[24px] border px-3 py-2"
      style={{
        backgroundColor: surface.background,
        borderColor: surface.border,
        shadowColor: '#A25D4A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 9,
        elevation: 2,
      }}
    >
      <View className="h-[66px] w-[66px] items-center justify-center">
        <LottieView
          ref={animation}
          source={animations[variant]}
          autoPlay={false}
          loop
          resizeMode="contain"
          style={{ width: 66, height: 66 }}
          webStyle={{ width: 66, height: 66 }}
        />
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-sm font-extrabold text-[#5A3D35]">{title}</Text>
        <Text className="text-xs leading-4 text-[#756B65]">{caption}</Text>
      </View>
      <View className="mr-1 h-2 w-2 rounded-full bg-[#D97955]" />
    </View>
  );
}
