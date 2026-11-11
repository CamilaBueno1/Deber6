import BusinessSwitcher from '@/widgets/dashboard/ui/BusinessSwitcher';
import CategorySalesCard from '@/widgets/dashboard/ui/CategorySalesCard';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import EmptyState from '@/shared/ui/EmptyState';
import Header from '@/widgets/app-header/ui/Header';
import SectionEntrance from '@/shared/ui/SectionEntrance';
import SectionLottie from '@/shared/ui/SectionLottie';
import WelcomeSplash from '@/features/auth/ui/WelcomeSplash';
import { useAuth } from '@/entities/session/model/AuthContext';
import { useNegocio } from '@/features/business-management/model/NegocioContext';
import { flags } from '@/features/auth/model/flags';
import { useStockData } from '@/widgets/product-overview/model/useStockData';
import { useCategorySales } from '@/widgets/dashboard/model/useCategorySales';
import { fechaLarga, hoy } from '@/shared/lib/date';
import { money } from '@/shared/lib/format';
import { showError } from '@/shared/lib/notify';
import { inicialesUsuario, nombreUsuario } from '@/entities/user/model/user';
import type { Producto, Venta } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

function productoEstrella(ventas: Venta[]) {
  const cantidades = new Map<string, { nombre: string; cantidad: number }>();
  for (const venta of ventas) {
    const previo = cantidades.get(venta.producto_nombre);
    cantidades.set(venta.producto_nombre, {
      nombre: venta.producto_nombre,
      cantidad: (previo?.cantidad ?? 0) + venta.cantidad,
    });
  }
  return [...cantidades.values()].sort((a, b) => b.cantidad - a.cantidad)[0] ?? null;
}

