// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import { Box, CardContent, Chip, Paper, Stack, Typography, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SavingsImg from '../../../assets/images/backgrounds/piggy.png';
import { SellingWidgetItem } from 'src/views/dashboard/useModernDashboardData';

type SellingProductsProps = {
  data: SellingWidgetItem[];
};

const SellingProducts = ({ data }: SellingProductsProps) => {
  const theme = useTheme();
  const borderColor = theme.palette.divider;

  const getChipColors = (color: SellingWidgetItem['color']) => {
    const palette = theme.palette[color] || theme.palette.primary;
    return {
      backgroundColor: palette.light,
      color: palette.main,
    };
  };

  return (
    <Paper sx={{ bgcolor: 'primary.main', border: `1px solid ${borderColor}` }} variant="outlined">
      <CardContent>
        <Typography variant="h5" color="white">
          Ticket Breakdown
        </Typography>
        <Typography variant="subtitle1" color="white" mb={4}>
          Live CRM metrics
        </Typography>

        <Box textAlign="center" mt={2} mb="-90px">
          <img src={SavingsImg} alt={SavingsImg} width={'300px'} />
        </Box>
      </CardContent>
      <Paper sx={{ overflow: 'hidden', zIndex: '1', position: 'relative', margin: '10px' }}>
        <Box p={3}>
          <Stack spacing={3}>
            {data.map((sell: any, i: number) => (
              <Box key={i}>
                <Stack
                  direction="row"
                  spacing={2}
                  mb={1}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h6">{sell.product}</Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      ${sell.price}
                    </Typography>
                  </Box>
                  <Chip
                    sx={{
                      ...getChipColors(sell.color),
                      borderRadius: '4px',
                      width: 55,
                      height: 24,
                    }}
                    label={sell.percent + '%'}
                  />
                </Stack>
                <LinearProgress value={sell.percent} variant="determinate" color={sell.color} />
              </Box>
            ))}
          </Stack>
        </Box>
      </Paper>
    </Paper>
  );
};

export default SellingProducts;
