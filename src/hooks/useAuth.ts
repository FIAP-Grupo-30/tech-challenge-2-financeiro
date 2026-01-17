import { useEffect, useState } from 'react';

interface AuthState {
  token: string | null;
  accountId: string | null;
  isAuthenticated: boolean;
}

/**
 * Hook para acessar informações de autenticação do Redux store global
 * compartilhado entre os microfrontends
 */
export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    accountId: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Acessa a store global exposta pelo projeto base
    const globalStore = (window as any).__BYTEBANK_STORE__;
    
    if (!globalStore) {
      console.warn('Redux store global não encontrada');
      return;
    }

    // Função para atualizar o estado local com base no store
    const updateAuthState = () => {
      const state = globalStore.getState();
      const auth = state.auth;
      
      setAuthState({
        token: auth?.token || null,
        accountId: auth?.user?.id || null,
        isAuthenticated: auth?.isAuthenticated || false,
      });
    };

    // Atualiza imediatamente
    updateAuthState();

    // Inscreve para mudanças no store
    const unsubscribe = globalStore.subscribe(updateAuthState);

    return () => {
      unsubscribe();
    };
  }, []);

  return authState;
}
