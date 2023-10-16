# Criando uma aplicação Node com Express

Com o Docker podemos criar e desenvolver uma aplicação com **Node** sem necessariamente ter ele instalado na maquina, onde iremos adicionar um volume para poder salvar os arquivos durante o desenvolvimento. Para isso podemos partir de uma imagem Node ou instalar o node em uma imagem qualquer.

Primeiramente veremos a opção que apenas criamos um container com um volume, e, em seguida uma opção com o **Dockerfile**.

## Node com Docker Run

Vejamos o comando para criar uma aplicação node escolhendo uma pasta na maquina como volume. Lembrando de executar o comando já na pasta escolhida.

```bash
docker run --rm -it -v $(pwd)/:/usr/src/app -p 3000:3000 node:15 bash
```

- `-v` : esta opção define um volume para o container. Primeiramente passamos o endereço na maquina utilizando o comando `$(pwd)/`, que serve para selecionar a pasta onde se encontra o terminal, e apos os dois pontos `:` passamos o endereço no container. Dessa forma tudo que for criado e modificado na pasta `app` do container, sera refletido na pasta de volume e vice-versa.

- `-p` : definimos a porta que sera disponibilizada, e que deve ser utilizada no `index.js`.

Os próximos passos é criar um projeto node e instalar o express com os comandos:

```bash
npm init

npm install express --save
```

Em seguida criamos um arquivo `index.js` e dentro dele colocamos o seguinte trecho de código para subir uma aplicação express.

```js
const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("<h1>Full Cycle</h1>");
});

app.listen(port, () => {
    console.log("Rodando na porta " + port);
});
```

Para executar a aplicação basta executar um `node index.js` que então teremos a aplicação express rodando na porta 3000.

## Node com Dockerfile

Agora vamos construir uma imagem a partir dessa nossa aplicação, colocando todos os arquivos da pasta volume para dentro do container. Vejamos como fica o Dockerfile.

```dockerfile
FROM node:15

WORKDIR /usr/src/app

COPY . .

EXPOSE 3000

CMD [ "node", "index.js" ]
```

- FROM : partimos da mesma imagem Node.

- WORKDIR : definimos a pasta de trabalho

- COPY : copiamos todos os arquivos do volume para o container. O primeiro endereço é o local que vamos copiar, e como vamos executar o build dentro da pasta `node` bastou passar apenas o `.`. Já o segundo endereço é o local para onde sera enviado os arquivos, e como definimos o *WORKDIR* na pasta alvo, bastou também passar o `.`.

- EXPOSE : informamos a porta para acessar a aplicação

- CMD : definimos o comando para executar a aplicação. Com isso ao rodar o container, a aplicação sobre logo em seguida.

### Dockerfile para a produção

É muito comum utilizar dois Dockerfile durante o desenvolvimento, um para essa primeira faze da aplicação e o outro para a faze de produção. Então podemos criar um segundo Dockerfile com o nome `Dockerfile.prod` e colocar nele o mesmo código do trecho acima, deixando o Dockerfile original para construir o projeto.

Suponhamos então que o projeto ficou pronto, e precisa ser construída a imagem, utilizaremos o seguinte comando.

```bash
docker build -t juliucesar/express-hello . -f Dockerfile.prod
```

Com a opção `-f` podemos informar o local/nome de um arquivo *Dockerfile* que possua um nome diferente do padrão. Caso ele esteja em outra pasta podemos informar `-f /nome-da-pasta/Dockerfile.prod`.
