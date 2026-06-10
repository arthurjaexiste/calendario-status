document.getElementById('formNovoFunc').addEventListener('submit', function(e) {
    e.preventDefault();
    const msgStatus = document.getElementById('msgStatus');
    msgStatus.style.display = 'none';

    const dados = {
        nome: document.getElementById('func_nome').value,
        cargo: document.getElementById('func_cargo').value,
        cpf: document.getElementById('func_cpf').value,
        telefone: document.getElementById('func_telefone').value,
        data_nascimento: document.getElementById('func_nascimento').value
    };

    fetch('/api/funcionarios/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(res => {
        if (res.ok) {
            window.location.href = '/funcionarios';
        } else {
            throw new Error();
        }
    })
    .catch(() => {
        msgStatus.textContent = "Erro ao cadastrar funcionário. Verifique se o CPF já existe.";
        msgStatus.className = "mensagem erro";
        msgStatus.style.display = "block";
    });
});

// Função que formata o CPF em tempo real (xxx.xxx.xxx-xx)
function mascaraCPF(input) {
    // Remove tudo o que não for número
    let v = input.value.replace(/\D/g, "");

    // Aplica a formatação por etapas de digitação
    if (v.length <= 11) {
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    input.value = v;
}

// Função que formata o Telefone em tempo real ((xx) xxxxx-xxxx)
function mascaraTelefone(input) {
    // Remove tudo o que não for número
    let v = input.value.replace(/\D/g, "");

    // Aplica os parênteses e o hífen
    if (v.length <= 11) {
        v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
        v = v.replace(/(\d{5})(\d)/, "$1-$2");
    }

    input.value = v;
}