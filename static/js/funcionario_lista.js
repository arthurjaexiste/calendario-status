document.addEventListener('DOMContentLoaded', function() {
    const corpo = document.getElementById('corpoTabelaFunc');
    if (!corpo) return;

    fetch('/api/funcionarios/lista')
        .then(async response => {
            // Obtém a resposta como texto puro primeiro para evitar crash de parse do JSON
            const textoBruto = await response.text();
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${textoBruto || 'Sem resposta do servidor'}`);
            }

            try {
                return JSON.parse(textoBruto);
            } catch (e) {
                throw new Error("A API não retornou um formato JSON válido. Retorno recebido: " + textoBruto);
            }
        })
        .then(data => {
            corpo.innerHTML = '';
            
            if (!Array.isArray(data)) {
                throw new Error("A API retornou sucesso, mas os dados não vieram em formato de lista.");
            }

            if (data.length > 0) {
                data.forEach(f => {
                    // Mapeia flexível para aceitar tanto minúsculas quanto maiúsculas da struct do Go
                    let id = f.id !== undefined ? f.id : (f.ID || '');
                    let nome = f.nome !== undefined ? f.nome : (f.Nome || '');
                    let cargo = f.cargo !== undefined ? f.cargo : (f.Cargo || '');
                    let cpf = f.cpf !== undefined ? f.cpf : (f.CPF || '');
                    let telefone = f.telefone !== undefined ? f.telefone : (f.Telefone || 'Não informado');
                    let dataNasc = f.data_nascimento !== undefined ? f.data_nascimento : (f.DataNascimento || 'Não informado');

                    let tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${id}</td>
                        <td class="td-nome"><strong>${nome}</strong></td>
                        <td>${cargo}</td>
                        <td class="td-cpf">${cpf}</td>
                        <td>${telefone}</td>
                        <td>${dataNasc}</td>
                        <td><button style="color:red; border:none; background:none; cursor:pointer;" onclick="alert('Exclusão em breve')">Remover</button></td>
                    `;
                    corpo.appendChild(tr);
                });
            } else {
                corpo.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Nenhum funcionário cadastrado.</td></tr>';
            }
        })
        .catch(error => {
            console.error("Erro detectado:", error);
            corpo.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#d93025; font-weight:bold; padding:20px; background-color:#fce8e6;">⚠️ Falha no Carregamento:<br>${error.message}</td></tr>`;
        });
});

function filtrarTabela() {
    const input = document.getElementById('buscaFuncionario').value.toLowerCase();
    const linhas = document.querySelectorAll('#corpoTabelaFunc tr');

    linhas.forEach(linha => {
        const nome = linha.querySelector('.td-nome')?.textContent.toLowerCase() || '';
        const cpf = linha.querySelector('.td-cpf')?.textContent.toLowerCase() || '';
        
        if (nome.includes(input) || cpf.includes(input)) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
    });
}