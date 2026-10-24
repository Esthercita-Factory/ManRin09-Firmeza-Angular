import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { ArrowLeft, Package, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';

interface OrdersViewProps {
  onBack: () => void;
  onGoToCatalog: () => void;
}

export function OrdersView({ onBack, onGoToCatalog }: OrdersViewProps) {
  const { user } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user?.token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await api.getMyPurchases(user.token);
      setOrders(data);
      setLoading(false);
    }
    loadOrders();
  }, [user]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </button>
        <h1 className="text-2xl font-black text-white">Mis Compras y Pedidos</h1>
      </div>

      {loading ? (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Cargando tu historial de compras...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-4">
          <Package className="w-16 h-16 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">Aún no tienes órdenes registradas</h2>
          <p className="text-xs text-slate-400">
            Explora el catálogo de nuestras ferreterías asociadas y realiza tu primer pedido.
          </p>
          <button
            onClick={onGoToCatalog}
            className="mt-2 px-6 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer"
          >
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={order.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition hover:border-slate-700"
              >
                {/* Cabecera de la Orden */}
                <div className="p-5 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        ORD #{order.id}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {order.isPaid ? 'Pagada / Confirmada' : 'Pendiente de Pago'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                      <span>•</span>
                      <CreditCard className="w-3 h-3" />
                      <span>{order.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Total de la orden</span>
                    <strong className="text-xl font-black text-amber-400">
                      ${Number(order.totalAmount || 0).toLocaleString('es-CO')}
                    </strong>
                  </div>
                </div>

                {/* Detalles de Ítems */}
                <div className="p-5 divide-y divide-slate-800/60">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                    Materiales Incluidos ({order.details?.length || 0})
                  </span>

                  {(order.details || []).map((detail: any) => (
                    <div
                      key={detail.id}
                      className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{detail.productName}</h4>
                          <span className="text-[10px] font-mono text-slate-400">SKU: {detail.productSku}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-200 block">
                          {detail.quantity} unid. × ${Number(detail.unitPrice).toLocaleString('es-CO')}
                        </span>
                        <strong className="text-xs text-amber-400 font-mono">
                          Subtotal: ${Number(detail.subtotal).toLocaleString('es-CO')}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
