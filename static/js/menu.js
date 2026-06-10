function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', function() {
    // Captura o perfil do usuário logado através do cookie
    const perfilCookie = document.cookie.split('; ').find(row => row.startsWith('auth_perfil='));
    const perfil = perfilCookie ? perfilCookie.split('=')[1] : '';

    // Seleciona os itens da Sidebar para controle visual
    const linkLancamento = document.querySelector('a[href="/lancamento"]')?.parentElement;
    const linkUsuarios = document.querySelector('a[href="/usuarios"]')?.parentElement;
    const linkConfig = document.querySelector('a[href="#"]')?.parentElement; // Exemplo de config

    // Oculta opções baseado no nível de acesso
    if (perfil === "RH") {
        if (linkLancamento) linkLancamento.style.display = 'none';
        if (linkUsuarios) linkUsuarios.style.display = 'none';
    } else if (perfil === "LOGISTICA") {
        // A logística já cai direto no formulário, mas se abrir a sidebar ocultamos as opções restritas
        if (linkUsuarios) linkUsuarios.style.display = 'none';
    }
    // Se for ADMIN, o javascript não esconde nada.

    // Carrega a API de funcionários para o dropdown do menu
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