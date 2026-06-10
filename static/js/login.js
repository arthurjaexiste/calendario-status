document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formLogin');
    const msg = document.getElementById('mensagem');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (msg) {
            msg.style.color = '#2563eb';
            msg.textContent = 'Autenticando...';
        }

        const usuarioInput = document.getElementById('usuario');
        const senhaInput = document.getElementById('senha');

        const dados = {
            usuario: usuarioInput ? usuarioInput.value.trim() : '',
            senha: senhaInput ? senhaInput.value.trim() : ''
        };

        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(async response => {
            const texto = await response.text();
            if (!response.ok) {
                throw new Error(texto || 'Erro desconhecido no servidor');
            }
            try {
                return JSON.parse(texto);
            } catch (err) {
                throw new Error('Resposta do servidor inválida (Não é JSON)');
            }
        })
        .then(data => {
            if (data.sucesso) {
                if (msg) {
                    msg.style.color = '#1e8e3e';
                    msg.textContent = 'Login efetuado! Redirecionando...';
                }
                // Redireciona para a rota enviada pelo Go (ex: / ou /lancamento)
                window.location.href = data.redirecionar || '/';
            } else {
                if (msg) {
                    msg.style.color = '#ef4444';
                    msg.textContent = '⚠️ Usuário ou senha incorretos.';
                }
            }
        })
        .catch(error => {
            console.error('Erro no login:', error);
            if (msg) {
                msg.style.color = '#ef4444';
                msg.textContent = '⚠️ Falha de conexão: ' + error.message;
            }
        });
    });
});