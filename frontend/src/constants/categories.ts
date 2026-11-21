import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import categoryImage from '../assets/images/pexels-thu-huynh-639083784-17541188 1.png';
import type { ProductCategory } from '../types/Product';

export interface CategoryItem {
  id: ProductCategory;
  label: string;
  productCount: number;
  image: string;
  Icon: ComponentType<SvgIconProps>;
}

export const CATEGORIES: readonly CategoryItem[] = [
  {
    id: 'cervejas',
    label: 'Cervejas',
    productCount: 3,
    image: categoryImage,
    Icon: SportsBarIcon,
  },
  {
    id: 'destilados',
    label: 'Destilados',
    productCount: 5,
    image: categoryImage,
    Icon: LocalBarIcon,
  },
  {
    id: 'nao_alcolicos',
    label: 'Sem Álcool',
    productCount: 7,
    image: categoryImage,
    Icon: LocalDrinkIcon,
  },
  {
    id: 'petiscos',
    label: 'Petiscos',
    productCount: 4,
    image: categoryImage,
    Icon: FastfoodIcon,
  },
  {
    id: 'gelo',
    label: 'Gelo',
    productCount: 2,
    image: categoryImage,
    Icon: AcUnitIcon,
  },
];
