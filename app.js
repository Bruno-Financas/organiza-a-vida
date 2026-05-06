// ============ GERENCIAMENTO DE DADOS ============
let dados = JSON.parse(localStorage.getItem("dados")) || {
  casal: [],
  fixas: [
    { nome: "Corsan Casa10", valor: 0 },
    { nome: "CEEE Casa10", valor: 0 },
    { nome: "Internet Osirnet", valor: 0 },
    { nome: "CEEE Casinha", valor: 0 },
    { nome: "Corsan Casinha", valor: 0 },
    { nome: "Cartão Nubank", valor: 0 },
    { nome: "Cartão Santander", valor: 0 },
    { nome: "Carro Kwid", valor: 1669.21 },
    { nome: "Escola Filha", valor: 1050 }
  ],
  lancamentos: []
};

let chartInstance = null;
let filtroAtivo = "Todas";

// Salvar dados no localStorage
function salvar() {
  try {
    localStorage.setItem("dados", JSON.stringify(dados));
  } catch (e) {
    console.error("Erro ao salvar dados:", e);
    alert("Erro ao salvar dados. Verifique o espaço disponível.");
  }
}

// ============ CASAL (NOMES) ============
function salvarCasal() {
  const nome1 = document.getElementById("pessoa1").value.trim();
  const nome2 = document.getElementById("pessoa2").value.trim();

  if (!nome1 || !nome2) {
    alert("Por favor, preencha ambos os nomes.");
    return;
  }

  dados.casal = [nome1, nome2];
  salvar();
  alert("Nomes salvos com sucesso!");
}

// ============ NAVEGAÇÃO ENTRE ABAS ============
function mostrarAba(id) {
  document.querySelectorAll(".aba").forEach(a => a.classList.add("oculto"));
  document.getElementById(id).classList.remove("oculto");

  // Atualizar botão ativo da nav
  document.querySelectorAll("nav button").forEach(btn => {
    btn.classList.remove("nav-active");
  });
  event.target.classList.add("nav-active");

  // Se for aba 50-30-20, renderizar gráfico
  if (id === "502020") {
    setTimeout(() => atualizar502020(), 100);
  }
}

// ============ CONTAS FIXAS ============
function adicionarContaFixa() {
  const nome = prompt("Nome da conta (ex: 'Água Casa'):");
  if (!nome || nome.trim() === "") return;

  const valorStr = prompt("Valor (ex: 100.50):");
  if (!valorStr) return;

  const valor = parseFloat(valorStr);
  if (isNaN(valor) || valor < 0) {
    alert("Valor inválido. Digite um número positivo.");
    return;
  }

  dados.fixas.push({ nome: nome.trim(), valor });
  salvar();
  renderFixas();
}

function renderFixas() {
  const listaFixas = document.getElementById("listaFixas");
  listaFixas.innerHTML = "";

  let total = 0;

  dados.fixas.forEach((conta, i) => {
    total += conta.valor;
    listaFixas.innerHTML += `
      <li>
        <div>
          <strong>${conta.nome}</strong><br>
          R$ ${conta.valor.toFixed(2)}
        </div>
        <button onclick="editarFixa(${i})">✏️</button>
        <button onclick="removerFixa(${i})">🗑</button>
      </li>
    `;
  });

  document.getElementById("totalFixas").textContent = total.toFixed(2);
}

function editarFixa(i) {
  const novoValor = prompt(
    `Novo valor para "${dados.fixas[i].nome}":\n(Atual: R$ ${dados.fixas[i].valor.toFixed(2)})`,
    dados.fixas[i].valor.toFixed(2)
  );

  if (novoValor === null) return;

  const valor = parseFloat(novoValor);
  if (isNaN(valor) || valor < 0) {
    alert("Valor inválido.");
    return;
  }

  dados.fixas[i].valor = valor;
  salvar();
  renderFixas();
}

function removerFixa(i) {
  if (confirm(`Remover "${dados.fixas[i].nome}"?`)) {
    dados.fixas.splice(i, 1);
    salvar();
    renderFixas();
  }
}

// ============ CLASSIFICAÇÃO AUTOMÁTICA (IA POR REGRAS) ============
function classificar(texto) {
  texto = texto.toLowerCase();

  if (
    texto.includes("salário") ||
    texto.includes("freelance") ||
    texto.includes("bonus") ||
    texto.includes("décimo")
  ) {
    return "Receita";
  }

  if (
    texto.includes("mercado") ||
    texto.includes("supermercado") ||
    texto.includes("padaria") ||
    texto.includes("açougue") ||
    texto.includes("restaurante") ||
    texto.includes("pizza") ||
    texto.includes("comida") ||
    texto.includes("alimentação")
  ) {
    return "Alimentação";
  }

  if (
    texto.includes("cartão") ||
    texto.includes("telefone") ||
    texto.includes("internet") ||
    texto.includes("luz") ||
    texto.includes("água") ||
    texto.includes("gás") ||
    texto.includes("condomínio") ||
    texto.includes("aluguel") ||
    texto.includes("carro") ||
    texto.includes("combustível") ||
    texto.includes("escola")
  ) {
    return "Despesas Fixas";
  }

  return "Outros";
}

