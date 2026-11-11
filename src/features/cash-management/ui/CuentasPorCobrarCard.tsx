import {
  crearCuentaPorCobrar,
  listarCuentasPendientes,
  requiereMigracionCuentasPorCobrar,
  registrarAbonoCuenta,
  type CuentaPorCobrar,
} from '@/entities/cash/api/cuentasPorCobrar';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import Input from '@/shared/ui/Input';
import { hoy } from '@/shared/lib/date';
import { aviso, showError } from '@/shared/lib/notify';
import { money, parseMonto } from '@/shared/lib/format';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

type Props = {
  negocioId: string;
  onChanged: () => Promise<void>;
};

type FormMode = 'deuda' | 'abono';
type PagoMetodo = 'efectivo' | 'transferencia';

export default function CuentasPorCobrarCard({ negocioId, onChanged }: Props) {
  const [cuentas, setCuentas] = useState<CuentaPorCobrar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [requiereMigracion, setRequiereMigracion] = useState(false);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [cuentaActiva, setCuentaActiva] = useState<CuentaPorCobrar | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      setCuentas(await listarCuentasPendientes(negocioId));
      setRequiereMigracion(false);
    } catch (error) {
      if (requiereMigracionCuentasPorCobrar(error)) {
        setCuentas([]);
        setRequiereMigracion(true);
      } else {
        showError(error, 'No pudimos cargar los pendientes por cobrar');
      }
    } finally {
      setCargando(false);
    }
  }, [negocioId]);

  useEffect(() => {
    void Promise.resolve().then(recargar);
  }, [recargar]);

  const totalPendiente = cuentas.reduce((total, cuenta) => total + cuenta.saldo, 0);

  const guardarDeuda = async (cliente: string, concepto: string, monto: number) => {
    setGuardando(true);
    try {
      await crearCuentaPorCobrar(negocioId, cliente, concepto, monto, hoy());
      setFormMode(null);
      aviso('La deuda quedó guardada en pendientes por cobrar.', 'Deuda registrada');
      await recargar();
    } catch (error) {
      if (requiereMigracionCuentasPorCobrar(error)) {
        setRequiereMigracion(true);
        setFormMode(null);
      } else {
        showError(error, 'No pudimos guardar la deuda');
      }
    } finally {
      setGuardando(false);
    }
  };

  const guardarAbono = async (cuenta: CuentaPorCobrar, monto: number, metodo: PagoMetodo) => {
    setGuardando(true);
    try {
      await registrarAbonoCuenta(cuenta.id, negocioId, monto, metodo, hoy());
      setFormMode(null);
      setCuentaActiva(null);
      await Promise.all([recargar(), onChanged()]);
      aviso('El cobro se registró y se agregó a la actividad de caja.', 'Cobro registrado');
    } catch (error) {
      if (requiereMigracionCuentasPorCobrar(error)) {
        setRequiereMigracion(true);
        setFormMode(null);
        setCuentaActiva(null);
      } else {
        showError(error, 'No pudimos registrar el cobro');
      }
    } finally {
      setGuardando(false);
    }
  };

  const abrirAbono = (cuenta: CuentaPorCobrar) => {
    setCuentaActiva(cuenta);
    setFormMode('abono');
  };

  return (
    <>
      <Card className="gap-3">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#FCE5D8]">
            <Ionicons name="receipt-outline" size={21} color="#A95743" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-extrabold text-[#493A36]">Pendientes por cobrar</Text>
            <Text className="text-xs text-[#756B65]">Deudas y ventas fiadas de tus clientes</Text>
          </View>
          <Text className="text-base font-extrabold text-[#A95743]">{money(totalPendiente)}</Text>
        </View>

        <Text className="text-xs leading-4 text-[#756B65]">
          Este registro solo controla el saldo: no suma ventas ni efectivo. Cada abono se refleja en
          caja cuando lo cobras.
        </Text>

        {requiereMigracion ? (
          <View className="gap-1 rounded-2xl border border-[#E8C9B6] bg-[#FFF1E8] p-3">
            <Text className="text-sm font-bold text-[#8B563D]">
              Falta configurar pendientes por cobrar
            </Text>
            <Text className="text-xs leading-5 text-[#6E625C]">
              Ejecuta la migración 003_cuentas_por_cobrar.sql en Supabase. Caja y apertura de
              jornada siguen disponibles mientras tanto.
            </Text>
          </View>
        ) : (
          <Button
            title="Registrar deuda o fiado"
            icon="add-circle-outline"
            variant="outline"
            onPress={() => setFormMode('deuda')}
          />
        )}

        {cargando ? (
          <Text className="py-2 text-center text-xs text-[#756B65]">Cargando pendientes…</Text>
        ) : requiereMigracion ? null : cuentas.length === 0 ? (
          <View className="items-center gap-1 rounded-2xl bg-[#FFF1E8] px-3 py-4">
            <Ionicons name="checkmark-circle-outline" size={22} color="#D97955" />
            <Text className="text-sm font-bold text-[#5A3D35]">No hay deudas pendientes</Text>
            <Text className="text-center text-xs text-[#756B65]">
              Las cuentas que registres aparecerán aquí hasta que se paguen.
            </Text>
          </View>
        ) : (
          <View>
            {cuentas.map((cuenta) => (
              <View
                key={cuenta.id}
                className="flex-row items-center gap-3 border-t border-[#EFE3DA] py-3"
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#FFF1E8]">
                  <Ionicons name="person-outline" size={17} color="#A95743" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#493A36]" numberOfLines={1}>
                    {cuenta.cliente}
                  </Text>
                  <Text className="text-xs text-[#756B65]" numberOfLines={1}>
                    {cuenta.concepto} · Deuda {money(cuenta.monto)}
                  </Text>
                  <Text className="text-xs font-bold text-[#A95743]">
                    Saldo pendiente: {money(cuenta.saldo)}
                  </Text>
                </View>
                <Pressable
                  disabled={requiereMigracion}
                  accessibilityRole="button"
                  accessibilityLabel={`Registrar cobro de ${cuenta.cliente}`}
                  onPress={() => abrirAbono(cuenta)}
                  className={`min-h-11 flex-row items-center gap-1 rounded-xl bg-[#A95743] px-3 active:opacity-80 ${
                    requiereMigracion ? 'opacity-50' : ''
                  }`}
                >
                  <Ionicons name="cash-outline" size={16} color="#FFFFFF" />
                  <Text className="text-xs font-bold text-white">Cobrar</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </Card>

      <CuentaForm
        key={`${formMode ?? 'cerrado'}-${cuentaActiva?.id ?? 'nueva'}`}
        visible={formMode !== null}
        mode={formMode ?? 'deuda'}
        cuenta={cuentaActiva}
        saving={guardando}
        onSaveDebt={guardarDeuda}
        onSavePayment={guardarAbono}
        onClose={() => {
          setFormMode(null);
          setCuentaActiva(null);
        }}
      />
    </>
  );
}

function CuentaForm({
  visible,
  mode,
  cuenta,
  saving,
  onSaveDebt,
  onSavePayment,
  onClose,
}: {
  visible: boolean;
  mode: FormMode;
  cuenta: CuentaPorCobrar | null;
  saving: boolean;
  onSaveDebt: (cliente: string, concepto: string, monto: number) => Promise<void>;
  onSavePayment: (cuenta: CuentaPorCobrar, monto: number, metodo: PagoMetodo) => Promise<void>;
  onClose: () => void;
}) {
  const [cliente, setCliente] = useState('');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState(cuenta ? String(cuenta.saldo) : '');
  const [metodoPago, setMetodoPago] = useState<PagoMetodo>('efectivo');
  const esAbono = mode === 'abono' && cuenta !== null;

  const guardar = () => {
    const valor = parseMonto(monto);
    if (isNaN(valor) || valor <= 0) return aviso('Escribe un monto mayor a 0.');
    if (esAbono) {
      if (valor > cuenta.saldo) return aviso('El cobro no puede superar el saldo pendiente.');
      void onSavePayment(cuenta, valor, metodoPago);
      return;
    }
    if (!cliente.trim()) return aviso('Escribe el nombre del cliente.');
    if (!concepto.trim()) return aviso('Describe brevemente la deuda o el fiado.');
    void onSaveDebt(cliente.trim(), concepto.trim(), valor);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 justify-end bg-black/50">
          <ScrollView
            className="w-full rounded-t-[30px] border border-white bg-white px-5 pt-3"
            contentContainerClassName="gap-3.5 pb-8"
            style={{ maxHeight: '90%' }}
            keyboardShouldPersistTaps="always"
          >
            <View className="mb-1 h-1.5 w-12 self-center rounded-full bg-[#ddd5c7]" />
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#FCE5D8]">
                  <Ionicons
                    name={esAbono ? 'cash-outline' : 'receipt-outline'}
                    size={20}
                    color="#A95743"
                  />
                </View>
                <View>
                  <Text className="text-xl font-bold text-[#493A36]">
                    {esAbono ? 'Registrar cobro' : 'Nueva deuda o fiado'}
                  </Text>
                  <Text className="text-xs text-[#756B65]">
                    {esAbono ? cuenta.cliente : 'Guarda el saldo pendiente del cliente'}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar formulario"
                onPress={onClose}
                className="h-10 w-10 items-center justify-center rounded-full bg-[#F8EDE0]"
              >
                <Ionicons name="close" size={19} color="#6E625C" />
              </Pressable>
            </View>

            {esAbono ? (
              <View className="rounded-2xl bg-[#FFF1E8] p-3">
                <Text className="text-xs text-[#756B65]">{cuenta.concepto}</Text>
                <Text className="text-sm font-bold text-[#A95743]">
                  Saldo pendiente: {money(cuenta.saldo)}
                </Text>
              </View>
            ) : (
              <>
                <Input
                  label="Cliente"
                  icon="person-outline"
                  placeholder="Nombre del cliente"
                  autoCapitalize="words"
                  value={cliente}
                  onChangeText={setCliente}
                />
                <Input
                  label="Descripción"
                  icon="document-text-outline"
                  placeholder="¿Qué quedó pendiente?"
                  autoCapitalize="sentences"
                  value={concepto}
                  onChangeText={setConcepto}
                />
              </>
            )}

            <Input
              label={esAbono ? 'Monto del cobro ($)' : 'Monto de la deuda ($)'}
              icon="cash-outline"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={monto}
              onChangeText={setMonto}
            />

            {esAbono ? (
              <View className="gap-2">
                <Text className="text-xs font-bold uppercase tracking-wider text-[#6E625C]">
                  ¿Cómo recibiste el abono?
                </Text>
                <View className="flex-row gap-2">
                  {(['efectivo', 'transferencia'] as const).map((metodo) => {
                    const activo = metodoPago === metodo;
                    return (
                      <Pressable
                        key={metodo}
                        accessibilityRole="button"
                        accessibilityState={{ selected: activo }}
                        onPress={() => setMetodoPago(metodo)}
                        className={`min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl border px-3 ${
                          activo
                            ? 'border-[#D97955] bg-[#FCE5D8]'
                            : 'border-[#EFE3DA] bg-white'
                        }`}
                      >
                        <Ionicons
                          name={metodo === 'efectivo' ? 'cash-outline' : 'swap-horizontal-outline'}
                          size={17}
                          color={activo ? '#A95743' : '#756B65'}
                        />
                        <Text
                          className={`text-xs font-bold ${
                            activo ? 'text-[#A95743]' : 'text-[#756B65]'
                          }`}
                        >
                          {metodo === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <View className="mt-1 gap-2">
              <Button
                title={esAbono ? 'Guardar cobro' : 'Guardar deuda'}
                icon="checkmark-circle-outline"
                onPress={guardar}
                loading={saving}
              />
              <Button title="Cancelar" variant="outline" onPress={onClose} disabled={saving} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
