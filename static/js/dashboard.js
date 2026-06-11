document.addEventListener('DOMContentLoaded', async function() {
    try {
        // O getTime() força o navegador a buscar os dados novos e ignorar o cache antigo
        const response = await fetch('/api/dashboard/stats?t=' + new Date().getTime());
        
        if (!response.ok) {
            throw new Error(`Erro de comunicação com a API: Código ${response.status}`);
        }

        const data = await response.json();
        
        // 1. Atualiza os cards (se vier undefined, garante que mostra 0)
        document.getElementById('statTotalFunc').textContent = data.total_funcionarios || 0;
        document.getElementById('statRota').textContent = (data.status_hoje && data.status_hoje.ROTA) || 0;
        document.getElementById('statFolga').textContent = (data.status_hoje && data.status_hoje.FOLGA) || 0;
        document.getElementById('statFerias').textContent = (data.status_hoje && data.status_hoje.FERIAS) || 0;

        // 2. Prepara o Gráfico
        const ctx = document.getElementById('statusChart');
        if (ctx) {
            const labels = Object.keys(data.status_hoje || {});
            const values = Object.values(data.status_hoje || {});
            
            // Somatório para ver se o gráfico está vazio
            const totalRegistrosHoje = values.reduce((a, b) => a + b, 0);

            if (totalRegistrosHoje === 0) {
                // Gráfico Cinza de "Vazio" para não quebrar a biblioteca
                new Chart(ctx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Nenhum lançamento hoje'],
                        datasets: [{ data: [1], backgroundColor: ['#e5e7eb'], borderWidth: 0 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { enabled: false } } }
                });
            } else {
                // Gráfico Real
                const colorMap = { 'ROTA': '#1e8e3e', 'FOLGA': '#1967d2', 'FERIAS': '#f29900', 'SUSPENSAO': '#d93025' };
                const colors = labels.map(label => colorMap[label] || '#cccccc');

                new Chart(ctx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{ data: values, backgroundColor: colors, borderColor: '#ffffff', borderWidth: 2 }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 12 } } } }
                    }
                });
            }
        }

        // 3. Monta as Listas
        const listsContainer = document.getElementById('statusLists');
        if (listsContainer) {
            listsContainer.innerHTML = '';
            const statusConfig = {
                'ROTA': { title: 'Em Rota', color: '#1e8e3e' },
                'FOLGA': { title: 'Em Folga', color: '#1967d2' },
                'FERIAS': { title: 'Em Férias', color: '#f29900' },
                'SUSPENSAO': { title: 'Suspensos', color: '#d93025' }
            };

            Object.keys(statusConfig).forEach(status => {
                const card = document.createElement('div');
                card.className = 'list-card';
                
                const header = document.createElement('div');
                header.className = 'list-header';
                header.style.borderLeft = `4px solid ${statusConfig[status].color}`;
                
                const qtd = (data.status_hoje && data.status_hoje[status]) || 0;
                header.innerHTML = `<h4>${statusConfig[status].title} (${qtd})</h4>`;
                
                const list = document.createElement('ul');
                list.className = 'employee-list';
                const employees = (data.detalhes_status && data.detalhes_status[status]) || [];
                
                if (employees.length === 0) {
                    list.innerHTML = `<li class="empty-msg">Nenhum funcionário neste status</li>`;
                } else {
                    employees.forEach(emp => {
                        list.innerHTML += `<li><span class="emp-name">${emp.nome}</span><span class="emp-cargo">${emp.cargo}</span></li>`;
                    });
                }
                
                card.appendChild(header);
                card.appendChild(list);
                listsContainer.appendChild(card);
            });
        }

    } catch (err) {
        console.error("FALHA NA DASHBOARD:", err);
        const totalCard = document.getElementById('statTotalFunc');
        if (totalCard) {
            totalCard.textContent = "ERRO API";
            totalCard.style.color = "#ef4444";
            totalCard.style.fontSize = "20px";
        }
    }
});
