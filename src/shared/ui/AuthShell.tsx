import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { ReactNode, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  showWelcomeAnimation?: boolean;
};

export default function AuthShell({
  title,
  subtitle,
  children,
  showWelcomeAnimation = true,
}: Props) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = Platform.OS === 'web' && width >= 900;
  const compact = height < 760 && !wide;

  const heroOpacity = useSharedValue(1);
  const heroTranslateY = useSharedValue(-10);
  const cardOpacity = useSharedValue(1);
  const cardTranslateY = useSharedValue(12);

  useEffect(() => {
    heroOpacity.set(withTiming(1, { duration: 300 }));
    heroTranslateY.set(withSpring(0, { damping: 16, stiffness: 180 }));

    cardOpacity.set(withDelay(80, withTiming(1, { duration: 320 })));
    cardTranslateY.set(withDelay(80, withSpring(0, { damping: 17, stiffness: 170 })));
  }, [cardOpacity, cardTranslateY, heroOpacity, heroTranslateY]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.get(),
    transform: [{ translateY: heroTranslateY.get() }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.get(),
    transform: [{ translateY: cardTranslateY.get() }],
  }));
  return (
    <View className="flex-1 overflow-hidden bg-[#FFFAF5]">
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -54,
          top: 100,
          width: 170,
          height: 170,
          borderRadius: 85,
          backgroundColor: 'rgba(184,111,75,0.08)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: -42,
          bottom: 80,
          width: 128,
          height: 128,
          borderRadius: 64,
          backgroundColor: 'rgba(241,124,91,0.08)',
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: compact ? 16 : 24,
            paddingVertical: compact ? 16 : 28,
            paddingTop: Math.max(insets.top, 12) + (compact ? 8 : 16),
          }}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View
            className={`w-full ${wide ? 'flex-row items-stretch' : 'flex-col'} ${compact ? 'gap-3' : 'gap-4'}`}
            style={{ maxWidth: wide ? 1040 : 460, gap: wide ? 24 : undefined }}
          >
            {showWelcomeAnimation ? (
              <Animated.View
                style={[
                  heroStyle,
                  wide ? { flex: 0.72, alignSelf: 'center' } : undefined,
                ]}
              >
                <View
                  style={{
                    borderRadius: wide ? 28 : 24,
                    paddingHorizontal: wide ? 18 : 14,
                    paddingVertical: wide ? 16 : compact ? 10 : 12,
                    position: 'relative',
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#ffffff',
                    backgroundColor: '#fbfaf5',
                    shadowColor: '#806D62',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.08,
                    shadowRadius: 20,
                    elevation: 3,
                  }}
                >
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      right: -20,
                      top: -30,
                      width: 130,
                      height: 130,
                      borderRadius: 999,
                      backgroundColor: 'rgba(184, 111, 75, 0.07)',
                    }}
                  />
                  <View className="flex-row items-center justify-between gap-1">
                    <View className="flex-1 gap-1">
                      <View className="flex-row items-center gap-2">
                        <View
                          className={`${compact ? 'h-9 w-9 rounded-xl' : 'h-10 w-10 rounded-[14px]'} items-center justify-center bg-[#FCE5D8]`}
                          style={{
                            borderWidth: 1,
                            borderColor: '#E7CDBA',
                          }}
                        >
                          <Ionicons
                            name="storefront"
                            size={compact ? 18 : 21}
                            color="#D97955"
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            numberOfLines={1}
                            className={`${wide ? 'text-[27px]' : compact ? 'text-[21px]' : 'text-[24px]'} font-extrabold tracking-tight text-[#493A36]`}
                            style={{
                              fontFamily: Platform.select({
                                ios: 'Georgia',
                                android: 'serif',
                                default: 'Georgia',
                              }),
                              lineHeight: wide ? 33 : compact ? 26 : 29,
                            }}
                          >
                            Stock<Text className="text-[#D97955]">Ya</Text>
                          </Text>
                          <Text className="text-[9px] font-bold uppercase tracking-[1.1px] text-[#756B65]">
                            Tu tienda, en orden
                          </Text>
                        </View>
                      </View>
                      <Text
                        className={`${wide ? 'text-xs leading-[17px]' : 'text-[10px] leading-[14px]'} text-[#756B65]`}
                      >
                        Vende rápido. Controla tu stock.
                      </Text>
                    </View>
                    <LottieView
                      source={require('../../../assets/lottie/welcome.json')}
                      autoPlay
                      loop
                      resizeMode="contain"
                      style={{
                        width: wide ? 142 : 118,
                        height: wide ? 116 : 98,
                      }}
                      webStyle={{
                        width: wide ? 142 : 118,
                        height: wide ? 116 : 98,
                      }}
                    />
                  </View>
                </View>
              </Animated.View>
            ) : null}

            <Animated.View style={[cardStyle, wide ? { flex: 1.28 } : undefined]}>
              <View
                className={`rounded-[30px] border border-white bg-[#FFFFFF] ${
                  compact ? 'gap-3 p-4' : wide ? 'gap-3.5 p-6' : 'gap-3.5 p-5'
                }`}
                style={{
                  shadowColor: '#806D62',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.09,
                  shadowRadius: 24,
                  elevation: 4,
                  justifyContent: 'center',
                }}
              >
                <View className="gap-1 pb-1">
                  <Text
                    className={`${
                      compact ? 'text-[24px]' : 'text-[28px]'
                    } font-bold tracking-tight text-[#493A36]`}
                    style={{
                      fontFamily: Platform.select({
                        ios: 'Georgia',
                        android: 'serif',
                        default: 'Georgia',
                      }),
                    }}
                  >
                    {title}
                  </Text>
                  <Text className="text-sm leading-5 text-[#756B65]">{subtitle}</Text>
                </View>

                {children}
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
