'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, Loader2 } from 'lucide-react';
import { ENV } from '../config/env';

// Configurações de validação
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const EVENT_NAME = 'mfe:document-added';

export default function FileUploadZone() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Envia os arquivos para a API
  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append('documents', file));

    try {
      const response = await fetch(`${ENV.API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Notifica outros Microfrontends que o upload foi concluído
        window.dispatchEvent(
          new CustomEvent(EVENT_NAME, {
            detail: { count: files.length, timestamp: new Date() },
          })
        );

        alert('Documentos enviados com sucesso!');
        setFiles([]); // Limpa a lista
      } else {
        throw new Error('Falha no servidor');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar arquivos. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      <h3 className="text-xl font-bold mb-1 text-gray-800 flex items-center gap-2">
        <FileText className="text-green-500" size={24} />
        Recibos e Documentos
      </h3>
      <p className="text-sm text-gray-500 mb-6">Anexe comprovantes à sua transação.</p>

      {/* Dropzone */}
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
          relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer text-center
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
          <div className="p-3 bg-green-100 rounded-full mb-3">
            <Upload className="text-green-600" size={28} />
          </div>
          <p className="text-sm font-medium text-gray-700">
            Arraste arquivos ou <span className="text-green-600 underline">clique para subir</span>
          </p>
          <p className="text-xs text-gray-400 mt-2">PDF, PNG ou JPG (Máx. 5MB por arquivo)</p>
        </div>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Arquivos selecionados ({files.length})
          </p>
          <ul className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="flex items-center gap-3 truncate">
                  <CheckCircle size={18} className="text-green-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                    <span className="text-[10px] text-gray-400">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={uploadFiles}
            disabled={isUploading}
            className={`
              w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2
              ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-[0.98] shadow-md shadow-blue-200'}
            `}
          >
            {isUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Enviando...
              </>
            ) : (
              `Enviar Documentos`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
