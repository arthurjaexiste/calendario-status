document.addEventListener('DOMContentLoaded', function() {
    const corpo = document.getElementById('corpoTabelaFunc');
    if (!corpo) return;

    fetch('/api/funcionarios/lista')
        .then(res => {
            if (!res.ok) throw new Error("Erro do servidor: " + res.status);
            return res.json();
        })
        .then(data => {
            corpo.innerHTML = '';
            
            if (data && data.length > 0) {
                data.forEach(f => {
                    let id = f.id !== undefined ? f.id : (f.ID || '');
                    let nome = f.nome !== undefined ? f.nome : (f.Nome || '');
                    let cargo = f.cargo !== undefined ? f.cargo : (f.Cargo || '');
                    let cpf = f.cpf !== undefined ? f.cpf : (f.CPF || '');
                    let telefone = f.telefone !== undefined ? f.telefone : (f.Telefone || '');
                    let dataNasc = f.data_nascimento !== undefined ? f.data_nascimento : (f.DataNascimento || '');

                    let tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${id}</td>
                        <td class="td-nome"><strong>${nome}</strong></td>
                        <td>${cargo}</td>
                        <td class="td-cpf">${cpf || 'Não informado'}</td>
                        <td>${telefone || 'Não informado'}</td>
                        <td>${dataNasc || 'Não informado'}</td>
                        <td>
                            <button style="background:#4285F4; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold;" 
                                onclick="abrirModal(${id}, '${nome}', '${cargo}', '${cpf}', '${telefone}', '${dataNasc}')">
                                <i class="fa-solid fa-pen"></i> Editar
                            </button>
                        </td>
                    `;
                    corpo.appendChild(tr);
                });
            } else {
                corpo.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Nenhum funcionário cadastrado no sistema.</td></tr>';
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            corpo.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#d93025; font-weight:bold; padding:20px;">⚠️ Falha ao carregar funcionários do sistema.</td></tr>`;
        });
});

function abrirModal(id, nome, cargo, cpf, tel, nasc) {
    document.getElementById('edit_id').value = id;
    document.getElementById('edit_nome').value = nome;
    document.getElementById('edit_cargo').value = cargo;
    document.getElementById('edit_cpf').value = cpf;
    document.getElementById('edit_telefone').value = tel;
    
    if (nasc && nasc.includes('/')) {
        let parts = nasc.split('/');
        document.getElementById('edit_nascimento').value = `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else {
        document.getElementById('edit_nascimento').value = '';
    }
    
    document.getElementById('modalEdicao').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modalEdicao').style.display = 'none';
}

function salvarEdicao() {
    const dados = {
        id: parseInt(document.getElementById('edit_id').value),
        nome: document.getElementById('edit_nome').value,
        cargo: document.getElementById('edit_cargo').value,
        cpf: document.getElementById('edit_cpf').value,
        telefone: document.getElementById('edit_telefone').value,
        data_nascimento: document.getElementById('edit_nascimento').value
    };

    fetch('/api/funcionarios/editar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(res => {
        if (res.ok) window.location.reload();
        else alert("Erro ao aplicar alterações no registro.");
    })
    .catch(err => console.error(err));
}

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

function mascaraCPF(input) {
    let v = input.value.replace(/\D/g, "");
    if (v.length <= 11) {
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    input.value = v;
}

function mascaraTelefone(input) {
    let v = input.value.replace(/\D/g, "");
    if (v.length <= 11) {
        v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
        v = v.replace(/(\d{5})(\d)/, "$1-$2");
    }
    input.value = v;
}