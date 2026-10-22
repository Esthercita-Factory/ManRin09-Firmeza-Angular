import type { ClientUser } from '../types';

const API_AUTH = 'http://localhost:5235/api/auth';
const TOKEN_KEY = 'firmeza_client_token';
const USER_KEY = 'firmeza_client_user';

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const decoded = atob(base64);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    const text = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractRole(decoded: any): string {
  if (!decoded) return '';
  const rawRole = decoded.role || 
                  decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                  decoded['Role'];
  if (Array.isArray(rawRole)) return rawRole[0] || '';
  return String(rawRole || '');
}

export const authService = {
  getStoredUser(): ClientUser | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (stored && token) {
        return JSON.parse(stored);
      }
      return null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  async loginClient(email: string, password: string): Promise<{ success: boolean; user?: ClientUser; message?: string }> {
    try {
      const response = await fetch(`${API_AUTH}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Credenciales inválidas.' };
      }

      // Validación estricta de rol: el e-commerce es exclusivo para clientes
      const token = data.token;
      const decoded = decodeJwtPayload(token);
      const role = extractRole(decoded) || data.role;

      if (role.toLowerCase() !== 'client') {
        return { 
          success: false, 
          message: 'Acceso restringido: Esta cuenta es de Empresa o Empleado administrativo. Por favor use el panel administrativo de Firmeza (http://localhost:4200).' 
        };
      }

      const clientUser: ClientUser = {
        id: decoded?.sub || decoded?.nameid || data.id || 'client-id',
        email: data.email || email,
        fullName: data.fullName || data.userName || email.split('@')[0],
        role: 'Client',
        token: token
      };

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(clientUser));

      return { success: true, user: clientUser };
    } catch (err) {
      console.error('[authService] Error en login:', err);
      return { success: false, message: 'No se pudo conectar con el servidor de autenticación.' };
    }
  },

  async registerClient(fullName: string, email: string, password: string, phoneNumber?: string): Promise<{ success: boolean; user?: ClientUser; message?: string }> {
    try {
      const response = await fetch(`${API_AUTH}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword: password,
          role: 'Client',
          phoneNumber: phoneNumber || '3000000000'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Error al registrar el cliente.' };
      }

      const token = data.token;
      const clientUser: ClientUser = {
        id: data.id || 'client-id',
        email: data.email || email,
        fullName: fullName,
        role: 'Client',
        token: token
      };

      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(clientUser));
      }

      return { success: true, user: clientUser };
    } catch (err) {
      console.error('[authService] Error en register:', err);
      return { success: false, message: 'Fallo de conexión con el servidor.' };
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
