import { Search, ShoppingCart, User as UserIcon, LogOut, Store } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: 'catalog' | 'cart' | 'stores' | 'login') => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function Navbar({ currentPage, onNavigate, search, onSearchChange }: NavbarProps) {
  const { cartItemCount, user, logout } = useStore();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-18">
          {/* Logo Firmeza */}
          <button 
            onClick={() => onNavigate('catalog')} 
            className="flex items-center gap-3 text-left cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              F
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-none">
                FIRMEZA <span className="text-amber-400 text-xs font-bold uppercase tracking-widest ml-1 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">Market</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-wider">
                Red Industrial & Ferreterías
              </span>
            </div>
          </button>

          {/* Buscador */}
          <div className="flex-1 max-w-xl relative hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cementos, aceros, herramientas, ferreterías..."
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 text-sm text-slate-100 rounded-xl border border-slate-800 focus:border-amber-400 focus:outline-hidden transition placeholder:text-slate-500"
            />
          </div>

          {/* Menú de Navegación */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => onNavigate('catalog')}
              className={`text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer ${
                currentPage === 'catalog' ? 'text-amber-400 bg-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              Catálogo
            </button>

            <button
              onClick={() => onNavigate('stores')}
              className={`text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'stores' ? 'text-amber-400 bg-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Ferreterías</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="text-right hidden lg:block">
                  <span className="text-xs font-bold text-slate-200 block leading-tight">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-amber-400 font-medium">
                    Cliente Registrado
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition cursor-pointer border border-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-amber-400 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Ingresar Cliente</span>
              </button>
            )}

            {/* Carrito */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-md shadow-amber-500/20 cursor-pointer"
              title="Ver mi carrito"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-slate-950 text-amber-400 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black border border-amber-400">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
