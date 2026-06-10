document.addEventListener('DOMContentLoaded', function () {

    // 1. INICIALIZA O CALENDÁRIO COM MÁSCARA BRASILEIRA (HORA INCLUSA)
    flatpickr(".data-hora-brasil", {
        enableTime: true,
        time_24hr: true,
        altInput: true,               // Cria o input visual formatado
        altFormat: "d/m/Y H:i",       // Visual BR: Ex: 11/06/2026 12:00
        dateFormat: "Y-m-d\\TH:i",    // Banco ISO: Ex: 2026-06-11T12:00
        locale: "pt",
        disableMobile: true
    });

    const selectFuncionario = document.getElementById('nome_funcionario');
    const form = document.getElementById('formLancamento');

    // 2. BUSCA A LISTA DE FUNCIONÁRIOS CADASTRADOS
    if (selectFuncionario) {
        fetch('/api/funcionarios/lista')
            .then(res => res.json())
            .then(data => {
                selectFuncionario.innerHTML = '<option value="" disabled selected>Selecione um funcionário...</option>';
                if (data && data.length > 0) {
                    data.forEach(f => {
                        const opt = document.createElement('option');
                        opt.value = f.nome;
                        opt.textContent = f.nome;
                        opt.dataset.cargo = f.cargo;
                        selectFuncionario.appendChild(opt);
                    });
                }
            })
            .catch(err => console.error("Erro ao carregar funcionários:", err));

        // Preenche o cargo automaticamente ao escolher o nome
        selectFuncionario.addEventListener('change', (e) => {
            const cargo = e.target.options[e.target.selectedIndex].dataset.cargo;
            const selectCargo = document.getElementById('cargo');

            for (let i = 0; i < selectCargo.options.length; i++) {
                if (selectCargo.options[i].value.toUpperCase() === cargo.toUpperCase()) {
                    selectCargo.selectedIndex = i;
                    break;
                }
            }
        });
    }

    // 3. ENVIA OS DADOS PARA O BANCO DE DADOS
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const msg = document.getElementById('msgStatus');

            msg.style.color = '#2563eb';
            msg.textContent = 'Enviando dados...';

            const dados = {
                nome_funcionario: selectFuncionario.value,
                cargo: document.getElementById('cargo').value,
                status_evento: document.getElementById('status_evento').value,
                data_inicio: document.getElementById('data_inicio').value, // Envia no formato Y-m-d\TH:i
                data_fim: document.getElementById('data_fim').value,
                observacao: document.getElementById('observacao').value
            };

            fetch('/api/salvar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            })
                .then(res => {
                    if (res.ok) {
                        msg.textContent = '✅ Salvo com sucesso!';
                        msg.style.color = '#1e8e3e';
                        form.reset();
                        setTimeout(() => window.location.reload(), 1500);
                    } else {
                        msg.textContent = '❌ Erro ao salvar no banco.';
                        msg.style.color = '#ef4444';
                    }
                })
                .catch(err => {
                    console.error(err);
                    msg.textContent = '⚠️ Falha de conexão com o servidor.';
                    msg.style.color = '#ef4444';
                });
        });
    }
});