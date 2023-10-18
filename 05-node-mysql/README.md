# Criando um app com Node e Mysql utilizando o docker compose

Primeiramente vamos setar o banco de dados Mysql, dentro do arquivo *docker compose* vamos adicionar o seguinte serviço:

```yml
db: 
  image: mysql:8.1
  container_name: db
  restart: always
  volumes:
    - ./mysql-data:/var/lib/mysql
  environment:
    MYSQL_ROOT_PASSWORD: non-root
    MYSQL_DATABASE: node-mysql
    MYSQL_PASSWORD: root
  networks:
    - node-network
```

Definimos um volume para persistir os dados do Mysql, além de ja configurar as variáveis de ambiente. Lembrando que é preciso criar a rede ao final do arquivo:

```yml
networks:
  node-network:
    driver: bridge
```

Em seguida entramos no container Mysql e criamos uma tabela para adicionar valores através do Node. Ja para o container do Node vamos ter as seguintes definições.

```yml
app:
  build: 
    context: node
  container_name: app
  tty: true
  networks:
    - node-network
  volumes:
    - ./node:/usr/src/app
  ports:
    - "3000:3000"
```

O campo `tty` (que significa "teletypewriter") serve para alocar o terminal ao container, e em alguns casos como esse em especifico, ele mantém o container rodando após ele ser executado, uma vez que nenhum script para manter ele de pé foi definido.

Além disso no arquivo `index.js` dentro da pasta *node*, adicionamos um trecho de código para efetuar a conexão e adicionar dados no Mysql.

## Dependências entre serviços

Um dos campos que podemos utilizar para adicionar uma dependência entre um container e outro é o `depends_on`, que faz com que um container suba primeiro para então o seguinte. Porem pode ser necessário que o serviço do Mysql ja estaca rodando completamente antes de iniciarmos o serviço do Node por exemplo, e como sabemos o Mysql leva algum tempo para estar em funcionamento após o container estar de pé. Dessa forma esse campo não atenderia a demanda.

