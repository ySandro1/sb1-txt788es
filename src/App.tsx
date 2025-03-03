import React, { useState } from 'react';
import { Table, User, Phone, FileSpreadsheet, Calendar, Pill, FileText, Printer, Clock, Download, Package, CheckSquare } from 'lucide-react';

// Tipo para os dados do cliente
type Cliente = {
  id: number;
  cpf: string;
  nome: string;
  telefone: string;
  dataRegistro: string;
  inicioTratamento: boolean;
  tratamentoContínuo: boolean;
  antibiotico: boolean;
  dataNascimento?: string;
  medicamento?: string;
  apoioFeito?: boolean;
};

function App() {
  // Estados para os campos do formulário
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [inicioTratamento, setInicioTratamento] = useState(false);
  const [tratamentoContínuo, setTratamentoContínuo] = useState(false);
  const [antibiotico, setAntibiotico] = useState(false);
  const [dataNascimento, setDataNascimento] = useState('');
  const [medicamento, setMedicamento] = useState('');
  
  // Estado para a lista de clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  
  // Estado para mensagens de erro/sucesso
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro' | ''>('');
  
  // Estado para controlar a exibição do relatório
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false);
  
  // Estado para controlar o formato de impressão
  const [formatoImpressao, setFormatoImpressao] = useState<'retrato' | 'paisagem' | 'cupom'>('retrato');
  
  // Estado para controlar o menu de impressão
  const [menuImpressaoAberto, setMenuImpressaoAberto] = useState(false);

  // Função para formatar CPF (XXX.XXX.XXX-XX)
  const formatarCPF = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    
    if (apenasNumeros.length <= 11) {
      let cpfFormatado = apenasNumeros;
      
      if (apenasNumeros.length > 3) {
        cpfFormatado = apenasNumeros.replace(/^(\d{3})(\d)/, '$1.$2');
      }
      if (apenasNumeros.length > 6) {
        cpfFormatado = cpfFormatado.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
      }
      if (apenasNumeros.length > 9) {
        cpfFormatado = cpfFormatado.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
      }
      
      return cpfFormatado;
    }
    
    return valor;
  };

  // Função para formatar telefone ((XX) XXXXX-XXXX)
  const formatarTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    
    if (apenasNumeros.length <= 11) {
      let telefoneFormatado = apenasNumeros;
      
      if (apenasNumeros.length > 2) {
        telefoneFormatado = apenasNumeros.replace(/^(\d{2})(\d)/, '($1) $2');
      }
      if (apenasNumeros.length > 7) {
        telefoneFormatado = telefoneFormatado.replace(/^(\(\d{2}\)\s)(\d{5})(\d)/, '$1$2-$3');
      }
      
      return telefoneFormatado;
    }
    
    return valor;
  };

  // Função para validar CPF
  const validarCPF = (cpf: string) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) {
      return false;
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpfLimpo)) {
      return false;
    }
    
    // Validação dos dígitos verificadores
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;
    
    return true;
  };

  // Função para adicionar um novo cliente
  const adicionarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos
    if (!cpf || !nome || !telefone) {
      setMensagem('Todos os campos obrigatórios devem ser preenchidos.');
      setTipoMensagem('erro');
      return;
    }
    
    // Validação do CPF
    if (!validarCPF(cpf)) {
      setMensagem('CPF inválido. Por favor, verifique.');
      setTipoMensagem('erro');
      return;
    }
    
    // Validação do telefone (formato básico)
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      setMensagem('Telefone inválido. Por favor, verifique.');
      setTipoMensagem('erro');
      return;
    }
    
    // Validação da data de nascimento quando antibiótico está marcado
    if (antibiotico && !dataNascimento) {
      setMensagem('Data de nascimento é obrigatória para tratamentos com antibiótico.');
      setTipoMensagem('erro');
      return;
    }
    
    // Verificar se o CPF já existe
    const cpfLimpo = cpf.replace(/\D/g, '');
    const clienteExistente = clientes.find(cliente => cliente.cpf.replace(/\D/g, '') === cpfLimpo);
    
    if (clienteExistente) {
      setMensagem('Este CPF já está cadastrado.');
      setTipoMensagem('erro');
      return;
    }
    
    // Criar novo cliente
    const novoCliente: Cliente = {
      id: Date.now(),
      cpf,
      nome,
      telefone,
      dataRegistro: new Date().toLocaleString('pt-BR'),
      inicioTratamento,
      tratamentoContínuo,
      antibiotico,
      dataNascimento: antibiotico ? dataNascimento : undefined,
      medicamento: medicamento || undefined,
      apoioFeito: false
    };
    
    // Adicionar à lista
    setClientes([...clientes, novoCliente]);
    
    // Limpar campos
    setCpf('');
    setNome('');
    setTelefone('');
    setInicioTratamento(false);
    setTratamentoContínuo(false);
    setAntibiotico(false);
    setDataNascimento('');
    setMedicamento('');
    
    // Mensagem de sucesso
    setMensagem('Cliente cadastrado com sucesso!');
    setTipoMensagem('sucesso');
    
    // Limpar mensagem após 3 segundos
    setTimeout(() => {
      setMensagem('');
      setTipoMensagem('');
    }, 3000);
  };

  // Função para remover um cliente
  const removerCliente = (id: number) => {
    setClientes(clientes.filter(cliente => cliente.id !== id));
    
    setMensagem('Cliente removido com sucesso!');
    setTipoMensagem('sucesso');
    
    setTimeout(() => {
      setMensagem('');
      setTipoMensagem('');
    }, 3000);
  };

  // Função para formatar a data para exibição
  const formatarData = (data?: string) => {
    if (!data) return '-';
    
    const partes = data.split('-');
    if (partes.length !== 3) return data;
    
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  // Função para verificar se um cliente foi cadastrado hoje
  const clienteCadastradoHoje = (dataRegistro: string): boolean => {
    const hoje = new Date();
    const dataHoje = `${hoje.getDate()}/${hoje.getMonth() + 1}/${hoje.getFullYear()}`;
    
    // Extrair a data do registro (formato: DD/MM/YYYY HH:MM:SS)
    const partesDataHora = dataRegistro.split(' ');
    if (partesDataHora.length < 1) return false;
    
    const dataRegistroFormatada = partesDataHora[0];
    const partesData = dataRegistroFormatada.split('/');
    if (partesData.length < 3) return false;
    
    const diaRegistro = parseInt(partesData[0]);
    const mesRegistro = parseInt(partesData[1]);
    const anoRegistro = parseInt(partesData[2]);
    
    const dataRegistroCompleta = `${diaRegistro}/${mesRegistro}/${anoRegistro}`;
    
    return dataRegistroCompleta === dataHoje;
  };

  // Filtrar clientes cadastrados hoje
  const clientesHoje = clientes.filter(cliente => clienteCadastradoHoje(cliente.dataRegistro));

  // Função para gerar o relatório
  const gerarRelatorio = () => {
    setMostrarRelatorio(true);
  };

  // Função para imprimir o relatório
  const imprimirRelatorio = () => {
    // Adicionar classe temporária para o formato de impressão
    document.body.classList.add(`print-${formatoImpressao}`);
    
    // Fechar o menu de impressão
    setMenuImpressaoAberto(false);
    
    // Imprimir
    window.print();
    
    // Remover classe após a impressão
    setTimeout(() => {
      document.body.classList.remove(`print-${formatoImpressao}`);
    }, 1000);
  };

  // Função para obter o status do tratamento
  const obterStatusTratamento = (cliente: Cliente): string => {
    const status: string[] = [];
    
    if (cliente.inicioTratamento) status.push('Início de Tratamento');
    if (cliente.tratamentoContínuo) status.push('Tratamento Contínuo');
    if (cliente.antibiotico) status.push('Antibiótico');
    
    return status.join(', ') || '-';
  };

  // Função para alternar o status de apoio feito
  const alternarApoioFeito = (id: number) => {
    setClientes(clientes.map(cliente => 
      cliente.id === id ? { ...cliente, apoioFeito: !cliente.apoioFeito } : cliente
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <header className="bg-blue-600 text-white p-4 shadow-md print:hidden">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={24} />
            <h1 className="text-xl font-bold">Sistema de Cadastro de Clientes</h1>
          </div>
          <div className="text-sm">Apoio ao Tratamento</div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        {/* Mensagem de feedback */}
        {mensagem && (
          <div 
            className={`mb-4 p-3 rounded-md print:hidden ${
              tipoMensagem === 'sucesso' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            {mensagem}
          </div>
        )}

        {mostrarRelatorio ? (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 print:shadow-none print:border-none print:p-0">
            <div className="flex items-center justify-between mb-6 print:mb-4">
              <div className="flex items-center gap-2">
                <FileText size={24} className="text-blue-600 print:hidden" />
                <h2 className="text-xl font-bold">Relatório de Cadastros do Dia</h2>
              </div>
              <div className="flex gap-2 print:hidden">
                <button
                  onClick={() => setMostrarRelatorio(false)}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200 flex items-center gap-2"
                >
                  Voltar
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMenuImpressaoAberto(!menuImpressaoAberto)}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                  >
                    <Printer size={16} />
                    Imprimir
                  </button>
                  {menuImpressaoAberto && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20">
                      <div className="py-2">
                        <p className="px-4 py-1 text-sm font-semibold text-gray-700">Formato:</p>
                        <button 
                          onClick={() => {
                            setFormatoImpressao('retrato');
                            imprimirRelatorio();
                          }}
                          className={`px-4 py-2 text-sm w-full text-left hover:bg-gray-100 flex items-center gap-2 ${formatoImpressao === 'retrato' ? 'bg-blue-50 text-blue-600' : ''}`}
                        >
                          <span className="w-4 h-4 inline-block border border-gray-300 rounded-sm">
                            {formatoImpressao === 'retrato' && <span className="block w-2 h-2 mx-auto mt-0.5 bg-blue-600 rounded-sm"></span>}
                          </span>
                          Retrato (A4)
                        </button>
                        <button 
                          onClick={() => {
                            setFormatoImpressao('paisagem');
                            imprimirRelatorio();
                          }}
                          className={`px-4 py-2 text-sm w-full text-left hover:bg-gray-100 flex items-center gap-2 ${formatoImpressao === 'paisagem' ? 'bg-blue-50 text-blue-600' : ''}`}
                        >
                          <span className="w-4 h-4 inline-block border border-gray-300 rounded-sm">
                            {formatoImpressao === 'paisagem' && <span className="block w-2 h-2 mx-auto mt-0.5 bg-blue-600 rounded-sm"></span>}
                          </span>
                          Paisagem (A4)
                        </button>
                        <button 
                          onClick={() => {
                            setFormatoImpressao('cupom');
                            imprimirRelatorio();
                          }}
                          className={`px-4 py-2 text-sm w-full text-left hover:bg-gray-100 flex items-center gap-2 ${formatoImpressao === 'cupom' ? 'bg-blue-50 text-blue-600' : ''}`}
                        >
                          <span className="w-4 h-4 inline-block border border-gray-300 rounded-sm">
                            {formatoImpressao === 'cupom' && <span className="block w-2 h-2 mx-auto mt-0.5 bg-blue-600 rounded-sm"></span>}
                          </span>
                          Cupom Fiscal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-4 print:mb-6">
              <p className="text-lg font-semibold">Data: {new Date().toLocaleDateString('pt-BR')}</p>
              <p className="text-md">Total de cadastros hoje: {clientesHoje.length}</p>
            </div>
            
            {clientesHoje.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum cliente cadastrado hoje.</p>
              </div>
            ) : (
              <div className="overflow-x-auto print:overflow-visible">
                <table className="min-w-full divide-y divide-gray-200 print:text-sm">
                  <thead className="bg-gray-50 print:bg-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-1">
                        CPF
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-1">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-1">
                        Telefone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-1">
                        Status
                      </th>
                      {clientesHoje.some(cliente => cliente.medicamento) && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-1">
                          Medicamento
                        </th>
                      )}
                      {clientesHoje.some(cliente => cliente.antibiotico) && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-1">
                          Data Nasc.
                        </th>
                      )}
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-1">
                        Apoio Feito
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientesHoje.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-gray-50 print:hover:bg-white">
                        <td className="px-4 py-3 text-sm text-gray-900 print:px-2 print:py-1">
                          {cliente.cpf}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 print:px-2 print:py-1">
                          {cliente.nome}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 print:px-2 print:py-1">
                          {cliente.telefone}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 print:px-2 print:py-1">
                          {cliente.inicioTratamento && <span>Início</span>}
                          {cliente.tratamentoContínuo && (cliente.inicioTratamento ? ', Contínuo' : 'Contínuo')}
                          {cliente.antibiotico && ((cliente.inicioTratamento || cliente.tratamentoContínuo) ? ', Antibiótico' : 'Antibiótico')}
                          {!cliente.inicioTratamento && !cliente.tratamentoContínuo && !cliente.antibiotico && '-'}
                        </td>
                        {clientesHoje.some(cliente => cliente.medicamento) && (
                          <td className="px-4 py-3 text-sm text-gray-900 print:px-2 print:py-1">
                            {cliente.medicamento || '-'}
                          </td>
                        )}
                        {clientesHoje.some(cliente => cliente.antibiotico) && (
                          <td className="px-4 py-3 text-sm text-gray-900 print:px-2 print:py-1">
                            {cliente.dataNascimento ? formatarData(cliente.dataNascimento) : '-'}
                          </td>
                        )}
                        <td className="px-4 py-3 text-sm text-center text-gray-900 print:px-2 print:py-1">
                          <div className="flex justify-center items-center">
                            <div 
                              onClick={() => alternarApoioFeito(cliente.id)} 
                              className="cursor-pointer print:cursor-default flex items-center justify-center"
                            >
                              <div className="w-5 h-5 border border-gray-400 rounded flex items-center justify-center print:w-4 print:h-4">
                                {cliente.apoioFeito && (
                                  <CheckSquare size={16} className="text-green-600" />
                                )}
                              </div>
                              <span className="ml-2 print:ml-1 text-sm print:text-xs">
                                {cliente.apoioFeito ? 'Sim' : 'Não'}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-8 border-t pt-4 print:mt-4 print:fixed print:bottom-4 print:w-full print-cupom:static">
              <p className="text-center text-gray-500 text-sm">
                Relatório gerado em {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário */}
            <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <User size={20} className="text-blue-600" />
                <h2 className="text-lg font-semibold">Cadastrar Cliente</h2>
              </div>
              
              <form onSubmit={adicionarCliente}>
                <div className="mb-4">
                  <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    id="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(formatarCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome do cliente"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4 flex flex-col gap-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="inicioTratamento"
                      checked={inicioTratamento}
                      onChange={(e) => setInicioTratamento(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="inicioTratamento" className="ml-2 flex items-center gap-1 text-sm text-gray-700">
                      <Calendar size={16} className="text-blue-600" />
                      Início de Tratamento
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tratamentoContínuo"
                      checked={tratamentoContínuo}
                      onChange={(e) => setTratamentoContínuo(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="tratamentoContínuo" className="ml-2 flex items-center gap-1 text-sm text-gray-700">
                      <Clock size={16} className="text-blue-600" />
                      Tratamento Contínuo
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="antibiotico"
                      checked={antibiotico}
                      onChange={(e) => setAntibiotico(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="antibiotico" className="ml-2 flex items-center gap-1 text-sm text-gray-700">
                      <Pill size={16} className="text-blue-600" />
                      Tratamento com Antibiótico
                    </label>
                  </div>
                </div>

                {antibiotico && (
                  <div className="mb-4 p-3 border border-blue-100 bg-blue-50 rounded-md">
                    <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      id="dataNascimento"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      *Obrigatório para tratamentos com antibiótico
                    </p>
                  </div>
                )}
                
                <div className="mb-4 p-3 border border-green-100 bg-green-50 rounded-md">
                  <div className="flex items-center gap-1 mb-1">
                    <Package size={16} className="text-green-600" />
                    <label htmlFor="medicamento" className="block text-sm font-medium text-gray-700">
                      Código/Nome do Medicamento
                    </label>
                  </div>
                  <input
                    type="text"
                    id="medicamento"
                    value={medicamento}
                    onChange={(e) => setMedicamento(e.target.value)}
                    placeholder="Ex: MED123 ou Paracetamol 500mg"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2"
                >
                  <span>Cadastrar</span>
                </button>
              </form>
            </div>

            {/* Tabela de Clientes */}
            <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Table size={20} className="text-blue-600" />
                  <h2 className="text-lg font-semibold">Clientes Cadastrados</h2>
                </div>
                <button
                  onClick={gerarRelatorio}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 flex items-center gap-2 text-sm"
                  disabled={clientesHoje.length === 0}
                >
                  <FileText size={16} />
                  Relatório do Dia
                </button>
              </div>
              
              {clientes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum cliente cadastrado.</p>
                  <p className="text-sm mt-2">Utilize o formulário para adicionar clientes.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CPF
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Telefone
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medicamento
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clientes.map((cliente) => (
                        <tr key={cliente.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {cliente.cpf}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {cliente.nome}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {cliente.telefone}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                            <div className="flex flex-col items-center gap-1">
                              {cliente.inicioTratamento && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Início
                                </span>
                              )}
                              {cliente.tratamentoContínuo && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Contínuo
                                </span>
                              )}
                              {cliente.antibiotico && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  Antibiótico
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {cliente.medicamento || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => removerCliente(cliente.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="bg-gray-100 border-t mt-8 py-4 print:hidden">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          <p>Sistema de Cadastro de Clientes para Apoio ao Tratamento &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;