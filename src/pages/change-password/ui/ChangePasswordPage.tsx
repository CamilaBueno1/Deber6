import { useAuth } from '@/entities/session/model/AuthContext';
import { changePassword, dismissGooglePasswordSetup } from '@/features/auth/api/auth';
import { showError } from '@/shared/lib/notify';
import PasswordStrengthBar from '@/shared/ui/PasswordStrengthBar';
import Input from '@/shared/ui/Input';
import Header from '@/widgets/app-header/ui/Header';
import Button from '@/shared/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { desdeGoogle } = useLocalSearchParams<{ desdeGoogle?: string }>();
  const { session } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ current: '', next: '', confirm: '' });

  const providers = useMemo(() => session?.user?.app_metadata?.providers ?? [], [session]);
  const requiresCurrentPassword =
    providers.includes('email') || session?.user.user_metadata?.password_setup_completed === true;

  const validate = () => {
    const nextErrors = { current: '', next: '', confirm: '' };

    if (requiresCurrentPassword && !currentPassword.trim()) {
      nextErrors.current = 'Necesitas tu contraseña actual.';
    }
    if (!newPassword.trim()) {
      nextErrors.next = 'Escribe la nueva contraseña.';
    } else if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      nextErrors.next = 'Mínimo 8 caracteres, mayúscula, minúscula y número.';
    } else if (requiresCurrentPassword && newPassword === currentPassword) {
      nextErrors.next = 'La nueva contraseña debe ser distinta a la actual.';
    }
    if (!confirmPassword.trim()) {
      nextErrors.confirm = 'Confirma la nueva contraseña.';
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirm = 'Las contraseñas no coinciden.';
    }

    setErrors(nextErrors);
    return !nextErrors.current && !nextErrors.next && !nextErrors.confirm;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await changePassword(requiresCurrentPassword ? currentPassword : null, newPassword);
      if (desdeGoogle === '1') router.replace('/');
      else router.back();
    } catch (error) {
      showError(error, 'No pudimos cambiar tu contraseña');
    } finally {
      setLoading(false);
    }
  };

  const continuarSinPassword = async () => {
    setLoading(true);
    try {
      await dismissGooglePasswordSetup();
      router.replace('/');
    } catch (error) {
      showError(error, 'No pudimos guardar esta preferencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FFFAF5]">
      <Header title="Contraseña" eyebrow="Seguridad" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerClassName="gap-4 p-4 pb-10"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-3 rounded-[24px] border border-[#F0DDD2] bg-white p-4">
            <View className="flex-row items-center gap-3 rounded-2xl bg-[#FFF1E8] p-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FCE5D8]">
                <Ionicons name="shield-checkmark-outline" size={20} color="#D97955" />
              </View>
              <Text className="flex-1 text-sm font-semibold text-[#5A3D35]">
                {requiresCurrentPassword
                  ? 'Actualiza tu contraseña para seguir usando tu cuenta.'
                  : 'Como tu acceso es con Google, solo necesitas definir una contraseña.'}
              </Text>
            </View>

            {requiresCurrentPassword ? (
              <Input
                label="Contraseña actual"
                icon="lock-closed-outline"
                placeholder="Escribe tu contraseña actual"
                secureTextEntry
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  if (errors.current) setErrors((prev) => ({ ...prev, current: '' }));
                }}
                error={errors.current}
              />
            ) : null}

            <Input
              label="Nueva contraseña"
              icon="key-outline"
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (errors.next) setErrors((prev) => ({ ...prev, next: '' }));
              }}
              error={errors.next}
            />
            <PasswordStrengthBar password={newPassword} />

            <Input
              label="Confirmar contraseña"
              icon="shield-checkmark-outline"
              placeholder="Repite tu nueva contraseña"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: '' }));
              }}
              error={errors.confirm}
            />

            <Button
              title="Guardar contraseña"
              icon="checkmark-circle-outline"
              variant="dark"
              onPress={handleSubmit}
              loading={loading}
            />
            {desdeGoogle === '1' ? (
              <Button
                title="Más tarde"
                variant="outline"
                onPress={continuarSinPassword}
                disabled={loading}
              />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
