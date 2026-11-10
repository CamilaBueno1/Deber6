import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = { label: string; onPress: () => void; prefix?: string; className?: string };

export default function TextLink({ label, onPress, prefix, className = '' }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <View className={`items-center ${className}`}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={() => {
            scale.set(withSpring(0.96, { damping: 15, stiffness: 300 }));
          }}
          onPressOut={() => {
            scale.set(withSpring(1, { damping: 15, stiffness: 300 }));
          }}
          hitSlop={8}
          className="py-1"
        >
          <Text className="text-sm text-[#71817b]">
            {prefix ? `${prefix} ` : ''}
            <Text className="font-bold text-[#246b61] underline">{label}</Text>
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
