import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { TopInfoBar } from '../components/layout/TopInfoBar';
import { Navbar } from '../components/layout/Navbar';
import { HeroSection } from '../components/home/HeroSection';
import { CategoriesSection } from '../components/home/CategoriesSection';
import { StoreLocationSection } from '../components/home/StoreLocationSection';
import { listPublicProducts } from '../services/productsService';
import type { ProductCategory } from '../types/Product';

export const Home = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [countsByCategory, setCountsByCategory] = useState<
    Partial<Record<ProductCategory, number>> | undefined
  >(undefined);

  useEffect(() => {
    if (!hash) return;
    const element = document.querySelector(hash);
    element?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  useEffect(() => {
    let isMounted = true;

    const loadCounts = async () => {
      try {
        const products = await listPublicProducts();
        if (!isMounted) return;

        const counts: Record<ProductCategory, number> = {
          beers: 0,
          spirits: 0,
          'soft-drinks': 0,
          snacks: 0,
          ice: 0,
        };
        for (const product of products) {
          counts[product.category] = (counts[product.category] ?? 0) + 1;
        }
        setCountsByCategory(counts);
      } catch {
        // Mantém os cards clicáveis com fallback "Ver produtos"
      }
    };

    void loadCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectCategory = (categoryId: ProductCategory) => {
    void navigate(`/produtos?categoria=${categoryId}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header>
        <TopInfoBar />
        <Navbar />
      </header>

      <Box sx={{ flexGrow: 1 }}>
        <main>
          <HeroSection />
          <CategoriesSection
            countsByCategory={countsByCategory}
            onSelectCategory={handleSelectCategory}
          />
          <StoreLocationSection />
        </main>
      </Box>
    </Box>
  );
};
