import { hoy } from '@/shared/lib/date';
import { money, parseMonto } from '@/shared/lib/format';
import { aviso, showError } from '@/shared/lib/notify';
import { abrirJornada } from '@/entities/cash/api/jornadas';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import Input from '@/shared/ui/Input';

type Props = { negocioId: string; sugerido: number; onDone: () => void };

export default function OpenDayCard({ negocioId, sugerido, onDone }: Props) {
  const [editado, setEditado] = useState(false);
  const [capitalManual, setCapitalManual] = useState('');
  const [loading, setLoading] = useState(false);

  const capital = editado ? capitalManual : sugerido ? String(sugerido) : '';

  const abrir = async () => {
    const monto = parseMonto(capital || '0');
    if (isNaN(monto) || monto < 0) return aviso('Escribe con cuánto dinero empiezas hoy. Puede ser 0.');
    setLoading(true);
    try {
      await abrirJornada(negocioId, hoy(), monto);
      onDone();
    } catch (e) {
      showError(e, 'No pudimos abrir tu jornada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card delay={90} className="gap-3.5 border-[#e8d7b4] bg-[#fffdf8]">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#f7efd9]">
            <Ionicons name="sunny" size={21} color="#d99a36" />
          </View>
          <View>
            <Text className="text-lg font-bold text-[#243b38]">Empieza tu jornada</Text>
            <Text className="text-xs text-[#71817b]">Registra tu efectivo inicial de hoy</Text>
          </View>
        </View>
        {sugerido > 0 ? (
          <Pressable
            onPress={() => {
              setEditado(true);
              setCapitalManual(String(sugerido));
            }}
            className="rounded-full border border-[#e5d2a5] bg-[#f7efd9] px-3 py-1 active:opacity-75"
          >
            <Text className="text-xs font-bold text-[#9a6b19]">Sugerido: {money(sugerido)}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text className="text-sm leading-5 text-[#5d706c]">
        Cuenta el efectivo con el que empiezas hoy. El valor sugerido es una referencia; ajústalo
        según el dinero que tengas realmente en caja.
      </Text>

      <Input
        label="Capital de inicio del día ($)"
        icon="cash-outline"
        placeholder="Ej. 50.00"
        keyboardType="decimal-pad"
        value={capital}
        onChangeText={(val) => {
          setEditado(true);
          setCapitalManual(val);
        }}
      />

      <Button title="Abrir jornada de hoy" icon="sunny" onPress={abrir} loading={loading} />
    </Card>
  );
}
