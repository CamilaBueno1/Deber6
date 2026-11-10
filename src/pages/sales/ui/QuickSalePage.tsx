import VentaExitosaModal from '@/features/product-management/ui/VentaExitosaModal';
import { colorStock } from '@/features/product-management/ui/ProductoCard';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import EmptyState from '@/shared/ui/EmptyState';
import Header from '@/widgets/app-header/ui/Header';
import SectionEntrance from '@/shared/ui/SectionEntrance';
import SectionLottie from '@/shared/ui/SectionLottie';
import { useNegocio } from '@/features/business-management/model/NegocioContext';
import { useStockData } from '@/widgets/product-overview/model/useStockData';
import { hoy } from '@/shared/lib/date';
import { money } from '@/shared/lib/format';
import { showError } from '@/shared/lib/notify';
import { registrarVenta } from '@/entities/sale/api/ventas';
import { categoriasDeInventario } from '@/entities/product/model/categories';
import { claveCategoria, nombreCategoria } from '@/shared/lib/category';
import type { Producto, Venta } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

export default function VenderScreen() {
  const router = useRouter();
  const { selected } = useNegocio();
  const { productos, loading, recargar } = useStockData(selected?.id);
  const [productoActivo, setProductoActivo] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [ventaExitosa, setVentaExitosa] = useState<Venta | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const disponibles = useMemo(
    () => productos.filter((producto) => producto.stock > 0),
    [productos],
  );
  const categorias = useMemo(() => categoriasDeInventario(disponibles), [disponibles]);
  const productosFiltrados = useMemo(
    () =>
      categoriaActiva
        ? disponibles.filter((producto) => claveCategoria(producto.categoria) === categoriaActiva)
        : disponibles,
    [categoriaActiva, disponibles],
  );

  const abrirVenta = (producto: Producto) => {
    setProductoActivo(producto);
    setCantidad(1);
  };

  const confirmarVenta = async () => {
    if (!productoActivo) return;
    setGuardando(true);
    try {
      const venta = await registrarVenta(productoActivo.id, cantidad, hoy());
      setProductoActivo(null);
      setVentaExitosa(venta);
      await recargar();
    } catch (error) {
      showError(error, 'No pudimos registrar la venta');
    } finally {
      setGuardando(false);
    }
  };

  if (!selected) {
    return (
      <View className="flex-1 bg-[#f3f8f2]">
        <Header eyebrow="StockYa" title="Vender rápido" />
        <View className="p-4">
          <Card>
            <EmptyState
              title="Crea tu tienda primero"
              message="Agrega un negocio y tus productos para empezar a vender."
              actionLabel="Crear negocio"
              icon="storefront-outline"
              onAction={() => router.push('/negocios')}
            />
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f3f8f2]">
      <Header
        eyebrow={selected.nombre}
        title="Vender rápido"
        rightAction={{
          label: 'Stock',
          icon: 'cube-outline',
          onPress: () => router.push('/inventario'),
        }}
      />
      <ScrollView
        contentContainerClassName="gap-4 p-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <SectionLottie
          variant="sales"
          title="Una venta, un toque"
          caption="Elige un producto y registra la venta al instante."
        />

        <SectionEntrance delay={40}>
        <View className="flex-row items-center gap-3 rounded-2xl border border-[#bfe7d2] bg-[#e2f5e9] px-4 py-3">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#16896a]">
            <Ionicons name="hand-left-outline" size={18} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-[#1f574f]">Toca un producto para vender</Text>
            <Text className="text-xs text-[#4e6b65]">Elige la cantidad y el stock se descuenta solo.</Text>
          </View>
        </View>
        </SectionEntrance>

        {disponibles.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: categoriaActiva === null }}
            onPress={() => setCategoriaActiva(null)}
            className={`rounded-full border px-3.5 py-2 ${
              categoriaActiva === null
                ? 'border-[#16896a] bg-[#16896a]'
                : 'border-[#e5e8df] bg-[#fffefa]'
            }`}
          >
            <Text className={`text-xs font-bold ${categoriaActiva === null ? 'text-white' : 'text-[#5d706c]'}`}>
              Todas · {disponibles.length}
            </Text>
          </Pressable>
          {categorias.map((categoria) => {
            const clave = claveCategoria(categoria);
            const activa = categoriaActiva === clave;
            const cantidadCategoria = disponibles.filter(
              (producto) => claveCategoria(producto.categoria) === clave,
            ).length;
            return (
              <Pressable
                key={clave}
                accessibilityRole="button"
                accessibilityState={{ selected: activa }}
                onPress={() => setCategoriaActiva(clave)}
                className={`rounded-full border px-3.5 py-2 ${
                  activa ? 'border-[#16896a] bg-[#16896a]' : 'border-[#e5e8df] bg-[#fffefa]'
                }`}
              >
                <Text className={`text-xs font-bold ${activa ? 'text-white' : 'text-[#5d706c]'}`}>
                  {categoria} · {cantidadCategoria}
                </Text>
              </Pressable>
            );
          })}
          </ScrollView>
        ) : null}

        {loading && productos.length === 0 ? (
          <Card delay={80} className="items-center py-8">
            <Text className="text-sm font-semibold text-[#71817b]">Cargando productos...</Text>
          </Card>
        ) : productos.length === 0 ? (
          <Card>
            <EmptyState
              title="Agrega productos para vender"
              message="Crea tu inventario y los productos aparecerán aquí en una cuadrícula rápida."
              actionLabel="Ir al inventario"
              icon="cube-outline"
              onAction={() => router.push('/inventario')}
            />
          </Card>
        ) : disponibles.length === 0 ? (
          <Card>
            <EmptyState
              title="No hay productos disponibles"
              message="Repón el stock de tus productos para volver a vender."
              actionLabel="Revisar inventario"
              icon="alert-circle-outline"
              onAction={() => router.push('/inventario')}
            />
          </Card>
        ) : (
          productosFiltrados.length === 0 ? (
            <Card>
              <EmptyState
                title="No hay productos con stock en esta categoría"
                message="Elige otra categoría para seguir vendiendo."
                actionLabel="Ver todos los productos"
                icon="albums-outline"
                onAction={() => setCategoriaActiva(null)}
              />
            </Card>
          ) : (
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {productosFiltrados.map((producto, index) => {
              const estado = colorStock(producto);
              return (
                <SectionEntrance
                  key={producto.id}
                  delay={Math.min(index * 35, 280)}
                  style={{ width: '48.5%' }}
                >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Vender ${producto.nombre}, quedan ${producto.stock}`}
                  onPress={() => abrirVenta(producto)}
                  className="w-full overflow-hidden rounded-[26px] border border-white bg-[#fffefa] active:opacity-80"
                  style={{
                    shadowColor: '#51745f',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.18,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  {producto.foto_url ? (
                    <Image
                      source={{ uri: producto.foto_url }}
                      contentFit="cover"
                      style={{ width: '100%', height: 120 }}
                    />
                  ) : (
                    <View className="h-[120px] items-center justify-center bg-[#ddf4e6]">
                      <Ionicons name="cube-outline" size={36} color="#16896a" />
                    </View>
                  )}
                  <View className="gap-1.5 p-3">
                    <Text className="text-sm font-extrabold text-[#243b38]" numberOfLines={1}>
                      {producto.nombre}
                    </Text>
                    <Text className="text-base font-black text-[#16896a]">
                      {money(producto.precio_venta)}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[11px] text-[#71817b]" numberOfLines={1}>
                        {nombreCategoria(producto.categoria)}
                      </Text>
                      <Text className="text-[11px] font-bold" style={{ color: estado.text }}>
                        {producto.stock} un.
                      </Text>
                    </View>
                  </View>
                </Pressable>
                </SectionEntrance>
              );
            })}
          </View>
          )
        )}
      </ScrollView>

      <Modal
        visible={productoActivo !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setProductoActivo(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="gap-4 rounded-t-[30px] border border-white bg-[#fffefa] p-5 pb-8">
            <View className="mx-auto h-1.5 w-12 rounded-full bg-[#ddd5c7]" />
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xl font-extrabold text-[#243b38]" numberOfLines={1}>
                  {productoActivo?.nombre}
                </Text>
                <Text className="text-sm text-[#71817b]">
                  {productoActivo ? money(productoActivo.precio_venta) : ''}
                  {' · '}Disponibles: {productoActivo?.stock ?? 0}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                onPress={() => setProductoActivo(null)}
                className="h-9 w-9 items-center justify-center rounded-full bg-[#f4efe4]"
              >
                <Ionicons name="close" size={18} color="#5d706c" />
              </Pressable>
            </View>

            <View className="flex-row items-center justify-center gap-8 py-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Restar una unidad"
                disabled={cantidad <= 1}
                onPress={() => setCantidad((actual) => Math.max(actual - 1, 1))}
                className={`h-14 w-14 items-center justify-center rounded-2xl border border-[#fffef8] bg-[#e7e4da] ${
                  cantidad <= 1 ? 'opacity-40' : ''
                }`}
              >
                <Ionicons name="remove" size={26} color="#246b61" />
              </Pressable>
              <View className="items-center">
                <Text className="text-4xl font-black text-[#243b38]">{cantidad}</Text>
                <Text className="text-xs font-semibold text-[#71817b]">unidades</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sumar una unidad"
                disabled={cantidad >= (productoActivo?.stock ?? 0)}
                onPress={() =>
                  setCantidad((actual) =>
                    Math.min(actual + 1, productoActivo?.stock ?? actual)
                  )
                }
                className={`h-14 w-14 items-center justify-center rounded-2xl border border-[#fffef8] bg-[#e7e4da] ${
                  cantidad >= (productoActivo?.stock ?? 0) ? 'opacity-40' : ''
                }`}
              >
                <Ionicons name="add" size={26} color="#246b61" />
              </Pressable>
            </View>

            <View className="flex-row items-center justify-between rounded-2xl bg-[#f4efe4] px-4 py-3">
              <Text className="text-sm font-semibold text-[#5d706c]">Total de la venta</Text>
              <Text className="text-xl font-black text-[#246b61]">
                {money((productoActivo?.precio_venta ?? 0) * cantidad)}
              </Text>
            </View>
            <Button
              title="Registrar venta"
              icon="checkmark-circle-outline"
              onPress={confirmarVenta}
              loading={guardando}
              disabled={!productoActivo || cantidad > (productoActivo?.stock ?? 0)}
            />
          </View>
        </View>
      </Modal>

      <VentaExitosaModal venta={ventaExitosa} onClose={() => setVentaExitosa(null)} />
    </View>
  );
}
