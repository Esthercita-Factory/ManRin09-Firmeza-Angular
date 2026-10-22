import { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { StoresView } from './views/StoresView';
import { LoginView } from './views/LoginView';
import { productsService } from './services/products.service';
import { plansService } from './services/plans.service';
import type { Product, Plan } from './types';

function MainApp() {
  const [currentPage, setCurrentPage] = useState<'catalog' | 'product-detail' | 'cart' | 'stores' | 'login'>('catalog');
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { selectedProduct, setSelectedProduct } = useStore();

  useEffect(() => {
    async function initCatalog() {
      setLoading(true);
      const [prodsData, plansData] = await Promise.all([
        productsService.getProducts(),
        plansService.getPlans()
      ]);
      setProducts(prodsData);
      setPlans(plansData);
      setLoading(false);
    }
    initCatalog();
  }, []);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar 
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        search={search}
        onSearchChange={setSearch}
      />

      {currentPage === 'catalog' && (
        <CatalogView 
          products={products}
          loading={loading}
          search={search}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {currentPage === 'product-detail' && selectedProduct && (
        <ProductDetailView 
          product={selectedProduct}
          onBack={() => setCurrentPage('catalog')}
          onGoToCart={() => setCurrentPage('cart')}
        />
      )}

      {currentPage === 'cart' && (
        <CartView 
          onBack={() => setCurrentPage('catalog')}
          onGoToLogin={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'stores' && (
        <StoresView 
          products={products}
          plans={plans}
          onSelectStore={() => {
            setCurrentPage('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'login' && (
        <LoginView 
          onBack={() => setCurrentPage('catalog')}
          onSuccess={() => setCurrentPage('catalog')}
        />
      )}

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
