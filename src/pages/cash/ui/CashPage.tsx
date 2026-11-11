import CloseDayModal from '@/features/cash-management/ui/CloseDayModal';
import CuentasPorCobrarCard from '@/features/cash-management/ui/CuentasPorCobrarCard';
import DaySummary from '@/features/cash-management/ui/DaySummary';
import MovimientoForm from '@/features/cash-management/ui/MovimientoForm';
import MovimientoRow from '@/features/cash-management/ui/MovimientoRow';
import OpenDayCard from '@/features/cash-management/ui/OpenDayCard';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import EmptyState from '@/shared/ui/EmptyState';
import Header from '@/widgets/app-header/ui/Header';
import SectionEntrance from '@/shared/ui/SectionEntrance';
import SectionLottie from '@/shared/ui/SectionLottie';
import { TIPOS } from '@/shared/config/movimientos';
import { useNegocio } from '@/features/business-management/model/NegocioContext';
import { useCajaDelDia } from '@/entities/cash/model/useCajaDelDia';
import { useDashboardData } from '@/widgets/dashboard/model/useDashboardData';
import { hoy } from '@/shared/lib/date';
import { money } from '@/shared/lib/format';
import { confirmar, showError } from '@/shared/lib/notify';
import {
  calcularPulso,
  sumar,
  sumarAbonosEnEfectivo,
  sumarAbonosPorTransferencia,
  sumarVentasEnEfectivo,
  sumarVentasPorTransferencia,
} from '@/entities/cash/model/pulse';
import { cerrarJornada, reabrirJornada } from '@/entities/cash/api/jornadas';
import { actualizarMovimiento, crearMovimiento, eliminarMovimiento } from '@/entities/cash/api/movimientos';
import type { Movimiento, MovimientoInput, TipoMovimiento } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type FormState = { tipo: TipoMovimiento; movimiento?: Movimiento } | null;
const TIPOS_REGISTRABLES: TipoMovimiento[] = ['venta', 'gasto', 'compra'];

