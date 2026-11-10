import NegocioCard from '@/features/business-management/ui/NegocioCard';
import NegocioForm from '@/features/business-management/ui/NegocioForm';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import EmptyState from '@/shared/ui/EmptyState';
import Header from '@/widgets/app-header/ui/Header';
import SectionLottie from '@/shared/ui/SectionLottie';
import { useNegocio } from '@/features/business-management/model/NegocioContext';
import { confirmar, showError } from '@/shared/lib/notify';
import { actualizarNegocio, crearNegocio, eliminarNegocio } from '@/entities/business/api/negocios';
import type { Negocio, NegocioInput } from '@/shared/types';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

type FormState = { negocio?: Negocio } | null;

export default function NegociosScreen() {
  const { negocios, selected, select, reload } = useNegocio();
  const [form, setForm] = useState<FormState>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async (input: NegocioInput) => {
    setGuardando(true);
    try {
      if (form?.negocio) await actualizarNegocio(form.negocio.id, input);
      else await crearNegocio(input);
      setForm(null);
      await reload();
    } catch (e) {
      showError(e, 'No pudimos guardar el negocio');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = (n: Negocio) =>
    confirmar(
      'Eliminar negocio',
      `Se borrarán también todas las ventas y gastos de "${n.nombre}". Esta acción no se puede deshacer.`,
      async () => {
        try {
          await eliminarNegocio(n.id);
          await reload();
        } catch (e) {
          showError(e, 'No pudimos eliminarlo');
        }
      }
    );

  return (
    <View className="flex-1 bg-[#f3f8f2]">
      <Header
        eyebrow="Tus emprendimientos"
        title="Mis negocios"
        rightAction={{
          label: 'Nuevo',
          icon: 'add-circle-outline',
          onPress: () => setForm({}),
        }}
      />

      <ScrollView contentContainerClassName="gap-3.5 p-4 pb-10" showsVerticalScrollIndicator={false}>
        <SectionLottie
          variant="business"
          title="Un espacio para cada idea"
          caption="Organiza y cambia entre tus emprendimientos fácilmente."
        />

        <Button title="Agregar nuevo negocio" icon="add-circle-outline" onPress={() => setForm({})} />

        {negocios.length === 0 ? (
          <Card delay={80}>
            <EmptyState
              title="Aún no tienes negocios"
              message="Agrega el primero para empezar a registrar tus ventas y gastos diarios."
              icon="storefront-outline"
            />
          </Card>
        ) : (
          <View className="gap-3">
            <Text className="px-1 text-xs font-bold uppercase tracking-wider text-[#5d706c]">
              Toca un negocio para activarlo ({negocios.length})
            </Text>
            {negocios.map((n) => (
              <NegocioCard
                key={n.id}
                negocio={n}
                activo={selected?.id === n.id}
                onSelect={() => select(n.id)}
                onEdit={() => setForm({ negocio: n })}
                onDelete={() => borrar(n)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <NegocioForm
        key={form ? form.negocio?.id ?? 'new' : 'closed'}
        visible={form !== null}
        inicial={form?.negocio}
        saving={guardando}
        onSubmit={guardar}
        onClose={() => setForm(null)}
      />
    </View>
  );
}
