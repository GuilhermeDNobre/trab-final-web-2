import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { STORE_INFO } from '../../constants/store';

export const StoreLocationSection = () => (
  <Box
    id="localizacao"
    sx={{ py: { xs: 6, md: 8 }, bgcolor: 'grey.50' }}
  >
    <Container maxWidth="lg">
      <Grid container spacing={4} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            <Typography variant="h4">Visite Nossa Loja</Typography>

            <Stack spacing={0.75}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Horário de Funcionamento
              </Typography>
              {STORE_INFO.hours.map((item) => (
                <Typography
                  key={item.label}
                  variant="body2"
                  color="text.secondary"
                >
                  {item.label}:{' '}
                  <Box
                    sx={{
                      display: 'inline',
                      fontWeight: 700,
                      color: 'text.primary',
                    }}
                  >
                    {item.time}
                  </Box>
                </Typography>
              ))}
            </Stack>

            <Stack spacing={0.75}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Contato/Endereço
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {STORE_INFO.phoneDisplay}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {STORE_INFO.address}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              useFlexGap
              sx={{ flexWrap: 'wrap' }}
            >
              <Button
                variant="contained"
                href={STORE_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar com Atendente
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                href={STORE_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ borderColor: 'divider' }}
              >
                Abrir no Maps
              </Button>
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              height: { xs: 280, md: 360 },
              border: 1,
              borderColor: 'divider',
            }}
          >
            <iframe
              title="Localização Gean Bebidas"
              src={STORE_INFO.mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{
                width: '100%',
                height: '100%',
                border: 0,
                display: 'block',
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  </Box>
);
