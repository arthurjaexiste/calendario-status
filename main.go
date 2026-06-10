package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

type ExtendedProps struct {
	Observacao string `json:"observacao"`
	Cargo      string `json:"cargo"`
}

type Evento struct {
	ID            string        `json:"id"`
	Title         string        `json:"title"`
	Start         string        `json:"start"`
	End           string        `json:"end,omitempty"`
	Color         string        `json:"color"`
	ExtendedProps ExtendedProps `json:"extendedProps"`
}

type Lancamento struct {
	NomeFuncionario string `json:"nome_funcionario"`
	Cargo           string `json:"cargo"`
	StatusEvento    string `json:"status_evento"`
	DataInicio      string `json:"data_inicio"`
	DataFim         string `json:"data_fim"`
	Observacao      string `json:"observacao"`
}

type Credenciais struct {
	Usuario string `json:"usuario"`
	Senha   string `json:"senha"`
}

type NovoUsuario struct {
	Usuario string `json:"usuario"`
	Senha   string `json:"senha"`
	Perfil  string `json:"perfil"`
}

type UserList struct {
	ID      int    `json:"id"`
	Usuario string `json:"usuario"`
	Perfil  string `json:"perfil"`
}

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

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// ==========================================
	// ROTAS DE INTERFACE (Controle Estrito de Nível)
	// ==========================================

	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "views/login.html")
	})

	// Portal de Seleção (Acessível por ADMIN e RH)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
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
	})

	// Calendário de Visualização (Acessível por ADMIN e RH)
	http.HandleFunc("/diario", func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("auth_perfil")
		if err != nil || (cookie.Value != "ADMIN" && cookie.Value != "RH") {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		http.ServeFile(w, r, "views/diario.html")
	})

	// Formulário de Lançamento (Acessível por ADMIN e LOGISTICA)
	http.HandleFunc("/lancamento", func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("auth_perfil")
		if err != nil || (cookie.Value != "ADMIN" && cookie.Value != "LOGISTICA") {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		http.ServeFile(w, r, "views/lancamento.html")
	})

	// Tela de Tabela de Usuários (EXCLUSIVO DO ADMIN)
	http.HandleFunc("/usuarios", func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("auth_perfil")
		if err != nil || cookie.Value != "ADMIN" {
			http.Error(w, "Acesso Negado: Apenas administradores podem gerenciar usuários.", http.StatusForbidden)
			return
		}
		http.ServeFile(w, r, "views/usuarios.html")
	})

	// Tela de Formulário de Novo Usuário (EXCLUSIVO DO ADMIN)
	http.HandleFunc("/usuario/novo", func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("auth_perfil")
		if err != nil || cookie.Value != "ADMIN" {
			http.Error(w, "Acesso Negado: Apenas administradores podem gerenciar usuários.", http.StatusForbidden)
			return
		}
		http.ServeFile(w, r, "views/usuario_novo.html")
	})

	// ==========================================
	// ROTAS DA API
	// ==========================================

	http.HandleFunc("/api/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
			return
		}
		var creds Credenciais
		json.NewDecoder(r.Body).Decode(&creds)

		var perfil string
		err := db.QueryRow("SELECT perfil FROM usuarios WHERE usuario = ? AND senha = ?", creds.Usuario, creds.Senha).Scan(&perfil)

		w.Header().Set("Content-Type", "application/json")
		if err != nil {
			json.NewEncoder(w).Encode(map[string]interface{}{"sucesso": false})
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "auth_perfil",
			Value:    perfil,
			Path:     "/",
			HttpOnly: false,
			Expires:  time.Now().Add(8 * time.Hour),
		})

		redirecionar := "/"
		if perfil == "LOGISTICA" {
			redirecionar = "/lancamento"
		}

		json.NewEncoder(w).Encode(map[string]interface{}{"sucesso": true, "redirecionar": redirecionar})
	})

	// API que retorna a lista completa de usuários cadastrados (EXCLUSIVO DO ADMIN)
	http.HandleFunc("/api/usuarios/lista", func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("auth_perfil")
		if err != nil || cookie.Value != "ADMIN" {
			http.Error(w, "Não autorizado", http.StatusForbidden)
			return
		}

		rows, err := db.Query("SELECT id, usuario, perfil FROM usuarios ORDER BY usuario")
		if err != nil {
			http.Error(w, "Erro ao buscar usuários", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var lista []UserList
		for rows.Next() {
			var u UserList
			if err := rows.Scan(&u.ID, &u.Usuario, &u.Perfil); err == nil {
				lista = append(lista, u)
			}
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(lista)
	})

	// Criação de novos usuários via API (EXCLUSIVO DO ADMIN)
	http.HandleFunc("/api/usuarios", func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("auth_perfil")
		if err != nil || cookie.Value != "ADMIN" {
			http.Error(w, "Não autorizado", http.StatusForbidden)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
			return
		}

		var nu NovoUsuario
		json.NewDecoder(r.Body).Decode(&nu)

		query := "INSERT INTO usuarios (usuario, senha, perfil) VALUES (?, ?, ?)"
		_, err = db.Exec(query, nu.Usuario, nu.Senha, nu.Perfil)
		if err != nil {
			log.Println("Erro ao criar usuário:", err)
			http.Error(w, "Erro ao salvar usuário ou usuário já existe.", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	})

	http.HandleFunc("/api/funcionarios", func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT DISTINCT nome_funcionario FROM eventos_diario ORDER BY nome_funcionario")
		if err != nil {
			http.Error(w, "Erro", 500)
			return
		}
		defer rows.Close()
		var nomes []string
		for rows.Next() {
			var nome string
			rows.Scan(&nome)
			nomes = append(nomes, nome)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(nomes)
	})

	http.HandleFunc("/api/eventos", func(w http.ResponseWriter, r *http.Request) {
		filtroFuncionario := r.URL.Query().Get("funcionario")
		filtroStatus := r.URL.Query().Get("status")
		query := "SELECT id, nome_funcionario, cargo, status_evento, data_inicio, data_fim, observacao FROM eventos_diario WHERE 1=1"
		var args []interface{}
		if filtroFuncionario != "" {
			query += " AND nome_funcionario = ?"
			args = append(args, filtroFuncionario)
		}
		if filtroStatus != "" && filtroStatus != "Todos" {
			query += " AND status_evento = ?"
			args = append(args, filtroStatus)
		}
		rows, err := db.Query(query, args...)
		if err != nil {
			http.Error(w, "Erro", 500)
			return
		}
		defer rows.Close()
		var eventos []Evento
		for rows.Next() {
			var id, nome, cargo, status, dataInicio string
			var dataFim, observacao sql.NullString
			rows.Scan(&id, &nome, &cargo, &status, &dataInicio, &dataFim, &observacao)
			cor := "#3788d8"
			switch status {
			case "ROTA":
				cor = "#1e8e3e"
			case "FOLGA":
				cor = "#1967d2"
			case "FÉRIAS":
				cor = "#f29900"
			case "SUSPENSÃO":
				cor = "#d93025"
			}
			textoObs := "Sem observações registradas."
			if observacao.Valid && observacao.String != "" {
				textoObs = observacao.String
			}
			evento := Evento{ID: id, Title: nome + " - " + status, Start: dataInicio, Color: cor, ExtendedProps: ExtendedProps{Observacao: textoObs, Cargo: cargo}}
			if dataFim.Valid {
				evento.End = dataFim.String
			}
			eventos = append(eventos, evento)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(eventos)
	})

	http.HandleFunc("/api/salvar", func(w http.ResponseWriter, r *http.Request) {
		var l Lancamento
		json.NewDecoder(r.Body).Decode(&l)
		var dataFimParam interface{} = nil
		if l.DataFim != "" {
			dataFimParam = l.DataFim
		}
		query := `INSERT INTO eventos_diario (nome_funcionario, cargo, status_evento, data_inicio, data_fim, observacao) VALUES (?, ?, ?, ?, ?, ?)`
		db.Exec(query, l.NomeFuncionario, l.Cargo, l.StatusEvento, l.DataInicio, dataFimParam, l.Observacao)
		w.WriteHeader(http.StatusCreated)
	})

	log.Println("Servidor Web rodando na porta 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
