document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const tituloEl = document.getElementById('tituloDiario');
    const filtroStatus = document.getElementById('filtroStatus');

    if (!calendarEl) return;

    // 1. Extrai o nome do funcionário da barra de endereços (URL)
    const urlParams = new URLSearchParams(window.location.search);
    const nomeFuncionario = urlParams.get('funcionario') || '';

    // 2. Atualiza o título da tela
    if (tituloEl) {
        tituloEl.textContent = nomeFuncionario ? 'Diário: ' + nomeFuncionario : 'Diário Geral (Todos)';
    }

    // 3. Monta o Calendário (FullCalendar)
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        height: 700,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana'
        },
        slotEventOverlap: false,
        displayEventTime: true,

        // 4. Busca os eventos dinamicamente e ELIMINA DUPLICATAS DO BANCO
        events: function(fetchInfo, successCallback, failureCallback) {
            const status = filtroStatus ? filtroStatus.value : 'Todos';
            let url = `/api/eventos?status=${encodeURIComponent(status)}`;
            
            if (nomeFuncionario) {
                url += `&funcionario=${encodeURIComponent(nomeFuncionario)}`;
            }

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    // BLINDAGEM ANTI-DUPLICAÇÃO:
                    const eventosUnicos = [];
                    const chavesVistas = new Set();
                    
                    (data || []).forEach(evento => {
                        const chave = evento.title + "|" + evento.start + "|" + evento.end;
                        if (!chavesVistas.has(chave)) {
                            chavesVistas.add(chave);
                            eventosUnicos.push(evento);
                        }
                    });

                    // --- ATUALIZA OS CARDS DE HORAS ---
                    atualizarEstatisticas(eventosUnicos);

                    successCallback(eventosUnicos);
                })
                .catch(error => {
                    console.error('Erro na requisição:', error);
                    failureCallback(error);
                });
        },
        
        // 5. Exibe os detalhes no Modal
        eventClick: function(info) {
            showEventModal(info.event);
        }
    });

    calendar.render();

    // 6. Atualiza a tela automaticamente quando o Filtro muda
    if (filtroStatus) {
        filtroStatus.addEventListener('change', function() {
            calendar.refetchEvents();
        });
    }
});

// ==========================================
// LÓGICA DE CÁLCULO DE HORAS
// ==========================================
function atualizarEstatisticas(eventos) {
    const totais = {
        'ROTA': 0,
        'FOLGA': 0,
        'FÉRIAS': 0,
        'SUSPENSÃO': 0
    };

    eventos.forEach(ev => {
        // O título no backend vem como "Nome - STATUS"
        const partes = ev.title.split(' - ');
        const status = partes[partes.length - 1]?.toUpperCase();
        
        if (totais.hasOwnProperty(status)) {
            const inicio = new Date(ev.start);
            const fim = ev.end ? new Date(ev.end) : new Date(inicio.getTime() + (60 * 60 * 1000)); // Default 1h se não tiver fim
            
            const diffMs = fim - inicio;
            if (diffMs > 0) {
                totais[status] += diffMs;
            }
        }
    });

    // Converte milissegundos para formato "Xh Ym"
    const formatarHoras = (ms) => {
        const totalMinutos = Math.floor(ms / (1000 * 60));
        const horas = Math.floor(totalMinutos / 60);
        const minutos = totalMinutos % 60;
        return `${horas}h ${minutos}m`;
    };

    document.getElementById('statRota').textContent = formatarHoras(totais['ROTA']);
    document.getElementById('statFolga').textContent = formatarHoras(totais['FOLGA']);
    document.getElementById('statFerias').textContent = formatarHoras(totais['FÉRIAS']);
    document.getElementById('statSuspensao').textContent = formatarHoras(totais['SUSPENSÃO']);
}

// ==========================================
// FUNÇÕES DE CONTROLE DO MODAL DE DETALHES
// ==========================================
function showEventModal(event) {

    document.getElementById('modalTitle').textContent = event.title;
    
    document.getElementById('modalFuncionario').textContent = event.extendedProps.nome_funcionario || event.title.split(' - ')[0];
    document.getElementById('modalCargo').textContent = event.extendedProps.cargo || 'Não informado';
    
    let dataStr = event.start.toLocaleString('pt-BR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
    
    if (event.end) {
        dataStr += ' até ' + event.end.toLocaleString('pt-BR', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    }
    document.getElementById('modalData').textContent = dataStr;

    const obs = event.extendedProps.observacao || 'Nenhuma observação registrada.';
    document.getElementById('modalObservacao').textContent = obs;

    document.getElementById('eventModal').classList.add('active');
}

function closeModal() {
    document.getElementById('eventModal').classList.remove('active');
}

window.onclick = function(event) {
    const modal = document.getElementById('eventModal');
    if (event.target == modal) {
        closeModal();
    }
}