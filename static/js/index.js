let calendar;

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
        events: function(info, successCallback, failureCallback) {
            // Captura os valores de todos os filtros, incluindo o nome do funcionário
            let funcionario = document.getElementById('filtroFuncionario').value;
            let cargo = document.getElementById('filtroCargo').value;
            let status = document.getElementById('filtroStatus').value;
            
            // Envia o nome como parâmetro na URL da API
            fetch(`/api/eventos?cargo=${cargo}&status=${status}&funcionario=${funcionario}`)
                .then(response => response.json())
                .then(data => successCallback(data))
                .catch(error => failureCallback(error));
        },
        eventClick: function(info) {
            document.getElementById('modal-titulo').innerText = info.event.title;
            document.getElementById('modal-cargo').innerText = info.event.extendedProps.cargo;
            document.getElementById('modal-inicio').innerText = info.event.start.toLocaleString('pt-BR');
            
            let dataFim = info.event.end ? info.event.end.toLocaleString('pt-BR') : 'Não especificado';
            document.getElementById('modal-fim').innerText = dataFim;
            document.getElementById('modal-obs').innerText = info.event.extendedProps.observacao;
            
            document.getElementById('modal-detalhes').style.display = 'block';
        }
    });
    calendar.render();
});

function aplicarFiltros() {
    calendar.refetchEvents(); // Recarrega a API a cada letra digitada ou filtro alterado
}

function fecharModal() {
    document.getElementById('modal-detalhes').style.display = 'none';
}