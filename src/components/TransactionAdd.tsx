import { CheckCircle, FileText, Loader2, Save, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ENV } from '../config/env';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../config/constants';
import { useAuth } from '../hooks/useAuth';

// Configurações de validação
const ALLOWED_TYPES = ALLOWED_FILE_TYPES;

interface Transaction {
  id: string;
  type: 'Credit' | 'Debit';
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

export default function TransactionAdd({ accountId, onTransactionCreated, editTransaction, onCancelEdit }: Props) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    type: 'Debit' as 'Credit' | 'Debit',
    value: '',
    from: '',
    to: '',
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
        type: editTransaction.type || 'Debit',
        value: editTransaction.value ? Math.abs(editTransaction.value).toString() : '',
        from: editTransaction.from || '',
        to: editTransaction.to || '',
      });
    }
  }, [editTransaction]);

  // Atualiza campo do formulário
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Valida formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.value || Number.parseFloat(formData.value) <= 0) {
      newErrors.value = 'Valor deve ser maior que zero';
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
        alert(`Arquivo "${file.name}" inválido (Tipo não suportado ou maior que 5MB)`);
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
        files.forEach((file) => formDataFiles.append('documents', file));

        const uploadResponse = await fetch(`${ENV.API_BASE_URL}/upload`, {
          method: 'POST',
          body: formDataFiles,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          attachmentUrls = uploadData.urls || [];
        }
      }

      // 2. Criar ou atualizar transação
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const transactionData = {
        accountId,
        type: formData.type,
        value: formData.type === 'Debit' ? -Math.abs(Number.parseFloat(formData.value)) : Math.abs(Number.parseFloat(formData.value)),
        from: formData.from || undefined,
        to: formData.to || undefined,
        anexo: attachmentUrls.length > 0 ? attachmentUrls.join(',') : undefined,
      };

      const url = editTransaction 
        ? `${ENV.API_BASE_URL}/account/transaction/${editTransaction.id}`
        : `${ENV.API_BASE_URL}/account/transaction`;
      
      const method = editTransaction ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        alert(editTransaction ? 'Transação atualizada com sucesso!' : 'Transação criada com sucesso!');
        
        // Limpa o formulário
        setFormData({
          type: 'Debit',
          value: '',
          from: '',
          to: '',
        });
        setFiles([]);
        
        // Notifica o componente pai
        if (onTransactionCreated) {
          onTransactionCreated();
        }
        
        // Cancela modo de edição
        if (onCancelEdit) {
          onCancelEdit();
        }

        // Dispara evento personalizado para outros MFEs
        window.dispatchEvent(
          new CustomEvent('mfe:transaction-created', {
            detail: { timestamp: new Date() },
          })
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao criar transação');
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      alert(`Erro ao criar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      <h3 className="text-xl font-bold mb-1 text-gray-800 flex items-center gap-2">
        <FileText className="text-green-500" size={24} />
        {editTransaction ? 'Editar Transação' : 'Nova Transação'}
      </h3>
      <p className="text-sm text-gray-500 mb-6">{editTransaction ? 'Edite os dados da transação.' : 'Adicione uma nova transação com anexos.'}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de Transação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Transação *
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('type', 'Credit')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                formData.type === 'Credit'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              💰 Receita
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('type', 'Debit')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                formData.type === 'Debit'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              💸 Despesa
            </button>
          </div>
        </div>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.value}
            onChange={(e) => handleInputChange('value', e.target.value)}
            placeholder="0.00"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.value
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-green-500'
            }`}
          />
          {errors.value && (
            <p className="mt-1 text-sm text-red-600">{errors.value}</p>
          )}
        </div>

        {/* Campos opcionais: De/Para */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              De (opcional)
            </label>
            <input
              type="text"
              value={formData.from}
              onChange={(e) => handleInputChange('from', e.target.value)}
              placeholder="Origem"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para (opcional)
            </label>
            <input
              type="text"
              value={formData.to}
              onChange={(e) => handleInputChange('to', e.target.value)}
              placeholder="Destino"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Área de Upload de Arquivos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
              relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer text-center
              ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'}
            `}
          >
            <input
              type="file"
              multiple
              hidden
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              accept={ALLOWED_TYPES.join(',')}
            />

            <div className="flex flex-col items-center">
              <div className="p-3 bg-green-100 rounded-full mb-2">
                <Upload className="text-green-600" size={24} />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Arraste arquivos ou <span className="text-green-600 underline">clique para subir</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, PNG ou JPG (Máx. 5MB por arquivo)</p>
            </div>
          </div>

          {/* Lista de Arquivos */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Arquivos selecionados ({files.length})
              </p>
              <ul className="max-h-32 overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle size={16} className="text-green-500 shrink-0" />
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-400">
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
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
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
        <div className="flex gap-3">
          {editTransaction && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  type: 'Debit',
                  value: '',
                  from: '',
                  to: '',
                });
                setFiles([]);
                if (onCancelEdit) onCancelEdit();
              }}
              className="flex-1 py-3 rounded-xl font-semibold border-2 border-gray-300 hover:border-gray-400 transition-all"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              ${editTransaction ? 'flex-1' : 'w-full'} py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2
              ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-[0.98] shadow-md'}
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={20} />
                {editTransaction ? 'Atualizar' : 'Criar Transação'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
