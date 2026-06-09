let calendar;

document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
        events: function (info, successCallback, failureCallback) {
            let cargo = document.getElementById('filtroCargo').value;
            let status = document.getElementById('filtroStatus').value;

            fetch(`/api/eventos?cargo=${cargo}&status=${status}`)
                .then(response => response.json())
                .then(data => successCallback(data))
                .catch(error => failureCallback(error));
        },
        eventClick: function (info) {
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
    calendar.refetchEvents();
}

function fecharModal() {
    document.getElementById('modal-detalhes').style.display = 'none';
}