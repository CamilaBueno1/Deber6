import AuthShell from '@/shared/ui/AuthShell';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import PasswordStrengthBar from '@/shared/ui/PasswordStrengthBar';
import { aviso, showError } from '@/shared/lib/notify';
import { evaluarPassword } from '@/shared/lib/password';
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
  const passwordEvaluation = evaluarPassword(password);

  const guardar = async () => {
    if (!passwordEvaluation.valid) return aviso('La contraseña debe tener 8 caracteres, mayúscula, minúscula y número.');
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
        <View className="flex-row items-center gap-3 rounded-2xl border border-[#F0DDD2] bg-[#FFF1E8] p-3.5">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FCE5D8]">
            <Ionicons name="shield-checkmark-outline" size={20} color="#D97955" />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-bold text-[#493A36]">Protege tu cuenta</Text>
            <Text className="text-xs leading-4 text-[#756B65]">
              Usa al menos 8 caracteres con mayúscula, minúscula y número. Toca el ojo para mostrar u ocultar cada campo.
            </Text>
          </View>
        </View>
        <Input
          label="Nueva contraseña"
          icon="lock-closed-outline"
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          returnKeyType="next"
        />
        <PasswordStrengthBar password={password} />
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
