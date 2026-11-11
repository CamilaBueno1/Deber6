import { registrarVentaCarrito } from '@/entities/sale/api/ventas';
import { categoriasDeInventario } from '@/entities/product/model/categories';
import { useNegocio } from '@/features/business-management/model/NegocioContext';
import { colorStock } from '@/features/product-management/ui/ProductoCard';
import VentaExitosaModal from '@/features/product-management/ui/VentaExitosaModal';
import { useCart } from '@/features/cart/model/useCart';
import { useStockData } from '@/widgets/product-overview/model/useStockData';
import { hoy } from '@/shared/lib/date';
import { claveCategoria, nombreCategoria } from '@/shared/lib/category';
import { money } from '@/shared/lib/format';
import { showError } from '@/shared/lib/notify';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import EmptyState from '@/shared/ui/EmptyState';
import Header from '@/widgets/app-header/ui/Header';
import SectionEntrance from '@/shared/ui/SectionEntrance';
import SectionLottie from '@/shared/ui/SectionLottie';
import Input from '@/shared/ui/Input';
import type { MetodoPagoVenta, Producto, Venta } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

function crearTicketId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (caracter) => {
    const aleatorio = Math.floor(Math.random() * 16);
    const valor = caracter === 'x' ? aleatorio : (aleatorio & 0x3) | 0x8;
    return valor.toString(16);
  });
}

