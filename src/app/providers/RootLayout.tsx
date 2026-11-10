import { AuthProvider, useAuth } from '@/entities/session/model/AuthContext';
import { NegocioProvider } from '@/features/business-management/model/NegocioContext';
import { createSessionFromUrl } from '@/features/auth/api/auth';
import { showError } from '@/shared/lib/notify';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

/** Decide a qué grupo de pantallas entra el usuario según tenga sesión o no. */
function Guard() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const url = Linking.useURL();
  const handledUrl = useRef<string | null>(null);
  const processingUrlRef = useRef(false);
  const [processingUrl, setProcessingUrl] = useState(false);

  useEffect(() => {
    if (!url || handledUrl.current === url) return;
    handledUrl.current = url;
    processingUrlRef.current = true;
    setProcessingUrl(true);
    createSessionFromUrl(url).catch((error: unknown) => {
      showError(error, 'No pudimos completar el inicio de sesión');
    }).finally(() => {
      processingUrlRef.current = false;
      setProcessingUrl(false);
    });
  }, [url]);

  useEffect(() => {
    if (loading || processingUrlRef.current || processingUrl) return;
    const enAuth = segments[0] === '(auth)';
    const authRoute = (segments as string[])[1];
    const enReset = authRoute === 'reset-password';
    const enVerificacion = segments[0] === 'verify-email';
    if (!session && !enAuth && !enVerificacion) router.replace('/login');
    else if (session && enAuth && !enReset) router.replace('/');
  }, [session, loading, processingUrl, segments, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-[#f3f8f2]">
        <View className="h-14 w-14 items-center justify-center rounded-[20px] border border-white bg-[#dff3e7]">
          <Ionicons name="storefront" size={27} color="#16896a" />
        </View>
        <ActivityIndicator size="small" color="#246b61" />
        <Text className="text-sm font-semibold text-[#58736a]">Abriendo tu tienda...</Text>
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NegocioProvider>
        <StatusBar style="dark" />
        <Guard />
      </NegocioProvider>
    </AuthProvider>
  );
}
