import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import type { Producto } from '@/shared/types';
import { money } from '@/shared/lib/format';

type Props = {
  producto: Producto;
  onEdit: () => void;
  onDelete: () => void;
};

export function colorStock(producto: Producto) {
  if (producto.stock <= producto.stock_minimo) {
    return producto.stock === 0
      ? { dot: '#e26756', bg: '#fff0ec', text: '#b9463d', label: 'Agotado' }
      : { dot: '#e39a26', bg: '#fff5dd', text: '#9d6811', label: 'Stock bajo' };
  }
  return { dot: '#1a9c70', bg: '#e2f5e9', text: '#137656', label: 'Disponible' };
}

export default function ProductoCard({ producto, onEdit, onDelete }: Props) {
  const estado = colorStock(producto);

  return (
    <View
      className="flex-row items-center gap-3 rounded-[22px] border border-white bg-[#fffefa] p-3"
      style={{
        shadowColor: '#314b3f',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      {producto.foto_url ? (
        <Image
          source={{ uri: producto.foto_url }}
          contentFit="cover"
          style={{ width: 58, height: 58, borderRadius: 16 }}
        />
      ) : (
        <View className="h-[58px] w-[58px] items-center justify-center rounded-2xl bg-[#e6f0e9]">
          <Ionicons name="cube-outline" size={24} color="#348a76" />
        </View>
      )}

      <View className="min-w-0 flex-1 gap-1">
        <Text className="text-sm font-extrabold text-[#243b38]" numberOfLines={1}>
          {producto.nombre}
        </Text>
        <Text className="text-xs text-[#71817b]" numberOfLines={1}>
          {producto.categoria || 'Sin categoría'} · {money(producto.precio_venta)}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: estado.dot }} />
          <Text className="text-[11px] font-bold" style={{ color: estado.text }}>
            {estado.label} · {producto.stock} un.
          </Text>
        </View>
      </View>

      <View className="flex-row gap-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar ${producto.nombre}`}
          onPress={onEdit}
          className="h-9 w-9 items-center justify-center rounded-xl bg-[#eef5f0]"
        >
          <Ionicons name="create-outline" size={17} color="#246b61" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${producto.nombre}`}
          onPress={onDelete}
          className="h-9 w-9 items-center justify-center rounded-xl bg-[#fdf3f0]"
        >
          <Ionicons name="trash-outline" size={16} color="#b84c37" />
        </Pressable>
      </View>
    </View>
  );
}
