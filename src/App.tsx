import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import TransactionAdd from './components/TransactionAdd';
import TransactionList from './components/TransactionList';
import { useAuth } from './hooks/useAuth';

function Content() {
  const { accountId, isAuthenticated } = useAuth();
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const handleTransactionCreated = () => {
    // Recarrega a lista de transações
    window.location.reload();
  };
  
  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  // Exibe mensagem se não estiver autenticado ou não tiver accountId
  if (!isAuthenticated || !accountId) {
    return (
      <main className="bg-[#e4e2e2] pt-10 pb-10 pl-4 pr-4">
        <div className="container max-w-7xl bg-white rounded-xl mx-auto p-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Acesso Restrito</h1>
            <p className="text-gray-600">Faça login para acessar suas transações.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#e4e2e2] pt-10 pb-10 pl-4 pr-4">
      <div className="container max-w-7xl bg-white rounded-xl mx-auto p-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Recibos e Documentos</h1>
          <p className="text-gray-600">Anexe comprovantes à sua transação.</p>
        </div>

        <div className="mb-8">
          <TransactionAdd 
            accountId={accountId} 
            onTransactionCreated={handleTransactionCreated}
            editTransaction={editingTransaction}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        <div>
          <TransactionList 
            accountId={accountId}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </main>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Content />
      <ReactQueryDevtoolsPanel />
    </QueryClientProvider>
  );
}

export default App;
