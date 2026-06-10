// Funções globais de máscara para serem usadas no HTML
function mascaraCPF(i) {
    var v = i.value;
    v = v.replace(/\D/g, "")
    v = v.replace(/(\d{3})(\d)/, "$1.$2")
    v = v.replace(/(\d{3})(\d)/, "$1.$2")
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    i.value = v;
}

function mascaraTelefone(i) {
    var v = i.value;
    v = v.replace(/\D/g, "")
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2")
    v = v.replace(/(\d)(\d{4})$/, "$1-$2")
    i.value = v;
}

document.addEventListener('DOMContentLoaded', function () {
    // === ATIVAÇÃO DO CALENDÁRIO FLATPICKR ===
    const inputNascimento = document.getElementById('func_nascimento');
    if (inputNascimento) {
        flatpickr(inputNascimento, {
            dateFormat: "Y-m-d", // Mantém o formato nativo ISO para o banco de dados
            locale: "pt", // Deixa o calendário em português
            disableMobile: "true"
        });
    }

    const form = document.getElementById('formNovoFunc');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const msg = document.getElementById('msgStatus');

        msg.style.color = '#2563eb';
        msg.textContent = 'Enviando dados...';

        const dados = {
            nome: document.getElementById('func_nome').value.trim(),
            cargo: document.getElementById('func_cargo').value,
            cpf: document.getElementById('func_cpf').value.trim(),
            telefone: document.getElementById('func_telefone').value.trim(),
            data_nascimento: document.getElementById('func_nascimento').value
        };

        fetch('/api/funcionarios/salvar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })
            .then(res => {
                if (res.ok) {
                    msg.style.color = '#1e8e3e';
                    msg.textContent = '✅ Colaborador cadastrado com sucesso!';
                    form.reset();
                    setTimeout(() => window.location.href = '/funcionarios', 1500);
                } else {
                    msg.style.color = '#ef4444';
                    msg.textContent = '⚠️ Erro ao salvar colaborador.';
                }
            })
            .catch(err => {
                console.error('Erro:', err);
                msg.style.color = '#ef4444';
                msg.textContent = '⚠️ Falha de conexão com o servidor.';
            });
    });
});