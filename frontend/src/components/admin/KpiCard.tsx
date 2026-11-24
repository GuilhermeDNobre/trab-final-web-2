import type { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  accentColor?: string;
}

export const KpiCard = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'primary.main',
}: KpiCardProps) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2.5,
      height: '100%',
      borderRadius: 2,
      bgcolor: 'background.paper',
    }}
  >
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            color: accentColor,
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Stack>
    </Stack>
  </Paper>
);
