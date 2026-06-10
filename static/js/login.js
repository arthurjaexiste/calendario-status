document.getElementById('formLogin').addEventListener('submit', function (e) {
    e.preventDefault();
    const msgErro = document.getElementById('msgErro');
    msgErro.style.display = 'none';

    const dados = {
        usuario: document.getElementById('usuario').value,
        senha: document.getElementById('senha').value
    };

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                window.location.href = data.redirecionar; // O Go vai dizer pra onde o usuário vai
            } else {
                msgErro.textContent = "Usuário ou senha incorretos.";
                msgErro.style.display = 'block';
            }
        })
        .catch(() => {
            msgErro.textContent = "Erro de conexão com o servidor.";
            msgErro.style.display = 'block';
        });
});