function StockBajoRow({ producto }: { producto: Producto }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/inventario')}
      className="flex-row items-center gap-3 border-t border-[#eee8dc] py-3"
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-xl ${
          producto.stock === 0 ? 'bg-[#fdf0ec]' : 'bg-[#fbf3e2]'
        }`}
      >
        <Ionicons
          name={producto.stock === 0 ? 'close-circle-outline' : 'alert-circle-outline'}
          size={18}
          color={producto.stock === 0 ? '#b84c37' : '#9a6b19'}
        />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-[#5A3D35]" numberOfLines={1}>
          {producto.nombre}
        </Text>
        <Text className="text-[11px] text-[#867A72]">
          Mínimo: {producto.stock_minimo} · Quedan: {producto.stock}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#A99389" />
    </Pressable>
  );
}

function DashboardHero({
  productosBajos,
  negocio,
  onPress,
}: {
  productosBajos: number;
  negocio: string;
  onPress: () => void;
}) {
  const badgeScale = useSharedValue(1);

  useEffect(() => {
    badgeScale.set(
      withSequence(
        withTiming(1.14, { duration: 180 }),
        withSpring(1, { damping: 12, stiffness: 180 }),
      ),
    );
  }, [badgeScale]);

  const illustrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.get() }],
  }));
  const todoEnOrden = productosBajos === 0;

  return (
    <LinearGradient
      colors={['#F7D6C3', '#FBE6C9', '#FBE9DD']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        minHeight: 150,
        overflow: 'hidden',
        borderRadius: 28,
        borderWidth: 1,
        borderColor: '#F1CDB9',
        padding: 18,
        shadowColor: '#A95743',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 15,
        elevation: 5,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -50,
          right: -26,
          width: 175,
          height: 175,
          borderRadius: 100,
          backgroundColor: 'rgba(255,255,255,0.42)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: 68,
          bottom: -54,
          width: 126,
          height: 126,
          borderRadius: 100,
          backgroundColor: 'rgba(249,194,127,0.23)',
        }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          todoEnOrden ? 'Ver inventario, todo en orden' : `Ver ${productosBajos} productos para reponer`
        }
        onPress={onPress}
        className="flex-1 flex-row items-center justify-between"
      >
        <View className="flex-1 gap-2 pr-2">
          <View className="self-start flex-row items-center gap-1.5 rounded-full border border-[#EBC7B3] bg-white/70 px-2.5 py-1">
            <View className={`h-1.5 w-1.5 rounded-full ${todoEnOrden ? 'bg-[#D97955]' : 'bg-[#E9A15B]'}`} />
            <Text className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B5147]">
              {todoEnOrden ? 'Stock bajo control' : `${productosBajos} por reponer`}
            </Text>
          </View>
          <Text className="text-[22px] font-extrabold leading-7 tracking-tight text-[#493A36]">
            Tu tienda,{'\n'}siempre en marcha.
          </Text>
          <Text className="text-xs leading-4 text-[#765F57]" numberOfLines={1}>
            {negocio} · {todoEnOrden ? 'Todo listo para vender' : 'Toca para revisar tu inventario'}
          </Text>
        </View>
        <Animated.View style={[{ marginRight: 4 }, illustrationStyle]}>
          <View
            style={{
              width: 82,
              height: 82,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.8)',
              borderRadius: 27,
              backgroundColor: '#FFF7F0',
              shadowColor: '#8B5147',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.22,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Ionicons name="storefront" size={39} color="#A95743" />
            <View
              style={{
                position: 'absolute',
                top: -5,
                right: -6,
                width: 30,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#FFF7F0',
                borderRadius: 15,
                backgroundColor: todoEnOrden ? '#FFD58F' : '#E9A15B',
              }}
            >
              <Ionicons name={todoEnOrden ? 'sparkles' : 'alert'} size={15} color="#493A36" />
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </LinearGradient>
  );
}

export default function InicioScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { selected, loading: cargandoNegocios } = useNegocio();
  const { productos, ventas, loading } = useStockData(selected?.id);
  const { categorias: categoriasVendidas, loading: cargandoCategorias } = useCategorySales(selected?.id);
  const [mostrarMeta, setMostrarMeta] = useState(false);
  const [bienvenidaCerrada, setBienvenidaCerrada] = useState(false);
  const metaCelebrada = useRef<string | null>(null);

  const ventasHoy = useMemo(() => ventas.reduce((total, venta) => total + venta.total, 0), [ventas]);
  const ganancia = useMemo(
    () =>
      ventas.reduce(
        (total, venta) => total + venta.total - venta.costo_unitario * venta.cantidad,
        0
      ),
    [ventas]
  );
  const estrella = useMemo(() => productoEstrella(ventas), [ventas]);
  const bajos = useMemo(
    () => productos.filter((producto) => producto.stock <= producto.stock_minimo),
    [productos]
  );
  const metaDiaria = selected?.meta_diaria ?? 100;
  const progreso = metaDiaria > 0 ? Math.min(ventasHoy / metaDiaria, 1) : 1;
  const excedioMeta = ventasHoy > metaDiaria && ventasHoy > 0;
  const nombre = nombreUsuario(session);
  const mostrarBienvenida = Boolean(session && !flags.welcomeShown && !bienvenidaCerrada);

  useEffect(() => {
    if (!selected || !excedioMeta) return;
    const clave = `${selected.id}-${hoy()}`;
    if (metaCelebrada.current === clave) return;
    metaCelebrada.current = clave;
    setMostrarMeta(true);
  }, [excedioMeta, selected]);

  const compartirReposicion = async () => {
    if (!selected || bajos.length === 0) return;
    const lista = bajos
      .map((producto) => `• ${producto.nombre}: pedir ${Math.max(producto.stock_minimo - producto.stock, 1)}`)
      .join('\n');
    try {
      await Share.share({
        title: `Reposición para ${selected.nombre}`,
        message: `Lista de reposición — ${selected.nombre}\n\n${lista}`,
      });
    } catch (error) {
      showError(error, 'No pudimos compartir la lista de reposición');
    }
  };

  return (
    <View className="flex-1 bg-[#FFFAF5]">
      <Header
        eyebrow={fechaLarga()}
        title={`Hola, ${nombre}`}
        avatar={{ text: inicialesUsuario(session), onPress: () => router.push('/settings') }}
        showLogout
      >
        <BusinessSwitcher />
      </Header>

      <ScrollView
        contentContainerClassName="gap-4 p-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <SectionLottie
          variant="growth"
          title="Tu negocio va tomando ritmo"
          caption="Ventas, ganancias y stock reunidos en un solo lugar."
        />

        {!cargandoNegocios && !selected ? (
          <Card>
            <EmptyState
              title="Crea tu primera tienda"
              message="Agrega tu negocio para registrar productos, vender y controlar el stock."
              actionLabel="Crear mi tienda"
              icon="storefront-outline"
              onAction={() => router.push('/negocios')}
            />
          </Card>
        ) : null}

        {selected ? (
          <>
            <SectionEntrance delay={30}>
              <DashboardHero
                productosBajos={bajos.length}
                negocio={selected.nombre}
                onPress={() => router.push('/inventario')}
              />
            </SectionEntrance>

            <SectionEntrance delay={90}>
            <View className="flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/vender')}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-[#D97955] px-3 py-4 active:opacity-80"
                style={{
                  shadowColor: '#D97955',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.18,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Ionicons name="cart" size={20} color="#ffffff" />
                <Text className="text-sm font-extrabold text-white">Vender rápido</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/inventario')}
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-[#EFE3DA] bg-[#FFFFFF] px-4 py-4 active:opacity-80"
              >
                <Ionicons name="cube-outline" size={20} color="#D97955" />
                <Text className="text-sm font-extrabold text-[#D97955]">Inventario</Text>
              </Pressable>
            </View>
            </SectionEntrance>

            <Card delay={140} className="gap-4 overflow-hidden">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-xs font-bold uppercase tracking-wider text-[#756B65]">
                    Ventas de hoy
                  </Text>
                  <Text className="mt-1 text-3xl font-black text-[#493A36]">{money(ventasHoy)}</Text>
                </View>
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#F4E7DC]">
                  <Ionicons name="trending-up" size={22} color="#8B563D" />
                </View>
              </View>

              <View className="flex-row items-center justify-between rounded-2xl bg-[#F8EDE0] px-3.5 py-3">
                <View className="flex-1">
                  <Text className="text-[11px] font-bold uppercase tracking-wide text-[#756B65]">
                    Ganancia aproximada
                  </Text>
                  <Text className="mt-0.5 text-lg font-extrabold text-[#8B563D]">
                    {money(ganancia)}
                  </Text>
                </View>
                <View className="h-9 w-px bg-[#dfd7c8]" />
                <View className="flex-1 items-end">
                  <Text className="text-[11px] font-bold uppercase tracking-wide text-[#756B65]">
                    Producto estrella
                  </Text>
                  <Text className="mt-0.5 max-w-full text-right text-sm font-extrabold text-[#493A36]" numberOfLines={1}>
                    {estrella?.nombre ?? 'Sin ventas'}
                  </Text>
                  {estrella ? (
                    <Text className="text-[10px] text-[#756B65]">{estrella.cantidad} vendidos</Text>
                  ) : null}
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-bold text-[#6E625C]">Meta diaria</Text>
                  <Text className={`text-xs font-extrabold ${excedioMeta ? 'text-[#8B563D]' : 'text-[#6E625C]'}`}>
                    {money(ventasHoy)} / {money(metaDiaria)}
                  </Text>
                </View>
                <View className="h-2.5 overflow-hidden rounded-full bg-[#ece6d9]">
                  <View
                    className="h-full rounded-full bg-[#D97955]"
                    style={{ width: `${Math.round(progreso * 100)}%` }}
                  />
                </View>
                <Text className="text-[11px] text-[#867A72]">
                  {excedioMeta
                    ? '¡Meta superada! Sigue así.'
                    : `Te faltan ${money(Math.max(metaDiaria - ventasHoy, 0))} para alcanzar tu meta.`}
                </Text>
              </View>
            </Card>

            <CategorySalesCard categorias={categoriasVendidas} loading={cargandoCategorias} />

            <Card delay={220} className="gap-1">
              <View className="mb-1 flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-extrabold text-[#493A36]">Semáforo de stock</Text>
                  <Text className="text-xs text-[#756B65]">
                    {bajos.length === 0
                      ? 'Tus productos están por encima del mínimo.'
                      : `${bajos.length} ${bajos.length === 1 ? 'producto necesita' : 'productos necesitan'} reposición.`}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ver inventario completo"
                  onPress={() => router.push('/inventario')}
                  className="h-9 w-9 items-center justify-center rounded-full bg-[#FFF1E8]"
                >
                  <Ionicons name="arrow-forward" size={17} color="#8B563D" />
                </Pressable>
              </View>
              {loading ? (
                <Text className="py-3 text-center text-xs text-[#867A72]">Actualizando stock...</Text>
              ) : bajos.length === 0 ? (
                <View className="flex-row items-center gap-2 border-t border-[#eee8dc] py-3">
                  <Ionicons name="checkmark-circle" size={19} color="#D97955" />
                  <Text className="text-xs font-semibold text-[#8B563D]">
                    {productos.length === 0 ? 'Agrega productos para ver su estado.' : 'Todo en orden.'}
                  </Text>
                </View>
              ) : (
                <>
                  {bajos.slice(0, 3).map((producto) => (
                    <StockBajoRow key={producto.id} producto={producto} />
                  ))}
                  {bajos.length > 3 ? (
                    <Text className="pt-1 text-center text-[11px] font-semibold text-[#756B65]">
                      +{bajos.length - 3} productos por revisar
                    </Text>
                  ) : null}
                  <Button
                    title="Compartir"
                    icon="share-social-outline"
                    variant="outline"
                    size="sm"
                    onPress={compartirReposicion}
                  />
                </>
              )}
            </Card>

            <Card delay={300} className="gap-2">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-extrabold text-[#493A36]">Ventas recientes</Text>
                  <Text className="text-xs text-[#756B65]">{fechaLarga()}</Text>
                </View>
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#f7efd9]">
                  <Ionicons name="receipt-outline" size={18} color="#9a6b19" />
                </View>
              </View>
              {ventas.slice(0, 4).length === 0 ? (
                <View className="items-center gap-1 border-t border-[#eee8dc] py-4">
                  <Text className="text-sm font-semibold text-[#6E625C]">Todavía no hay ventas hoy.</Text>
                  <Text className="text-xs text-[#867A72]">Tus ventas aparecerán aquí al registrarlas.</Text>
                </View>
              ) : (
                ventas.slice(0, 4).map((venta) => (
                  <View
                    key={venta.id}
                    className="flex-row items-center justify-between border-t border-[#eee8dc] py-2.5"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-[#5A3D35]" numberOfLines={1}>
                        {venta.producto_nombre}
                      </Text>
                      <Text className="text-[11px] text-[#867A72]">
                        {venta.cantidad} un. · {new Date(venta.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <Text className="text-sm font-extrabold text-[#8B563D]">{money(venta.total)}</Text>
                  </View>
                ))
              )}
            </Card>
          </>
        ) : null}
      </ScrollView>

      <WelcomeSplash
        visible={mostrarBienvenida}
        nombre={nombre}
        recienRegistrado={flags.justRegistered}
        onDone={() => {
          flags.welcomeShown = true;
          setBienvenidaCerrada(true);
        }}
      />

      <Modal visible={mostrarMeta} transparent animationType="fade" onRequestClose={() => setMostrarMeta(false)}>
        <View className="flex-1 items-center justify-center bg-[#493A36]/60 px-6">
          <View
            className="w-full max-w-sm items-center gap-2 rounded-[28px] border border-white bg-[#FFFFFF] p-6"
            style={{
              shadowColor: '#aaa596',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.28,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <LottieView
              source={require('../../../../assets/lottie/welcome-burst.json')}
              autoPlay
              loop={false}
              style={{ width: 160, height: 140 }}
              webStyle={{ width: 160, height: 140 }}
            />
            <Text className="text-center text-2xl font-black text-[#493A36]">¡Meta superada!</Text>
            <Text className="text-center text-sm text-[#756B65]">
              Vendiste {money(ventasHoy)}. ¡Tu tienda va con todo!
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setMostrarMeta(false)}
              className="mt-2 w-full items-center rounded-2xl bg-[#8B563D] py-3.5"
            >
              <Text className="text-base font-extrabold text-white">¡Seguir vendiendo!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
