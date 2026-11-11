import { evaluarPassword } from '@/shared/lib/password';
import { Text, View } from 'react-native';

type Props = {
  password: string;
};

const BAR_COLORS = ['#ef4444', '#E9A15B', '#F3C46F', '#D97955'];

export default function PasswordStrengthBar({ password }: Props) {
  const evaluation = evaluarPassword(password);
  const percentage = password ? Math.max((evaluation.score / 4) * 100, 12) : 0;
  const label = !password
    ? 'Necesitamos una contraseña segura'
    : evaluation.valid
      ? 'Contraseña segura'
      : evaluation.score >= 3
        ? 'Casi lista'
        : 'Débil';

  const color = !password ? '#cbd5e1' : BAR_COLORS[Math.min(Math.max(evaluation.score - 1, 0), 3)];

  return (
    <View className="gap-2">
      <View className="h-2.5 w-full overflow-hidden rounded-full bg-[#F0E4DC]">
        <View
          className="h-full rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </View>
      <Text className="text-[11px] font-semibold text-[#6E625C]">{label}</Text>
    </View>
  );
}
