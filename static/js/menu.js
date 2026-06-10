let funcionariosMaster = []; // Guarda a lista vinda do cadastro mestre

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', function() {
    const perfilCookie = document.cookie.split('; ').find(row => row.startsWith('auth_perfil='));
    const perfil = perfilCookie ? perfilCookie.split('=')[1] : '';

    // Captura os elementos do menu
    const linkLancamento = document.querySelector('a[href="/lancamento"]')?.parentElement;
    const linkUsuarios = document.querySelector('a[href="/usuarios"]')?.parentElement;
    const linkFuncionarios = document.querySelector('a[href="/funcionarios"]')?.parentElement;

    // Regras de visibilidade
    if (perfil === "RH") {
        if (linkLancamento) linkLancamento.style.display = 'none';
        if (linkUsuarios) linkUsuarios.style.display = 'none';
    } else if (perfil === "LOGISTICA") {
        if (linkUsuarios) linkUsuarios.style.display = 'none';
        if (linkFuncionarios) linkFuncionarios.style.display = 'none';
    }

    // Gerenciador do Dropdown de Pesquisa Inteligente
    const inputBusca = document.getElementById('inputBuscaFuncionario');
    const listaDropdown = document.getElementById('listaDropdownFunc');

    if (inputBusca && listaDropdown) {
        // Busca os dados diretamente da API oficial de funcionários do sistema
        fetch('/api/funcionarios/lista')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    funcionariosMaster = data.map(f => f.nome !== undefined ? f.nome : (f.Nome || ''));
                    renderizarOpcoes(funcionariosMaster);
                }
            })
            .catch(err => {
                console.error("Erro ao carregar lista master:", err);
                listaDropdown.innerHTML = '<div class="dropdown-item sem-resultado">⚠️ Erro ao carregar funcionários</div>';
            });

        // Abre a lista ao clicar no campo
        inputBusca.addEventListener('click', function() {
            listaDropdown.style.display = 'block';
        });

        // Filtra os resultados em tempo real conforme digita
        inputBusca.addEventListener('input', function() {
			listaDropdown.style.display = 'block';
            const termo = inputBusca.value.toLowerCase();
            const filtrados = funcionariosMaster.filter(nome => nome.toLowerCase().includes(termo));
            renderizarOpcoes(filtrados);
        });

        // Fecha a lista se clicar fora do componente de busca
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown-pesquisa')) {
                listaDropdown.style.display = 'none';
            }
        });
    }
});

// Desenha os itens filtrados dentro da caixinha suspensa
function renderizarOpcoes(listaNomes) {
    const listaDropdown = document.getElementById('listaDropdownFunc');
    const inputBusca = document.getElementById('inputBuscaFuncionario');
    if (!listaDropdown) return;

    listaDropdown.innerHTML = '';

    if (listaNomes.length > 0) {
        listaNomes.forEach(nome => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = nome;
            
            // Quando clica em um funcionário da lista, preenche o campo e fecha a caixinha
            item.addEventListener('click', function() {
                inputBusca.value = nome;
                listaDropdown.style.display = 'none';
            });
            
            listaDropdown.appendChild(item);
        });
    } else {
        listaDropdown.innerHTML = '<div class="dropdown-item sem-resultado">Nenhum funcionário encontrado</div>';
    }
}

// Redireciona para o diário do funcionário selecionado
function acessarDiario() {
    const nome = document.getElementById('inputBuscaFuncionario').value;
    if (nome && nome.trim() !== "" && funcionariosMaster.includes(nome)) {
        window.location.href = `/diario?funcionario=${encodeURIComponent(nome)}`;
    } else {
        alert("Por favor, selecione um funcionário válido da lista.");
    }
}