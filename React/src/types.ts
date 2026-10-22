export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  category: string;
  categoryDetail: string;
  location: string;
  costPrice: number;
  price: number;
  stock: number;
  stockReserved: number;
  minStock: number;
  isActive: boolean;
  registeredByName?: string;
  enterpriseId?: number;
  enterpriseName?: string;
  createdAt: string;
}

export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precioMensual: number;
  precioAnual: number;
  caracteristicas: string[];
  esRecomendado: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ClientUser {
  id: string;
  email: string;
  fullName: string;
  role: 'Client';
  token: string;
}