function QuickMovementButton({
  tipo,
  disabled,
  onPress,
}: {
  tipo: TipoMovimiento;
  disabled?: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const t = TIPOS[tipo];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          shadowColor: t.color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: disabled ? 0 : 0.22,
          shadowRadius: 8,
          elevation: disabled ? 0 : 3,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          if (!disabled) scale.set(withSpring(0.94, { damping: 15, stiffness: 300 }));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, { damping: 14, stiffness: 260 }));
        }}
        accessibilityRole="button"
        accessibilityLabel={`Registrar ${t.boton}`}
        style={{ backgroundColor: t.color }}
        className={`items-center gap-1.5 rounded-2xl border border-white/20 py-3.5 ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-white/25">
          <Ionicons name={t.icon} size={20} color="#ffffff" />
        </View>
        <Text className="text-xs font-extrabold tracking-wide text-white">+ {t.boton}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function CajaScreen() {
  const router = useRouter();
  const { selected } = useNegocio();
  const { movimientos, jornada, capitalSugerido, recargar } = useCajaDelDia(selected?.id);
  const { movimientos: movimientosRecientes, recargar: recargarRecientes } = useDashboardData(selected?.id);
  const [form, setForm] = useState<FormState>(null);
  const [guardando, setGuardando] = useState(false);
  const [cierre, setCierre] = useState(false);

  if (!selected) {
    return (
      <View className="flex-1 bg-[#FFFAF5]">
        <Header eyebrow="Control diario" title="Caja del día" />
        <View className="p-4">
          <Card>
            <EmptyState
              title="Primero crea un negocio"
              message="Ve a la pestaña Negocios y agrega el primero para registrar tus ventas."
              actionLabel="Ir a Mis negocios"
              icon="storefront-outline"
              onAction={() => router.push('/negocios')}
            />
          </Card>
        </View>
      </View>
    );
  }

  const ventas = sumar(movimientos, 'venta');
  const ventasEnEfectivo = sumarVentasEnEfectivo(movimientos);
  const ventasPorTransferencia = sumarVentasPorTransferencia(movimientos);
  const abonosEnEfectivo = sumarAbonosEnEfectivo(movimientos);
  const abonosPorTransferencia = sumarAbonosPorTransferencia(movimientos);
  const gastos = sumar(movimientos, 'gasto');
  const compras = sumar(movimientos, 'compra');
  const resumenDia = calcularPulso(movimientos);
  const inicio = jornada?.capital_inicio ?? 0;
  const cajaFinal = inicio + ventasEnEfectivo + abonosEnEfectivo - gastos - compras;
  const capitalParaAbrir = capitalSugerido ?? selected.capital_inicial;
  const ventasSinCostoRecientes = movimientosRecientes.filter(
    (movimiento) =>
      movimiento.tipo === 'venta' &&
      movimiento.costo_directo === null &&
      movimiento.fecha !== hoy(),
  );

  const guardar = async (input: MovimientoInput) => {
    setGuardando(true);
    try {
      if (form?.movimiento) await actualizarMovimiento(form.movimiento.id, input);
      else await crearMovimiento(selected.id, hoy(), input);
      setForm(null);
      await Promise.all([recargar(), recargarRecientes()]);
    } catch (e) {
      showError(e, 'No pudimos guardar el movimiento');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = (m: Movimiento) =>
    confirmar('Eliminar movimiento', `¿Seguro que quieres eliminar "${m.concepto}"?`, async () => {
      try {
        await eliminarMovimiento(m.id);
        recargar();
      } catch (e) {
        showError(e, 'No pudimos eliminarlo');
      }
    });

  const cerrarDia = async () => {
    if (!jornada) return;
    try {
      await cerrarJornada(jornada.id);
      setCierre(true);
      recargar();
    } catch (e) {
      showError(e, 'No pudimos cerrar la jornada');
    }
  };

  const reabrirDia = async () => {
    if (!jornada) return;
    try {
      await reabrirJornada(jornada.id);
      recargar();
    } catch (e) {
      showError(e, 'No pudimos reabrir la jornada');
    }
  };

  return (
    <View className="flex-1 bg-[#FFFAF5]">
      <Header eyebrow={selected.nombre} title="Caja del día" />

      <ScrollView contentContainerClassName="gap-4 p-4 pb-10" showsVerticalScrollIndicator={false}>
        <SectionLottie
          variant="cash"
          title="Tu día, claro y en orden"
          caption="Sigue ventas, gastos y el saldo de tu caja."
        />
        <CuentasPorCobrarCard negocioId={selected.id} onChanged={recargar} />

        {ventasSinCostoRecientes.length > 0 ? (
          <Card className="gap-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="calculator-outline" size={18} color="#d99a36" />
              <Text className="flex-1 text-sm font-bold text-[#493A36]">
                Completa costos de ventas recientes
              </Text>
            </View>
            <Text className="text-xs leading-4 text-[#756B65]">
              Usa tus registros o recetas para completar el costo. No lo estimes si no tienes
              información.
            </Text>
            {ventasSinCostoRecientes.map((venta) => (
              <Pressable
                key={venta.id}
                accessibilityRole="button"
                accessibilityLabel={`Completar costo de ${venta.concepto}, ${venta.fecha}`}
                onPress={() => setForm({ tipo: 'venta', movimiento: venta })}
                className="flex-row items-center gap-3 border-t border-[#e7e1d6] py-2.5"
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#f7efd9]">
                  <Ionicons name="time-outline" size={17} color="#9a6b19" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#5A3D35]" numberOfLines={1}>
                    {venta.concepto}
                  </Text>
                  <Text className="text-[11px] text-[#867A72]">
                    {venta.fecha} · Venta {money(venta.monto)}
                  </Text>
                </View>
                <Text className="text-xs font-bold text-[#8B563D]">Completar</Text>
              </Pressable>
            ))}
          </Card>
        ) : null}

        {!jornada ? (
          <>
            {ventas > 0 ? (
              <Card className="gap-1">
                <Text className="text-sm font-bold text-[#493A36]">Ventas registradas hoy</Text>
                <Text className="text-xs leading-5 text-[#756B65]">
                  Ya se registraron {money(ventas)} en Vender. Al iniciar la jornada, estas ventas
                  aparecerán en el balance junto con el capital de apertura.
                </Text>
              </Card>
            ) : null}
            <OpenDayCard negocioId={selected.id} sugerido={capitalParaAbrir} onDone={recargar} />
          </>
        ) : (
          <>
            <DaySummary
              inicio={inicio}
              ventas={ventas}
              ventasEnEfectivo={ventasEnEfectivo}
              ventasPorTransferencia={ventasPorTransferencia}
              abonosEnEfectivo={abonosEnEfectivo}
              abonosPorTransferencia={abonosPorTransferencia}
              gastos={gastos}
              compras={compras}
              costoVentas={resumenDia.costoVentas}
              resultadoOperativo={resumenDia.resultadoOperativo}
              ventasSinCosto={resumenDia.ventasSinCosto}
              final={cajaFinal}
              cerrada={jornada.cerrada}
            />

            <SectionEntrance delay={100}>
            <View className="gap-2">
              <Text className="px-1 text-xs font-bold uppercase tracking-wider text-[#6E625C]">
                Registrar nuevo movimiento
              </Text>
              <View className="flex-row gap-2.5">
                {TIPOS_REGISTRABLES.map((tipo) => (
                  <QuickMovementButton
                    key={tipo}
                    tipo={tipo}
                    disabled={jornada.cerrada}
                    onPress={() => setForm({ tipo })}
                  />
                ))}
              </View>
            </View>
            </SectionEntrance>

            <Card delay={120} className="gap-1">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-base font-bold text-[#493A36]">Movimientos de hoy</Text>
                <View className="rounded-full bg-[#F8EDE0] px-2.5 py-0.5">
                  <Text className="text-xs font-bold text-[#6E625C]">{movimientos.length}</Text>
                </View>
              </View>
              {movimientos.length === 0 ? (
                <EmptyState
                  title="Todavía no hay movimientos"
                  message="Registra gastos, compras o ingresos por servicios con los botones de arriba. Las ventas de productos se agregan desde «Vender»."
                  icon="receipt-outline"
                  size={125}
                />
              ) : (
                movimientos.map((m) => (
                  <MovimientoRow
                    key={m.id}
                    movimiento={m}
                    readOnly={m.origen === 'venta' || m.origen === 'abono'}
                    onEdit={() => {
                      if (m.tipo !== 'abono') setForm({ tipo: m.tipo, movimiento: m });
                    }}
                    onDelete={() => borrar(m)}
                  />
                ))
              )}
            </Card>

            {!jornada.cerrada ? (
              <Button title="Cerrar la jornada de hoy" variant="dark" icon="moon-outline" onPress={cerrarDia} />
            ) : (
              <Button title="Reabrir jornada de hoy" variant="outline" icon="sunny-outline" onPress={reabrirDia} />
            )}
          </>
        )}
      </ScrollView>

      <MovimientoForm
        key={form ? form.movimiento?.id ?? `new-${form.tipo}` : 'closed'}
        visible={form !== null}
        tipo={form?.tipo ?? 'venta'}
        inicial={form?.movimiento}
        saving={guardando}
        onSubmit={guardar}
        onClose={() => setForm(null)}
      />
      <CloseDayModal
        visible={cierre}
        resultadoOperativo={resumenDia.resultadoOperativo}
        ventasSinCosto={resumenDia.ventasSinCosto}
        cajaFinal={cajaFinal}
        onClose={() => setCierre(false)}
      />
    </View>
  );
}
