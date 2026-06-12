document.addEventListener('DOMContentLoaded', function () {

    // 1. INICIA O CALENDÁRIO
    const flatpickrConfig = {
        enableTime: true,
        time_24hr: true,
        altInput: true,
        altFormat: "d/m/Y H:i",
        dateFormat: "Y-m-d\\TH:i",
        locale: "pt",
        disableMobile: true
    };
    flatpickr(".data-hora-brasil", flatpickrConfig);

    const selectFuncionario = document.getElementById('nome_funcionario');
    const selectStatus = document.getElementById('status_evento');
    const sectionRange = document.getElementById('section-range');
    const sectionPoint = document.getElementById('section-point');
    const labelPonto = document.getElementById('label-ponto');
    const form = document.getElementById('formLancamento');

    // 2. BUSCA A LISTA DE FUNCIONÁRIOS NA API (AGORA VAI FUNCIONAR)
    if (selectFuncionario) {
        fetch('/api/funcionarios/lista')
            .then(res => {
                if (!res.ok) throw new Error("Erro na API");
                return res.json();
            })
            .then(data => {
                selectFuncionario.innerHTML = '<option value="" disabled selected>Selecione um funcionário...</option>';
                if (data && data.length > 0) {
                    data.forEach(f => {
                        const opt = document.createElement('option');
                        opt.value = f.nome;
                        opt.textContent = f.nome;
                        opt.dataset.cargo = f.cargo || ""; // Proteção caso cargo venha nulo
                        selectFuncionario.appendChild(opt);
                    });
                } else {
                    selectFuncionario.innerHTML = '<option value="" disabled selected>Nenhum funcionário encontrado</option>';
                }
            })
            .catch(err => console.error("Erro ao carregar funcionários:", err));

        // Preenche o cargo automaticamente ao selecionar o nome
        selectFuncionario.addEventListener('change', (e) => {
            const cargo = e.target.options[e.target.selectedIndex].dataset.cargo || "";
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

    // 3. LÓGICA DE TROCA DE CAMPOS (ENTRADA/SAÍDA vs OUTROS)
    if (selectStatus) {
        selectStatus.addEventListener('change', (e) => {
            const status = e.target.value;
            if (status === 'ENTRADA' || status === 'SAÍDA') {
                sectionRange.style.display = 'none';
                sectionPoint.style.display = 'block';
                labelPonto.textContent = status === 'ENTRADA' ? 'Horário de Entrada *' : 'Horário de Saída *';
            } else {
                sectionRange.style.display = 'block';
                sectionPoint.style.display = 'none';
            }
        });
    }

    // 4. SALVAR NO BANCO
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const msg = document.getElementById('msgStatus');

            msg.style.color = '#2563eb';
            msg.textContent = '⏳ Processando lançamento...';

            const status = selectStatus.value;
            let dataInicio, dataFim;

            // Se for Entrada ou Saída, pega do campo único. Senão, pega dos campos duplos.
            if (status === 'ENTRADA' || status === 'SAÍDA') {
                dataInicio = document.getElementById('data_ponto').value;
                dataFim = '';
            } else {
                dataInicio = document.getElementById('data_inicio').value;
                dataFim = document.getElementById('data_fim').value;
            }

            const dados = {
                nome_funcionario: selectFuncionario.value,
                cargo: document.getElementById('cargo').value,
                status_evento: status,
                data_inicio: dataInicio,
                data_fim: dataFim,
                observacao: document.getElementById('observacao').value
            };

            // Validação de segurança
            if (!dados.nome_funcionario || !dados.data_inicio) {
                msg.textContent = '❌ Funcionário e Data/Horário são obrigatórios!';
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

                        // Voltar a tela ao formato original
                        sectionRange.style.display = 'block';
                        sectionPoint.style.display = 'none';

                        // Limpa os calendários visualmente
                        document.querySelectorAll('.data-hora-brasil').forEach(el => {
                            if (el._flatpickr) el._flatpickr.clear();
                        });

                        setTimeout(() => window.location.reload(), 1500);
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