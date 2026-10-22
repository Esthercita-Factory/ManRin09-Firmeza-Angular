import type { Product } from '../types';

const API_BASE = 'http://localhost:5235/api/products';

export const productsService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error(`Error en API de productos: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('[productsService] Fallo al cargar productos:', error);
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`[productsService] Error obteniendo producto ${id}:`, error);
      return null;
    }
  }
};
