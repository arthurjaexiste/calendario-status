document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/usuarios/lista')
        .then(response => response.json())
        .then(users => {
            const corpo = document.getElementById('corpoTabela');
            corpo.innerHTML = '';
            users.forEach(u => {
                let tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.id}</td>
                    <td><strong>${u.usuario}</strong></td>
                    <td><span class="badge">${u.perfil}</span></td>
                    <td><button style="color:red; border:none; background:none; cursor:pointer;" onclick="alert('Funcionalidade de deletar em breve')">Excluir</button></td>
                `;
                corpo.appendChild(tr);
            });
        });
});