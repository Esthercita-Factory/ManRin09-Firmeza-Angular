import { useState } from 'react';
import { authService } from '../services/auth.service';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

interface LoginViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function LoginView({ onBack, onSuccess }: LoginViewProps) {
  const { setUser } = useStore();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (isRegisterMode) {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('Por favor completa todos los campos requeridos.');
        setLoading(false);
        return;
      }
      const result = await authService.registerClient(fullName, email, password, phoneNumber);
      if (result.success && result.user) {
        setUser(result.user);
        onSuccess();
      } else {
        setErrorMessage(result.message || 'Error al registrar la cuenta de cliente.');
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Ingresa correo y contraseña.');
        setLoading(false);
        return;
      }
      const result = await authService.loginClient(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        onSuccess();
      } else {
        setErrorMessage(result.message || 'No fue posible iniciar sesión.');
      }
    }
    setLoading(false);
  };

  return (
    <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col justify-center">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 font-black text-2xl mx-auto mb-3">
            F
          </div>
          <h2 className="text-xl font-black text-white">
            {isRegisterMode ? 'Crear Cuenta de Cliente' : 'Acceso Exclusivo para Clientes'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegisterMode 
              ? 'Regístrate para comprar en ferreterías de la red' 
              : 'Ingresa para gestionar tus pedidos y cotizaciones'}
          </p>
        </div>

        {/* Alerta de cuenta empresa si aplica */}
        <div className="mb-5 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Aviso de rol:</strong> Este portal es exclusivo para clientes compradores. Las cuentas de <em>Empresa</em> o <em>Empleado</em> deben acceder al portal administrativo.
          </span>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium leading-relaxed">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Teléfono Móvil</label>
                <input
                  type="tel"
                  placeholder="3001234567"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Correo Electrónico *</label>
            <input
              type="email"
              required
              placeholder="cliente@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Contraseña *</label>
            <input
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Procesando...' : (isRegisterMode ? 'Crear mi Cuenta' : 'Entrar como Cliente')}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <button
            onClick={() => { setIsRegisterMode(!isRegisterMode); setErrorMessage(''); }}
            className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
          >
            {isRegisterMode 
              ? '¿Ya tienes cuenta de cliente? Inicia sesión' 
              : '¿Nuevo cliente? Regístrate gratis aquí'}
          </button>
        </div>
      </div>
    </main>
  );
}
