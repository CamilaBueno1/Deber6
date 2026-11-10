import { ICONOS_NEGOCIO, iconoNegocio } from '@/shared/config/movimientos';
import { parseMonto } from '@/shared/lib/format';
import { aviso } from '@/shared/lib/notify';
import type { Negocio, NegocioInput } from '@/shared/types';
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
  inicial?: Negocio;
  saving: boolean;
  onSubmit: (input: NegocioInput) => void;
  onClose: () => void;
};

export default function NegocioForm({ visible, inicial, saving, onSubmit, onClose }: Props) {
  const [nombre, setNombre] = useState(() => inicial?.nombre ?? '');
  const [rubro, setRubro] = useState(() => inicial?.rubro ?? '');
  const [icono, setIcono] = useState(() => iconoNegocio(inicial?.emoji ?? 'storefront-outline'));
  const [capital, setCapital] = useState(() => (inicial ? String(inicial.capital_inicial) : ''));
  const [metaDiaria, setMetaDiaria] = useState(() =>
    inicial ? String(inicial.meta_diaria) : '100'
  );

  const guardar = () => {
    const valor = parseMonto(capital || '0');
    const meta = parseMonto(metaDiaria || '0');
    if (!nombre.trim()) return aviso('Ponle un nombre a tu negocio.');
    if (isNaN(valor) || valor < 0)
      return aviso('El capital inicial debe ser un número válido. Puede ser 0.');
    if (!Number.isFinite(meta) || meta < 0)
      return aviso('La meta diaria debe ser un número válido. Puede ser 0.');
    onSubmit({
      nombre: nombre.trim(),
      rubro: rubro.trim() || null,
      emoji: icono,
      capital_inicial: valor,
      meta_diaria: meta,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 justify-end bg-black/50">
          <ScrollView
            className="w-full rounded-t-[30px] border border-white bg-[#fffefa] px-5 pt-3"
            contentContainerClassName="gap-3.5 pb-8"
            style={{ maxHeight: '90%' }}
            keyboardShouldPersistTaps="always"
          >
            <View className="mb-1 h-1.5 w-12 self-center rounded-full bg-[#ddd5c7]" />
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#e6f0e9]">
                  <Ionicons name={icono} size={21} color="#246b61" />
                </View>
                <View>
                  <Text className="text-xl font-bold text-[#243b38]">
                    {inicial ? 'Editar negocio' : 'Nuevo negocio'}
                  </Text>
                  <Text className="text-xs text-[#71817b]">Personaliza tu emprendimiento</Text>
                </View>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={8}
                className="h-8 w-8 items-center justify-center rounded-full bg-[#f4efe4]"
              >
                <Ionicons name="close" size={18} color="#5d706c" />
              </Pressable>
            </View>

            <View className="gap-1.5">
              <Text className="text-xs font-bold uppercase tracking-wider text-[#5d706c]">
                Elige un ícono
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 py-0.5"
                keyboardShouldPersistTaps="always"
              >
                {ICONOS_NEGOCIO.map((e) => {
                  const selected = icono === e;
                  return (
                    <Pressable
                      key={e}
                      accessibilityRole="button"
                      accessibilityLabel={`Elegir icono ${e.replace('-outline', '').replaceAll('-', ' ')}`}
                      accessibilityState={{ selected }}
                      onPress={() => setIcono(e)}
                      className={`h-12 w-12 items-center justify-center rounded-2xl border ${
                        selected ? 'border-[#246b61] bg-[#246b61]' : 'border-[#fffef8] bg-[#e7e4da]'
                      }`}
                    >
                      <Ionicons name={e} size={22} color={selected ? '#ffffff' : '#71817b'} />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <Input
              label="Nombre del negocio"
              icon="storefront-outline"
              placeholder="Ej. Almuerzos Doña Rosa"
              autoCapitalize="words"
              value={nombre}
              onChangeText={setNombre}
            />
            <Input
              label="Rubro (opcional)"
              icon="pricetag-outline"
              placeholder="Ej. comida, ropa, servicios"
              autoCapitalize="sentences"
              value={rubro}
              onChangeText={setRubro}
            />
            <Input
              label="Capital inicial ($)"
              icon="wallet-outline"
              placeholder="Ej. 200.00"
              keyboardType="decimal-pad"
              value={capital}
              onChangeText={setCapital}
            />
            <Input
              label="Meta diaria de ventas ($)"
              icon="trending-up-outline"
              placeholder="Ej. 100.00"
              keyboardType="decimal-pad"
              value={metaDiaria}
              onChangeText={setMetaDiaria}
            />

            <View className="mt-1 gap-2">
              <Button
                title="Guardar negocio"
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
