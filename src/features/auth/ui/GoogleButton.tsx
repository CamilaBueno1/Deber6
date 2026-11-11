import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

type Props = {
  title?: string;
  loading?: boolean;
  onPress: () => void;
};

export default function GoogleButton({ title = 'Continuar con Google', loading = false, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="flex-row items-center justify-center gap-2.5 rounded-2xl border border-[#EFE3DA] bg-white py-3.5"
      style={{ opacity: loading ? 0.7 : 1 }}
    >
      <Ionicons name="logo-google" size={19} color="#ea4335" />
      <Text className="text-sm font-bold text-[#493A36]">{title}</Text>
    </Pressable>
  );
}
