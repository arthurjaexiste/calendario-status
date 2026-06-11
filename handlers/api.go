package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"calendario/models"
)

// =========================================================================
// 1. APIs DE AUTENTICAÇÃO E USUÁRIOS
// =========================================================================

func (h *Handler) ApiLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}
	var creds models.Credenciais
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		log.Println("Erro ao decodificar JSON de login:", err)
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	log.Printf("Tentativa de login: usuario=%s, senha=%s", creds.Usuario, creds.Senha)

	var perfil string
	err := h.DB.QueryRow("SELECT perfil FROM usuarios WHERE usuario = ? AND senha = ?", creds.Usuario, creds.Senha).Scan(&perfil)

	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		log.Printf("Falha no login para usuario %s: %v", creds.Usuario, err)
		json.NewEncoder(w).Encode(map[string]interface{}{"sucesso": false, "mensagem": "Usuário ou senha incorretos"})
		return
	}

	log.Printf("Login bem-sucedido para usuario %s, perfil: %s", creds.Usuario, perfil)

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_perfil",
		Value:    perfil,
		Path:     "/",
		HttpOnly: false, 
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(8 * time.Hour),
	})

	redirecionar := "/home"
	if perfil == "LOGISTICA" {
		redirecionar = "/lancamento"
	}
	json.NewEncoder(w).Encode(map[string]interface{}{"sucesso": true, "redirecionar": redirecionar})
}



