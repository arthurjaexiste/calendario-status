package models

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

type Funcionario struct {
	ID             int    `json:"id"`
	Nome           string `json:"nome"`
	Cargo          string `json:"cargo"`
	CPF            string `json:"cpf"`
	Telefone       string `json:"telefone"`
	DataNascimento string `json:"data_nascimento"`
	CodEmpresa     string `json:"cod_empresa"`
}

type Veiculo struct {
	ID     int    `json:"id"`
	Placa  string `json:"placa"`
	Modelo string `json:"modelo"`
	Cor    string `json:"cor"`
	Ano    int    `json:"ano"`
}

type NovoVeiculo struct {
	Placa  string `json:"placa"`
	Modelo string `json:"modelo"`
	Cor    string `json:"cor"`
	Ano    int    `json:"ano"`
}