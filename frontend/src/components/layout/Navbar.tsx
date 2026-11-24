import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { STORE_INFO } from '../../constants/store';
import { useCart } from '../../hooks/useCart';

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Produtos', to: '/produtos' },
  { label: 'Sobre', to: '/#localizacao' },
] as const;

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, openCart } = useCart();

  const toggleDrawer = (open: boolean) => () => {
    setMobileOpen(open);
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <IconButton
              aria-label="Abrir menu"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Link
              component={RouterLink}
              to="/"
              underline="none"
              color="text.primary"
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              {STORE_INFO.name}
            </Link>
          </Stack>

          <Stack
            direction="row"
            spacing={3}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {NAV_LINKS.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                color="inherit"
                sx={{ fontWeight: 500 }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <IconButton
              aria-label="Buscar produtos"
              component={RouterLink}
              to="/produtos"
            >
              <SearchIcon />
            </IconButton>
            <IconButton aria-label="Abrir carrinho" onClick={openCart}>
              <Badge badgeContent={totalItems} color="primary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>
            <Button
              variant="contained"
              size="small"
              startIcon={<PhoneOutlinedIcon />}
              href={STORE_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Contato
            </Button>
          </Stack>
        </Toolbar>
      </Container>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleDrawer(false)}
        sx={{ display: { md: 'none' } }}
      >
        <Box sx={{ width: 240, pt: 2 }} role="presentation">
          <Typography variant="h6" sx={{ px: 2, pb: 1, fontWeight: 700 }}>
            {STORE_INFO.name}
          </Typography>
          <List>
            {NAV_LINKS.map((link) => (
              <ListItemButton
                key={link.to}
                component={RouterLink}
                to={link.to}
                onClick={toggleDrawer(false)}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};
