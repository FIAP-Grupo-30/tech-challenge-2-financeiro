// import React from 'react';

// const App: React.FC = () => {
//   return (
//     <div style={{ 
//       minHeight: 'calc(100vh - 64px)', 
//       backgroundColor: '#f5f5f5',
//       padding: '48px 24px'
//     }}>
//       <div style={{ 
//         maxWidth: '800px', 
//         margin: '0 auto',
//         backgroundColor: 'white',
//         borderRadius: '16px',
//         padding: '48px',
//         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
//       }}>
//         <div style={{ textAlign: 'center' }}>
//           <div style={{
//             width: '80px',
//             height: '80px',
//             backgroundColor: '#47A138',
//             borderRadius: '16px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             margin: '0 auto 24px',
//             fontSize: '40px'
//           }}>
//             💰
//           </div>
//           <h1 style={{ 
//             fontSize: '2rem', 
//             fontWeight: '700', 
//             color: '#000',
//             marginBottom: '16px'
//           }}>
//             Hello World - Financeiro
//           </h1>
//           <p style={{ 
//             fontSize: '1.125rem', 
//             color: '#666',
//             marginBottom: '32px'
//           }}>
//             Micro-frontend Financeiro carregado com sucesso! 🎉
//           </p>
//           <div style={{
//             backgroundColor: '#eff6ff',
//             border: '2px dashed #3b82f6',
//             borderRadius: '12px',
//             padding: '32px',
//             marginTop: '24px'
//           }}>
//             <h2 style={{ 
//               fontSize: '1.25rem', 
//               fontWeight: '600', 
//               color: '#1e40af',
//               marginBottom: '12px'
//             }}>
//               📋 Área de Desenvolvimento
//             </h2>
//             <p style={{ color: '#1d4ed8', marginBottom: '16px' }}>
//               Aqui devem ficar os <strong>Lançamentos Financeiros</strong> e <strong>Extrato</strong>:
//             </p>
//             <ul style={{ 
//               textAlign: 'left', 
//               color: '#1e40af',
//               maxWidth: '400px',
//               margin: '0 auto',
//               lineHeight: '2'
//             }}>
//               <li>💸 PIX - Transferências instantâneas</li>
//               <li>📄 DOC - Transferências bancárias</li>
//               <li>🏧 Saque - Retirada de valores</li>
//               <li>📋 Extrato - Histórico de transações</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;


import TransactionList from './components/TransactionList';

function App() {
  return (
    <>
      <bytebank-header
        logo-url="http://localhost:9001/logo-green.svg"
        logo-small-url="http://localhost:9001/logo-small.svg"
      />

      <main className="bg-[#e4e2e2] pt-10 pb-10 pl-4 pr-4">
        {/* suas rotas */}
        <div className="container mx-auto max-w-[1550px] bg-[#FFF] rounded-[12px] mx-auto p-12">              
          <TransactionList />
        </div>
      </main>

      <bytebank-footer 
        asset-base="http://localhost:9001"
        logo-url="logo-white.svg" 
      />
      
    </>
  );
}

export default App;

