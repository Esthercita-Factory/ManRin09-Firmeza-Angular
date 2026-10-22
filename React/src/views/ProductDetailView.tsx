import type { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, Building2, Package, ShoppingCart } from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onGoToCart: () => void;
}

export function ProductDetailView({ product, onBack, onGoToCart }: ProductDetailViewProps) {
  const { addToCart } = useStore();
  const storeName = product.enterpriseName || 'Ferretería Principal';
  const inStock = product.stock > 0;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
      </button>

      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Bloque Izquierdo */}
          <div className="space-y-6">
            <div className="h-64 sm:h-80 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Package className="w-10 h-10" />
              </div>
              <span className="text-xs font-mono text-slate-400">SKU: {product.sku}</span>
              <span className="text-xs text-amber-400 font-bold uppercase mt-1 tracking-wider">{product.category}</span>
            </div>

            {/* Ferretería Vendedora */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-bold block">Ferretería Emisora</span>
                <span className="text-sm font-bold text-white">{storeName}</span>
              </div>
            </div>
          </div>

          {/* Bloque Derecho */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 font-medium">Ubicación física: {product.location || 'Bodega General'}</span>
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-snug">
                  {product.name}
                </h1>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">Precio Unitario</span>
                <span className="text-3xl font-black text-amber-400">
                  ${product.price.toLocaleString('es-CO')}
                </span>
                <span className="text-xs text-slate-400 block mt-1">Precio directo de ferretería</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Descripción del Material</h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {product.description || 'Material certificado con trazabilidad garantizada.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Stock Disponible</span>
                  <strong className="text-emerald-400 text-sm">{product.stock} unidades</strong>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Despacho</span>
                  <strong className="text-slate-200 text-sm">Directo de ferretería</strong>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <button
                onClick={() => { addToCart(product); onGoToCart(); }}
                disabled={!inStock}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                  inStock
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-4 h-4" /> Comprar Ahora
              </button>

              <button
                onClick={() => addToCart(product)}
                disabled={!inStock}
                className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
              >
                Agregar al Carrito y Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
