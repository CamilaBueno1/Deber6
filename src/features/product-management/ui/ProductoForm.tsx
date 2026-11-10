import { Image } from 'expo-image';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Producto, ProductoInput } from '@/shared/types';
import { claveCategoria, normalizarCategoria } from '@/shared/lib/category';
import { parseMonto } from '@/shared/lib/format';
import { aviso, showError } from '@/shared/lib/notify';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';

type Props = {
  visible: boolean;
  inicial?: Producto;
  categorias: string[];
  saving: boolean;
  onSubmit: (input: ProductoInput, foto?: { uri: string; base64: string }) => void;
  onClose: () => void;
};

export default function ProductoForm({
  visible,
  inicial,
  categorias,
  saving,
  onSubmit,
  onClose,
}: Props) {
  const [nombre, setNombre] = useState(() => inicial?.nombre ?? '');
  const [categoria, setCategoria] = useState(() => inicial?.categoria ?? '');
  const [precio, setPrecio] = useState(() => (inicial ? String(inicial.precio_venta) : ''));
  const [costo, setCosto] = useState(() => (inicial ? String(inicial.costo) : ''));
  const [stock, setStock] = useState(() => (inicial ? String(inicial.stock) : '0'));
  const [minimo, setMinimo] = useState(() => (inicial ? String(inicial.stock_minimo) : '2'));
  const [foto, setFoto] = useState<{ uri: string; base64: string } | null>(null);
  const [quitarFoto, setQuitarFoto] = useState(false);
  const [procesandoFoto, setProcesandoFoto] = useState(false);

  const seleccionarFoto = async () => {
    setProcesandoFoto(true);
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        aviso('Permite el acceso a tus fotos para agregar una imagen al producto.');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
      });
      if (!resultado.canceled) {
        const imagen = resultado.assets[0];
        if (!imagen) throw new Error('No pudimos leer la imagen seleccionada.');
        const procesada = await ImageManipulator.manipulate(imagen.uri)
          .resize({ width: 1200 })
          .renderAsync();
        const jpg = await procesada.saveAsync({
          format: SaveFormat.JPEG,
          compress: 0.78,
          base64: true,
        });
        if (!jpg.base64) throw new Error('No pudimos preparar la imagen para subirla.');
        setFoto({ uri: jpg.uri, base64: jpg.base64 });
        setQuitarFoto(false);
      }
    } catch (error) {
      showError(error, 'No pudimos abrir tus fotos');
    } finally {
      setProcesandoFoto(false);
    }
  };

  const guardar = () => {
    const precioVenta = parseMonto(precio);
    const costoUnitario = parseMonto(costo || '0');
    const stockActual = Number(stock);
    const stockMinimo = Number(minimo);

    if (!nombre.trim()) return aviso('Escribe el nombre del producto.');
    if (!Number.isFinite(precioVenta) || precioVenta <= 0)
      return aviso('El precio de venta debe ser mayor que cero.');
    if (!Number.isFinite(costoUnitario) || costoUnitario < 0)
      return aviso('El costo debe ser un número válido. Puede ser 0.');
    if (!Number.isSafeInteger(stockActual) || stockActual < 0)
      return aviso('El stock debe ser un número entero igual o mayor que 0.');
    if (!Number.isSafeInteger(stockMinimo) || stockMinimo < 0)
      return aviso('El stock mínimo debe ser un número entero igual o mayor que 0.');

    onSubmit(
      {
        nombre: nombre.trim(),
        categoria: normalizarCategoria(categoria),
        precio_venta: precioVenta,
        costo: costoUnitario,
        stock: stockActual,
        stock_minimo: stockMinimo,
        foto_path: quitarFoto ? null : (inicial?.foto_path ?? null),
      },
      foto ?? undefined
    );
  };

  const uriFoto = foto?.uri ?? (quitarFoto ? null : inicial?.foto_url);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-end bg-black/50">
          <ScrollView
            className="w-full rounded-t-[30px] border border-white bg-[#fffefa] px-5 pt-3"
            contentContainerClassName="gap-3.5 pb-8"
            style={{ maxHeight: '92%', flexShrink: 1 }}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-1 h-1.5 w-12 self-center rounded-full bg-[#ddd5c7]" />
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-[#243b38]">
                  {inicial ? 'Editar producto' : 'Nuevo producto'}
                </Text>
                <Text className="text-xs text-[#71817b]">Completa los datos de tu inventario</Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={8}
                className="h-10 w-10 items-center justify-center rounded-2xl bg-[#f1f0e8]"
              >
                <Ionicons name="close" size={18} color="#5d706c" />
              </Pressable>
            </View>

            <View className="flex-row items-center gap-3">
              {uriFoto ? (
                <Image source={{ uri: uriFoto }} contentFit="cover" style={{ width: 76, height: 76, borderRadius: 18 }} />
              ) : (
                <View className="h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-[#e4f1e9]">
                  <Ionicons name="image-outline" size={28} color="#348a76" />
                </View>
              )}
              <View className="flex-1 gap-2">
                <Button
                  title={uriFoto ? 'Cambiar foto' : 'Agregar foto'}
                  icon="camera-outline"
                  variant="outline"
                  size="sm"
                  onPress={seleccionarFoto}
                  loading={procesandoFoto}
                  disabled={saving}
                />
                {uriFoto ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setFoto(null);
                      setQuitarFoto(true);
                    }}
                  >
                    <Text className="text-center text-xs font-bold text-[#b84c37]">Quitar foto</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <Input
              label="Nombre del producto"
              icon="pricetag-outline"
              placeholder="Ej. Café molido"
              autoCapitalize="words"
              value={nombre}
              onChangeText={setNombre}
            />
            <Input
              label="Categoría"
              icon="albums-outline"
              placeholder="Ej. Bebidas, limpieza..."
              autoCapitalize="sentences"
              value={categoria}
              onChangeText={setCategoria}
            />
            {categorias.length > 0 ? (
              <View className="gap-2">
                <Text className="text-[11px] font-bold text-[#71817b]">
                  Elige una existente o escribe una nueva
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-2"
                >
                  {categorias.map((opcion) => {
                    const activa = claveCategoria(categoria) === claveCategoria(opcion);
                    return (
                      <Pressable
                        key={claveCategoria(opcion)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: activa }}
                        onPress={() => setCategoria(opcion)}
                        className={`rounded-full border px-3 py-2 ${
                          activa
                            ? 'border-[#16896a] bg-[#ddf4e6]'
                            : 'border-[#e5e8df] bg-[#fffefa]'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            activa ? 'text-[#16896a]' : 'text-[#5d706c]'
                          }`}
                        >
                          {opcion}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}
            <View className="flex-row gap-3">
              <Input
                label="Precio de venta"
                icon="cash-outline"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={precio}
                onChangeText={setPrecio}
                containerClassName="flex-1"
              />
              <Input
                label="Costo"
                icon="wallet-outline"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={costo}
                onChangeText={setCosto}
                containerClassName="flex-1"
              />
            </View>
            <View className="flex-row gap-3">
              <Input
                label="Stock actual"
                icon="cube-outline"
                placeholder="0"
                keyboardType="number-pad"
                value={stock}
                onChangeText={setStock}
                containerClassName="flex-1"
              />
              <Input
                label="Stock mínimo"
                icon="alert-circle-outline"
                placeholder="2"
                keyboardType="number-pad"
                value={minimo}
                onChangeText={setMinimo}
                containerClassName="flex-1"
              />
            </View>

            <View className="mt-1 gap-2">
              <Button
                title="Guardar producto"
                icon="checkmark-circle-outline"
                onPress={guardar}
                loading={saving}
              />
              <Button title="Cancelar" variant="outline" onPress={onClose} disabled={saving} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
