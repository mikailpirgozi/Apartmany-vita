import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Mock problematic modules before they get loaded
vi.mock('webidl-conversions', () => ({
  default: {},
  __esModule: true,
}))

vi.mock('whatwg-url', () => ({
  URL: globalThis.URL || class MockURL {
    constructor(public href: string) {}
  },
  __esModule: true,
}))

// Polyfill for Node.js environment
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }
  } as Crypto
}

// Polyfill for URL and other Web APIs
if (typeof globalThis.URL === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { URL } = require('url')
    globalThis.URL = URL
  } catch {
    globalThis.URL = class URL {
      constructor(public href: string) {
        this.href = href
      }
    } as typeof URL
  }
}

// Mock webidl-conversions
if (typeof globalThis.WeakMap === 'undefined') {
  globalThis.WeakMap = Map as typeof WeakMap
}

// Mock TextEncoder/TextDecoder for Node.js compatibility
if (typeof globalThis.TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextEncoder, TextDecoder } = require('util')
  globalThis.TextEncoder = TextEncoder
  globalThis.TextDecoder = TextDecoder
}

// Mock DOM APIs for Node environment
Object.defineProperty(globalThis, 'document', {
  value: {
    createElement: (tagName: string) => {
      const element = {
        tagName: tagName.toUpperCase(),
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => []),
        getElementById: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          contains: vi.fn(),
          toggle: vi.fn(),
        },
        style: {},
        textContent: '',
        innerHTML: '',
        innerText: '',
      };
      return element;
    },
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    createTextNode: vi.fn((text: string) => ({ textContent: text })),
  },
  writable: true,
})

Object.defineProperty(globalThis, 'window', {
  value: {
    location: { href: 'http://localhost:3000' },
    document: globalThis.document,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    scrollTo: vi.fn(),
    scroll: vi.fn(),
    innerWidth: 1024,
    innerHeight: 768,
  },
  writable: true,
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Next.js image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    return React.createElement('img', props)
  },
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => React.createElement('div', props, children),
    section: ({ children, ...props }: React.ComponentProps<'section'>) => React.createElement('section', props, children),
    h1: ({ children, ...props }: React.ComponentProps<'h1'>) => React.createElement('h1', props, children),
    p: ({ children, ...props }: React.ComponentProps<'p'>) => React.createElement('p', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
  useMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
