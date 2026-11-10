import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Text, View } from 'react-native';
import Button from './Button';

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  size?: number;
  icon?: keyof typeof Ionicons.glyphMap;
};

export default function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  size = 148,
  icon = 'sparkles-outline',
}: Props) {
  return (
    <View className="items-center gap-2 py-4">
      <View>
        <View
          style={{ width: size, height: size * 0.85 }}
          className="relative items-center justify-center rounded-full bg-[#f2ede0]/70"
        >
          <LottieView
            source={require('../../../assets/lottie/empty.json')}
            autoPlay
            loop
            style={{ width: size, height: size * 0.85 }}
            webStyle={{ width: size, height: size * 0.85 }}
          />
          <View className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full border-2 border-[#fffcf6] bg-[#e6f0e9]">
            <Ionicons name={icon} size={18} color="#246b61" />
          </View>
        </View>
      </View>
      <Text className="mt-1 text-center text-lg font-extrabold text-[#193d35]">{title}</Text>
      <Text className="mb-2 max-w-xs px-3 text-center text-sm leading-5 text-[#71817b]">{message}</Text>
      {actionLabel && onAction ? (
        <Button title={actionLabel} icon="add-circle-outline" onPress={onAction} />
      ) : null}
    </View>
  );
}
