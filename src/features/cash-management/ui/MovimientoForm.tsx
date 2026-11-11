import { TIPOS } from '@/shared/config/movimientos';
import { parseMonto } from '@/shared/lib/format';
import { aviso } from '@/shared/lib/notify';
import type { Movimiento, MovimientoInput, TipoMovimiento } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';

type Props = {
  visible: boolean;
  tipo: TipoMovimiento;
  inicial?: Movimiento;
  saving: boolean;
  onSubmit: (input: MovimientoInput) => void;
  onClose: () => void;
};

export default function MovimientoForm({
  visible,
  tipo,
  inicial,
  saving,
  onSubmit,
  onClose,
}: Props) {
  const [concepto, setConcepto] = useState(() => inicial?.concepto ?? '');
  const [cliente, setCliente] = useState(() => inicial?.cliente ?? '');
  const [monto, setMonto] = useState(() => (inicial ? String(inicial.monto) : ''));
  const [costoDirecto, setCostoDirecto] = useState(() =>
    inicial?.costo_directo == null ? '' : String(inicial.costo_directo),
  );

  const guardar = () => {
    const valor = parseMonto(monto);
    if (!concepto.trim()) return aviso('Describe brevemente este movimiento.');
    if (isNaN(valor) || valor <= 0) return aviso('Escribe un monto mayor a 0.');
    const costo = tipo === 'venta' ? parseMonto(costoDirecto) : null;
    if (
      tipo === 'venta' &&
      (!costoDirecto.trim() || costo === null || isNaN(costo) || costo < 0)
    ) {
      return aviso('Indica el costo directo de esta venta. Escribe 0 si no aplica.');
    }
    onSubmit({
      tipo,
      concepto: concepto.trim(),
      cliente: tipo === 'venta' ? cliente.trim() || null : null,
      monto: valor,
      costo_directo: costo,
    });
  };

  const t = TIPOS[tipo];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 justify-end bg-black/50">
          <ScrollView
            className="w-full rounded-t-[30px] border border-white bg-[#FFFFFF] px-5 pt-3"
            contentContainerClassName="gap-3.5 pb-8"
            style={{ maxHeight: '90%' }}
            keyboardShouldPersistTaps="always"
          >
            <View className="mb-1 h-1.5 w-12 self-center rounded-full bg-[#ddd5c7]" />
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <View
                  className="h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: t.color + '22' }}
                >
                  <Ionicons name={t.icon} size={20} color={t.color} />
                </View>
                <View>
                  <Text className="text-xl font-bold text-[#493A36]">
                    {inicial ? 'Editar' : 'Registrar'} {t.label.toLowerCase()}
                  </Text>
                  <Text className="text-xs text-[#756B65]">
                    {tipo === 'venta'
                      ? 'Usa esto solo para ingresos que no vienen de un producto del inventario.'
                      : 'Completa los datos del movimiento'}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={8}
                className="h-8 w-8 items-center justify-center rounded-full bg-[#F8EDE0]"
              >
                <Ionicons name="close" size={18} color="#6E625C" />
              </Pressable>
            </View>

            <Input
              label="Descripción"
              icon="document-text-outline"
              placeholder={t.placeholder}
              autoCapitalize="sentences"
              value={concepto}
              onChangeText={setConcepto}
            />
            {tipo === 'venta' ? (
              <Input
                label="Cliente (opcional)"
                icon="person-outline"
                placeholder="Nombre del cliente"
                autoCapitalize="words"
                value={cliente}
                onChangeText={setCliente}
              />
            ) : null}
            <Input
              label="Monto ($)"
              icon="cash-outline"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={monto}
              onChangeText={setMonto}
            />
            {tipo === 'venta' ? (
              <>
                <Input
                  label="Costo directo de esta venta ($)"
                  icon="calculator-outline"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={costoDirecto}
                  onChangeText={setCostoDirecto}
                />
                <Text className="-mt-2 text-[11px] leading-4 text-[#756B65]">
                  Registra cuánto costaron los productos o insumos usados en esta venta. Si no tuvo
                  costo directo, escribe 0. No repitas aquí gastos ni compras ya registrados en caja.
                </Text>
              </>
            ) : null}
            <View className="mt-1 gap-2">
              <Button
                title="Guardar movimiento"
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
