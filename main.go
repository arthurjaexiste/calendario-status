package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"

	"calendario/handlers"
)

func main() {
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_DATABASE")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", dbUser, dbPass, dbHost, dbPort, dbName)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Erro ao abrir conexão com o banco:", err)
	}
	
	err = db.Ping()
	if err != nil {
		log.Fatal("Não foi possível conectar ao MariaDB:", err)
	}
	log.Println("Conectado ao MariaDB com sucesso!")

	// Instancia o Handler injetando a conexão do banco nele
	h := &handlers.Handler{DB: db}

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// ==========================================
	// ROTAS DE INTERFACE (VIEWS)
	// ==========================================
	http.HandleFunc("/login", h.Login)
	http.HandleFunc("/", h.Index)
	http.HandleFunc("/diario", h.Diario)
	http.HandleFunc("/lancamento", h.Lancamento)
	http.HandleFunc("/usuarios", h.Usuarios)
	http.HandleFunc("/usuario/novo", h.UsuarioNovo)
	http.HandleFunc("/funcionarios", h.Funcionarios)
	http.HandleFunc("/funcionario/novo", h.FuncionarioNovo)

	// ==========================================
	// ROTAS DA API (JSON)
	// ==========================================
	http.HandleFunc("/api/login", h.ApiLogin)
	http.HandleFunc("/api/usuarios/lista", h.ApiUsuariosLista)
	http.HandleFunc("/api/usuarios", h.ApiCriarUsuario)
	
	// APIs de Funcionários (Mestre, Edição e Legada)
	http.HandleFunc("/api/funcionarios/lista", h.ApiFuncionariosLista)
	http.HandleFunc("/api/funcionarios/salvar", h.ApiFuncionariosSalvar)
	http.HandleFunc("/api/funcionarios/editar", h.ApiFuncionariosEditar)
	http.HandleFunc("/api/funcionarios", h.ApiFuncionariosLegada)
	
	// APIs do Diário/Calendário
	http.HandleFunc("/api/eventos", h.ApiEventos)
	http.HandleFunc("/api/salvar", h.ApiSalvarEvento)

	log.Println("Servidor Web rodando na porta 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}