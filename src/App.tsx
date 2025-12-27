import React, { useState, useEffect } from 'react';
import TransactionList from './components/TransactionList';

const App: React.FC = () => {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const token = localStorage.getItem('bytebank_token');
        if (!token) { setIsLoading(false); return; }

        const res = await fetch('http://localhost:3000/account', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAccountId(data.result?.account?.[0]?.id || null);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccount();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#47A138]"></div>
      </div>
    );
  }

  if (!accountId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">Faça login para acessar.</p>
          <a href="/" className="btn-bytebank-primary">Voltar</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <TransactionList accountId={accountId} />
      </main>
    </div>
  );
};

export default App;
