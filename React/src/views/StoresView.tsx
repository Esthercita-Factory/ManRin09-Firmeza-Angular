import type { Product, Plan } from '../types';
import { Store, Check, ArrowRight } from 'lucide-react';

interface StoresViewProps {
  products: Product[];
  plans: Plan[];
  onSelectStore: (storeName: string) => void;
}

export function StoresView({ products, plans, onSelectStore }: StoresViewProps) {
  const stores = Array.from(new Set(products.map(p => p.enterpriseName || 'Ferretería Principal').filter(Boolean)));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-8">
      <div className="max-w-2xl">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Ecosistema Firmeza</span>
        <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">
          Ferreterías y Puntos de Despacho Aliados
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Conoce las ferreterías que integran su inventario a nuestra plataforma. Puedes comprar productos de una ferretería en particular o combinar pedidos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map(storeName => {
          const storeProducts = products.filter(p => (p.enterpriseName || 'Ferretería Principal') === storeName);
          const storeTotalStock = storeProducts.reduce((acc, p) => acc + p.stock, 0);

          return (
            <div 
              key={storeName} 
              className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{storeName}</h3>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Inventario Sincronizado
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                  <div className="bg-slate-900 p-2.5 rounded-lg">
                    <span className="text-slate-500 block">Artículos</span>
                    <strong className="text-slate-200">{storeProducts.length} tipos</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg">
                    <span className="text-slate-500 block">Unidades</span>
                    <strong className="text-amber-400">{storeTotalStock} en stock</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectStore(storeName)}
                className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold text-xs rounded-xl border border-slate-800 transition cursor-pointer flex items-center justify-center gap-2"
              >
                Ver Catálogo de esta Ferretería <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Planes de Afiliación */}
      {plans.length > 0 && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-10 mt-12">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">¿Tienes un negocio?</span>
            <h2 className="text-2xl font-black text-white mt-1">Planes de Afiliación a la Red Firmeza</h2>
            <p className="text-xs text-slate-400 mt-2">
              Publica tus productos para constructores de todo el país y sincroniza inventario con nuestro ERP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map(plan => (
              <div key={plan.id} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">{plan.nombre}</h4>
                  <p className="text-xs text-slate-400 mt-1">{plan.descripcion}</p>
                  <div className="my-4">
                    <span className="text-2xl font-black text-amber-400">${plan.precioMensual}</span>
                    <span className="text-xs text-slate-400"> /mes</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {plan.caracteristicas.map((c, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="http://localhost:4200/register"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl text-center block transition cursor-pointer"
                >
                  Registrar mi Ferretería
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
