import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { TopInfoBar } from '../components/layout/TopInfoBar';
import { Navbar } from '../components/layout/Navbar';
import { HeroSection } from '../components/home/HeroSection';
import { CategoriesSection } from '../components/home/CategoriesSection';
import { StoreLocationSection } from '../components/home/StoreLocationSection';
import type { ProductCategory } from '../types/Product';

export const Home = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const element = document.querySelector(hash);
    element?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

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
          <CategoriesSection onSelectCategory={handleSelectCategory} />
          <StoreLocationSection />
        </main>
      </Box>
    </Box>
  );
};
