import { Alert, Platform } from 'react-native';

export const aviso = (mensaje: string, titulo = 'Revisa este dato') => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
};

export const showError = (e: unknown, titulo = 'Algo salió mal') => {
  const mensaje = (e as { message?: string })?.message ?? 'Inténtalo de nuevo en unos segundos.';
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
};

export const confirmar = (
  titulo: string,
  mensaje: string,
  onConfirm: () => void,
  textoBoton = 'Eliminar',
) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.confirm(`${titulo}\n\n${mensaje}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(titulo, mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoBoton, style: 'destructive', onPress: onConfirm },
  ]);
};
