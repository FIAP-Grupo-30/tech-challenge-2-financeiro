import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import useStore from "@bytebank/root/bytebank-store";
import TransactionAdd from "./components/TransactionAdd";
import TransactionList from "./components/TransactionList";
import { useAuth } from "./hooks/useAuth";

function Content() {
	console.log('🚀🚀🚀 [Financeiro] VERSÃO NOVA DO CÓDIGO - BUILD ATUALIZADO! 🚀🚀🚀');
	const { accountId, isAuthenticated } = useAuth();
	const accountState = useStore((state) => state.account);
	const fetchAccount = useStore((state) => state.fetchAccount);
	const [editingTransaction, setEditingTransaction] = useState<any>(null);
	const [isHydrated, setIsHydrated] = useState(false);
	const [isLoadingAccount, setIsLoadingAccount] = useState(false);
	const [hasTriedLoadingAccount, setHasTriedLoadingAccount] = useState(false);

	console.log('🔍 [Financeiro] Estado:', { accountId, isAuthenticated, isHydrated, isLoadingAccount, hasTriedLoadingAccount, selectedAccount: accountState?.selectedAccount });

	// Aguarda a hidratação do Zustand (persist)
	useEffect(() => {
		// Pequeno delay para garantir que o persist carregou do localStorage
		const timer = setTimeout(() => {
			setIsHydrated(true);
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	// Garantir que a conta seja carregada se ainda não estiver
	useEffect(() => {
		const loadAccount = async () => {
			if (isAuthenticated && !accountState?.selectedAccount && isHydrated && !isLoadingAccount && !hasTriedLoadingAccount) {
				setIsLoadingAccount(true);
				setHasTriedLoadingAccount(true);
				try {
					await fetchAccount();
				} catch (error) {
					console.error('[Financeiro] Erro ao carregar conta:', error);
				} finally {
					setIsLoadingAccount(false);
				}
			}
		};
		loadAccount();
	}, [isAuthenticated, fetchAccount, accountState?.selectedAccount, isHydrated, isLoadingAccount, hasTriedLoadingAccount]);

	const handleTransactionCreated = () => {
		// Não precisa fazer nada, o TransactionList vai recarregar automaticamente
		// via React Query quando o evento for disparado
	};

	const handleEdit = (transaction: any) => {
		setEditingTransaction(transaction);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleCancelEdit = () => {
		setEditingTransaction(null);
	};

	// Aguarda hidratação antes de verificar autenticação
	if (!isHydrated || isLoadingAccount) {
		return (
			<main className="bg-[#e4e2e2] pt-10 pb-10 pl-4 pr-4">
				<div className="container max-w-7xl bg-white rounded-xl mx-auto p-12">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#47A138] mx-auto"></div>
						<p className="text-gray-600 mt-4">Carregando...</p>
					</div>
				</div>
			</main>
		);
	}

	// Só exibe "Acesso Restrito" se já tentou carregar e ainda não tem accountId
	if (!isAuthenticated || (!accountId && hasTriedLoadingAccount)) {
		return (
			<main className="bg-[#e4e2e2] pt-10 pb-10 pl-4 pr-4">
				<div className="container max-w-7xl bg-white rounded-xl mx-auto p-12">
					<div className="text-center">
						<h1 className="text-2xl font-semibold mb-4">Acesso Restrito</h1>
						<p className="text-gray-600">
							Faça login para acessar suas transações.
						</p>
					</div>
				</div>
			</main>
		);
	}

	// accountId é garantidamente string neste ponto devido às verificações acima
	const validAccountId = accountId as string;

	return (
		<main className="bg-[#e4e2e2] pt-10 pb-10 pl-4 pr-4">
			<div className="container max-w-7xl bg-white rounded-xl mx-auto p-12">
				<div className="mb-8">
					<h1 className="text-2xl font-semibold">Recibos e Documentos</h1>
					<p className="text-gray-600">Anexe comprovantes à sua transação.</p>
				</div>

				<div className="mb-8">
					<TransactionAdd
						accountId={validAccountId}
						onTransactionCreated={handleTransactionCreated}
						editTransaction={editingTransaction}
						onCancelEdit={handleCancelEdit}
					/>
				</div>

				<div>
					<TransactionList accountId={validAccountId} onEdit={handleEdit} />
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
