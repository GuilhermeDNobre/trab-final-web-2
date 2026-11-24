import { useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchHeaderProps {
  initialValue: string;
  onSearch: (term: string) => void;
}

export const SearchHeader = ({ initialValue, onSearch }: SearchHeaderProps) => {
  const [inputValue, setInputValue] = useState(initialValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(inputValue);
  };

  return (
    <Box
      sx={{
        py: { xs: 4, md: 5 },
        bgcolor: 'background.default',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1} sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4">Pesquisar Produtos</Typography>
          <Typography variant="body1" color="text.secondary">
            Encontre a sua bebida favorita
          </Typography>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ maxWidth: 680, mx: 'auto' }}
          >
            <TextField
              fullWidth
              size="small"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Busque por cervejas, destilados, refrigerantes..."
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              variant="contained"
              type="submit"
              sx={{ minWidth: { sm: 120 }, borderRadius: 1.5 }}
            >
              Buscar
            </Button>
          </Stack>
        </form>
      </Container>
    </Box>
  );
};