export default function VenderScreen() {
  const router = useRouter();
  const { selected } = useNegocio();
  const { productos, loading, recargar } = useStockData(selected?.id);
  const cart = useCart();
  const [ticketAbierto, setTicketAbierto] = useState(false);
  const [cliente, setCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPagoVenta>('efectivo');
  const [guardando, setGuardando] = useState(false);
  const [ventaExitosa, setVentaExitosa] = useState<Venta[] | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const ticketId = useRef<string | null>(null);

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
  const cantidades = useMemo(
    () => new Map(cart.items.map((item) => [item.producto.id, item.cantidad])),
    [cart.items],
  );

  const agregarProducto = (producto: Producto) => {
    cart.agregar(producto);
    ticketId.current = null;
  };

  const confirmarVenta = async () => {
    if (!selected || cart.items.length === 0) return;
    setGuardando(true);
    try {
      const idempotencyKey = ticketId.current ?? crearTicketId();
      ticketId.current = idempotencyKey;
      const ventas = await registrarVentaCarrito(
        selected.id,
        idempotencyKey,
        cart.items.map((item) => ({ productoId: item.producto.id, cantidad: item.cantidad })),
        hoy(),
        cliente.trim() || null,
        metodoPago,
      );
      setTicketAbierto(false);
      setVentaExitosa(ventas);
      cart.vaciar();
      ticketId.current = null;
      setCliente('');
      setMetodoPago('efectivo');
      await recargar();
    } catch (error) {
      showError(error, 'No pudimos registrar el ticket');
    } finally {
      setGuardando(false);
    }
  };

  if (!selected) {
    return (
      <View className="flex-1 bg-[#FFFAF5]">
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
    <View className="flex-1 bg-[#FFFAF5]">
      <Header
        eyebrow={selected.nombre}
        title="Vender"
        rightAction={{
          label: 'Inventario',
          icon: 'cube-outline',
          onPress: () => router.push('/inventario'),
        }}
      />
      <ScrollView
        contentContainerClassName="gap-4 p-4 pb-24"
        showsVerticalScrollIndicator={false}
      >
        <SectionLottie
          variant="sales"
          title="Arma un ticket"
          caption="Toca varios productos y ajusta las cantidades antes de cobrar."
        />
        <View className="flex-row items-center gap-3 rounded-2xl border border-[#e7d8c8] bg-[#fff7ed] px-4 py-3">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#f0dfcf]">
            <Ionicons name="cart-outline" size={18} color="#9b5b3e" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-[#654332]">Toca para agregar al ticket</Text>
            <Text className="text-xs text-[#806d62]">
              Puedes incluir varios productos y guardar el nombre del cliente.
            </Text>
          </View>
        </View>

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
                  ? 'border-[#9b5b3e] bg-[#9b5b3e]'
                  : 'border-[#EFE3DA] bg-[#FFFFFF]'
              }`}
            >
              <Text className={`text-xs font-bold ${categoriaActiva === null ? 'text-white' : 'text-[#6E625C]'}`}>
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
                    activa ? 'border-[#9b5b3e] bg-[#9b5b3e]' : 'border-[#EFE3DA] bg-[#FFFFFF]'
                  }`}
                >
                  <Text className={`text-xs font-bold ${activa ? 'text-white' : 'text-[#6E625C]'}`}>
                    {categoria} · {cantidadCategoria}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {loading && productos.length === 0 ? (
          <Card delay={80} className="items-center py-8">
            <Text className="text-sm font-semibold text-[#756B65]">Cargando productos...</Text>
          </Card>
        ) : productos.length === 0 ? (
          <Card>
            <EmptyState
              title="Agrega productos para vender"
              message="Crea tu inventario y los productos aparecerán aquí."
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
        ) : productosFiltrados.length === 0 ? (
          <Card>
            <EmptyState
              title="No hay productos en esta categoría"
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
              const enTicket = cantidades.get(producto.id) ?? 0;
              return (
                <SectionEntrance
                  key={producto.id}
                  delay={Math.min(index * 35, 280)}
                  style={{ width: '48.5%' }}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Agregar ${producto.nombre} al ticket, quedan ${producto.stock}`}
                    onPress={() => agregarProducto(producto)}
                    className="w-full overflow-hidden rounded-[26px] border border-white bg-[#FFFFFF] active:opacity-80"
                    style={{
                      shadowColor: '#806d62',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.13,
                      shadowRadius: 12,
                      elevation: 3,
                    }}
                  >
                    {producto.foto_url ? (
                      <Image
                        source={{ uri: producto.foto_url }}
                        contentFit="cover"
                        style={{ width: '100%', height: 120 }}
                      />
                    ) : (
                      <View className="h-[120px] items-center justify-center bg-[#f6e8d8]">
                        <Ionicons name="cube-outline" size={36} color="#9b5b3e" />
                      </View>
                    )}
                    {enTicket > 0 ? (
                      <View className="absolute right-2 top-2 h-8 min-w-8 items-center justify-center rounded-full bg-[#9b5b3e] px-2">
                        <Text className="text-xs font-black text-white">{enTicket}</Text>
                      </View>
                    ) : null}
                    <View className="gap-1.5 p-3">
                      <Text className="text-sm font-extrabold text-[#493A36]" numberOfLines={1}>
                        {producto.nombre}
                      </Text>
                      <Text className="text-base font-black text-[#9b5b3e]">
                        {money(producto.precio_venta)}
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[11px] text-[#756B65]" numberOfLines={1}>
                          {nombreCategoria(producto.categoria)}
                        </Text>
                        <Text className="text-[11px] font-bold" style={{ color: estado.text }}>
                          {producto.stock} un.
                        </Text>
                      </View>
                      <View className="mt-1 flex-row items-center justify-center gap-1 rounded-xl bg-[#fff7ed] py-2">
                        <Ionicons name="add-circle-outline" size={16} color="#9b5b3e" />
                        <Text className="text-xs font-bold text-[#9b5b3e]">Agregar</Text>
                      </View>
                    </View>
                  </Pressable>
                </SectionEntrance>
              );
            })}
          </View>
        )}
      </ScrollView>

      {cart.cantidadTotal > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir ticket con ${cart.cantidadTotal} productos, total ${money(cart.total)}`}
          onPress={() => setTicketAbierto(true)}
          className="absolute bottom-3 left-4 right-4 flex-row items-center justify-between rounded-2xl bg-[#A95743] px-4 py-3.5"
          style={{
            shadowColor: '#543122',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.24,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Ionicons name="receipt-outline" size={18} color="#ffffff" />
            </View>
            <View>
              <Text className="text-sm font-extrabold text-white">
                {cart.cantidadTotal} {cart.cantidadTotal === 1 ? 'ítem' : 'ítems'} · {money(cart.total)}
              </Text>
              <Text className="text-xs text-[#f4dfcf]">{cart.items.length} productos distintos · Ver ticket</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color="#f4dfcf" />
        </Pressable>
      ) : null}

      <Modal
        visible={ticketAbierto}
        transparent
        animationType="slide"
        onRequestClose={() => setTicketAbierto(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[90%] gap-4 rounded-t-[30px] border border-white bg-[#FFFFFF] p-5 pb-8">
            <View className="mx-auto h-1.5 w-12 rounded-full bg-[#ddd5c7]" />
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-extrabold text-[#493A36]">Ticket de venta</Text>
                <Text className="text-sm text-[#756B65]">
                  {cart.items.length} {cart.items.length === 1 ? 'producto' : 'productos'} distintos
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar ticket"
                onPress={() => setTicketAbierto(false)}
                className="h-11 w-11 items-center justify-center rounded-full bg-[#F8EDE0]"
              >
                <Ionicons name="close" size={19} color="#6E625C" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[42%]" keyboardShouldPersistTaps="always">
              <View className="gap-2">
                {cart.items.map((item) => (
                  <View
                    key={item.producto.id}
                    className="flex-row items-center gap-3 rounded-2xl border border-[#eee4d9] bg-white p-3"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-[#342b28]" numberOfLines={1}>
                        {item.producto.nombre}
                      </Text>
                      <Text className="text-xs text-[#756b65]">
                        {money(item.producto.precio_venta)} c/u · {money(item.producto.precio_venta * item.cantidad)}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Quitar una unidad de ${item.producto.nombre}`}
                      onPress={() => {
                        cart.cambiarCantidad(item.producto.id, item.cantidad - 1);
                        ticketId.current = null;
                      }}
                      className="h-11 w-11 items-center justify-center rounded-xl bg-[#f6e8d8]"
                    >
                      <Ionicons name="remove" size={19} color="#A95743" />
                    </Pressable>
                    <Text className="w-6 text-center text-base font-black text-[#342b28]">
                      {item.cantidad}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Agregar una unidad de ${item.producto.nombre}`}
                      disabled={item.cantidad >= item.producto.stock}
                      onPress={() => {
                        cart.cambiarCantidad(item.producto.id, item.cantidad + 1);
                        ticketId.current = null;
                      }}
                      className={`h-11 w-11 items-center justify-center rounded-xl bg-[#f6e8d8] ${
                        item.cantidad >= item.producto.stock ? 'opacity-40' : ''
                      }`}
                    >
                      <Ionicons name="add" size={19} color="#A95743" />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Eliminar ${item.producto.nombre} del ticket`}
                      onPress={() => {
                        cart.quitar(item.producto.id);
                        ticketId.current = null;
                      }}
                      className="h-11 w-11 items-center justify-center"
                    >
                      <Ionicons name="trash-outline" size={18} color="#b84c37" />
                    </Pressable>
                  </View>
                ))}
              </View>
            </ScrollView>

            <Input
              label="Cliente (opcional)"
              icon="person-outline"
              placeholder="Nombre para identificar el ticket"
              autoCapitalize="words"
              value={cliente}
              onChangeText={setCliente}
            />
            <View className="gap-2">
              <Text className="text-xs font-bold uppercase tracking-wider text-[#6E625C]">
                Método de pago
              </Text>
              <View className="flex-row gap-2">
                {([
                  { valor: 'efectivo', etiqueta: 'Efectivo', icono: 'cash-outline' },
                  { valor: 'transferencia', etiqueta: 'Transferencia', icono: 'swap-horizontal-outline' },
                ] as const).map((opcion) => {
                  const activo = metodoPago === opcion.valor;
                  return (
                    <Pressable
                      key={opcion.valor}
                      accessibilityRole="button"
                      accessibilityState={{ selected: activo }}
                      onPress={() => {
                        setMetodoPago(opcion.valor);
                        ticketId.current = null;
                      }}
                      className={`min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl border ${
                        activo ? 'border-[#9B5B3E] bg-[#FCE5D8]' : 'border-[#EFE3DA] bg-white'
                      }`}
                    >
                      <Ionicons
                        name={opcion.icono}
                        size={18}
                        color={activo ? '#9B5B3E' : '#756B65'}
                      />
                      <Text className={`text-xs font-bold ${activo ? 'text-[#A95743]' : 'text-[#756B65]'}`}>
                        {opcion.etiqueta}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text className="text-[11px] leading-4 text-[#756B65]">
                Las transferencias cuentan como venta, pero no aumentan el efectivo físico de la caja.
              </Text>
            </View>
            <View className="flex-row items-center justify-between rounded-2xl bg-[#fff7ed] px-4 py-3">
              <Text className="text-sm font-semibold text-[#6e625c]">Total del ticket</Text>
              <Text className="text-xl font-black text-[#A95743]">{money(cart.total)}</Text>
            </View>
            <Button
              title="Registrar venta"
              icon="checkmark-circle-outline"
              onPress={confirmarVenta}
              loading={guardando}
              disabled={cart.items.length === 0}
            />
          </View>
        </View>
      </Modal>

      <VentaExitosaModal venta={ventaExitosa} onClose={() => setVentaExitosa(null)} />
    </View>
  );
}
