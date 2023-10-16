# Docker Compose

A ferramenta Docker compose é utilizada para facilitar a definição, configuração e execução de aplicações multi-container. Ele nos permite definir todo um ambiante de implantação, incluindo as configurações de container, redes volumes, em um único arquivo `docker-compose.yml`. Essa extensão YAML é a que descreve a estrutura do aplicativo multi-contêiner.

Vejamos um exemplo para compreender melhor. Vamos criar o arquivo *docker-compose.yml*, e dentro dele colocamos o seguinte trecho de código:

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

Dentro do campo `servicer` indicamos todos os containers que vamos subir, e podemos ver que cada campo representa uma configuração que vinhamos fazendo no próprio comando de executar um container (`docker run ...`). No exemplo acima executamos os dois containers do capitulo anterior `03-laravel-nginx`.

Para executar esse arquivo utilizamos o comando abaixo. Lembrando de que o terminal precisa estar na mesma pasta de onde se encontra o arquivo *compose*.

```bash
docker compose up
```

Com apenas esse comando subimos múltiplos containers, sem a necessidade de criar comandos do *docker run* muito extensos, e que sobem apenas um container.

Apos esse exemplo vejamos os principais comandos do docker compose:

- `up` : sobe os containers definidos no arquivo *compose*.

- `down` : serve para interromper e remover os containers definidos no arquivo *compose*, além de remover os recursos associados aos containers, bem como os **networks** criados.

- `ps` : lista os containers relacionados ao *compose*.

- `logs` ou `logs nome-do-container` : exibe os logs de todos os container ou do container que foi especificado.

- `exec` : utilizado para executar comandos em um container definido no *compose*. Por exemplo `docker compose exec meu-container sh`.

- `build` : reconstrói as imagens dos containers definidos no *compose*.

- `restart` : reinicia os container sem reconstruir as imagens.

- `pull` : efetua o download das imagens definidas no *compose*.

## Subindo containers durante desenvolvimento

