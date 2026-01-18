import { CheckCircle, FileText, Loader2, Save, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ENV } from "../config/env";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "../config/constants";
import { useAuth } from "../hooks/useAuth";

// Configurações de validação
const ALLOWED_TYPES = ALLOWED_FILE_TYPES;

interface Transaction {
	id: string;
	type: "Credit" | "Debit";
	value: number;
	from?: string;
	to?: string;
	anexo?: string;
}

interface Props {
	accountId: string;
	onTransactionCreated?: () => void;
	editTransaction?: Transaction;
	onCancelEdit?: () => void;
}

export default function TransactionAdd({
	accountId,
	onTransactionCreated,
	editTransaction,
	onCancelEdit,
}: Props) {
	const { token } = useAuth();
	const [formData, setFormData] = useState({
		type: "Debit" as "Credit" | "Debit",
		value: "",
		from: "",
		to: "",
	});

	const [files, setFiles] = useState<File[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Atualiza o formulário quando editTransaction mudar
	useEffect(() => {
		if (editTransaction) {
			setFormData({
				type: editTransaction.type || "Debit",
				value: editTransaction.value
					? Math.abs(editTransaction.value).toString()
					: "",
				from: editTransaction.from || "",
				to: editTransaction.to || "",
			});
		}
	}, [editTransaction]);

	// Atualiza campo do formulário
	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: "" }));
	};

	// Valida formulário
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.value || Number.parseFloat(formData.value) <= 0) {
			newErrors.value = "Valor deve ser maior que zero";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Filtra e valida os arquivos selecionados
	const handleFiles = useCallback((newFiles: FileList | null) => {
		if (!newFiles) return;

		const incomingFiles = Array.from(newFiles);
		const validFiles: File[] = [];

		incomingFiles.forEach((file) => {
			const isValidType = ALLOWED_TYPES.includes(file.type);
			const isValidSize = file.size <= MAX_FILE_SIZE;

			if (isValidType && isValidSize) {
				validFiles.push(file);
			} else {
				alert(
					`Arquivo "${file.name}" inválido (Tipo não suportado ou maior que 5MB)`,
				);
			}
		});

		setFiles((prev) => [...prev, ...validFiles]);
	}, []);

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	// Envia a transação
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// 1. Upload dos arquivos (se houver)
			let attachmentUrls: string[] = [];
			if (files.length > 0) {
				const formDataFiles = new FormData();
				files.forEach((file) => formDataFiles.append("documents", file));

				const uploadResponse = await fetch(`${ENV.API_BASE_URL}/upload`, {
					method: "POST",
					body: formDataFiles,
				});

				if (uploadResponse.ok) {
					const uploadData = await uploadResponse.json();
					attachmentUrls = uploadData.urls || [];
				}
			}

			// 2. Criar ou atualizar transação
			if (!token) {
				throw new Error("Token de autenticação não encontrado");
			}

			const transactionData = {
				accountId,
				type: formData.type,
				value:
					formData.type === "Debit"
						? -Math.abs(Number.parseFloat(formData.value))
						: Math.abs(Number.parseFloat(formData.value)),
				from: formData.from || undefined,
				to: formData.to || undefined,
				anexo: attachmentUrls.length > 0 ? attachmentUrls.join(",") : undefined,
			};

			const url = editTransaction
				? `${ENV.API_BASE_URL}/account/transaction/${editTransaction.id}`
				: `${ENV.API_BASE_URL}/account/transaction`;

			const method = editTransaction ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(transactionData),
			});

			if (response.ok) {
				console.log('🎉 [TransactionAdd] CÓDIGO NOVO - Transação criada, SEM ALERT!');
				// Limpa o formulário
				setFormData({
					type: "Debit",
					value: "",
					from: "",
					to: "",
				});
				setFiles([]);

				// Cancela modo de edição
				if (onCancelEdit) {
					onCancelEdit();
				}

				// Dispara evento personalizado para outros MFEs
				window.dispatchEvent(
					new CustomEvent("mfe:transaction-created", {
						detail: { timestamp: new Date() },
					}),
				);

				// Notifica o componente pai (após dispatch do evento)
				if (onTransactionCreated) {
					onTransactionCreated();
				}
			} else {
				const errorData = await response.json();
				throw new Error(errorData.message || "Falha ao criar transação");
			}
		} catch (error) {
			console.error("Erro ao criar transação:", error);
			alert(
				`Erro ao criar transação: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fin:w-full fin:p-6 fin:bg-white fin:rounded-2xl fin:shadow-md fin:border fin:border-gray-100">
			<h3 className="fin:text-xl fin:font-bold fin:mb-1 fin:text-gray-800 fin:flex fin:items-center fin:gap-2">
				<FileText className="fin:text-green-500" size={24} />
				{editTransaction ? "Editar Transação" : "Nova Transação"}
			</h3>
			<p className="fin:text-sm fin:text-gray-500 fin:mb-6">
				{editTransaction
					? "Edite os dados da transação."
					: "Adicione uma nova transação com anexos."}
			</p>

			<form onSubmit={handleSubmit} className="fin:space-y-4">
				{/* Tipo de Transação */}
				<div>
					<label className="fin:block fin:text-sm fin:font-medium fin:text-gray-700 fin:mb-2">
						Tipo de Transação *
					</label>
					<div className="fin:flex fin:gap-3">
						<button
							type="button"
							onClick={() => handleInputChange("type", "Credit")}
							className={`fin:flex-1 fin:py-3 fin:px-4 fin:rounded-lg fin:border-2 fin:font-medium fin:transition-all ${
								formData.type === "Credit"
									? "fin:border-green-500 fin:bg-green-50 fin:text-green-700"
									: "fin:border-gray-200 fin:hover:fin:border-gray-300"
							}`}
						>
							💰 Receita
						</button>
						<button
							type="button"
							onClick={() => handleInputChange("type", "Debit")}
							className={`fin:flex-1 fin:py-3 fin:px-4 fin:rounded-lg fin:border-2 fin:font-medium fin:transition-all ${
								formData.type === "Debit"
									? "fin:border-red-500 fin:bg-red-50 fin:text-red-700"
									: "fin:border-gray-200 fin:hover:fin:border-gray-300"
							}`}
						>
							💸 Despesa
						</button>
					</div>
				</div>

				{/* Valor */}
				<div>
					<label className="fin:block fin:text-sm fin:font-medium fin:text-gray-700 fin:mb-2">
						Valor *
					</label>
					<input
						type="number"
						step="0.01"
						min="0"
						value={formData.value}
						onChange={(e) => handleInputChange("value", e.target.value)}
						placeholder="0.00"
						className={`fin:w-full fin:px-4 fin:py-2 fin:border fin:rounded-lg fin:focus:fin:outline-none fin:focus:fin:ring-2 ${
							errors.value
								? "fin:border-red-300 fin:focus:fin:ring-red-500"
								: "fin:border-gray-300 fin:focus:fin:ring-green-500"
						}`}
					/>
					{errors.value && (
						<p className="fin:mt-1 fin:text-sm fin:text-red-600">{errors.value}</p>
					)}
				</div>

				{/* Campos opcionais: De/Para */}
				<div className="fin:grid fin:grid-cols-2 fin:gap-4">
					<div>
						<label className="fin:block fin:text-sm fin:font-medium fin:text-gray-700 fin:mb-2">
							De (opcional)
						</label>
						<input
							type="text"
							value={formData.from}
							onChange={(e) => handleInputChange("from", e.target.value)}
							placeholder="Origem"
							className="fin:w-full fin:px-4 fin:py-2 fin:border fin:border-gray-300 fin:rounded-lg fin:focus:fin:outline-none fin:focus:fin:ring-2 fin:focus:fin:ring-green-500"
						/>
					</div>
					<div>
						<label className="fin:block fin:text-sm fin:font-medium fin:text-gray-700 fin:mb-2">
							Para (opcional)
						</label>
						<input
							type="text"
							value={formData.to}
							onChange={(e) => handleInputChange("to", e.target.value)}
							placeholder="Destino"
							className="fin:w-full fin:px-4 fin:py-2 fin:border fin:border-gray-300 fin:rounded-lg fin:focus:fin:outline-none fin:focus:fin:ring-2 fin:focus:fin:ring-green-500"
						/>
					</div>
				</div>

				{/* Área de Upload de Arquivos */}
				<div>
					<label className="fin:block fin:text-sm fin:font-medium fin:text-gray-700 fin:mb-2">
						Anexar Recibos/Documentos (opcional)
					</label>
					<div
						onDragOver={(e) => {
							e.preventDefault();
							setIsDragging(true);
						}}
						onDragLeave={() => setIsDragging(false)}
						onDrop={(e) => {
							e.preventDefault();
							setIsDragging(false);
							handleFiles(e.dataTransfer.files);
						}}
						onClick={() => fileInputRef.current?.click()}
						className={`
              fin:relative fin:border-2 fin:border-dashed fin:rounded-xl fin:p-6 fin:transition-all fin:cursor-pointer fin:text-center
              ${isDragging ? "fin:border-green-500 fin:bg-green-50" : "fin:border-gray-200 fin:hover:fin:border-green-300 fin:hover:fin:bg-gray-50"}
            `}
					>
						<input
							type="file"
							multiple
							hidden
							ref={fileInputRef}
							onChange={(e) => handleFiles(e.target.files)}
							accept={ALLOWED_TYPES.join(",")}
						/>

						<div className="fin:flex fin:flex-col fin:items-center">
							<div className="fin:p-3 fin:bg-green-100 fin:rounded-full fin:mb-2">
								<Upload className="fin:text-green-600" size={24} />
							</div>
							<p className="fin:text-sm fin:font-medium fin:text-gray-700">
								Arraste arquivos ou{" "}
								<span className="fin:text-green-600 fin:underline">
									clique para subir
								</span>
							</p>
							<p className="fin:text-xs fin:text-gray-400 fin:mt-1">
								PDF, PNG ou JPG (Máx. 5MB por arquivo)
							</p>
						</div>
					</div>

					{/* Lista de Arquivos */}
					{files.length > 0 && (
						<div className="fin:mt-4 fin:space-y-2">
							<p className="fin:text-xs fin:font-semibold fin:text-gray-400 fin:uppercase fin:tracking-wider">
								Arquivos selecionados ({files.length})
							</p>
							<ul className="fin:max-h-32 fin:overflow-y-auto fin:space-y-2">
								{files.map((file, index) => (
									<li
										key={`${file.name}-${index}`}
										className="fin:flex fin:items-center fin:justify-between fin:p-2 fin:bg-gray-50 fin:rounded-lg"
									>
										<div className="fin:flex fin:items-center fin:gap-2 fin:truncate">
											<CheckCircle
												size={16}
												className="fin:text-green-500 fin:shrink-0"
											/>
											<div className="fin:flex fin:flex-col fin:truncate">
												<span className="fin:text-sm fin:font-medium fin:text-gray-700 fin:truncate">
													{file.name}
												</span>
												<span className="fin:text-xs fin:text-gray-400">
													{(file.size / 1024).toFixed(0)} KB
												</span>
											</div>
										</div>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												removeFile(index);
											}}
											className="fin:p-1 fin:text-gray-400 fin:hover:fin:text-red-500 fin:hover:fin:bg-red-50 fin:rounded-md fin:transition-colors"
										>
											<X size={16} />
										</button>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>

				{/* Botões de Envio */}
				<div className="fin:flex fin:gap-3">
					{editTransaction && (
						<button
							type="button"
							onClick={() => {
								setFormData({
									type: "Debit",
									value: "",
									from: "",
									to: "",
								});
								setFiles([]);
								if (onCancelEdit) onCancelEdit();
							}}
							className="fin:flex-1 fin:py-3 fin:rounded-xl fin:font-semibold fin:border-2 fin:border-gray-300 fin:hover:fin:border-gray-400 fin:transition-all"
						>
							Cancelar
						</button>
					)}
					<button
						type="submit"
						disabled={isSubmitting}
						className={`
              ${editTransaction ? "fin:flex-1" : "fin:w-full"} fin:py-3 fin:rounded-xl fin:font-semibold fin:text-white fin:transition-all fin:flex fin:items-center fin:justify-center fin:gap-2
              ${isSubmitting ? "fin:bg-gray-400 fin:cursor-not-allowed" : "fin:bg-green-600 fin:hover:fin:bg-green-700 fin:active:fin:scale-[0.98] fin:shadow-md"}
            `}
					>
						{isSubmitting ? (
							<>
								<Loader2 size={20} className="fin:animate-spin" />
								Salvando...
							</>
						) : (
							<>
								<Save size={20} />
								{editTransaction ? "Atualizar" : "Criar Transação"}
							</>
						)}
					</button>
				</div>
			</form>
		</div>
	);
}
