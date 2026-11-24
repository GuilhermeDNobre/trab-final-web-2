import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { STORE_INFO } from '../../constants/store';

const DRAWER_WIDTH = 250;

interface AdminLayoutProps {
  children: ReactNode;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewProductClick?: () => void;
}

export const AdminLayout = ({
  children,
  searchTerm,
  onSearchChange,
  onNewProductClick,
}: AdminLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    void navigate('/admin/login', { replace: true });
  };

  const toggleMobileDrawer = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 2,
      }}
    >
      <Box>
        <Stack spacing={0.5} sx={{ px: 1.5, py: 1, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {STORE_INFO.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Painel Administrativo
          </Typography>
        </Stack>

        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ px: 1.5, fontWeight: 600 }}
        >
          Gestão
        </Typography>

        <List disablePadding sx={{ mt: 0.5 }}>
          <ListItemButton
            component={RouterLink}
            to="/admin"
            selected={pathname === '/admin'}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DashboardOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Visão Geral"
              slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}
            />
          </ListItemButton>

          <ListItemButton
            component={RouterLink}
            to="/admin/produtos"
            selected={pathname === '/admin/produtos'}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Inventory2OutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Produtos"
              slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}
            />
          </ListItemButton>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ px: 1.5, fontWeight: 600 }}
        >
          Loja
        </Typography>

        <List disablePadding sx={{ mt: 0.5 }}>
          <ListItemButton
            component={RouterLink}
            to="/"
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <StorefrontOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Ver Vitrine"
              slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 500 } } }}
            />
          </ListItemButton>
        </List>
      </Box>

      <Box>
        <Divider sx={{ mb: 2 }} />
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: 'primary.main',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              A
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                Administrador
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Conta Admin
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={handleLogout}
            size="small"
            aria-label="Sair do painel"
            title="Sair do painel"
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA' }}>
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleMobileDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRightColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ gap: 2, justifyContent: 'space-between' }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', flexGrow: 1, maxWidth: 460 }}
            >
              <IconButton
                aria-label="Abrir menu administrativo"
                edge="start"
                onClick={toggleMobileDrawer}
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>

              <TextField
                fullWidth
                size="small"
                placeholder="Buscar produto por nome..."
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onNewProductClick}
              disabled={!onNewProductClick}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Novo Produto
            </Button>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
