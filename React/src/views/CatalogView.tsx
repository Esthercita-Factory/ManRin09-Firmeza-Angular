import { useState } from 'react';
import type { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Building2, Plus, Eye, Package, SlidersHorizontal, Check, Sparkles } from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  loading: boolean;
  search: string;
  onSelectProduct: (p: Product) => void;
}

export function CatalogView({ products, loading, search, onSelectProduct }: CatalogViewProps) {
  const { addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');

  const stores = ['all', ...Array.from(new Set(products.map(p => p.enterpriseName || 'Ferretería Principal').filter(Boolean)))];
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase();
    const storeName = p.enterpriseName || 'Ferretería Principal';
    const matchesSearch = p.name.toLowerCase().includes(q) || 
                          p.sku.toLowerCase().includes(q) ||
                          storeName.toLowerCase().includes(q) ||
                          p.description?.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStore = selectedStore === 'all' || storeName.toLowerCase() === selectedStore.toLowerCase();
    return matchesSearch && matchesCategory && matchesStore;
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Banner Principal */}
      <section className="bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Red Unificada de Ferreterías & Materiales
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Catálogo de Materiales y Herramientas por Tienda
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Consulta en tiempo real existencias disponibles en cada ferretería aliada de Colombia. Precios directos de bodega.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-900/80 border border-slate-800 px-6 py-4 rounded-2xl text-center">
              <span className="block text-2xl font-black text-amber-400">{stores.length - 1 || 1}</span>
              <span className="text-xs text-slate-400">Ferreterías Conectadas</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 px-6 py-4 rounded-2xl text-center">
              <span className="block text-2xl font-black text-emerald-400">{products.length}</span>
              <span className="text-xs text-slate-400">Productos Activos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cuerpo del Catálogo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filtros Laterales */}
          <aside className="w-full lg:w-64 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-6 shrink-0">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-sm">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Filtros</span>
            </div>

            {/* Filtro por Tienda / Ferretería */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Ferretería Emisora
              </label>
              <div className="space-y-1.5">
                {stores.map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedStore(st)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl transition cursor-pointer flex items-center justify-between ${
                      selectedStore === st
                        ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{st === 'all' ? 'Todas las Tiendas' : st}</span>
                    {selectedStore === st && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro por Categoría */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Categorías
              </label>
              <div className="space-y-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl transition cursor-pointer flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate capitalize">{cat === 'all' ? 'Todas las Categorías' : cat}</span>
                    {selectedCategory === cat && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Listado de Productos */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2">
              <span>Mostrando <strong className="text-slate-200">{filteredProducts.length}</strong> artículos</span>
              {(selectedCategory !== 'all' || selectedStore !== 'all') && (
                <button
                  onClick={() => { setSelectedCategory('all'); setSelectedStore('all'); }}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="h-72 bg-slate-950 border border-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Package className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-200">No hay productos con este criterio</h3>
                <p className="text-xs text-slate-400">Prueba cambiando la ferretería o la categoría seleccionada.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map(product => {
                  const inStock = product.stock > 0;
                  const storeName = product.enterpriseName || 'Ferretería Principal';

                  return (
                    <div
                      key={product.id}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-sm group"
                    >
                      <div>
                        {/* Ferretería Vendedora */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate max-w-[140px]">{storeName}</span>
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {product.sku}
                          </span>
                        </div>

                        {/* Nombre del Producto */}
                        <h3 
                          onClick={() => onSelectProduct(product)}
                          className="font-bold text-slate-100 text-base group-hover:text-amber-400 transition cursor-pointer line-clamp-2 leading-snug"
                        >
                          {product.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 capitalize block mt-1">
                          {product.category}
                        </span>

                        <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                          {product.description || 'Material certificado para construcción e infraestructura.'}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-800/80">
                        <div className="flex items-baseline justify-between mb-4">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Precio</span>
                            <span className="text-xl font-black text-white">
                              ${product.price.toLocaleString('es-CO')}
                            </span>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            inStock ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {inStock ? `${product.stock} disponibles` : 'Agotado'}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => onSelectProduct(product)}
                            className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-800 transition cursor-pointer"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={!inStock}
                            className={`col-span-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                              inStock 
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10' 
                                : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" /> Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
