import { ReactNode, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

export default function SectionEntrance({ children, delay = 0, style }: Props) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(18);
  const scale = useSharedValue(0.975);

  useFocusEffect(
    useCallback(() => {
      opacity.set(1);
      translateY.set(18);
      scale.set(0.975);

      const frame = requestAnimationFrame(() => {
        opacity.set(withDelay(delay, withTiming(1, { duration: 420 })));
        translateY.set(withDelay(delay, withSpring(0, { damping: 16, stiffness: 160 })));
        scale.set(withDelay(delay, withSpring(1, { damping: 16, stiffness: 160 })));
      });

      return () => cancelAnimationFrame(frame);
    }, [delay, opacity, scale, translateY])
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: translateY.get() }, { scale: scale.get() }],
  }));

  return <Animated.View style={[{ width: '100%' }, style, animatedStyle]}>{children}</Animated.View>;
}
