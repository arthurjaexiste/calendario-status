package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

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

	var db *sql.DB
	var err error

	for i := 0; i < 10; i++ {
		db, err = sql.Open("mysql", dsn)
		if err == nil {
			err = db.Ping()
			if err == nil {
				log.Println("Conectado ao MariaDB com sucesso!")
				break
			}
		}
		time.Sleep(3 * time.Second)
	}

	// Instancia o Handler injetando a conexão do banco nele
	h := &handlers.Handler{DB: db}

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// ==========================================
	// ROTAS DE INTERFACE
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
	// ROTAS DA API
	// ==========================================
	http.HandleFunc("/api/login", h.ApiLogin)
	http.HandleFunc("/api/usuarios/lista", h.ApiUsuariosLista)
	http.HandleFunc("/api/usuarios", h.ApiCriarUsuario)
	http.HandleFunc("/api/funcionarios/lista", h.ApiFuncionariosLista)
	http.HandleFunc("/api/funcionarios/salvar", h.ApiFuncionariosSalvar)
	
	// APIs legadas do Diário/Calendário
	http.HandleFunc("/api/funcionarios", h.ApiFuncionariosLegada)
	http.HandleFunc("/api/eventos", h.ApiEventos)
	http.HandleFunc("/api/salvar", h.ApiSalvarEvento)

	log.Println("Servidor Web rodando na porta 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}