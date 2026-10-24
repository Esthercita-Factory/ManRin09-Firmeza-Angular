import type { Product, Plan } from '../types';

const API_BASE = 'http://localhost:5235/api';

export const api = {
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error('Error al obtener productos');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async getPlans(): Promise<Plan[]> {
    try {
      const res = await fetch(`${API_BASE}/plans`);
      if (!res.ok) throw new Error('Error al obtener planes');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async login(email: string, password: string):Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Credenciales inválidas' };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: 'No se pudo conectar con el servidor de autenticación' };
    }
  },

  async registerClient(fullName: string, email: string, password: string, phone?: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword: password,
          role: 'Client',
          phoneNumber: phone || '3000000000'
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Error en el registro' };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  },

  async checkout(
    items: { productId: string; quantity: number; unitPrice?: number }[],
    token: string,
    paymentMethod: string = 'Efectivo / Tarjeta'
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/sale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice
          })),
          paymentMethod,
          isPaid: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || data.detail || 'No se pudo procesar la orden de compra.' };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: 'Error de conexión al procesar la orden.' };
    }
  },

  async getMyPurchases(token: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/sale/my-purchases`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
};
