import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import heroImage from '../../assets/images/pexels-rodrigo-ortega-2044210904-30553178.jpg';
import { STORE_INFO } from '../../constants/store';

export const HeroSection = () => (
  <Box
    id="inicio"
    sx={{
      position: 'relative',
      minHeight: { xs: 420, md: 520 },
      display: 'flex',
      alignItems: 'center',
      backgroundImage: `url(${heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'common.white',
    }}
  >
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: 0,
        bgcolor: 'rgba(0, 0, 0, 0.58)',
      }}
    />

    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
      <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
            lineHeight: 1.15,
          }}
        >
          {STORE_INFO.name}
          <br />
          Sua Opção de Bebidas
          <br />
          em Quixadá
        </Typography>

        <Typography variant="subtitle1" sx={{ color: 'grey.200' }}>
          Mais de 20 produtos para te atender
        </Typography>

        <Box>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/produtos"
          >
            Procurar Produtos
          </Button>
        </Box>
      </Stack>
    </Container>
  </Box>
);
