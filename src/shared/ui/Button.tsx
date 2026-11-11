import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export type ButtonVariant = 'primary' | 'dark' | 'outline' | 'ghost' | 'danger' | 'dangerOutline';
type ButtonSize = 'sm' | 'md' | 'lg';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  className?: string;
};

const BOX: Record<ButtonVariant, string> = {
  primary: 'bg-[#A95743] border border-[#874435]',
  dark: 'bg-[#A95743] border border-[#613826]',
  outline: 'bg-[#FFFFFF] border border-[#EFE3DA]',
  ghost: 'bg-transparent border border-transparent',
  danger: 'bg-[#d66a54] border border-[#c05742]',
  dangerOutline: 'bg-[#fdf3f0] border border-[#efc7be]',
};

const TEXT: Record<ButtonVariant, string> = {
  primary: 'text-white',
  dark: 'text-white',
  outline: 'text-[#493A36]',
  ghost: 'text-[#8B563D]',
  danger: 'text-white',
  dangerOutline: 'text-[#b84c37]',
};

const ICON: Record<ButtonVariant, string> = {
  primary: '#ffffff',
  dark: '#ffffff',
  outline: '#D97955',
  ghost: '#D97955',
  danger: '#ffffff',
  dangerOutline: '#c4533d',
};

const SIZE_BOX: Record<ButtonSize, string> = {
  sm: 'rounded-2xl px-3.5 py-2.5 gap-1.5',
  md: 'rounded-2xl px-4 py-3.5 gap-2',
  lg: 'rounded-[20px] px-5 py-4 gap-2.5',
};

const SIZE_TEXT: Record<ButtonSize, string> = {
  sm: 'text-sm font-bold',
  md: 'text-base font-bold',
  lg: 'text-base font-extrabold tracking-tight',
};

const SHADOW: Record<ButtonVariant, ViewStyle> = {
  primary: {
    shadowColor: '#D97955',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 9,
    elevation: 3,
  },
  dark: {
    shadowColor: '#A95743',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
  outline: {
    shadowColor: '#806D62',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 1,
  },
  ghost: {},
  danger: {
    shadowColor: '#9e3b27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  dangerOutline: {
    shadowColor: '#9e3b27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
};

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon,
  rightIcon,
  className = '',
}: Props) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.set(withSpring(0.965, { damping: 16, stiffness: 320 }));
    }
  };

  const handlePressOut = () => {
    scale.set(withSpring(1, { damping: 14, stiffness: 280 }));
  };

  const iconSize = size === 'sm' ? 17 : 20;

  return (
    <View className={`w-full ${className}`}>
      <Animated.View style={[{ width: '100%' }, !isDisabled ? SHADOW[variant] : undefined, animatedStyle]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled, busy: loading }}
          className={`w-full flex-row items-center justify-center ${SIZE_BOX[size]} ${BOX[variant]} ${
            isDisabled ? 'opacity-60' : ''
          }`}
          style={{
            borderTopColor: variant === 'primary' || variant === 'dark' ? 'rgba(255,255,255,0.2)' : '#ffffff',
            borderLeftColor: variant === 'primary' || variant === 'dark' ? 'rgba(255,255,255,0.16)' : '#ffffff',
          }}
        >
          {loading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color={ICON[variant]} size="small" />
              <Text className={`${SIZE_TEXT[size]} ${TEXT[variant]}`}>Procesando...</Text>
            </View>
          ) : (
            <>
              {icon ? <Ionicons name={icon} size={iconSize} color={ICON[variant]} /> : null}
              <Text className={`${SIZE_TEXT[size]} ${TEXT[variant]}`}>{title}</Text>
              {rightIcon ? <Ionicons name={rightIcon} size={iconSize} color={ICON[variant]} /> : null}
            </>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}
