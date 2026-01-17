import useStore from '@bytebank/root/bytebank-store';

interface AuthState {
  token: string | null;
  accountId: string | null;
  isAuthenticated: boolean;
}

/**
 * Hook para acessar informações de autenticação da store Zustand global
 * compartilhada entre os microfrontends via module federation
 */
export function useAuth(): AuthState {
  const auth = useStore((state) => state.auth);
  const account = useStore((state) => state.account);

  // Obtém accountId do user ou do selectedAccount
  const accountId = auth?.user?.id || account?.selectedAccount?.id || null;

  return {
    token: auth?.token || null,
    accountId,
    isAuthenticated: auth?.isAuthenticated || false,
  };
}
