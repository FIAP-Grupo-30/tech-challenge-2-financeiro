# Financeiro - Módulo de Transações ByteBank

## 📋 Visão Geral

O **@bytebank/financeiro** é o microfrontend responsável por toda a gestão de transações financeiras do ByteBank. Ele permite aos usuários visualizar o extrato completo da conta, filtrar transações por tipo/categoria/período, e futuramente criar novas transações (depósitos, saques, transferências).

Este MFE é ativado quando o usuário acessa as rotas `/financeiro`, `/transacoes` ou `/extrato`.

## 🎯 Responsabilidades

### 1. **Visualização de Extrato**
- Lista completa de todas as transações da conta selecionada
- Exibição de detalhes: tipo, valor, descrição, categoria, data, saldo resultante
- Indicadores visuais para diferentes tipos de transação

### 2. **Filtros e Busca**
- Filtro por tipo de transação (Depósito, Saque, Transferência)
- Filtro por categoria
- Busca por descrição
- Filtro por período (data inicial e final)

### 3. **Paginação**
- Navegação entre páginas de transações
- Seleção de quantidade de itens por página
- Indicação de total de registros

### 4. **Estatísticas Rápidas**
- Total de entradas (depósitos)
- Total de saídas (saques/transferências)
- Saldo atual
- Quantidade de transações

### 5. **Responsividade**
- Layout adaptável para desktop, tablet e mobile
- Cards de transação otimizados para telas pequenas

## 🏗️ Arquitetura

```
tech-challenge-2-financeiro/
├── src/
│   ├── bytebank-financeiro.tsx     # Entry point Single-SPA
│   ├── App.tsx                     # Componente raiz
│   ├── globals.css                 # Estilos Tailwind
│   └── components/
│       └── TransactionList.tsx     # Lista de transações
├── vite.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 📦 Estrutura de Componentes

### Entry Point - `bytebank-financeiro.tsx`

Configuração Single-SPA React:

```typescript
import React from 'react';
import * as ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';
import './globals.css';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err: Error) {
    console.error('@bytebank/financeiro error:', err);
    return <div className="text-red-500 p-4">Erro no módulo financeiro</div>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
```

**Ciclo de Vida:**
1. **Bootstrap**: Inicializa configurações (executado uma vez)
2. **Mount**: Renderiza App no DOM quando rota é ativa
3. **Unmount**: Remove App do DOM quando usuário sai da rota

### App Component - `App.tsx`

Container principal do microfrontend:

```typescript
import React from 'react';
import TransactionList from './components/TransactionList';

const App: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Transações Financeiras
        </h1>
        <p className="text-gray-600 mt-2">
          Visualize e gerencie todas as suas movimentações
        </p>
      </header>
      
      <TransactionList />
    </div>
  );
};

export default App;
```

### TransactionList Component - `components/TransactionList.tsx`

Componente principal com toda a lógica de exibição e filtros:

#### **Estado Local**

```typescript
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [showFilters, setShowFilters] = useState(false);
const [filters, setFilters] = useState({
  type: 'all',
  category: 'all',
  searchTerm: '',
  dateStart: '',
  dateEnd: '',
});

