# Criando um app com Node e Mysql utilizando o docker compose

Primeiramente vamos setar o banco de dados Mysql, dentro do arquivo *docker compose* vamos adicionar o seguinte serviço:

```yml
db-mysql: 
  image: mysql:8.1
  container_name: db-mysql
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
app-node:
  build: 
    context: node
  container_name: app-node
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

Suponhamos que para este projeto seja necessário que o serviço do Mysql esteja completamente funcional antes do container do Node iniciar. Um das opções disponíveis pelo Docker que parece resolver esse problema é o:

```yml
depends_on:
  - db-mysql
```

Porem o que ele faz é apenas colocar uma **ordem de inicialização entre os serviços**. Uma vez que o container do Mysql esteja de pé, o Docker iniciara o do Node, independente do Mysql estar disponível para receber conexões ou não.

Para resolver essa questão, podemos utilizar algumas bibliotecas como o **Wait-for-it** e o **Dockerize**, que criam scripts para testar se o serviço esta em pleno funcionamento, e caso não, colocam o container dependente em modo de espera (pelo tempo definido) até que o serviço da dependência esteja funcionando. Ou utilizar a funcionalidade do **healthcheck** disponibilizada pelo Docker.

Vamos começar com um exemplo do Dockerize. Ele necessita ser instalado ao container dependente, então vamos adicionar o seguinte código ao Dockerfile do Node:

```dockerfile
ENV DOCKERIZE_VERSION v0.7.0

RUN apt-get update \
    && apt-get install -y wget \
    && wget -O - https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz | tar xzf - -C /usr/local/bin \
    && apt-get autoremove -yqq --purge wget && rm -rf /var/lib/apt/lists/*
```

O proximo passo é adicionar o comando ao serviço do Node no Docker compose.

```yml
container_name: app-node
entrypoint: dockerize -wait tcp://db-mysql:3306 -timeout 25s docker-entrypoint.sh
depends_on:
  - db-mysql
```

O que o comando do *dockerize* faz é esperar `-wait` a conexão com o Mysql `tcp://db-mysql:3306` estar funcionando, e ele tentara efetuar a conexão por 25 segundos `-timeout`. Caso a conexão ocorra normalmente ele ira iniciar o aplicativo com o `docker-entrypoint.sh`.

> O `docker-entrypoint.sh` é um script de entrada padrão fornecido pela imagem do contêiner que você está sendo utilizado, no caso o container do Node. É uma parte comum das imagens Docker que é frequentemente usada para configurar e iniciar o aplicativo ou serviço no contêiner.

### Health check

Agora vamos a segunda opção com os campos `healthckech` junto ao `depends_on`, onde o primeiro ira verificar a "saúde" do processo, e o segundo ira definir a dependência do container à saúdo do outro container. Dessa forma iniciando o container apenas após o primeiro estar em pleno funcionamento.

O primeiro passo é configurar um script para verificar a saúde do serviço Mysql, e fazemos isso adicionando o seguinte trecho de código no docker compose:

```yml
healthcheck:
  test: ["CMD-SHELL", "mysqladmin ping -hlocalhost -uroot -proot_password"]
  interval: 5s
  timeout: 3s
  retries: 5
```

Dentro do *healthcheck* adicionamos o script (`test`), definimos o intervalo entre tentativas (`interval`), o tempo que ele ira esperar para considerar uma reposta positiva (`timeout`) e a quantidade de tentativas (`retries`). Lembrando que o script a ser utiliza-do para verificar a saúdo do serviço depende exclusivamente de qual serviço esta sendo executado, com cada um possuindo uma maneira diferente.

O proximo passo é adicionar a dependência ao Node:

```yml
depends_on:
  db-mysql:
    condition: service_healthy
```

Com a condição `service_healthy`, o container Node só ira iniciar apos o serviço do Mysql estiver pronto para receber conexões.
