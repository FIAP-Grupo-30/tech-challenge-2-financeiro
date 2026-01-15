import TransactionList from './components/TransactionList';
import FileUploadZone from './components/FileUploadZone';

function App() {
  return (
    <main className="bg-[#e4e2e2] pt-10 pb-10 pl-4 pr-4">
      <div className="container max-w-[1550px] bg-white rounded-[12px] mx-auto p-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Recibos e Documentos</h1>
          <p className="text-gray-600">Anexe comprovantes à sua transação.</p>
        </div>

        <div className="mb-8">
          <FileUploadZone />
        </div>

        <div>
          <TransactionList />
        </div>
      </div>
    </main>
  );
}

export default App;
