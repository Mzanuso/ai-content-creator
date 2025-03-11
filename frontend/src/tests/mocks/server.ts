import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configurare il server mock con gli handler definiti
export const server = setupServer(...handlers);