// ============ LANÇAMENTOS ============
function processarLancamento() {
  const texto = document.getElementById("textoLancamento").value.trim();
  const dataStr = document.getElementById("dataLancamento").value;

  if (!texto) {
    alert("Por favor, preencha a descrição do lançamento.");
    return;
  }

  // Extrair valor (primeiro número com até 2 casas decimais)
  const valorMatch = texto.match(/\d+\.?\d{0,2}/);
  if (!valorMatch) {
    alert('Nenhum valor encontrado. Use formato: "Descrição 50.90 [Pessoa]"');
    return;
  }

  const valor = parseFloat(valorMatch[0]);
  if (valor <= 0) {
    alert("O valor deve ser maior que zero.");
    return;
  }

  // Detectar pessoa mencionada
  let pessoa = "Ambos";
  if (dados.casal.length === 2) {
    const textoLower = texto.toLowerCase();
    if (textoLower.includes(dados.casal[0].toLowerCase())) {
      pessoa = dados.casal[0];
    } else if (textoLower.includes(dados.casal[1].toLowerCase())) {
      pessoa = dados.casal[1];
    }
  }

  const categoria = classificar(texto);
  const data = dataStr || new Date().toISOString().slice(0, 10);

  dados.lancamentos.push({
    texto,
    valor,
    categoria,
    pessoa,
    data
  });

  salvar();
  document.getElementById("textoLancamento").value = "";
  document.getElementById("dataLancamento").value = "";
  renderLancamentos();
  atualizar502020();
}

function renderLancamentos() {
  const listaLancamentos = document.getElementById("listaLancamentos");
  listaLancamentos.innerHTML = "";

  // Filtrar por categoria
  let lancamentos = dados.lancamentos;
  if (filtroAtivo !== "Todas") {
    lancamentos = lancamentos.filter(l => l.categoria === filtroAtivo);
  }

  // Ordenar por data decrescente
  lancamentos.sort((a, b) => new Date(b.data) - new Date(a.data));

  if (lancamentos.length === 0) {
    listaLancamentos.innerHTML = '<li style="text-align: center; color: #999;">Nenhum lançamento encontrado</li>';
    return;
  }

  lancamentos.forEach((l, originalIndex) => {
    const realIndex = dados.lancamentos.indexOf(l);
    const data = new Date(l.data);
    const dataFormatada = data.toLocaleDateString("pt-BR");

    listaLancamentos.innerHTML += `
      <li>
        <div>
          <strong>${l.texto}</strong><br>
          <small>${dataFormatada} | ${l.categoria} | ${l.pessoa}</small>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <div style="font-weight: bold; color: #d32f2f; margin-bottom: 8px;">
            -R$ ${l.valor.toFixed(2)}
          </div>
          <button onclick="removerLancamento(${realIndex})" style="width: 40px; padding: 6px;">🗑</button>
        </div>
      </li>
    `;
  });
}

function removerLancamento(i) {
  if (confirm("Remover este lançamento?")) {
    dados.lancamentos.splice(i, 1);
    salvar();
    renderLancamentos();
    atualizar502020();
  }
}

function filtrarPorCategoria(categoria) {
  filtroAtivo = categoria;

  // Atualizar botões de filtro
  document.querySelectorAll(".filtros button").forEach(btn => {
    btn.classList.remove("filtro-ativo");
  });
  event.target.classList.add("filtro-ativo");

  renderLancamentos();
}

// ============ MÉTODO 50-30-20 ============
function atualizar502020() {
  const receita = dados.lancamentos
    .filter(l => l.categoria === "Receita")
    .reduce((sum, l) => sum + l.valor, 0);

  const essencial = receita * 0.5;
  const desejos = receita * 0.3;
  const investimentos = receita * 0.2;

  // Atualizar textos
  document.getElementById("essencial").textContent = `R$ ${essencial.toFixed(2)}`;
  document.getElementById("desejos").textContent = `R$ ${desejos.toFixed(2)}`;
  document.getElementById("investimentos").textContent = `R$ ${investimentos.toFixed(2)}`;
  document.getElementById("totalReceita").textContent = receita.toFixed(2);

  // Destruir gráfico anterior se existir
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Criar novo gráfico
  const ctx = document.getElementById("grafico");
  if (ctx) {
    chartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Essencial (50%)", "Desejos (30%)", "Investimentos (20%)"],
        datasets: [
          {
            data: [essencial, desejos, investimentos],
            backgroundColor: ["#4caf50", "#ff9800", "#9c27b0"],
            borderColor: ["#45a049", "#f57c00", "#8e24aa"],
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              font: { size: 14 }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed;
                return `R$ ${value.toFixed(2)}`;
              }
            }
          }
        }
      }
    });
  }
}

// ============ SERVICE WORKER ============
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").catch(err => {
    console.warn("Erro ao registrar Service Worker:", err);
  });
}

// ============ INICIALIZAÇÃO ============
document.addEventListener("DOMContentLoaded", () => {
  renderFixas();
  renderLancamentos();

  // Pré-preencher nome se já existir
  if (dados.casal.length === 2) {
    document.getElementById("pessoa1").value = dados.casal[0];
    document.getElementById("pessoa2").value = dados.casal[1];
  }

  // Definir data de hoje como padrão
  const hoje = new Date().toISOString().slice(0, 10);
  document.getElementById("dataLancamento").value = hoje;

  // Enter para processar lançamento
  document.getElementById("textoLancamento").addEventListener("keypress", e => {
    if (e.key === "Enter") {
      processarLancamento();
    }
  });
});
