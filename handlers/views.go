package handlers

import (
	"database/sql"
	"net/http"
)

// A estrutura é declarada UMA ÚNICA VEZ neste arquivo para todo o pacote
type Handler struct {
	DB *sql.DB
}

func (h *Handler) Index(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	http.ServeFile(w, r, "views/index.html")
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "views/login.html")
}

func (h *Handler) Diario(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "views/diario.html")
}

func (h *Handler) Lancamento(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "views/lancamento.html")
}

func (h *Handler) Usuarios(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "views/usuarios.html")
}

func (h *Handler) UsuarioNovo(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "views/usuario_novo.html")
}

func (h *Handler) Funcionarios(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "views/funcionarios.html")
}

func (h *Handler) FuncionarioNovo(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "views/funcionario_novo.html")
}