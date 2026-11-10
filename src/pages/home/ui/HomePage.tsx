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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { flags, GOOGLE_WELCOME_STORAGE_KEY } from '@/features/auth/model/flags';
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
        <Text className="text-sm font-bold text-[#344b47]" numberOfLines={1}>
          {producto.nombre}
        </Text>
        <Text className="text-[11px] text-[#879792]">
          Mínimo: {producto.stock_minimo} · Quedan: {producto.stock}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9aa7a1" />
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
      colors={['#125b49', '#16896a', '#36aa77']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        minHeight: 150,
        overflow: 'hidden',
        borderRadius: 28,
        borderWidth: 1,
        borderColor: '#76c895',
        padding: 18,
        shadowColor: '#125b49',
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
          backgroundColor: 'rgba(255,255,255,0.07)',
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
          backgroundColor: 'rgba(255,200,87,0.16)',
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
          <View           className="self-start flex-row items-center gap-1.5 rounded-full border border-white/20 bg-[#0e4d3e]/65 px-2.5 py-1">
            <View className={`h-1.5 w-1.5 rounded-full ${todoEnOrden ? 'bg-[#a9e7a1]' : 'bg-[#ffc857]'}`} />
            <Text className="text-[10px] font-extrabold uppercase tracking-wider text-[#e2f0e2]">
              {todoEnOrden ? 'Stock bajo control' : `${productosBajos} por reponer`}
            </Text>
          </View>
          <Text className="text-[22px] font-extrabold leading-7 tracking-tight text-white">
            Tu tienda,{'\n'}siempre en marcha.
          </Text>
          <Text className="text-xs leading-4 text-[#d8eade]" numberOfLines={1}>
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
              borderColor: 'rgba(255,255,255,0.48)',
              borderRadius: 27,
              backgroundColor: '#e4f7dc',
              shadowColor: '#0d493b',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.22,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Ionicons name="storefront" size={39} color="#286c53" />
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
                borderColor: '#16896a',
                borderRadius: 15,
                backgroundColor: todoEnOrden ? '#ffc857' : '#f17c5b',
              }}
            >
              <Ionicons name={todoEnOrden ? 'sparkles' : 'alert'} size={15} color="#fffaf0" />
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
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);
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

  useEffect(() => {
    if (!session) return;
    let active = true;

    const showWelcome = () => {
      flags.welcomeShown = true;
      setMostrarBienvenida(true);
    };

    if (!flags.welcomeShown) {
      showWelcome();
      AsyncStorage.removeItem(GOOGLE_WELCOME_STORAGE_KEY).catch((error: unknown) => {
        showError(error, 'No pudimos limpiar el estado de bienvenida');
      });
      return () => {
        active = false;
      };
    }

    AsyncStorage.getItem(GOOGLE_WELCOME_STORAGE_KEY)
      .then(async (pendingWelcome) => {
        if (!active || pendingWelcome !== 'true') return;
        await AsyncStorage.removeItem(GOOGLE_WELCOME_STORAGE_KEY);
        if (active) showWelcome();
      })
      .catch((error: unknown) => {
        if (active) showError(error, 'No pudimos recuperar la bienvenida');
      });

    return () => {
      active = false;
    };
  }, [session]);

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
    <View className="flex-1 bg-[#f3f8f2]">
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
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-[#16896a] px-3 py-4 active:opacity-80"
                style={{
                  shadowColor: '#16896a',
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
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-[#e5e8df] bg-[#fffefa] px-4 py-4 active:opacity-80"
              >
                <Ionicons name="cube-outline" size={20} color="#16896a" />
                <Text className="text-sm font-extrabold text-[#16896a]">Inventario</Text>
              </Pressable>
            </View>
            </SectionEntrance>

            <Card delay={140} className="gap-4 overflow-hidden">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-xs font-bold uppercase tracking-wider text-[#71817b]">
                    Ventas de hoy
                  </Text>
                  <Text className="mt-1 text-3xl font-black text-[#243b38]">{money(ventasHoy)}</Text>
                </View>
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#e6f0e9]">
                  <Ionicons name="trending-up" size={22} color="#246b61" />
                </View>
              </View>

              <View className="flex-row items-center justify-between rounded-2xl bg-[#f4efe4] px-3.5 py-3">
                <View className="flex-1">
                  <Text className="text-[11px] font-bold uppercase tracking-wide text-[#71817b]">
                    Ganancia aproximada
                  </Text>
                  <Text className="mt-0.5 text-lg font-extrabold text-[#246b61]">
                    {money(ganancia)}
                  </Text>
                </View>
                <View className="h-9 w-px bg-[#dfd7c8]" />
                <View className="flex-1 items-end">
                  <Text className="text-[11px] font-bold uppercase tracking-wide text-[#71817b]">
                    Producto estrella
                  </Text>
                  <Text className="mt-0.5 max-w-full text-right text-sm font-extrabold text-[#243b38]" numberOfLines={1}>
                    {estrella?.nombre ?? 'Sin ventas'}
                  </Text>
                  {estrella ? (
                    <Text className="text-[10px] text-[#71817b]">{estrella.cantidad} vendidos</Text>
                  ) : null}
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-bold text-[#5d706c]">Meta diaria</Text>
                  <Text className={`text-xs font-extrabold ${excedioMeta ? 'text-[#246b61]' : 'text-[#5d706c]'}`}>
                    {money(ventasHoy)} / {money(metaDiaria)}
                  </Text>
                </View>
                <View className="h-2.5 overflow-hidden rounded-full bg-[#ece6d9]">
                  <View
                    className="h-full rounded-full bg-[#348a76]"
                    style={{ width: `${Math.round(progreso * 100)}%` }}
                  />
                </View>
                <Text className="text-[11px] text-[#879792]">
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
                  <Text className="text-base font-extrabold text-[#243b38]">Semáforo de stock</Text>
                  <Text className="text-xs text-[#71817b]">
                    {bajos.length === 0
                      ? 'Tus productos están por encima del mínimo.'
                      : `${bajos.length} ${bajos.length === 1 ? 'producto necesita' : 'productos necesitan'} reposición.`}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ver inventario completo"
                  onPress={() => router.push('/inventario')}
                  className="h-9 w-9 items-center justify-center rounded-full bg-[#eef5f0]"
                >
                  <Ionicons name="arrow-forward" size={17} color="#246b61" />
                </Pressable>
              </View>
              {loading ? (
                <Text className="py-3 text-center text-xs text-[#879792]">Actualizando stock...</Text>
              ) : bajos.length === 0 ? (
                <View className="flex-row items-center gap-2 border-t border-[#eee8dc] py-3">
                  <Ionicons name="checkmark-circle" size={19} color="#348a76" />
                  <Text className="text-xs font-semibold text-[#246b61]">
                    {productos.length === 0 ? 'Agrega productos para ver su estado.' : 'Todo en orden.'}
                  </Text>
                </View>
              ) : (
                <>
                  {bajos.slice(0, 3).map((producto) => (
                    <StockBajoRow key={producto.id} producto={producto} />
                  ))}
                  {bajos.length > 3 ? (
                    <Text className="pt-1 text-center text-[11px] font-semibold text-[#71817b]">
                      +{bajos.length - 3} productos por revisar
                    </Text>
                  ) : null}
                  <Button
                    title="Compartir lista de reposición"
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
                  <Text className="text-base font-extrabold text-[#243b38]">Ventas recientes</Text>
                  <Text className="text-xs text-[#71817b]">{fechaLarga()}</Text>
                </View>
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#f7efd9]">
                  <Ionicons name="receipt-outline" size={18} color="#9a6b19" />
                </View>
              </View>
              {ventas.slice(0, 4).length === 0 ? (
                <View className="items-center gap-1 border-t border-[#eee8dc] py-4">
                  <Text className="text-sm font-semibold text-[#5d706c]">Todavía no hay ventas hoy.</Text>
                  <Text className="text-xs text-[#879792]">Tus ventas aparecerán aquí al registrarlas.</Text>
                </View>
              ) : (
                ventas.slice(0, 4).map((venta) => (
                  <View
                    key={venta.id}
                    className="flex-row items-center justify-between border-t border-[#eee8dc] py-2.5"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-[#344b47]" numberOfLines={1}>
                        {venta.producto_nombre}
                      </Text>
                      <Text className="text-[11px] text-[#879792]">
                        {venta.cantidad} un. · {new Date(venta.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <Text className="text-sm font-extrabold text-[#246b61]">{money(venta.total)}</Text>
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
        onDone={() => setMostrarBienvenida(false)}
      />

      <Modal visible={mostrarMeta} transparent animationType="fade" onRequestClose={() => setMostrarMeta(false)}>
        <View className="flex-1 items-center justify-center bg-[#243b38]/60 px-6">
          <View
            className="w-full max-w-sm items-center gap-2 rounded-[28px] border border-white bg-[#fffefa] p-6"
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
            <Text className="text-center text-2xl font-black text-[#243b38]">¡Meta superada!</Text>
            <Text className="text-center text-sm text-[#71817b]">
              Vendiste {money(ventasHoy)}. ¡Tu tienda va con todo!
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setMostrarMeta(false)}
              className="mt-2 w-full items-center rounded-2xl bg-[#246b61] py-3.5"
            >
              <Text className="text-base font-extrabold text-white">¡Seguir vendiendo!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
