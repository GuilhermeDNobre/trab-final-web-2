import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CartDrawer } from './components/cart/CartDrawer';
import { CartProvider } from './contexts/CartContext';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';

export function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/produtos" element={<AdminProducts />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <CartDrawer />
    </CartProvider>
  );
}

export default App;
