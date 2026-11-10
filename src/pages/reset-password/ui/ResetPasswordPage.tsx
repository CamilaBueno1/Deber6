import AuthShell from '@/shared/ui/AuthShell';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { aviso, showError } from '@/shared/lib/notify';
import { supabase } from '@/shared/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const guardar = async () => {
    if (password.length < 6) return aviso('La contraseña debe tener al menos 6 caracteres.');
    if (password !== confirm) return aviso('Las dos contraseñas deben ser iguales.');
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return showError(error, 'No pudimos cambiar tu contraseña');
      aviso('Ya puedes usar tu nueva contraseña.', 'Contraseña actualizada');
      router.replace('/');
    } catch (error) {
      showError(error, 'No pudimos cambiar tu contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Nueva contraseña"
      subtitle="Elige una contraseña segura que puedas recordar."
      showWelcomeAnimation
    >
      <View className="gap-3">
        <View className="flex-row items-center gap-3 rounded-2xl border border-[#dcecdf] bg-[#f1f8f1] p-3.5">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#ddf4e6]">
            <Ionicons name="shield-checkmark-outline" size={20} color="#16896a" />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-bold text-[#243b38]">Protege tu cuenta</Text>
            <Text className="text-xs leading-4 text-[#71817b]">
              Usa al menos 6 caracteres. Toca el ojo para mostrar u ocultar cada campo.
            </Text>
          </View>
        </View>
        <Input
          label="Nueva contraseña"
          icon="lock-closed-outline"
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          returnKeyType="next"
        />
        <Input
          label="Repite la contraseña"
          icon="shield-checkmark-outline"
          placeholder="Escríbela otra vez"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          returnKeyType="done"
        />
      </View>
      <Button
        title="Guardar contraseña"
        variant="dark"
        icon="checkmark-circle-outline"
        onPress={guardar}
        loading={loading}
      />
    </AuthShell>
  );
}
