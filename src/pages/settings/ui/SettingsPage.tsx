import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import Header from '@/widgets/app-header/ui/Header';
import SectionLottie from '@/shared/ui/SectionLottie';
import Input from '@/shared/ui/Input';
import { useAuth } from '@/entities/session/model/AuthContext';
import { useNegocio } from '@/features/business-management/model/NegocioContext';
import { aviso, showError } from '@/shared/lib/notify';
import { supabase } from '@/shared/lib/supabase';
import { inicialesUsuario, nombreCompletoUsuario } from '@/entities/user/model/user';
import { Ionicons } from '@expo/vector-icons';
import type { Session } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const miembroDesde = (iso?: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
};

function PulsingAvatar({ iniciales }: { iniciales: string }) {
  const pop = useSharedValue(0.6);

  useEffect(() => {
    pop.set(withSpring(1, { damping: 10, stiffness: 160 }));
  }, [pop]);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));

  return (
    <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={popStyle}>
        <View
          className="h-20 w-20 items-center justify-center rounded-full border-4 border-white/90 bg-[#f3cf83]"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text className="text-2xl font-black text-[#173f39]">{iniciales}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function StatTile({
  icon,
  label,
  value,
  delay,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  delay: number;
}) {
  const y = useSharedValue(14);
  const o = useSharedValue(1);
  useEffect(() => {
    y.set(withDelay(delay, withSpring(0, { damping: 15, stiffness: 170 })));
    o.set(withDelay(delay, withTiming(1, { duration: 300 })));
  }, [delay, o, y]);
  const style = useAnimatedStyle(() => ({ opacity: o.get(), transform: [{ translateY: y.get() }] }));

  return (
    <Animated.View style={[{ flex: 1 }, style]}>
      <View className="items-center gap-1 rounded-2xl border border-white/15 bg-white/10 px-2 py-3">
        <Ionicons name={icon} size={18} color="#f3cf83" />
        <Text className="text-sm font-extrabold text-white" numberOfLines={1}>
          {value}
        </Text>
        <Text className="text-[10px] font-semibold uppercase tracking-wider text-[#bfe3d5]">
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

function MenuRow({
  icon,
  color,
  title,
  subtitle,
  href,
  delay,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  subtitle: string;
  href: Href;
  delay: number;
}) {
  const router = useRouter();
  const x = useSharedValue(-16);
  const o = useSharedValue(1);
  const scale = useSharedValue(1);
  const arrow = useSharedValue(0);

  useEffect(() => {
    x.set(withDelay(delay, withSpring(0, { damping: 16, stiffness: 170 })));
    o.set(withDelay(delay, withTiming(1, { duration: 300 })));
  }, [delay, o, x]);

  const style = useAnimatedStyle(() => ({
    opacity: o.get(),
    transform: [{ translateX: x.get() }, { scale: scale.get() }],
  }));
  const arrowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: arrow.get() }] }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={() => router.push(href)}
        onPressIn={() => {
          scale.set(withSpring(0.97, { damping: 15, stiffness: 300 }));
          arrow.set(withSpring(5, { damping: 12, stiffness: 260 }));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, { damping: 13, stiffness: 260 }));
          arrow.set(withSpring(0, { damping: 12, stiffness: 260 }));
        }}
        className="flex-row items-center gap-3 rounded-[22px] border border-white bg-[#fffefa] px-3.5 py-3"
        style={{
          shadowColor: '#243b38',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 5,
          elevation: 1,
        }}
      >
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: color + '1f' }}
        >
          <Ionicons name={icon} size={21} color={color} />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-[#243b38]">{title}</Text>
          <Text className="text-xs text-[#71817b]">{subtitle}</Text>
        </View>
        <Animated.View style={arrowStyle}>
          <Ionicons name="chevron-forward" size={18} color="#a3b0ab" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function ProfileDetails({ session }: { session: Session }) {
  const { negocios, selected } = useNegocio();
  const nombreActual = nombreCompletoUsuario(session);
  const iniciales = inicialesUsuario(session);
  const [nombre, setNombre] = useState(nombreActual);
  const [loading, setLoading] = useState(false);

  const heroO = useSharedValue(1);
  const heroY = useSharedValue(-12);
  useEffect(() => {
    heroO.set(withTiming(1, { duration: 350 }));
    heroY.set(withSpring(0, { damping: 15, stiffness: 160 }));
  }, [heroO, heroY]);
  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroO.get(),
    transform: [{ translateY: heroY.get() }],
  }));

  const proveedor = session.user.app_metadata?.provider === 'google' ? 'Google' : 'Correo';
  const desde = miembroDesde(session.user.created_at);

  const guardarNombre = async () => {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) return aviso('Escribe tu nombre.');
    if (nombreLimpio === nombreActual) return aviso('No hay cambios para guardar.');

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: nombreLimpio } });
      if (error) return showError(error, 'No pudimos actualizar tu nombre');
      aviso('Tu nombre se actualizó correctamente.', 'Perfil actualizado');
    } catch (error) {
      showError(error, 'No pudimos actualizar tu nombre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Animated.View style={heroStyle}>
        <LinearGradient
          colors={['#125b49', '#16896a', '#36aa77']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 28,
            padding: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#76c895',
            shadowColor: '#16453e',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.22,
            shadowRadius: 16,
            elevation: 5,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: -30,
              top: -40,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          />

          <View className="items-center gap-2">
            <PulsingAvatar iniciales={iniciales} />
            <Text className="mt-1 text-center text-xl font-extrabold text-white" numberOfLines={1}>
              {nombreActual || 'Mi perfil'}
            </Text>
            <Text className="text-center text-sm text-[#d7ede4]" numberOfLines={1}>
              {session.user.email}
            </Text>
            {desde ? (
              <View className="flex-row items-center gap-1.5 rounded-full border border-[#f3cf83]/35 bg-black/15 px-3 py-1">
                <Ionicons name="ribbon-outline" size={12} color="#f3cf83" />
                <Text className="text-[11px] font-bold text-[#f3cf83]">Emprendedor desde {desde}</Text>
              </View>
            ) : null}
          </View>

          <View className="mt-4 flex-row gap-2.5">
            <StatTile icon="storefront" label="Negocios" value={String(negocios.length)} delay={150} />
            <StatTile icon="star" label="Activo" value={selected?.nombre ?? '—'} delay={230} />
            <StatTile
              icon={proveedor === 'Google' ? 'logo-google' : 'mail'}
              label="Acceso"
              value={proveedor}
              delay={310}
            />
          </View>
        </LinearGradient>
      </Animated.View>

      <Card delay={120} className="gap-3.5">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#e6f0e9]">
            <Ionicons name="person" size={17} color="#246b61" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-extrabold text-[#243b38]">Datos personales</Text>
            <Text className="text-xs text-[#71817b]">Tu nombre aparece en el saludo de bienvenida.</Text>
          </View>
        </View>
        <Input
          label="Tu nombre"
          icon="person-outline"
          placeholder="Escribe tu nombre"
          autoCapitalize="words"
          value={nombre}
          onChangeText={setNombre}
          returnKeyType="done"
        />
        <Input
          label="Correo electrónico"
          icon="mail-outline"
          value={session.user.email ?? ''}
          editable={false}
          style={{ color: '#879792' }}
        />
        <Button
          title="Guardar cambios"
          icon="checkmark-circle-outline"
          onPress={guardarNombre}
          loading={loading}
        />
      </Card>

      <View className="gap-2.5">
        <Text className="px-1 text-xs font-bold uppercase tracking-wider text-[#5d706c]">
          Accesos rápidos
        </Text>
        <MenuRow
          icon="storefront"
          color="#246b61"
          title="Mis negocios"
          subtitle="Crea, edita o cambia de negocio"
          href="/negocios"
          delay={200}
        />
        <MenuRow
          icon="wallet"
          color="#d99a36"
          title="Vender rápido"
          subtitle="Registra ventas y descuenta el stock al instante"
          href="/vender"
          delay={270}
        />
        <MenuRow
          icon="cube"
          color="#4c8ca0"
          title="Inventario"
          subtitle="Edita productos y comparte lo que debes reponer"
          href="/inventario"
          delay={340}
        />
      </View>

      <View className="mt-1 flex-row items-center justify-center gap-1.5 py-2">
        <Ionicons name="shield-checkmark" size={14} color="#879792" />
        <Text className="text-xs text-[#879792]">StockYa · Tus datos están protegidos en la nube</Text>
      </View>
    </>
  );
}

export default function AjustesScreen() {
  const router = useRouter();
  const { session } = useAuth();

  return (
    <View className="flex-1 bg-[#f3f8f2]">
      <Header eyebrow="Tu cuenta" title="Mi perfil" showLogout />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="gap-4 p-4 pb-10"
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {session ? (
            <>
              <SectionLottie
                variant="profile"
                title="Tu centro de control"
                caption="Administra tu cuenta y mantén tu tienda a tu manera."
              />
              <ProfileDetails key={session.user.id} session={session} />
            </>
          ) : (
            <Card className="gap-3">
              <Text className="text-base font-bold text-[#243b38]">Sesión no disponible</Text>
              <Button
                title="Ir a iniciar sesión"
                icon="log-in-outline"
                onPress={() => router.replace('/login')}
              />
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
