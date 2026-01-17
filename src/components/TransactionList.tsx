import { Edit2 } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useGetTransactions } from '../hooks/useGetTransactions';
import { useAuth } from '../hooks/useAuth';

interface Props {
  accountId: string;
  onEdit?: (transaction: any) => void;
}

const TransactionList: React.FC<Props> = ({ accountId, onEdit }) => {
  const { token } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ 
    type: 'all', 
    searchTerm: '',
    startDate: '',
    endDate: ''
  });

  const { data, isFetching } = useGetTransactions({ accountId, token });
  const transactions = data?.result?.transactions || [];

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      
      // Filtro por data de início
      if (filters.startDate) {
        const transactionDate = new Date(t.date);
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (transactionDate < startDate) return false;
      }
      
      // Filtro por data de fim
      if (filters.endDate) {
        const transactionDate = new Date(t.date);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (transactionDate > endDate) return false;
      }
      
      return true;
    });
  }, [transactions, filters]);

  const paged = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const totalPages = Math.ceil(filtered.length / 10);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  if (isFetching) {
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-md border ${showFilters ? 'bg-[#47A138] text-white' : 'border-gray-300'}`}
            type="button"
          >
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t grid md:grid-cols-2 gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos os tipos</option>
              <option value="Credit">Receitas</option>
              <option value="Debit">Despesas</option>
            </select>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                placeholder="Data inicial"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                placeholder="Data final"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={() => setFilters({ type: 'all', searchTerm: '', startDate: '', endDate: '' })}
              className="text-[#47A138] md:col-span-2"
              type="button"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {paged.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">Nenhuma transação</div>
        ) : (
          paged.map((t) => {
            const hasAttachment = t.anexo && t.anexo.length > 0;
            
            return (
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
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-black">
                      {t.type === 'Credit' ? 'Receita' : 'Despesa'}
                      {hasAttachment && (
                        <span className="ml-2 text-xs text-gray-500" title="Possui anexo">
                          📎
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(t.date)}</p>
                  {(t.from || t.to) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {t.from && `De: ${t.from}`}
                      {t.from && t.to && ' • '}
                      {t.to && `Para: ${t.to}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-semibold ${t.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {t.type === 'Credit' ? '+' : ''}
                    {formatCurrency(t.value)}
                  </span>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(t)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar transação"
                      type="button"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
            type="button"
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
            type="button"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
