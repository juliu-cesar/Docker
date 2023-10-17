# Docker Compose

A ferramenta Docker compose é utilizada para facilitar a definição, configuração e execução de aplicações multi-container. Ele nos permite definir todo um ambiante de implantação, incluindo as configurações de container, **network** e **volumes**, em um único arquivo `docker-compose.yml`. Essa extensão YAML é a que descreve a estrutura do aplicativo multi-contêiner.

## Subindo containers Laravel e Nginx

Para entender melhor a utilização do *compose*, vamos criar um exemplo utilizando como base os dois containers do capitulo anterior `03-laravel-nginx`. Vamos criar o arquivo *docker-compose.yml*, e dentro dele colocamos o seguinte trecho de código:

```yml
version: '3'

services:
  laravel:
    image: juliucesar/laravel-optimized:prod
    container_name: laravel
    networks:
      - laranet

  nginx:
    image: juliucesar/nginx-laravel:prod
    container_name: nginx
    networks:
      - laranet
    ports:
      - "8080:80"

networks:
  laranet:
    driver: bridge
```

> O campo `version` apenas se refere a versão da sintaxe do docker-compose, que até no momento a mais atual é a 3.

Dentro do campo `servicer` indicamos todos os containers que vamos subir, e podemos ver que cada campo representa uma configuração que anteriormente era feita no próprio comando para executar um container (`docker run ...`).

Para executar esse arquivo utilizamos o comando abaixo. Lembrando de que o terminal precisa estar na mesma pasta de onde se encontra o arquivo *compose*.

```bash
docker compose up
```

> Assim como no *docker run* podemos informar a opção `-d` para desanexar o terminal.

Com apenas esse comando subimos múltiplos containers, sem a necessidade de criar comandos do *docker run* muito extensos, e que sobem apenas um container.

### Principais campos para o docker compose

- `services` : define os serviços que compõem o aplicativo, sendo cada serviço é um contêiner Docker.

- `image` : define a imagem a ser utilizada em um serviço.

- `build` :  define um contexto de construção e o arquivo Dockerfile para criar a imagem de um serviço. Este campo pode ser utilizado enquanto os containers estiverem de pé com o comando `docker compose build`, ou no momento de subir os containers com o `docker compose up --build`.

- `volumes` : define os volumes que serão montados no container, permitindo a persistência de dados.

- `network` : define a rede que será usada pelo serviço. Caso seja informado alguma rede personalizada para o container, sera preciso criar esse network ao final do arquivo.

- `ports` : define as portas que o serviço ira expor e direcionar para o sistema host.

- `expose` : define as postas que o container expões internamente. Não mapeia as portas para o sistema host, apenas permite que outros serviços se comuniquem com este por meio da porta especificada.

- `environment` : define variáveis de ambiente a serem passadas pera o container.

- `command` : define o comando a ser executado quando o container é iniciado.

- `restar` : define a politica de reinicialização do container em caso de falha. Possui algumas opções como "always", "no" e "on-failure".

- `depends_on` : define as dependências entre serviços, especificando que um serviço deve esperar até que suas dependências estejam em execução.

### Principais comandos

- `up` : sobe os containers definidos no arquivo *compose*.

- `down` : serve para interromper e remover os containers definidos no arquivo *compose*, além de remover os recursos associados aos containers, bem como os **networks** criados.

- `ps` : lista os containers relacionados ao *compose*.

- `logs` ou `logs nome-do-container` : exibe os logs de todos os container ou do container que foi especificado.

- `exec` : utilizado para executar comandos em um container definido no *compose*. Por exemplo `docker compose exec meu-container sh`.

- `build` : reconstrói as imagens dos containers definidos no *compose*.

- `restart` : reinicia os container sem reconstruir as imagens.

- `pull` : efetua o download das imagens definidas no *compose*.

## Subindo containers durante desenvolvimento

No exemplo anterior definimos uma imagem fixa para o container, porem durante o desenvolvimento o mais comum é utilizar uma imagem que ira se atualizando conforme o projeto avança. E para isso podemos utilizar o campo **build**. Com ele podemos efetuar o build de uma imagem a partir de um **Dockerfile**. Vejamos como ficaria a imagem do laravel:

```yml
services:
  laravel:
    build: 
      context: ./laravel
      dockerfile: Dockerfile.prod
    image: juliucesar/laravel-optimized:prod
    container_name: laravel
    networks:
      - laranet
```

- `context` : é preciso informar um contexto para o build, que é a pasta onde se encontra o arquivo Dockerfile

- `dockerfile` : utilizado para informar o nome do arquivo Dockerfile caso ele possua um nome diferente do padrão.

Como foi visto, não há necessidade de remover o campo `image`, ele ainda pode ser utilizada para dar o nome a imagem que for ser construída.

No momento de subir os container o Docker ira utilizar as imagens prontas, então caso seja necessário efetuar o build para atualizar as imagens temos os dois seguintes comandos:

```bash
docker compose build
# Ou
docker compose up -d --build
```

O primeiro comando pode ser utilizado enquanto os containers estão de pé. Já o segundo efetua o build no momento de subir os containers.
