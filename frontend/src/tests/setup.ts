// test-setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import { server } from './mocks/server';

// Estendere i matcher per jest-dom
expect.extend(matchers);

// Eseguire la pulizia dopo ogni test
afterEach(() => {
  cleanup();
});

// Configurare il server MSW prima di tutti i test
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Resettare gli handlers dopo ogni test per evitare che influenzino altri test
afterEach(() => server.resetHandlers());

// Chiudere il server MSW dopo tutti i test
afterAll(() => server.close());

// Mock per il localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    }
  };
})();

// Mock per il matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Assegnare l'implementazione mock al localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock per IntersectionObserver
class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor() {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

// Mock per window.scrollTo
window.scrollTo = vi.fn();

// Mock per HTMLMediaElement
Object.defineProperty(window.HTMLMediaElement.prototype, 'muted', {
  set: function() { /* do nothing */ },
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  value: async function() { return undefined; },
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  value: function() { /* do nothing */ },
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  value: function() { /* do nothing */ },
});
