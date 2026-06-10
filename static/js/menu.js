// Abre e fecha o menu lateral adicionando/removendo a classe CSS
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

// Carregamento dos dados da API
document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/funcionarios')
        .then(response => response.json())
        .then(nomes => {
            const select = document.getElementById('selectFuncionario');
            select.innerHTML = '<option value="" disabled selected>Escolha um funcionário...</option>';
            
            nomes.forEach(nome => {
                let option = document.createElement('option');
                option.value = nome;
                option.textContent = nome;
                select.appendChild(option);
            });
        });
});

// Botão de acessar o calendário
function acessarDiario() {
    const nome = document.getElementById('selectFuncionario').value;
    if (nome) {
        window.location.href = `/diario?funcionario=${encodeURIComponent(nome)}`;
    } else {
        alert("Por favor, selecione um funcionário.");
    }
}