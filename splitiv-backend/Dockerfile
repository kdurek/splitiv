FROM golang:alpine as builder
LABEL maintainer="Krzysztof Durek <walendes@gmail.com>"
RUN apk update && apk add --no-cache git
WORKDIR /backend
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /backend/main .
COPY --from=builder /backend/.env .
EXPOSE 37534
CMD ["./main"]