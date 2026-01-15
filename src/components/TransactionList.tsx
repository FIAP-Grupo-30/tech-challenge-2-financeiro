import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ENV } from '../config/env';

interface Transaction {
  id: string;
  type: 'Credit' | 'Debit';
  value: number;
  date: string;
  description?: string;
  category?: string;
  from?: string;
  to?: string;
}

const CATEGORIES = [
  { value: 'all', label: 'Todas' },
  { value: 'alimentacao', label: '🍽️ Alimentação' },
  { value: 'transporte', label: '🚗 Transporte' },
  { value: 'moradia', label: '🏠 Moradia' },
  { value: 'compras', label: '🛒 Compras' },
  { value: 'outros', label: '📌 Outros' },
];

interface Props {
  accountId: string;
}

const TransactionList: React.FC<Props> = ({ accountId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: 'all', category: 'all', searchTerm: '' });

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('bytebank_token');
        const res = await fetch(`${ENV.API_BASE_URL}/account/${accountId}/statement`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTransactions(data.result?.transactions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (accountId) fetchTransactions();

    const handleUpdate = () => fetchTransactions();
    window.addEventListener('bytebank-event', handleUpdate as any);
    return () => window.removeEventListener('bytebank-event', handleUpdate as any);
  }, [accountId]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      if (
        filters.searchTerm &&
        !t.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [transactions, filters]);

  const paged = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const totalPages = Math.ceil(filtered.length / 10);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#47A138]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-medium text-black">Transações</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Buscar..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#47A138]"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-md border ${showFilters ? 'bg-[#47A138] text-white' : 'border-gray-300'}`}
            >
              Filtros
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t grid md:grid-cols-3 gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos os tipos</option>
              <option value="Credit">Receitas</option>
              <option value="Debit">Despesas</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setFilters({ type: 'all', category: 'all', searchTerm: '' })}
              className="text-[#47A138]"
            >
              Limpar
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {paged.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">Nenhuma transação</div>
        ) : (
          paged.map((t) => (
            <div
              key={t.id}
              className={`transaction-item ${t.type === 'Credit' ? 'transaction-item-credit' : 'transaction-item-debit'}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'Credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
              >
                {t.type === 'Credit' ? '↓' : '↑'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-black">{t.description || 'Transação'}</p>
                <p className="text-sm text-gray-500">{formatDate(t.date)}</p>
              </div>
              <span
                className={`font-semibold ${t.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}
              >
                {t.type === 'Credit' ? '+' : ''}
                {formatCurrency(t.value)}
              </span>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