func (h *Handler) ApiUsuariosLista(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query("SELECT id, usuario, perfil FROM usuarios ORDER BY usuario")
	if err != nil {
		http.Error(w, "Erro no banco", 500)
		return
	}
	defer rows.Close()
	var lista []models.UserList
	for rows.Next() {
		var u models.UserList
		if err := rows.Scan(&u.ID, &u.Usuario, &u.Perfil); err == nil {
			lista = append(lista, u)
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lista)
}

func (h *Handler) ApiCriarUsuario(w http.ResponseWriter, r *http.Request) {
	var nu models.NovoUsuario
	json.NewDecoder(r.Body).Decode(&nu)
	_, err := h.DB.Exec("INSERT INTO usuarios (usuario, senha, perfil) VALUES (?, ?, ?)", nu.Usuario, nu.Senha, nu.Perfil)
	if err != nil {
		http.Error(w, "Erro", 500)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

// =========================================================================
// 2. APIs DE JORNADAS E EVENTOS (CALENDÁRIO)
// =========================================================================

func (h *Handler) ApiEventos(w http.ResponseWriter, r *http.Request) {
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
	rows, err := h.DB.Query(query, args...)
	if err != nil {
		http.Error(w, "Erro", 500)
		return
	}
	defer rows.Close()
	var eventos []models.Evento
	for rows.Next() {
		var id, nome, cargo, status, dataInicio string
		var dataFim, observacao sql.NullString
		rows.Scan(&id, &nome, &cargo, &status, &dataInicio, &dataFim, &observacao)
		cor := "#3788d8"
		switch status {
		case "ROTA": cor = "#1e8e3e"
		case "FOLGA": cor = "#1967d2"
		case "FÉRIAS": cor = "#f29900"
		case "SUSPENSÃO": cor = "#d93025"
		}
		textoObs := "Sem observações."
		if observacao.Valid && observacao.String != "" {
			textoObs = observacao.String
		}
		evento := models.Evento{ID: id, Title: nome + " - " + status, Start: dataInicio, Color: cor, ExtendedProps: models.ExtendedProps{Observacao: textoObs, Cargo: cargo}}
		if dataFim.Valid {
			evento.End = dataFim.String
		}
		eventos = append(eventos, evento)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(eventos)
}

func (h *Handler) ApiSalvarEvento(w http.ResponseWriter, r *http.Request) {
	var l models.Lancamento
	if err := json.NewDecoder(r.Body).Decode(&l); err != nil {
		http.Error(w, "JSON inválido", 400)
		return
	}

	// Converte formato ISO do Flatpickr (2026-06-11T12:00) para MySQL (2026-06-11 12:00:00)
	formatISO := "2006-01-02T15:04"
	formatMySQL := "2006-01-02 15:04:05"

	parseDate := func(isoStr string) interface{} {
		if isoStr == "" {
			return nil
		}
		t, err := time.Parse(formatISO, isoStr)
		if err != nil {
			log.Println("Erro ao parsear data:", err, "Valor:", isoStr)
			return nil
		}
		return t.Format(formatMySQL)
	}

	dataInicio := parseDate(l.DataInicio)
	var dataFim interface{} = nil
	if l.DataFim != "" {
		dataFim = parseDate(l.DataFim)
	}

	// Verificação básica de dados obrigatórios
	if l.NomeFuncionario == "" || dataInicio == nil {
		http.Error(w, "Nome do funcionário e data de início são obrigatórios", 400)
		return
	}

	id := fmt.Sprintf("%d", time.Now().UnixNano())
	query := "INSERT INTO eventos_diario (id, nome_funcionario, cargo, status_evento, data_inicio, data_fim, observacao) VALUES (?, ?, ?, ?, ?, ?, ?)"
	_, err := h.DB.Exec(query, id, l.NomeFuncionario, l.Cargo, l.StatusEvento, dataInicio, dataFim, l.Observacao)
	if err != nil {
		log.Println("Erro SQL ao salvar evento:", err)
		http.Error(w, "Erro ao salvar no banco de dados", 500)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

// =========================================================================
// 3. APIs DE GESTÃO DE FUNCIONÁRIOS
// =========================================================================

func (h *Handler) ApiFuncionariosLista(w http.ResponseWriter, r *http.Request) {
	query := `SELECT id, nome, cargo, COALESCE(cpf, ''), COALESCE(telefone, ''), COALESCE(DATE_FORMAT(data_nascimento, '%Y-%m-%d'), '') FROM funcionarios ORDER BY nome`
	rows, err := h.DB.Query(query)
	if err != nil {
		log.Println("Erro no banco (Lista Func):", err)
		http.Error(w, "Erro no banco", 500)
		return
	}
	defer rows.Close()

	var lista []models.Funcionario
	for rows.Next() {
		var f models.Funcionario
		if err := rows.Scan(&f.ID, &f.Nome, &f.Cargo, &f.CPF, &f.Telefone, &f.DataNascimento); err != nil {
			log.Println("Erro ao ler linha:", err)
			continue
		}
		lista = append(lista, f)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lista)
}

func (h *Handler) ApiFuncionariosSalvar(w http.ResponseWriter, r *http.Request) {
	var f models.Funcionario
	if err := json.NewDecoder(r.Body).Decode(&f); err != nil {
		http.Error(w, "JSON inválido", 400)
		return
	}

	var dataNasc interface{} = nil
	if f.DataNascimento != "" {
		dataNasc = f.DataNascimento
	}

	query := "INSERT INTO funcionarios (nome, cargo, cpf, telefone, data_nascimento) VALUES (?, ?, ?, ?, ?)"
	_, err := h.DB.Exec(query, f.Nome, f.Cargo, f.CPF, f.Telefone, dataNasc)
	if err != nil {
		log.Println("Erro ao salvar funcionário no banco:", err)
		http.Error(w, "Erro interno", 500)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) ApiFuncionariosEditar(w http.ResponseWriter, r *http.Request) {
	var f models.Funcionario
	if err := json.NewDecoder(r.Body).Decode(&f); err != nil {
		http.Error(w, "JSON inválido", 400)
		return
	}

	var dataNasc interface{} = nil
	if f.DataNascimento != "" {
		dataNasc = f.DataNascimento
	}

	query := "UPDATE funcionarios SET nome=?, cargo=?, cpf=?, telefone=?, data_nascimento=? WHERE id=?"
	_, err := h.DB.Exec(query, f.Nome, f.Cargo, f.CPF, f.Telefone, dataNasc, f.ID)
	if err != nil {
		log.Println("Erro ao editar funcionário no banco:", err)
		http.Error(w, "Erro interno", 500)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) ApiFuncionariosLegada(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query("SELECT DISTINCT nome_funcionario FROM eventos_diario ORDER BY nome_funcionario")
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
}