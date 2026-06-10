document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/funcionarios/lista')
        .then(response => response.json())
        .then(data => {
            const corpo = document.getElementById('corpoTabelaFunc');
            corpo.innerHTML = '';
            if (data && data.length > 0) {
                data.forEach(f => {
                    let tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${f.id}</td>
                        <td class="td-nome"><strong>${f.nome}</strong></td>
                        <td>${f.cargo}</td>
                        <td class="td-cpf">${f.cpf}</td>
                        <td>${f.telefone || 'Não informado'}</td>
                        <td>${f.data_nascimento || 'Não informado'}</td>
                        <td><button style="color:red; border:none; background:none; cursor:pointer;" onclick="alert('Exclusão em breve')">Remover</button></td>
                    `;
                    corpo.appendChild(tr);
                });
            } else {
                corpo.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum funcionário cadastrado.</td></tr>';
            }
        })
        .catch(error => console.error("Erro ao buscar funcionários:", error));
});

// Função que filtra as linhas da tabela enquanto você digita o Nome ou CPF
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