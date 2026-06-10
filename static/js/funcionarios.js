document.getElementById('formNovoFunc').addEventListener('submit', function(e) {
    e.preventDefault();
    const msgStatus = document.getElementById('msgStatus');
    
    if (msgStatus) {
        msgStatus.style.display = 'none';
        msgStatus.textContent = '';
        msgStatus.className = 'mensagem'; // reseta classes
    }

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
            if (msgStatus) {
                msgStatus.textContent = "✅ Funcionário cadastrado com sucesso!";
                msgStatus.className = "mensagem sucesso";
                msgStatus.style.display = "block";
                msgStatus.style.backgroundColor = "#e6f4ea";
                msgStatus.style.color = "#1e8e3e";
                msgStatus.style.padding = "10px";
                msgStatus.style.borderRadius = "4px";
                msgStatus.style.marginTop = "15px";
                msgStatus.style.textAlign = "center";
                msgStatus.style.fontWeight = "bold";
            }
            
            // Limpa o formulário após o sucesso
            document.getElementById('formNovoFunc').reset();

            // Espera 2 segundos para o usuário ver o feedback e depois redireciona
            setTimeout(() => {
                window.location.href = '/funcionarios';
            }, 2000);
        } else {
            throw new Error();
        }
    })
    .catch(() => {
        if (msgStatus) {
            msgStatus.textContent = "❌ Erro ao cadastrar funcionário. Verifique se o CPF já existe.";
            msgStatus.className = "mensagem erro";
            msgStatus.style.display = "block";
            msgStatus.style.backgroundColor = "#fce8e6";
            msgStatus.style.color = "#d93025";
            msgStatus.style.padding = "10px";
            msgStatus.style.borderRadius = "4px";
            msgStatus.style.marginTop = "15px";
            msgStatus.style.textAlign = "center";
            msgStatus.style.fontWeight = "bold";
        }
    });
});

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