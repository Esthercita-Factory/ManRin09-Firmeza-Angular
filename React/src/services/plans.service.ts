import type { Plan } from '../types';

const API_PLANS = 'http://localhost:5235/api/plans';

export const plansService = {
  async getPlans(): Promise<Plan[]> {
    try {
      const response = await fetch(API_PLANS);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('[plansService] Fallo al cargar planes:', error);
      return [];
    }
  }
};
