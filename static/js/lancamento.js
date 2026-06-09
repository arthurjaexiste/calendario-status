document.getElementById('formLancamento').addEventListener('submit', function (e) {
    e.preventDefault();

    const msgStatus = document.getElementById('msgStatus');
    msgStatus.style.display = 'none';

    const dados = {
        nome_funcionario: document.getElementById('nome').value,
        cargo: document.getElementById('cargo').value,
        status_evento: document.getElementById('status').value,
        data_inicio: document.getElementById('data_inicio').value.replace('T', ' ') + ':00',
        data_fim: document.getElementById('data_fim').value ? document.getElementById('data_fim').value.replace('T', ' ') + ':00' : null,
        observacao: document.getElementById('observacao').value
    };

    fetch('/api/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
        .then(response => {
            if (response.ok) {
                msgStatus.textContent = "Registro salvo com sucesso!";
                msgStatus.className = "mensagem sucesso";
                msgStatus.style.display = "block";
                document.getElementById('formLancamento').reset();
            } else {
                throw new Error('Erro ao salvar no banco.');
            }
        })
        .catch(error => {
            msgStatus.textContent = "Erro de conexão ao tentar salvar.";
            msgStatus.className = "mensagem erro";
            msgStatus.style.display = "block";
        });
});