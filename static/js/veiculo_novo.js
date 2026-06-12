document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formVeiculo');
    const msg = document.getElementById('msgStatus');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            msg.textContent = '⏳ Salvando veículo...';
            msg.style.color = '#2563eb';

            const dados = {
                placa: document.getElementById('placa').value.toUpperCase(),
                modelo: document.getElementById('modelo').value,
                cor: document.getElementById('cor').value,
                ano: parseInt(document.getElementById('ano').value) || 0
            };

            fetch('/api/veiculos/criar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            })
            .then(res => {
                if (res.ok) {
                    msg.textContent = '✅ Veículo cadastrado com sucesso!';
                    msg.style.color = '#1e8e3e';
                    setTimeout(() => window.location.href = '/veiculos', 1500);
                } else {
                    return res.text().then(text => { throw new Error(text) });
                }
            })
            .catch(err => {
                console.error('Erro ao salvar veículo:', err);
                msg.textContent = '❌ ' + err.message;
                msg.style.color = '#ef4444';
            });
        });
    }
});
