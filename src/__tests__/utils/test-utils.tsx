import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

// Create a new QueryClient for each test to avoid shared state
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface AllTheProvidersProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <SessionProvider session={null}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'>;

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  };
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render, userEvent };

// Helper to wait for async operations
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

// Helper to fill form fields
export async function fillFormField(
  user: ReturnType<typeof userEvent.setup>,
  element: HTMLElement,
  value: string
) {
  await user.clear(element);
  await user.type(element, value);
}

// Helper for testing form submission
export async function submitForm(
  user: ReturnType<typeof userEvent.setup>,
  submitButton: HTMLElement
) {
  await user.click(submitButton);
}
