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

func initDB(db *sql.DB) {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS usuarios (
			id INT AUTO_INCREMENT PRIMARY KEY,
			usuario VARCHAR(50) NOT NULL UNIQUE,
			senha VARCHAR(255) NOT NULL,
			perfil VARCHAR(50) NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS funcionarios (
			id INT AUTO_INCREMENT PRIMARY KEY,
			nome VARCHAR(100) NOT NULL,
			cargo VARCHAR(50),
			cpf VARCHAR(20) UNIQUE,
			telefone VARCHAR(20),
			data_nascimento DATE,
			cod_empresa VARCHAR(50)
		);`,
		`CREATE TABLE IF NOT EXISTS eventos_diario (
			id VARCHAR(50) PRIMARY KEY,
			nome_funcionario VARCHAR(100) NOT NULL,
			cargo VARCHAR(50),
			status_evento VARCHAR(50),
			data_inicio DATETIME NOT NULL,
			data_fim DATETIME,
			observacao TEXT
		);`,
	}

	for _, q := range queries {
		_, err := db.Exec(q)
		if err != nil {
			log.Fatal("Erro ao criar tabela:", err, "\nQuery:", q)
		}
	}
	log.Println("Verificação/Criação de tabelas concluída.")

	// Inserir usuário padrão admin se não existir
	_, err := db.Exec("INSERT IGNORE INTO usuarios (usuario, senha, perfil) VALUES ('admin', 'admin123', 'admin')")
	if err != nil {
		log.Println("Aviso ao inserir usuário padrão:", err)
	} else {
		log.Println("Usuário padrão 'admin' verificado/criado.")
	}
}

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

	// Inicializa o banco de dados (tabelas e usuário admin)
	initDB(db)

	// Instancia o Handler injetando a conexão do banco nele
	h := &handlers.Handler{DB: db}

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// ==========================================
	// ROTAS DE INTERFACE (VIEWS)
	// ==========================================
	http.HandleFunc("/login", h.Login)
	http.HandleFunc("/", h.Index)
	http.HandleFunc("/home", h.Index)
	http.HandleFunc("/diario", h.Diario)
	http.HandleFunc("/lancamento", h.Lancamento)
	http.HandleFunc("/usuarios", h.Usuarios)
	http.HandleFunc("/usuario/novo", h.UsuarioNovo)
	http.HandleFunc("/logout", h.Logout)
	http.HandleFunc("/dashboard", h.Dashboard)
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

	// 👇 A ROTA QUE FALTAVA PARA O DASHBOARD PUXAR OS NÚMEROS DO BANCO 👇
	http.HandleFunc("/api/dashboard/stats", h.ApiDashboardStats)

	log.Println("Servidor Web rodando na porta 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}