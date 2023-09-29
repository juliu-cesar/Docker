# Dockerfile

Este arquivo nos permite criar uma imagem personalizada a partir de uma imagem base. Vamos pegar o exemplo que foi visto anteriormente, onde foi necessário instalar o Vim dentro do container Nginx. Vejamos os passos necessários para construir uma imagem ja com o vim instalado.

```dockerfile
FROM nginx:latest

RUN apt-get update
RUN apt-get install vim -y
```

Primeiramente escolhemos a imagem base, que no caso é a ultima versão do Nginx, após isso utilizamos o *RUN* para executar um comando durante a construção do container, que são o de atualizar as dependências e de instalar o *vim*. Como durante a instalação do Vim ele pergunta se quer prosseguir com o processo, passamos a opção `-y` para confirmar qualquer pergunta.

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

## Entrypoint e CMD

Ambos são utilizados para executar comandos no momento que o container é executado, porem existem diferenças importantes de serem destacadas entre eles. A mais importante é que o `CMD` pode ser substituído caso seja passado algum parâmetro no comando para rodar o container, enquanto o `ENTRYPOINT` não pode ser alterado. Vejamos um exemplo com *CMD*.

```dockerfile
FROM ubuntu:latest

CMD [ "echo", "Hello World" ]
```

O resultado obtido ao executar o container sera a frase *Hello World* exibida no terminal. Porem caso seja passado um parâmetro como `docker run image_name echo hello`, o que sera impresso no terminal sera apenas *hello*. Geralmente utilizamos o CMD quando queremos executar um comando padrão caso não seja informado nenhum outro.

```dockerfile
FROM ubuntu:latest

ENTRYPOINT [ "echo", "Hello" ]

CMD [ "World" ]
```

Já com o ENTRYPOINT o resultado não é alterado independente de ser passado algum argumento ou não. Porem ele pode ser combinado com o CMD para criar um comando com parâmetros padrões porem modificáveis. Como vimos anteriormente o CMD pode ser substituído, então caso seja executado o comando `docker run image_name docker`, o resultado obtido sera *Hello docker*, uma vez que o *Hello* do entrypoint não sera modificado.

Dentro do Docker Hub podemos acessar o Dockerfile de qualquer imagem publicada, bastando clicar em uma das tags da imagem. Por exemplo a imagem do Nginx pode ser acessada por esse link [Dockerfile Nginx](https://github.com/nginxinc/docker-nginx/blob/321a13a966eeff945196ddd31a629dad2aa85eda/mainline/debian/Dockerfile). Ao final do arquivo temos o seguinte trecho:

```dockerfile
ENTRYPOINT ["/docker-entrypoint.sh"]

EXPOSE 80

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
```

Quando iniciamos o container, o ENTRYPOINT ira executar o arquivo *docker-entrypoint.sh*, que é um arquivo de shell script responsável por executar algumas funções necessárias para o Nginx. Ao final desse arquivo temos o código `exec "$@"`, que serve para executar qualquer comando que receber como parâmetro, nesse caso são os do CMD, que ira subir o servidor local do Nginx. Porem quando passamos algum parâmetro no comando de execução, como por exemplo o `bash`, ele substituirá o CMD, com isso iniciando o shell ao invés de subir o Nginx.

Outro detalhe desse trecho é o comando EXPOSE que expõe a porta 80 do container, mas veremos esse comando mais a frente.

## Subindo uma imagem no Docker Hub

Para subir uma imagem primeiramente é preciso ter uma conta no Docker Hub e também utilizar o nome de usuário no nome da tag da imagem na hora de fazer o build, por exemplo `docker build -t juliucesar/nginx-html .`. Com isso podemos dar sequencia para o login e push da imagem.

```bash
docker login

docker push juliucesar/nginx-html
```

O primeiro comando é para efetuar o login e em seguida enviamos a imagem para o repositório no Docker Hub com o *push*.
