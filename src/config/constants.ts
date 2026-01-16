// Categorias disponíveis para transações
export const CATEGORIES = [
  { value: 'alimentacao', label: '🍽️ Alimentação' },
  { value: 'transporte', label: '🚗 Transporte' },
  { value: 'moradia', label: '🏠 Moradia' },
  { value: 'saude', label: '💊 Saúde' },
  { value: 'educacao', label: '📚 Educação' },
  { value: 'lazer', label: '🎮 Lazer' },
  { value: 'compras', label: '🛒 Compras' },
  { value: 'servicos', label: '🔧 Serviços' },
  { value: 'investimentos', label: '📈 Investimentos' },
  { value: 'salario', label: '💰 Salário' },
  { value: 'freelance', label: '💼 Freelance' },
  { value: 'outros', label: '📌 Outros' },
];

// Sugestões de categorias baseadas em palavras-chave
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  alimentacao: ['restaurante', 'mercado', 'supermercado', 'padaria', 'lanche', 'comida', 'ifood', 'delivery'],
  transporte: ['uber', '99', 'gasolina', 'combustivel', 'onibus', 'metro', 'estacionamento', 'taxi'],
  moradia: ['aluguel', 'condominio', 'iptu', 'luz', 'agua', 'gas', 'internet'],
  saude: ['farmacia', 'medico', 'consulta', 'exame', 'hospital', 'plano de saude'],
  educacao: ['escola', 'faculdade', 'curso', 'livro', 'material escolar'],
  lazer: ['cinema', 'teatro', 'show', 'viagem', 'netflix', 'spotify', 'streaming'],
  compras: ['loja', 'shopping', 'roupa', 'eletronico', 'magazine'],
  servicos: ['salao', 'barbeiro', 'academia', 'manutencao', 'reparo'],
  investimentos: ['investimento', 'acao', 'fundo', 'tesouro', 'cdb', 'aplicacao'],
  salario: ['salario', 'pagamento', 'remuneracao'],
  freelance: ['freelance', 'freela', 'projeto', 'servico prestado'],
};

// Configurações de validação para upload de arquivos
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
