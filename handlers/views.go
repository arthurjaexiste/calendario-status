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
	cookie, err := r.Cookie("auth_perfil")
	if err != nil || cookie.Value == "" {
		// Se realmente não tem cookie, redireciona
		http.Redirect(w, r, "/login", http.StatusFound)
		return false
	}
	// Tem cookie e tem valor, deixa passar
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
	// Se não tiver o cookie, o verificarAuth vai disparar o redirect e retornar false
	if !h.verificarAuth(w, r) {
		return
	}
	
	// Se chegou aqui, está logado. Exibe a HOME.
	http.ServeFile(w, r, "views/home.html")
}

// =========================================================================
// ROTAS SECUNDÁRIAS PROTEGIDAS
// =========================================================================
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_perfil",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	})
	http.Redirect(w, r, "/login", http.StatusFound)
}

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