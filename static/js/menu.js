function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', function () {
    const perfilCookie = document.cookie.split('; ').find(row => row.startsWith('auth_perfil='));
    const perfil = perfilCookie ? perfilCookie.split('=')[1] : '';

    // Captura os elementos do menu
    const linkLancamento = document.querySelector('a[href="/lancamento"]')?.parentElement;
    const linkUsuarios = document.querySelector('a[href="/usuarios"]')?.parentElement;
    const linkFuncionarios = document.querySelector('a[href="/funcionarios"]')?.parentElement;

    // Regras de visibilidade baseadas no perfil
    if (perfil === "RH") {
        if (linkLancamento) linkLancamento.style.display = 'none';
        if (linkUsuarios) linkUsuarios.style.display = 'none';
        // RH pode ver funcionários
    } else if (perfil === "LOGISTICA") {
        if (linkUsuarios) linkUsuarios.style.display = 'none';
        if (linkFuncionarios) linkFuncionarios.style.display = 'none';
    }

    // Carrega o select de busca de diários
    const select = document.getElementById('selectFuncionario');
    if (select) {
        fetch('/api/funcionarios')
            .then(response => response.json())
            .then(nomes => {
                select.innerHTML = '<option value="" disabled selected>Escolha um funcionário...</option>';
                nomes.forEach(nome => {
                    let option = document.createElement('option');
                    option.value = nome;
                    option.textContent = nome;
                    select.appendChild(option);
                });
            });
    }
});

function acessarDiario() {
    const nome = document.getElementById('selectFuncionario').value;
    if (nome) {
        window.location.href = `/diario?funcionario=${encodeURIComponent(nome)}`;
    } else {
        alert("Por favor, selecione um funcionário.");
    }
}