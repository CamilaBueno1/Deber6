import { TIPOS } from '@/shared/config/movimientos';
import { money } from '@/shared/lib/format';
import type { Movimiento } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Card from '@/shared/ui/Card';

export default function RecentMovements({ movimientos }: { movimientos: Movimiento[] }) {
  const router = useRouter();

  return (
    <Card delay={240} className="gap-1">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-base font-bold text-[#243b38]">Últimos movimientos</Text>
        <Pressable
          onPress={() => router.push('/caja')}
          className="flex-row items-center gap-1 rounded-full bg-[#e6f0e9] px-3 py-1 active:opacity-75"
        >
          <Text className="text-xs font-bold text-[#246b61]">Ir a Caja</Text>
          <Ionicons name="arrow-forward" size={13} color="#246b61" />
        </Pressable>
      </View>
      {movimientos.length === 0 ? (
        <View className="items-center gap-2 py-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#f4efe4]">
            <Ionicons name="receipt-outline" size={20} color="#879792" />
          </View>
          <Text className="text-center text-sm text-[#71817b]">
            Aún no registras movimientos. Ve a la pestaña Caja para empezar.
          </Text>
        </View>
      ) : (
        movimientos.slice(0, 5).map((m, idx, arr) => {
          const t = TIPOS[m.tipo];
          const isLast = idx === arr.length - 1;
          return (
            <View
              key={m.id}
              className={`flex-row items-center gap-3 py-3 ${!isLast ? 'border-b border-[#ece6da]' : ''}`}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: t.color + '20' }}
              >
                <Ionicons name={t.icon} size={18} color={t.color} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-[#243b38]" numberOfLines={1}>
                  {m.concepto}
                </Text>
                <Text className="text-xs text-[#879792]">
                  {m.fecha} · {t.label}
                  {m.cliente ? ` · ${m.cliente}` : ''}
                </Text>
              </View>
              <Text className="text-base font-extrabold" style={{ color: t.color }}>
                {t.signo}
                {money(m.monto)}
              </Text>
            </View>
          );
        })
      )}
    </Card>
  );
}
