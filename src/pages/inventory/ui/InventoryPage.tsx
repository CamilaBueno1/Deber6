import ProductoCard from '@/features/product-management/ui/ProductoCard';
import ProductoForm from '@/features/product-management/ui/ProductoForm';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import EmptyState from '@/shared/ui/EmptyState';
import Header from '@/widgets/app-header/ui/Header';
import SectionEntrance from '@/shared/ui/SectionEntrance';
import SectionLottie from '@/shared/ui/SectionLottie';
import { useNegocio } from '@/features/business-management/model/NegocioContext';
import { useStockData } from '@/widgets/product-overview/model/useStockData';
import { money } from '@/shared/lib/format';
import { confirmar, showError } from '@/shared/lib/notify';
import {
  actualizarProducto,
  crearProducto,
  eliminarFotoProducto,
  eliminarProducto,
  subirFotoProducto,
} from '@/entities/product/api/productos';
import {
  categoriasDeInventario,
  categoriasExistentes,
} from '@/entities/product/model/categories';
import { claveCategoria } from '@/shared/lib/category';
import type { Producto, ProductoInput } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Share, ScrollView, Text, View } from 'react-native';

type FormState = { producto?: Producto } | null;

export default function InventarioScreen() {
  const router = useRouter();
  const { selected } = useNegocio();
  const { productos, loading, recargar } = useStockData(selected?.id);
  const [form, setForm] = useState<FormState>(null);
  const [guardando, setGuardando] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const categorias = useMemo(() => categoriasDeInventario(productos), [productos]);
  const categoriasSugeridas = useMemo(() => categoriasExistentes(productos), [productos]);
  const productosFiltrados = useMemo(
    () =>
      categoriaActiva
        ? productos.filter((producto) => claveCategoria(producto.categoria) === categoriaActiva)
        : productos,
    [categoriaActiva, productos],
  );
  const productosBajos = useMemo(
    () => productos.filter((producto) => producto.stock <= producto.stock_minimo),
    [productos]
  );

  const guardar = async (
    input: ProductoInput,
    foto?: { uri: string; base64: string }
  ) => {
    if (!selected) return;
    setGuardando(true);
    let fotoNueva: { path: string; url: string } | null = null;
    try {
      if (foto) {
        fotoNueva = await subirFotoProducto(selected.id, foto.base64);
      }
      const datos = { ...input, foto_path: fotoNueva?.path ?? input.foto_path };
      if (form?.producto) {
        await actualizarProducto(form.producto.id, datos);
      } else {
        await crearProducto(selected.id, datos);
      }

      const fotoAnterior = form?.producto?.foto_path;
      if (fotoAnterior && fotoAnterior !== datos.foto_path) {
        try {
          await eliminarFotoProducto(fotoAnterior);
        } catch (error) {
          showError(error, 'Producto guardado; no pudimos eliminar la foto anterior');
        }
      }

      setForm(null);
      await recargar();
    } catch (error) {
      if (fotoNueva) {
        try {
          await eliminarFotoProducto(fotoNueva.path);
        } catch (cleanupError) {
          showError(cleanupError, 'No pudimos limpiar la foto que no se guardó');
        }
      }
      showError(error, 'No pudimos guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = (producto: Producto) =>
    confirmar(
      'Eliminar producto',
      `¿Quieres eliminar "${producto.nombre}"? Las ventas anteriores se conservarán.`,
      async () => {
        try {
          await eliminarProducto(producto.id);
          await recargar();
          if (producto.foto_path) {
            try {
              await eliminarFotoProducto(producto.foto_path);
            } catch (error) {
              showError(error, 'Producto eliminado; no pudimos borrar su foto');
            }
          }
        } catch (error) {
          showError(error, 'No pudimos eliminar el producto');
        }
      }
    );

  const compartirReposicion = async () => {
    if (!selected || productosBajos.length === 0) return;
    const lineas = productosBajos.map((producto) => {
      const faltan = Math.max(producto.stock_minimo - producto.stock, 1);
      return `• ${producto.nombre}: pedir ${faltan} (hay ${producto.stock})`;
    });
    try {
      await Share.share({
        title: `Reposición para ${selected.nombre}`,
        message: `Lista de reposición — ${selected.nombre}\n\n${lineas.join('\n')}`,
      });
    } catch (error) {
      showError(error, 'No pudimos compartir la lista de reposición');
    }
  };

  if (!selected) {
    return (
      <View className="flex-1 bg-[#FFFAF5]">
        <Header eyebrow="StockYa" title="Inventario" />
        <View className="p-4">
          <Card>
            <EmptyState
              title="Crea tu tienda primero"
              message="Agrega un negocio para empezar a cargar productos y controlar su stock."
              actionLabel="Crear negocio"
              icon="storefront-outline"
              onAction={() => router.push('/negocios')}
            />
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FFFAF5]">
      <Header
        eyebrow={selected.nombre}
        title="Inventario"
        rightAction={{
          label: 'Agregar',
          icon: 'add-circle-outline',
          onPress: () => setForm({}),
        }}
      />
      <ScrollView
        contentContainerClassName="gap-4 p-4 pb-10"
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <SectionLottie
          variant="store"
          title="Cada producto en su lugar"
          caption="Controla cantidades, precios y lo que necesitas reponer."
        />

        <Card delay={40} className="gap-3">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#FCE5D8]">
              <Ionicons name="cube" size={21} color="#D97955" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-extrabold text-[#493A36]">
                {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
              </Text>
              <Text className="text-xs text-[#756B65]">en el inventario de {selected.nombre}</Text>
            </View>
            <View className="items-end">
              <Text className="text-lg font-black text-[#b84c37]">{productosBajos.length}</Text>
              <Text className="text-[10px] font-bold uppercase text-[#9a6b19]">por reponer</Text>
            </View>
          </View>
          {productosBajos.length > 0 ? (
            <Button
              title="Compartir"
              icon="share-social-outline"
              variant="outline"
              onPress={compartirReposicion}
            />
          ) : (
            <View className="flex-row items-center gap-2 rounded-xl bg-[#FCE5D8] px-3 py-2.5">
              <Ionicons name="checkmark-circle" size={17} color="#D97955" />
              <Text className="flex-1 text-xs font-semibold text-[#A95743]">
                Todo en orden: no hay productos bajo el mínimo.
              </Text>
            </View>
          )}
        </Card>

        {loading && productos.length === 0 ? (
          <Card delay={100} className="items-center gap-2 py-8">
            <Text className="text-sm font-semibold text-[#756B65]">Cargando inventario...</Text>
          </Card>
        ) : productos.length === 0 ? (
          <Card>
            <EmptyState
              title="Tu inventario está vacío"
              message="Agrega productos con su precio, costo y stock mínimo para empezar."
              actionLabel="Agregar primer producto"
              icon="cube-outline"
              onAction={() => setForm({})}
            />
          </Card>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 px-1"
            >
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: categoriaActiva === null }}
                onPress={() => setCategoriaActiva(null)}
                className={`rounded-full border px-3.5 py-2 ${
                  categoriaActiva === null
                    ? 'border-[#D97955] bg-[#D97955]'
                    : 'border-[#EFE3DA] bg-[#FFFFFF]'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    categoriaActiva === null ? 'text-white' : 'text-[#6E625C]'
                  }`}
                >
                  Todas · {productos.length}
                </Text>
              </Pressable>
              {categorias.map((categoria) => {
                const clave = claveCategoria(categoria);
                const activa = categoriaActiva === clave;
                const cantidad = productos.filter(
                  (producto) => claveCategoria(producto.categoria) === clave,
                ).length;
                return (
                  <Pressable
                    key={clave}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activa }}
                    onPress={() => setCategoriaActiva(clave)}
                    className={`rounded-full border px-3.5 py-2 ${
                      activa ? 'border-[#D97955] bg-[#D97955]' : 'border-[#EFE3DA] bg-[#FFFFFF]'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${activa ? 'text-white' : 'text-[#6E625C]'}`}>
                      {categoria} · {cantidad}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="flex-row items-end justify-between px-1">
              <View>
                <Text className="text-lg font-extrabold text-[#493A36]">Tus productos</Text>
                <Text className="text-xs text-[#756B65]">
                  {productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto' : 'productos'} · toca para editar
                </Text>
              </View>
              <Text className="text-xs font-bold text-[#6E625C]">{money(
                productos.reduce((total, producto) => total + producto.stock * producto.costo, 0)
              )}</Text>
            </View>
            <View className="gap-2.5">
              {productosFiltrados.length === 0 ? (
                <Card>
                  <EmptyState
                    title="No hay productos en esta categoría"
                    message="Prueba con otra categoría o vuelve a mostrar todo el inventario."
                    actionLabel="Ver todas"
                    icon="albums-outline"
                    onAction={() => setCategoriaActiva(null)}
                  />
                </Card>
              ) : (
                productosFiltrados.map((producto, index) => (
                <SectionEntrance key={producto.id} delay={Math.min(index * 35, 280)}>
                  <ProductoCard
                    producto={producto}
                    onEdit={() => setForm({ producto })}
                    onDelete={() => borrar(producto)}
                  />
                </SectionEntrance>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      <ProductoForm
        key={form ? form.producto?.id ?? 'nuevo' : 'cerrado'}
        visible={form !== null}
        inicial={form?.producto}
        categorias={categoriasSugeridas}
        saving={guardando}
        onSubmit={guardar}
        onClose={() => setForm(null)}
      />
    </View>
  );
}
