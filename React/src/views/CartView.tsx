import { useStore } from '../context/StoreContext';
import { ArrowLeft, Building2, Package, Minus, Plus, Trash2, CreditCard, Check } from 'lucide-react';
import { useState } from 'react';

interface CartViewProps {
  onBack: () => void;
  onGoToLogin: () => void;
}

export function CartView({ onBack, onGoToLogin }: CartViewProps) {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, cartItemCount, user } = useStore();
  const [orderDone, setOrderDone] = useState(false);

  const handleConfirmOrder = () => {
    if (!user) {
      onGoToLogin();
      return;
    }
    setOrderDone(true);
    clearCart();
    setTimeout(() => {
      setOrderDone(false);
      onBack();
    }, 3500);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Seguir explorando catálogo
        </button>
        <h1 className="text-2xl font-black text-white">Bolsa de Pedidos ({cartItemCount})</h1>
      </div>

      {orderDone ? (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">¡Orden de Pedido Registrada!</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Hemos transmitido la solicitud a las ferreterías emisoras correspondientes para preparar el despacho.
          </p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer"
          >
            Volver al Catálogo
          </button>
        </div>
      ) : cart.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-4">
          <Package className="w-16 h-16 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">Tu carrito está vacío</h2>
          <p className="text-xs text-slate-400">Agrega productos del catálogo para generar tu pedido.</p>
          <button
            onClick={onBack}
            className="mt-2 px-6 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer"
          >
            Ver Productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Lista de Productos con Ferretería Emisora */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
              {cart.map(item => {
                const storeName = item.product.enterpriseName || 'Ferretería Principal';
                return (
                  <div key={item.product.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Building2 className="w-3 h-3" />
                        <span>Despachado por: {storeName}</span>
                      </span>

                      <h3 className="font-bold text-white text-sm">{item.product.name}</h3>
                      <span className="text-[11px] text-slate-400 font-mono block">SKU: {item.product.sku}</span>

                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, -1)}
                            className="px-2.5 py-1 text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="px-2.5 py-1 text-slate-400 hover:text-white cursor-pointer disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-[11px] text-slate-500">
                          ({item.product.stock} disponibles en bodega)
                        </span>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-xs text-red-400 hover:underline flex items-center gap-1 cursor-pointer ml-auto sm:ml-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Quitar
                        </button>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-amber-400 block">
                        ${(item.product.price * item.quantity).toLocaleString('es-CO')}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ${item.product.price.toLocaleString('es-CO')} c/u
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Resumen de la Orden
            </h3>

            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal Artículos ({cartItemCount}):</span>
                <strong className="text-white">${cartTotal.toLocaleString('es-CO')}</strong>
              </div>
              <div className="flex justify-between">
                <span>Flete Logístico:</span>
                <strong className="text-emerald-400">Directo en obra / A convenir</strong>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-800 text-sm font-black text-white">
                <span>Total Estimado:</span>
                <strong className="text-xl text-amber-400">${cartTotal.toLocaleString('es-CO')}</strong>
              </div>
            </div>

            {user ? (
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 block font-medium">Facturar a nombre de:</span>
                <strong className="text-slate-200">{user.fullName} ({user.email})</strong>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-xs text-amber-300">
                <span className="font-bold block mb-0.5">Identifícate como cliente:</span>
                Inicia sesión con tu cuenta de cliente para despachar tu pedido.
              </div>
            )}

            <button
              onClick={handleConfirmOrder}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {user ? 'Confirmar y Enviar Pedido' : 'Iniciar Sesión para Pedir'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
