# Dockerfile

Este arquivo nos permite criar uma imagem personalizada a partir de uma imagem base. Vamos pegar o exemplo que foi visto anteriormente, onde foi necessário instalar o Vim dentro do container Nginx. Vejamos os passos necessários para construir uma imagem ja com o vim instalado.

```dockerfile
FROM nginx:latest

RUN apt-get update
RUN apt-get install vim -y
```

Primeiramente escolhemos a imagem base, que no caso é a ultima versão do Nginx, após isso utilizamos o *RUN* para executar um comando automaticamente dentro do container, que são o de atualizar as dependências e para instalar o vim. Como durante a instalação do Vim ele pergunta se quer prosseguir com o processo, passamos a opção `-y` para confirmar qualquer pergunta.

## Construindo a imagem

Agora para construir essa imagem e salvar ela no nosso repositório local, utilizamos o seguinte comando:

```bash
docker build -t nome_do_usuario/nginx-com-vim:latest .
```

O comando `build` sera responsável por construir a imagem. A opção `-t` é utilizada para informar a tag da imagem. Apos o noma da tag passamos a versão utilizando o `:`. Por fim informamos qual a pasta que se encontra o *Dockerfile*, como o terminal esta na mesma pasta, passamos apenas `.`.

Para conferir se a imagem realmente esta salva no repositório, basta utilizar o comando:

```bash
docker images
```

## Iniciando a imagem

Assim como qualquer outra imagem vamos utilizar o comando `run` para subir o container.

```bash
docker run -it juliucesar/nginx-com-vim bash
```

___

Vejamos um exemplo agora onde copiamos a pasta *html* na raiz desse projeto para dentro do container, substituindo a pasta *html* do Nginx.

```dockerfile
FROM nginx:latest

WORKDIR /app
RUN apt-get update && \
    apt-get install vim -y

COPY html/ /usr/share/nginx/html/
```

Com o *WORKDIR* definimos uma pasta de trabalho, onde todos os comandos subsequentes serão executados. Podemos definir uma pasta de trabalho, executar alguns comandos nela e, apos isso definir outra pasta de trabalho. No comando *RUN* utilizamos o `&&` para adicionar um segundo comando, e, a contra barra `\` para poder quebrar a linha e continuar o comando. Por fim utilizamos o comando *COPY* para copiar a pasta *html* para dentro da pasta também *html* do nginx no container.

Conforme é efetuado alterações e refeito o build da imagem, o processo se torna mais rápido, pois muitas dependências o **docker ja possui em cache**, acelerando muito a velocidade para montar a imagem.

