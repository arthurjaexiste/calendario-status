FROM golang:alpine

WORKDIR /app
COPY . .

# Inicializa o módulo Go e baixa o driver do MySQL/MariaDB
RUN go mod init calendario && go get github.com/go-sql-driver/mysql
RUN go build -o api-calendario main.go

EXPOSE 8080
CMD ["./api-calendario"]