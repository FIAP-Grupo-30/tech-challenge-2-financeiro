import { Edit2 } from "lucide-react";
import type React from "react";
import { useMemo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetTransactions } from "../hooks/useGetTransactions";
import { useAuth } from "../hooks/useAuth";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

interface Props {
	accountId: string;
	onEdit?: (transaction: any) => void;
}

const TransactionList: React.FC<Props> = ({ accountId, onEdit }) => {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	const [displayedCount, setDisplayedCount] = useState(10);
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState({
		type: "all",
		searchTerm: "",
		startDate: "",
		endDate: "",
	});

	// Escuta eventos de transação criada para recarregar
	useEffect(() => {
		const handleTransactionCreated = () => {
			// Invalida a query para forçar refetch
			queryClient.invalidateQueries({ queryKey: ["transactions", accountId] });
		};

		window.addEventListener("mfe:transaction-created", handleTransactionCreated);
		
		return () => {
			window.removeEventListener("mfe:transaction-created", handleTransactionCreated);
		};
	}, [accountId, queryClient]);

	const { data, isFetching } = useGetTransactions({ accountId, token });
	const transactions = data?.result?.transactions || [];

	const filtered = useMemo(() => {
		return transactions.filter((t) => {
			if (filters.type !== "all" && t.type !== filters.type) return false;

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

	const paged = filtered.slice(0, displayedCount);
	const hasMore = displayedCount < filtered.length;

	const observerTarget = useInfiniteScroll({
		onLoadMore: () => {
			setDisplayedCount((prev) => prev + 10);
		},
		isLoading: isFetching,
		hasMore,
		threshold: 0.1,
	});

	const formatCurrency = (v: number) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(v);
	const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

	if (isFetching) {
		return (
			<div className="fin:flex fin:items-center fin:justify-center fin:py-12">
				<div className="fin:animate-spin fin:rounded-full fin:h-8 fin:w-8 fin:border-t-2 fin:border-b-2 fin:border-[#47A138]"></div>
			</div>
		);
	}

	return (
		<div className="fin:space-y-6">
			<div className="fin:bg-white fin:rounded-xl fin:p-6 fin:shadow-sm">
				<div className="fin:flex fin:flex-col fin:md:flex-row fin:md:items-center fin:md:justify-between fin:gap-4">
					<h2 className="fin:text-2xl fin:font-medium fin:text-black">Transações</h2>
					<button
						onClick={() => setShowFilters(!showFilters)}
						className={`fin:px-4 fin:py-2 fin:rounded-md fin:border ${showFilters ? "fin:bg-[#47A138] fin:text-white" : "fin:border-gray-300"}`}
						type="button"
					>
						Filtros
					</button>
				</div>

				{showFilters && (
					<div className="fin:mt-6 fin:pt-6 fin:border-t fin:grid fin:md:grid-cols-2 fin:gap-4">
						<select
							value={filters.type}
							onChange={(e) => setFilters({ ...filters, type: e.target.value })}
							className="fin:px-3 fin:py-2 fin:border fin:border-gray-300 fin:rounded-md"
						>
							<option value="all">Todos os tipos</option>
							<option value="Credit">Receitas</option>
							<option value="Debit">Despesas</option>
						</select>
						<div className="fin:flex fin:gap-2">
							<input
								type="date"
								value={filters.startDate}
								onChange={(e) =>
									setFilters({ ...filters, startDate: e.target.value })
								}
								placeholder="Data inicial"
								className="fin:flex-1 fin:px-3 fin:py-2 fin:border fin:border-gray-300 fin:rounded-md"
							/>
							<input
								type="date"
								value={filters.endDate}
								onChange={(e) =>
									setFilters({ ...filters, endDate: e.target.value })
								}
								placeholder="Data final"
								className="fin:flex-1 fin:px-3 fin:py-2 fin:border fin:border-gray-300 fin:rounded-md"
							/>
						</div>
						<button
							onClick={() =>
								setFilters({
									type: "all",
									searchTerm: "",
									startDate: "",
									endDate: "",
								})
							}
							className="fin:text-[#47A138] fin:md:col-span-2"
							type="button"
						>
							Limpar Filtros
						</button>
					</div>
				)}
			</div>

			<div className="fin:space-y-3 fin:max-h-[600px] fin:overflow-y-auto">
				{paged.length === 0 ? (
					<div className="fin:bg-white fin:rounded-xl fin:p-8 fin:text-center fin:text-gray-500">
						Nenhuma transação
					</div>
				) : (
					paged.map((t) => {
						const hasAttachment = t.anexo && t.anexo.length > 0;

						return (
							<div
								key={t.id}
								className={`transaction-item ${t.type === "Credit" ? "transaction-item-credit" : "transaction-item-debit"}`}
							>
								<div
									className={`fin:w-10 fin:h-10 fin:rounded-full fin:flex fin:items-center fin:justify-center ${t.type === "Credit" ? "fin:bg-green-100 fin:text-green-600" : "fin:bg-red-100 fin:text-red-600"}`}
								>
									{t.type === "Credit" ? "↓" : "↑"}
								</div>
								<div className="fin:flex-1">
									<div className="fin:flex fin:items-center fin:gap-2">
										<p className="fin:font-medium fin:text-black">
											{t.type === "Credit" ? "Receita" : "Despesa"}
											{hasAttachment && (
												<span
													className="fin:ml-2 fin:text-xs fin:text-gray-500"
													title="Possui anexo"
												>
													📎
												</span>
											)}
										</p>
									</div>
									<p className="fin:text-sm fin:text-gray-500">{formatDate(t.date)}</p>
									{(t.from || t.to) && (
										<p className="fin:text-xs fin:text-gray-400 fin:mt-1">
											{t.from && `De: ${t.from}`}
											{t.from && t.to && " • "}
											{t.to && `Para: ${t.to}`}
										</p>
									)}
								</div>
								<div className="fin:flex fin:items-center fin:gap-3">
									<span
										className={`fin:font-semibold ${t.type === "Credit" ? "fin:text-green-600" : "fin:text-red-600"}`}
									>
										{t.type === "Credit" ? "+" : ""}
										{formatCurrency(t.value)}
									</span>
									{onEdit && (
										<button
											onClick={() => onEdit(t)}
											className="fin:p-2 fin:text-gray-400 fin:hover:fin:text-blue-600 fin:hover:fin:bg-blue-50 fin:rounded-lg fin:transition-colors"
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

			{hasMore && (
				<div
					ref={observerTarget}
					className="fin:py-6 fin:text-center"
				>
					{isFetching && (
						<div className="fin:flex fin:justify-center">
							<div className="fin:animate-spin fin:rounded-full fin:h-6 fin:w-6 fin:border-t-2 fin:border-b-2 fin:border-[#47A138]"></div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default TransactionList;
