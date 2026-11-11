import { colors } from '@/shared/config/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerClassName?: string;
  error?: string;
};

export default function Input({
  label,
  icon,
  containerClassName = '',
  error,
  onFocus,
  onBlur,
  style,
  ...props
}: Props) {
  const [mostrarClave, setMostrarClave] = useState(false);
  const [focused, setFocused] = useState(false);
  const esClave = props.secureTextEntry === true;

  return (
    <View className={`${containerClassName || 'w-full'} gap-1.5`}>
      {label ? (
        <Text className="text-xs font-bold uppercase tracking-wider text-[#6E625C]">{label}</Text>
      ) : null}
      <View
        className="w-full flex-row items-center rounded-2xl"
        style={{
          minHeight: 52,
          borderWidth: 1,
          borderColor: error ? '#ef4444' : focused ? '#D97955' : '#E8DDD5',
          backgroundColor: focused ? '#ffffff' : '#FFFAF6',
          shadowColor: '#806D62',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: focused ? 0.08 : 0,
          shadowRadius: 5,
          elevation: focused ? 1 : 0,
        }}
      >
        {icon ? (
          <View pointerEvents="none" className="pl-3.5 pr-1">
            <Ionicons name={icon} size={19} color={focused ? colors.brand : colors.muted} />
          </View>
        ) : null}
        <TextInput
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          editable={props.editable ?? true}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          secureTextEntry={esClave && !mostrarClave}
          style={[
            {
              flex: 1,
              minHeight: 50,
              paddingVertical: Platform.OS === 'ios' ? 14 : 11,
              paddingLeft: icon ? 8 : 16,
              paddingRight: esClave ? 6 : 16,
              fontSize: 16,
              color: '#493A36',
            },
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
            style,
          ]}
        />
        {esClave ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            accessibilityHint="Cambia la visibilidad de la contraseña"
            onPress={() => setMostrarClave((visible) => !visible)}
            hitSlop={10}
            className="h-12 w-12 items-center justify-center"
          >
            <Ionicons
              name={mostrarClave ? 'eye-off-outline' : 'eye-outline'}
              size={21}
              color={colors.brand}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="text-xs font-medium text-[#ef4444]">{error}</Text> : null}
    </View>
  );
}
