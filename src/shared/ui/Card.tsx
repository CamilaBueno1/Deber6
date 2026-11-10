import { ReactNode, useCallback } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

type SurfaceProps = Omit<Props, 'delay' | 'animated'>;

function CardSurface({ children, className = '', style }: SurfaceProps) {
  return (
    <View
      className={`rounded-[26px] border bg-[#fffefa] p-4 ${className}`}
      style={[
        {
          borderColor: '#ffffff',
          borderTopColor: '#ffffff',
          borderLeftColor: '#ffffff',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function AnimatedCard({ children, className, delay = 0, style }: Props) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(14);
  const scale = useSharedValue(0.975);

  useFocusEffect(
    useCallback(() => {
      opacity.set(1);
      translateY.set(14);
      scale.set(0.975);

      const frame = requestAnimationFrame(() => {
        opacity.set(withDelay(delay, withTiming(1, { duration: 380 })));
        translateY.set(withDelay(delay, withSpring(0, { damping: 16, stiffness: 165 })));
        scale.set(withDelay(delay, withSpring(1, { damping: 16, stiffness: 165 })));
      });

      return () => cancelAnimationFrame(frame);
    }, [delay, opacity, scale, translateY])
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: translateY.get() }, { scale: scale.get() }],
  }));

  return <Animated.View style={[styles.shadow, animatedStyle, style]}>
    <CardSurface className={className}>{children}</CardSurface>
  </Animated.View>;
}

const styles = {
  shadow: {
    shadowColor: '#51745f',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 2,
  } as const,
};

export default function Card({
  animated = true,
  children,
  ...props
}: Props) {
  return animated ? (
    <AnimatedCard {...props}>{children}</AnimatedCard>
  ) : (
    <View style={[styles.shadow, props.style]}>
      <CardSurface className={props.className}>{children}</CardSurface>
    </View>
  );
}
