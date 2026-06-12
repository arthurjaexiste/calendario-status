document.addEventListener('DOMContentLoaded', function() {
    carregarVeiculos();
});

function carregarVeiculos() {
    const corpoTabela = document.getElementById('corpoTabela');

    fetch('/api/veiculos/lista')
        .then(response => response.json())
        .then(data => {
            corpoTabela.innerHTML = '';

            if (data.length === 0) {
                corpoTabela.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color: #6b7280;">Nenhum veículo cadastrado.</td></tr>';
                return;
            }

            data.forEach(v => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${v.id}</td>
                    <td><strong>${v.placa}</strong></td>
                    <td>${v.modelo}</td>
                    <td>${v.cor || '-'}</td>
                    <td>${v.ano || '-'}</td>
                `;
                corpoTabela.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar veículos:', error);
            corpoTabela.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color: #ef4444;">Erro ao carregar a lista de veículos.</td></tr>';
        });
}
