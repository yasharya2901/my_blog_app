FROM golang:1.22 AS builder

WORKDIR /app

COPY go.mod go.sum ./

COPY . .

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/api

FROM scratch

COPY --from=builder /app/server /server

EXPOSE 8080

CMD ["/server"]
