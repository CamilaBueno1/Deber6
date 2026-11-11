import { colors } from '@/shared/config/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { type ColorValue, Platform, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

function AnimatedTabIcon({
  name,
  focusedName,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focusedName: keyof typeof Ionicons.glyphMap;
  color: ColorValue;
  focused: boolean;
}) {
  const scale = useSharedValue(focused ? 1.08 : 1);

  useEffect(() => {
    scale.set(withSpring(focused ? 1.1 : 1, { damping: 13, stiffness: 240 }));
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        className={`h-8 w-12 items-center justify-center rounded-full ${
          focused ? 'bg-[#FCE5D8]' : ''
        }`}
      >
        <Ionicons
          name={focused ? focusedName : name}
          color={focused ? colors.brand : color}
          size={20}
        />
      </View>
    </Animated.View>
  );
}

const icono = (
  name: keyof typeof Ionicons.glyphMap,
  focusedName: keyof typeof Ionicons.glyphMap,
) => {
  const TabIcon = ({ color, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <AnimatedTabIcon name={name} focusedName={focusedName} color={color} focused={focused} />
  );
  TabIcon.displayName = `TabIcon_${name}`;
  return TabIcon;
};

export default function AppLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
          tabBarItemStyle: { paddingTop: 6, paddingBottom: Platform.OS === 'ios' ? 2 : 6 },
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#F0DDD2',
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 82 : 68,
            elevation: 8,
            shadowColor: '#806D62',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Inicio', tabBarIcon: icono('analytics-outline', 'analytics') }}
        />
        <Tabs.Screen
          name="caja"
          options={{ title: 'Caja', tabBarIcon: icono('wallet-outline', 'wallet') }}
        />
        <Tabs.Screen
          name="vender"
          options={{ title: 'Vender', tabBarIcon: icono('cart-outline', 'cart') }}
        />
        <Tabs.Screen
          name="inventario"
          options={{ title: 'Inventario', tabBarIcon: icono('cube-outline', 'cube') }}
        />
        <Tabs.Screen name="negocios" options={{ href: null }} />
        <Tabs.Screen name="cambiar-password" options={{ href: null }} />
        <Tabs.Screen
          name="settings"
          options={{ title: 'Perfil', tabBarIcon: icono('person-outline', 'person') }}
        />
      </Tabs>
    </View>
  );
}
