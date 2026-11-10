import type { ResumenCategoria } from '@/entities/sale/model/categorySummary';
import Card from '@/shared/ui/Card';
import { money } from '@/shared/lib/format';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  categorias: ResumenCategoria[];
  loading: boolean;
};

export default function CategorySalesCard({ categorias, loading }: Props) {
  const [orden, setOrden] = useState<'ingresos' | 'unidades'>('ingresos');
  const categoriasOrdenadas = useMemo(
    () =>
      [...categorias].sort(
        (a, b) =>
          b[orden] - a[orden] ||
          (orden === 'ingresos' ? b.unidades - a.unidades : b.ingresos - a.ingresos) ||
          a.categoria.localeCompare(b.categoria, 'es'),
      ),
    [categorias, orden],
  );
  const valorTotal = categoriasOrdenadas.reduce((total, categoria) => total + categoria[orden], 0);
  const valorMaximo = categoriasOrdenadas[0]?.[orden] ?? 0;

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-extrabold text-[#243b38]">Categorías que más venden</Text>
          <Text className="text-xs text-[#71817b]">Ingresos de los últimos 7 días</Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#f7efd9]">
          <Ionicons name="podium-outline" size={20} color="#9a6b19" />
        </View>
      </View>

      <View className="flex-row gap-2 rounded-2xl bg-[#f1f0e8] p-1">
        {(['ingresos', 'unidades'] as const).map((opcion) => {
          const activa = orden === opcion;
          return (
            <Pressable
              key={opcion}
              accessibilityRole="button"
              accessibilityState={{ selected: activa }}
              onPress={() => setOrden(opcion)}
              className={`flex-1 items-center rounded-xl py-2 ${
                activa ? 'bg-white' : ''
              }`}
            >
              <Text className={`text-xs font-bold ${activa ? 'text-[#16896a]' : 'text-[#71817b]'}`}>
                {opcion === 'ingresos' ? 'Por ingresos' : 'Por unidades'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <Text className="py-3 text-center text-xs font-semibold text-[#71817b]">
          Cargando ventas por categoría...
        </Text>
      ) : categorias.length === 0 ? (
        <View className="items-center gap-1 border-t border-[#eee8dc] py-4">
          <Text className="text-sm font-semibold text-[#5d706c]">Aún no hay ventas esta semana.</Text>
          <Text className="text-center text-xs text-[#879792]">
            Registra ventas para descubrir qué categorías tienen más movimiento.
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-row items-center justify-between rounded-2xl bg-[#f4efe4] px-3.5 py-3">
            <View className="flex-1">
              <Text className="text-[10px] font-bold uppercase tracking-wide text-[#71817b]">
                Categoría líder
              </Text>
              <Text className="mt-0.5 text-sm font-extrabold text-[#243b38]" numberOfLines={1}>
                {categoriasOrdenadas[0].categoria}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm font-black text-[#246b61]">
                {Math.round(
                  valorTotal > 0 ? (categoriasOrdenadas[0][orden] / valorTotal) * 100 : 0,
                )}%
              </Text>
              <Text className="text-[10px] text-[#71817b]">
                {orden === 'ingresos' ? 'de ingresos' : 'de unidades'}
              </Text>
            </View>
          </View>

          <View className="gap-3">
            {categoriasOrdenadas.slice(0, 4).map((categoria, index) => {
              const progreso = valorMaximo > 0 ? categoria[orden] / valorMaximo : 0;
              return (
                <View key={categoria.categoria} className="gap-1">
                  <View className="flex-row items-center justify-between gap-3">
                    <View className="flex-1 flex-row items-center gap-2">
                      <View
                        className={`h-6 w-6 items-center justify-center rounded-lg ${
                          index === 0 ? 'bg-[#ddf4e6]' : 'bg-[#f1f0e8]'
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-black ${
                            index === 0 ? 'text-[#16896a]' : 'text-[#71817b]'
                          }`}
                        >
                          {index + 1}
                        </Text>
                      </View>
                      <Text className="flex-1 text-xs font-bold text-[#344b47]" numberOfLines={1}>
                        {categoria.categoria}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs font-extrabold text-[#246b61]">
                        {orden === 'ingresos' ? money(categoria.ingresos) : `${categoria.unidades} un.`}
                      </Text>
                      {orden === 'unidades' ? (
                        <Text className="text-[10px] text-[#879792]">{money(categoria.ingresos)}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View className="ml-8 h-1.5 overflow-hidden rounded-full bg-[#ece6d9]">
                    <View
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-[#348a76]' : 'bg-[#aec8b5]'
                      }`}
                      style={{ width: `${Math.max(progreso * 100, 4)}%` }}
                    />
                  </View>
                  <Text className="ml-8 text-[10px] text-[#879792]">
                    {categoria.unidades} {categoria.unidades === 1 ? 'unidad' : 'unidades'} ·{' '}
                    {categoria.transacciones}{' '}
                    {categoria.transacciones === 1 ? 'venta' : 'ventas'}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </Card>
  );
}