const ITEMS_PER_PAGE = 10;
```

#### **Buscar Transações**

```typescript
useEffect(() => {
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('bytebank_token');
      const accountId = localStorage.getItem('bytebank_selected_account');
      
      if (!accountId) {
        console.warn('Nenhuma conta selecionada');
        return;
      }
      
      const res = await fetch(
        `http://localhost:8080/account/${accountId}/statement`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const data = await res.json();
      setTransactions(data.result?.transactions || []);
    } catch (e) {
      console.error('Erro ao buscar transações:', e);
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchTransactions();
  
  // Escutar evento de atualização
  const handleUpdate = () => fetchTransactions();
  window.addEventListener('bytebank-event', handleUpdate);
  
  return () => window.removeEventListener('bytebank-event', handleUpdate);
}, []);
```

#### **Filtros**

```typescript
const filtered = useMemo(() => {
  return transactions.filter((t) => {
    // Filtro por tipo
    if (filters.type !== 'all' && t.type !== filters.type) {
      return false;
    }
    
    // Filtro por categoria
    if (filters.category !== 'all' && t.category !== filters.category) {
      return false;
    }
    
    // Busca por descrição
    if (
      filters.searchTerm &&
      !t.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    // Filtro por data inicial
    if (filters.dateStart && new Date(t.date) < new Date(filters.dateStart)) {
      return false;
    }
    
    // Filtro por data final
    if (filters.dateEnd && new Date(t.date) > new Date(filters.dateEnd)) {
      return false;
    }
    
    return true;
  });
}, [transactions, filters]);
```

#### **Paginação**

```typescript
const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
const paginatedTransactions = filtered.slice(
  startIndex,
  startIndex + ITEMS_PER_PAGE
);

const handlePageChange = (page: number) => {
  setCurrentPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

#### **Estatísticas**

```typescript
const statistics = useMemo(() => {
  const deposits = filtered
    .filter((t) => t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const withdrawals = filtered
    .filter((t) => t.type === 'WITHDRAWAL' || t.type === 'TRANSFER')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalDeposits: deposits,
    totalWithdrawals: withdrawals,
    balance: deposits - withdrawals,
    count: filtered.length,
  };
}, [filtered]);
```

#### **Renderização**

```tsx
return (
  <div className="space-y-6">
    {/* Estatísticas */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Entradas"
        value={`R$ ${statistics.totalDeposits.toFixed(2)}`}
        icon="↑"
        color="green"
      />
      <StatCard
        title="Total Saídas"
        value={`R$ ${statistics.totalWithdrawals.toFixed(2)}`}
        icon="↓"
        color="red"
      />
      <StatCard
        title="Saldo"
        value={`R$ ${statistics.balance.toFixed(2)}`}
        icon="="
        color="blue"
      />
      <StatCard
        title="Transações"
        value={statistics.count}
        icon="#"
        color="gray"
      />
    </div>
    
    {/* Filtros */}
    <div className="bg-white rounded-lg shadow p-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2"
      >
        <span>Filtros</span>
        {showFilters ? '▲' : '▼'}
      </button>
      
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="all">Todos os tipos</option>
            <option value="DEPOSIT">Depósito</option>
            <option value="WITHDRAWAL">Saque</option>
            <option value="TRANSFER">Transferência</option>
          </select>
          
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          />
          
          <input
            type="date"
            value={filters.dateStart}
            onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
          />
        </div>
      )}
    </div>
    
    {/* Lista de Transações */}
    {isLoading ? (
      <div className="text-center py-8">Carregando...</div>
    ) : (
      <div className="space-y-4">
        {paginatedTransactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    )}
    
    {/* Paginação */}
    {totalPages > 1 && (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    )}
  </div>
);
```

## 🎨 Componentes Visuais

### StatCard

Card para exibir estatísticas:

```tsx
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'green' | 'red' | 'blue' | 'gray';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    gray: 'bg-gray-50 text-gray-600',
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
```

### TransactionCard

Card para cada transação:

```tsx
interface TransactionCardProps {
  transaction: Transaction;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const isDeposit = transaction.type === 'DEPOSIT';
  const isWithdrawal = transaction.type === 'WITHDRAWAL';
  const isTransfer = transaction.type === 'TRANSFER';
  
  const typeConfig = {
    DEPOSIT: {
      icon: '↑',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Depósito',
    },
    WITHDRAWAL: {
      icon: '↓',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Saque',
    },
    TRANSFER: {
      icon: '→',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Transferência',
    },
  };
  
  const config = typeConfig[transaction.type];
  
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        {/* Ícone e Tipo */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${config.bgColor} ${config.color}`}>
            {config.icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{transaction.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm ${config.color}`}>{config.label}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{transaction.category}</span>
            </div>
          </div>
        </div>
        
        {/* Valor e Data */}
        <div className="text-right">
          <p className={`text-xl font-bold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
            {isDeposit ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(transaction.date).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-xs text-gray-400">
            Saldo: R$ {transaction.balance.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};
```

### Pagination

Componente de paginação:

```tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
      >
        Anterior
      </button>
      
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded ${
            page === currentPage
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
      >
        Próxima
      </button>
    </div>
  );
};
```

## 🔄 Integração com @bytebank/base

### Dependências Compartilhadas

```typescript
// React e React-DOM vêm do import map (CDN)
// Não são bundlados no build
import React from 'react';
import ReactDOM from 'react-dom';
```

### Futura Integração Redux

```typescript
// Quando integrar com Redux do @bytebank/base
import { useAppSelector, useAppDispatch } from '@bytebank/base';
import { fetchTransactions, setFilters } from '@bytebank/base';

const TransactionList = () => {
  const dispatch = useAppDispatch();
  const { transactions, isLoading, filters } = useAppSelector(
    (state) => state.transactions
  );
  
  useEffect(() => {
    const accountId = localStorage.getItem('bytebank_selected_account');
    if (accountId) {
      dispatch(fetchTransactions(accountId));
    }
  }, [dispatch]);
  
  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };
  
  // ... resto do componente
};
```

### Event Bus

```typescript
import { on, emit, ByteBankEvents } from '@bytebank/base';

// Escutar mudança de conta
useEffect(() => {
  const unsubscribe = on(ByteBankEvents.ACCOUNT_CHANGED, (account) => {
    fetchTransactions(account.id);
  });
  
  return unsubscribe;
}, []);

// Emitir evento após criar transação
const handleCreateTransaction = async (transaction) => {
  const result = await api.post('/transaction', transaction);
  emit(ByteBankEvents.TRANSACTION_CREATED, result.data);
};
```

## 🎯 Rotas Ativas

Este microfrontend é montado nas seguintes rotas:

- `/financeiro` - Rota principal
- `/transacoes` - Alias para financeiro
- `/extrato` - Alias para financeiro

**Configuração no root-config:**
```typescript
registerApplication({
  name: '@bytebank/financeiro',
  app: () => System.import('@bytebank/financeiro'),
  activeWhen: ['/financeiro', '/transacoes', '/extrato'],
});
```

## 🎨 Estilos e Design

### Tailwind CSS

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utilities */
.transaction-card {
  @apply bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow;
}

.stat-card {
  @apply bg-white rounded-lg shadow p-6;
}

.btn-filter {
  @apply px-4 py-2 rounded border border-gray-300 hover:bg-gray-50;
}
```

### Responsividade

```css
/* Mobile First */
.transaction-list {
  @apply space-y-4;
}

/* Tablet */
@media (min-width: 768px) {
  .stat-grid {
    @apply grid grid-cols-2 gap-4;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .stat-grid {
    @apply grid-cols-4;
  }
  
  .transaction-card {
    @apply flex items-center justify-between;
  }
}
```

## 🚀 Funcionalidades Futuras

### 1. Criar Nova Transação

Modal para criar transação:

```tsx
const CreateTransactionModal = () => {
  const [form, setForm] = useState({
    type: 'DEPOSIT',
    amount: '',
    description: '',
    category: '',
  });
  
  const handleSubmit = async () => {
    await api.post('/transaction', {
      ...form,
      accountId: selectedAccount.id,
    });
    
    emit(ByteBankEvents.TRANSACTION_CREATED);
  };
  
  return (
    <Modal>
      <form onSubmit={handleSubmit}>
        <select value={form.type} onChange={...}>
          <option value="DEPOSIT">Depósito</option>
          <option value="WITHDRAWAL">Saque</option>
          <option value="TRANSFER">Transferência</option>
        </select>
        {/* ... outros campos */}
      </form>
    </Modal>
  );
};
```

### 2. Exportar Extrato

```tsx
const exportToPDF = () => {
  // Usar biblioteca como jsPDF
  const doc = new jsPDF();
  doc.text('Extrato ByteBank', 10, 10);
  
  transactions.forEach((t, index) => {
    doc.text(
      `${t.date} - ${t.description} - R$ ${t.amount}`,
      10,
      20 + (index * 10)
    );
  });
  
  doc.save('extrato-bytebank.pdf');
};

const exportToCSV = () => {
  const csv = [
    ['Data', 'Tipo', 'Descrição', 'Valor', 'Saldo'],
    ...transactions.map(t => [
      t.date,
      t.type,
      t.description,
      t.amount,
      t.balance,
    ]),
  ];
  
  const csvContent = csv.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'extrato-bytebank.csv';
  link.click();
};
```

### 3. Detalhes da Transação

Modal com informações completas:

```tsx
const TransactionDetailModal = ({ transaction }) => {
  return (
    <Modal>
      <h2>Detalhes da Transação</h2>
      <dl>
        <dt>ID</dt>
        <dd>{transaction.id}</dd>
        
        <dt>Tipo</dt>
        <dd>{transaction.type}</dd>
        
        <dt>Valor</dt>
        <dd>R$ {transaction.amount.toFixed(2)}</dd>
        
        <dt>Descrição</dt>
        <dd>{transaction.description}</dd>
        
        <dt>Categoria</dt>
        <dd>{transaction.category}</dd>
        
        <dt>Data</dt>
        <dd>{new Date(transaction.date).toLocaleString('pt-BR')}</dd>
        
        <dt>Saldo Resultante</dt>
        <dd>R$ {transaction.balance.toFixed(2)}</dd>
      </dl>
    </Modal>
  );
};
```

### 4. Gráficos

Visualizações com Chart.js:

```tsx
import { Line, Pie } from 'react-chartjs-2';

const TransactionCharts = ({ transactions }) => {
  // Gráfico de linha - Saldo ao longo do tempo
  const balanceData = {
    labels: transactions.map(t => new Date(t.date).toLocaleDateString()),
    datasets: [{
      label: 'Saldo',
      data: transactions.map(t => t.balance),
      borderColor: '#47A138',
      tension: 0.4,
    }],
  };
  
  // Gráfico de pizza - Gastos por categoria
  const categoryData = {
    labels: [...new Set(transactions.map(t => t.category))],
    datasets: [{
      data: categorySums,
      backgroundColor: ['#47A138', '#FF6384', '#36A2EB', '#FFCE56'],
    }],
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Line data={balanceData} />
      <Pie data={categoryData} />
    </div>
  );
};
```

## 🛠️ Comandos

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## 📊 Dependências

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "single-spa-react": "^6.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.1.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/single-spa-react": "^5.1.0"
  }
}
```

## 👥 Equipe

**FIAP Grupo 30 - Tech Challenge 2**
