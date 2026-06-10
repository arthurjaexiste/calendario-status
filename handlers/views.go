package handlers

import (
	"database/sql"
	"net/http"
)

// A struct Handler é declarada APENAS aqui para evitar duplicidade no pacote
type Handler struct {
	DB *sql.DB
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "views/login.html")
}

func (h *Handler) Index(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	cookie, err := r.Cookie("auth_perfil")
	if err != nil || (cookie.Value != "ADMIN" && cookie.Value != "RH") {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	http.ServeFile(w, r, "views/index.html")
}

func (h *Handler) Diario(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("auth_perfil")
	if err != nil || (cookie.Value != "ADMIN" && cookie.Value != "RH") {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	http.ServeFile(w, r, "views/diario.html")
}

func (h *Handler) Lancamento(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("auth_perfil")
	if err != nil || (cookie.Value != "ADMIN" && cookie.Value != "LOGISTICA") {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	http.ServeFile(w, r, "views/lancamento.html")
}

func (h *Handler) Usuarios(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("auth_perfil")
	if err != nil || cookie.Value != "ADMIN" {
		http.Error(w, "Acesso Negado: Apenas administradores podem gerenciar usuários.", http.StatusForbidden)
		return
	}
	http.ServeFile(w, r, "views/usuarios.html")
}

func (h *Handler) UsuarioNovo(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("auth_perfil")
	if err != nil || cookie.Value != "ADMIN" {
		http.Error(w, "Acesso Negado: Apenas administradores podem gerenciar usuários.", http.StatusForbidden)
		return
	}
	http.ServeFile(w, r, "views/usuario_novo.html")
}

func (h *Handler) Funcionarios(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("auth_perfil")
	if err != nil || (cookie.Value != "ADMIN" && cookie.Value != "RH") {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	http.ServeFile(w, r, "views/funcionarios.html")
}

func (h *Handler) FuncionarioNovo(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("auth_perfil")
	if err != nil || cookie.Value != "ADMIN" {
		http.Error(w, "Acesso Negado.", http.StatusForbidden)
		return
	}
	http.ServeFile(w, r, "views/funcionario_novo.html")
}