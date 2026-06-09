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

func main() {
	// Lendo as credenciais de forma segura do arquivo .env (injetado pelo Docker)
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_DATABASE")

	// Montando a string de conexão dinamicamente
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", dbUser, dbPass, dbHost, dbPort, dbName)
	
	var db *sql.DB
	var err error

	for i := 0; i < 10; i++ {
		db, err = sql.Open("mysql", dsn)
		if err == nil {
			err = db.Ping()
			if err == nil {
				log.Println("Conectado ao MariaDB com sucesso e em segurança!")
				break
			}
		}
		time.Sleep(3 * time.Second)
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	http.HandleFunc("/api/eventos", func(w http.ResponseWriter, r *http.Request) {
		filtroCargo := r.URL.Query().Get("cargo")
		filtroStatus := r.URL.Query().Get("status")

		query := "SELECT id, nome_funcionario, cargo, status_evento, data_inicio, data_fim, observacao FROM eventos_diario WHERE 1=1"
		var args []interface{}

		if filtroCargo != "" && filtroCargo != "Todos" {
			query += " AND cargo = ?"
			args = append(args, filtroCargo)
		}
		if filtroStatus != "" && filtroStatus != "Todos" {
			query += " AND status_evento = ?"
			args = append(args, filtroStatus)
		}

		rows, err := db.Query(query, args...)
		if err != nil {
			http.Error(w, "Erro ao buscar eventos", http.StatusInternalServerError)
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

			evento := Evento{
				ID:    id,
				Title: nome + " - " + status,
				Start: dataInicio,
				Color: cor,
				ExtendedProps: ExtendedProps{
					Observacao: textoObs,
					Cargo:      cargo,
				},
			}
			if dataFim.Valid {
				evento.End = dataFim.String
			}

			eventos = append(eventos, evento)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(eventos)
	})

	log.Println("Servidor Web rodando na porta 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}