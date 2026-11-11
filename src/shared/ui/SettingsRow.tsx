import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export default function SettingsRow({ icon, color, title, subtitle, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-[22px] border border-[#EFE4DD] bg-[#FFFFFF] px-3.5 py-3"
    >
      <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}22` }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-[#493A36]">{title}</Text>
        <Text className="text-xs text-[#756B65]">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#A99389" />
    </Pressable>
  );
}
