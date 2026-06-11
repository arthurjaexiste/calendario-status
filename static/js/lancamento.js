document.addEventListener('DOMContentLoaded', function () {

    // 1. CONFIGURAÇÃO PROFISSIONAL DO CALENDÁRIO (Flatpickr)
    const flatpickrConfig = {
        enableTime: true,
        time_24hr: true,
        altInput: true,               // Input visual amigável
        altFormat: "d/m/Y H:i",       // Formato BR: 11/06/2026 14:30
        dateFormat: "Y-m-d\\TH:i",    // Formato ISO para o backend
        locale: "pt",
        disableMobile: true,
        animate: true,
        monthSelectorType: 'static',
        onOpen: function(selectedDates, dateStr, instance) {
            instance.element.classList.add('is-open');
        },
        onClose: function(selectedDates, dateStr, instance) {
            instance.element.classList.remove('is-open');
        }
    };

    flatpickr(".data-hora-brasil", flatpickrConfig);

    const selectFuncionario = document.getElementById('nome_funcionario');
    const form = document.getElementById('formLancamento');

    // 2. CARREGAMENTO DINÂMICO DE FUNCIONÁRIOS
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

        selectFuncionario.addEventListener('change', (e) => {
            const cargo = e.target.options[e.target.selectedIndex].dataset.cargo;
            const selectCargo = document.getElementById('cargo');
            if (selectCargo) {
                for (let i = 0; i < selectCargo.options.length; i++) {
                    if (selectCargo.options[i].value.toUpperCase() === cargo.toUpperCase()) {
                        selectCargo.selectedIndex = i;
                        break;
                    }
                }
            }
        });
    }

    // 3. ENVIO DO FORMULÁRIO COM FEEDBACK VISUAL
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const msg = document.getElementById('msgStatus');

            // Reset de estado
            msg.className = 'status-msg'; // Reseta classes
            msg.style.color = '#2563eb';
            msg.textContent = '⏳ Processando lançamento...';

            const dados = {
                nome_funcionario: selectFuncionario.value,
                cargo: document.getElementById('cargo').value,
                status_evento: document.getElementById('status_evento').value,
                data_inicio: document.getElementById('data_inicio').value,
                data_fim: document.getElementById('data_fim').value,
                observacao: document.getElementById('observacao').value
            };

            // Validação básica no front
            if (!dados.nome_funcionario || !dados.data_inicio) {
                msg.textContent = '❌ Funcionário e Data de Início são obrigatórios!';
                msg.style.color = '#ef4444';
                return;
            }

            fetch('/api/salvar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            })
            .then(res => {
                if (res.ok) {
                    msg.textContent = '✅ Lançamento registrado com sucesso!';
                    msg.style.color = '#1e8e3e';
                    form.reset();
                    // Re-inicializa os campos de data após o reset
                    document.querySelectorAll('.data-hora-brasil').forEach(el => {
                        if (el._flatpickr) {
                            el._flatpickr.clear();
                        }
                    });
                    
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    return res.text().then(text => { throw new Error(text) });
                }
            })
            .catch(err => {
                console.error('Erro ao salvar:', err);
                msg.textContent = '❌ ' + err.message;
                msg.style.color = '#ef4444';
            });
        });
    }
});