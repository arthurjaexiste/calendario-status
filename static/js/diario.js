document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const tituloEl = document.getElementById('tituloDiario');
    const filtroStatus = document.getElementById('filtroStatus');

    // 1. Extrai o nome do funcionário da barra de endereços (URL)
    const urlParams = new URLSearchParams(window.location.search);
    const nomeFuncionario = urlParams.get('funcionario') || '';

    // 2. Atualiza o título da tela
    if (tituloEl) {
        tituloEl.textContent = nomeFuncionario ? 'Diário: ' + nomeFuncionario : 'Diário Geral (Todos)';
    }

    if (!calendarEl) {
        console.error("A div #calendar não foi encontrada no HTML.");
        return;
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
        
        // 4. Busca os eventos dinamicamente
        events: function(fetchInfo, successCallback, failureCallback) {
            const status = filtroStatus ? filtroStatus.value : 'Todos';
            let url = `/api/eventos?status=${encodeURIComponent(status)}`;
            
            if (nomeFuncionario) {
                url += `&funcionario=${encodeURIComponent(nomeFuncionario)}`;
            }

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log("Dados recebidos da API:", data);
                    if (Array.isArray(data)) {
                        successCallback(data);
                    } else {
                        console.error("API não retornou um array:", data);
                        successCallback([]);
                    }
                })
                .catch(error => {
                    console.error('Erro na requisição:', error);
                    failureCallback(error);
                });
        },
        
        // 5. Exibe os detalhes da observação ao clicar no evento
        eventClick: function(info) {
            const titulo = info.event.title;
            const cargo = info.event.extendedProps.cargo || 'Não informado';
            const obs = info.event.extendedProps.observacao || 'Nenhuma observação registrada.';
            
            alert(`📌 EVENTO: ${titulo}\n💼 CARGO: ${cargo}\n\n📝 OBSERVAÇÃO:\n${obs}`);
        }
    });

    calendar.render();

    // 6. Atualiza a tela automaticamente quando você muda o Filtro de Status
    if (filtroStatus) {
        filtroStatus.addEventListener('change', function() {
            calendar.refetchEvents();
        });
    }
});