document.getElementById('formUsuario').addEventListener('submit', function(e) {
    e.preventDefault();
    const msgStatus = document.getElementById('msgUserStatus');
    msgStatus.style.display = 'none';

    const dados = {
        usuario: document.getElementById('new_usuario').value,
        senha:  document.getElementById('new_senha').value,
        perfil: document.getElementById('new_perfil').value
    };

    fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(response => {
        if (response.ok) {
            msgStatus.textContent = "Usuário cadastrado com sucesso!";
            msgStatus.className = "mensagem sucesso";
            msgStatus.style.display = "block";
            document.getElementById('formUsuario').reset();
        } else {
            throw new Error();
        }
    })
    .catch(() => {
        msgStatus.textContent = "Erro ao cadastrar ou usuário já existente.";
        msgStatus.className = "mensagem erro";
        msgStatus.style.display = "block";
    });
});