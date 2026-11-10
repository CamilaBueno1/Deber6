import AuthShell from '@/shared/ui/AuthShell';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { aviso, showError } from '@/shared/lib/notify';
import { supabase } from '@/shared/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';

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
      <Input
        label="Nueva contraseña"
        icon="lock-closed-outline"
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Input
        label="Repite la contraseña"
        icon="shield-checkmark-outline"
        placeholder="Escríbela otra vez"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />
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
