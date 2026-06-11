package handlers

import (
	"database/sql"
	"net/http"
)

// Define o Handler para todo o pacote
type Handler struct {
	DB *sql.DB
}

// =========================================================================
// O GUARDA: VERIFICA SE O CARA TÁ LOGADO
// =========================================================================
func (h *Handler) verificarAuth(w http.ResponseWriter, r *http.Request) bool {
	_, err := r.Cookie("auth_perfil")
	if err != nil {
		// Se não tem cookie (não logou), joga imediatamente para a tela de /login
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return false
	}
	// Tem cookie, deixa passar
	return true
}

// =========================================================================
// ROTA PÚBLICA (PORTA DE ENTRADA)
// =========================================================================
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	// Exibe o HTML de login
	http.ServeFile(w, r, "views/login.html")
}

// =========================================================================
// ROTA PRINCIPAL (DEPOIS DO LOGIN)
// =========================================================================
func (h *Handler) Index(w http.ResponseWriter, r *http.Request) {
	// Passa pelo guarda. Se não tiver logado, ele te chuta pro /login.
	if !h.verificarAuth(w, r) { return }
	
	// Se passou, exibe a SUA HOME!
	http.ServeFile(w, r, "views/home.html")
}

// =========================================================================
// ROTAS SECUNDÁRIAS PROTEGIDAS
// =========================================================================
func (h *Handler) Diario(w http.ResponseWriter, r *http.Request) {
	if !h.verificarAuth(w, r) { return }
	http.ServeFile(w, r, "views/diario.html")
}

func (h *Handler) Lancamento(w http.ResponseWriter, r *http.Request) {
	if !h.verificarAuth(w, r) { return }
	http.ServeFile(w, r, "views/lancamento.html")
}

func (h *Handler) Usuarios(w http.ResponseWriter, r *http.Request) {
	if !h.verificarAuth(w, r) { return }
	http.ServeFile(w, r, "views/usuarios.html")
}

func (h *Handler) UsuarioNovo(w http.ResponseWriter, r *http.Request) {
	if !h.verificarAuth(w, r) { return }
	http.ServeFile(w, r, "views/usuario_novo.html")
}

func (h *Handler) Funcionarios(w http.ResponseWriter, r *http.Request) {
	if !h.verificarAuth(w, r) { return }
	http.ServeFile(w, r, "views/funcionarios.html")
}

func (h *Handler) FuncionarioNovo(w http.ResponseWriter, r *http.Request) {
	if !h.verificarAuth(w, r) { return }
	http.ServeFile(w, r, "views/funcionario_novo.html")
}