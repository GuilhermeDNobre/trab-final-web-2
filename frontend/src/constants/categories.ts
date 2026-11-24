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
  image: string;
  Icon: ComponentType<SvgIconProps>;
}

export const CATEGORIES: readonly CategoryItem[] = [
  {
    id: 'beers',
    label: 'Cervejas',
    image: categoryImage,
    Icon: SportsBarIcon,
  },
  {
    id: 'spirits',
    label: 'Destilados',
    image: categoryImage,
    Icon: LocalBarIcon,
  },
  {
    id: 'soft-drinks',
    label: 'Sem Álcool',
    image: categoryImage,
    Icon: LocalDrinkIcon,
  },
  {
    id: 'snacks',
    label: 'Petiscos',
    image: categoryImage,
    Icon: FastfoodIcon,
  },
  {
    id: 'ice',
    label: 'Gelo',
    image: categoryImage,
    Icon: AcUnitIcon,
  },
];
