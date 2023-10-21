FROM golang AS builder

WORKDIR /go/challenge

RUN go mod init challenge/go
RUN echo 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Full Cycle Rocks!!")\n}' > print.go
RUN go build -o challenge

FROM scratch

COPY --from=builder /go/challenge/challenge /

ENTRYPOINT [ "/challenge" ]