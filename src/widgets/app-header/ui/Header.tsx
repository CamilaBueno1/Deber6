import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useEffect } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LogoutButton from '@/features/auth/ui/LogoutButton';

type Props = {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
  /** Muestra el botón de cerrar sesión en la esquina superior derecha. */
  showLogout?: boolean;
  /** Avatar con iniciales en la esquina (por ejemplo, para ir al perfil). */
  avatar?: { text: string; onPress: () => void };
  rightAction?: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    variant?: 'default' | 'danger';
  };
};

export default function Header({ title, eyebrow, children, rightAction, avatar, showLogout }: Props) {
  const insets = useSafeAreaInsets();
  const btnScale = useSharedValue(1);
  const avatarScale = useSharedValue(1);
  const titleX = useSharedValue(-10);
  const titleOpacity = useSharedValue(1);

  useEffect(() => {
    titleX.set(withSpring(0, { damping: 16, stiffness: 170 }));
    titleOpacity.set(withTiming(1, { duration: 320 }));
  }, [titleOpacity, titleX]);

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.get() }] }));
  const avatarStyle = useAnimatedStyle(() => ({ transform: [{ scale: avatarScale.get() }] }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.get(),
    transform: [{ translateX: titleX.get() }],
  }));

  const isDanger = rightAction?.variant === 'danger';

  return (
    <View
      className="bg-[#FFFAF5] px-5 pb-3.5"
      style={{ paddingTop: insets.top + 10 }}
    >
      <View className="flex-row items-center justify-between gap-3">
        <Animated.View style={[{ flex: 1 }, titleStyle]}>
          <View className="gap-0.5">
            {eyebrow ? (
              <Text className="text-[10px] font-extrabold uppercase tracking-[1.4px] text-[#D97955]">
                {eyebrow}
              </Text>
            ) : null}
            <Text
              numberOfLines={1}
              className="text-[26px] font-extrabold tracking-tight text-[#493A36]"
              style={{
                fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
              }}
            >
              {title}
            </Text>
          </View>
        </Animated.View>

        <View className="flex-row items-center gap-2">
          {rightAction ? (
            <Animated.View style={btnStyle}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={rightAction.label}
                onPress={rightAction.onPress}
                onPressIn={() => {
                  btnScale.set(withSpring(0.93, { damping: 15, stiffness: 300 }));
                }}
                onPressOut={() => {
                  btnScale.set(withSpring(1, { damping: 14, stiffness: 260 }));
                }}
                className={`h-10 flex-row items-center gap-1.5 rounded-2xl border px-3.5 ${
                  isDanger ? 'border-[#f1d0c8] bg-[#fff4f0]' : 'border-[#EFE3DA] bg-[#FFFFFF]'
                }`}
              >
                <Ionicons
                  name={rightAction.icon}
                  size={17}
                  color={                  isDanger ? '#c4533d' : '#D97955'}
                />
                <Text
                  className={`text-xs font-extrabold ${isDanger ? 'text-[#b84c37]' : 'text-[#493A36]'}`}
                >
                  {rightAction.label}
                </Text>
              </Pressable>
            </Animated.View>
          ) : null}

          {avatar ? (
            <Animated.View style={avatarStyle}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ir a mi cuenta"
                onPress={avatar.onPress}
                onPressIn={() => {
                  avatarScale.set(withSpring(0.9, { damping: 15, stiffness: 320 }));
                }}
                onPressOut={() => {
                  avatarScale.set(withSpring(1, { damping: 12, stiffness: 260 }));
                }}
                className="h-10 w-10 items-center justify-center rounded-2xl border border-white bg-[#D97955]"
                style={{
                  shadowColor: '#A95743',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.14,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <Text className="text-sm font-extrabold text-white">{avatar.text}</Text>
              </Pressable>
            </Animated.View>
          ) : null}

          {showLogout ? <LogoutButton /> : null}
        </View>
      </View>
      {children}
    </View>
  );
}
