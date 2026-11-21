import { Box, Container, Stack, Typography } from '@mui/material';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { STORE_INFO } from '../../constants/store';

export const TopInfoBar = () => (
  <Box
    sx={{
      borderBottom: 1,
      borderColor: 'divider',
      bgcolor: 'background.paper',
      py: 0.75,
    }}
  >
    <Container maxWidth="lg">
      <Stack
        direction="row"
        spacing={3}
        sx={{
          alignItems: 'center',
          justifyContent: { xs: 'space-between', sm: 'flex-start' },
        }}
      >
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <PhoneOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {STORE_INFO.phoneDisplay}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <LocationOnOutlinedIcon
            sx={{ fontSize: 16, color: 'text.secondary' }}
          />
          <Typography variant="caption" color="text.secondary">
            {STORE_INFO.city}
          </Typography>
        </Stack>
      </Stack>
    </Container>
  </Box>
);
