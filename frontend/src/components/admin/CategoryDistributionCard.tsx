import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import type { CategoryDistributionItem } from '../../utils/adminMetrics';

interface CategoryDistributionCardProps {
  items: readonly CategoryDistributionItem[];
  totalProducts: number;
}

const buildConicGradient = (items: readonly CategoryDistributionItem[]): string => {
  const nonEmpty = items.filter((item) => item.count > 0);
  if (nonEmpty.length === 0) {
    return '#E0E0E0 0deg 360deg';
  }

  const total = nonEmpty.reduce((sum, item) => sum + item.count, 0);
  const { segments } = nonEmpty.reduce<{
    segments: string[];
    currentDeg: number;
  }>(
    (acc, item) => {
      const sliceDeg = (item.count / total) * 360;
      const nextDeg = acc.currentDeg + sliceDeg;
      return {
        segments: [
          ...acc.segments,
          `${item.color} ${acc.currentDeg.toFixed(1)}deg ${nextDeg.toFixed(1)}deg`,
        ],
        currentDeg: nextDeg,
      };
    },
    { segments: [], currentDeg: 0 },
  );

  return `conic-gradient(${segments.join(', ')})`;
};

export const CategoryDistributionCard = ({
  items,
  totalProducts,
}: CategoryDistributionCardProps) => {
  const gradient = buildConicGradient(items);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 2,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Distribuição por categoria
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          my: 2,
        }}
      >
        <Box
          aria-label="Gráfico de distribuição por categoria"
          sx={{
            width: 164,
            height: 164,
            borderRadius: '50%',
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 108,
              height: 108,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              {totalProducts}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              produtos
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={1.25} sx={{ mt: 1 }}>
        {items.map((item) => (
          <Grid key={item.id} size={{ xs: 6 }}>
            <Box
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: '#F8F9FA',
              }}
            >
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {item.label}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: 'baseline', mt: 0.5 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {item.count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.percentage}%
                </Typography>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
