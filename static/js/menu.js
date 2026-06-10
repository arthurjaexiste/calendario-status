document.addEventListener('DOMContentLoaded', function () {
    // Puxa a lista de nomes do banco de dados ao abrir a tela
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

function acessarDiario() {
    const nome = document.getElementById('selectFuncionario').value;
    if (nome) {
        // Redireciona para a tela do calendário enviando o nome pela URL
        window.location.href = `/diario?funcionario=${encodeURIComponent(nome)}`;
    } else {
        alert("Por favor, selecione um funcionário.");
    }
}