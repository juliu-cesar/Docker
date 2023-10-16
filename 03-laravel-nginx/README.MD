# Otimizando imagens Docker

Até o momento criamos imagens de containers com o único proposito de servir à aplicação, e muitas vezes temos diversos recursos que não serão necessários para quando a imagem for para produção, além de que imagens leves são mais fáceis de baixar, sobem mais rápido e quando falamos em escala, isso conta muito. Por isso é importante fazer a otimização da imagem.

Para este projeto a ideia é colocar uma imagem Laravel para produção, onde teremos o Nginx servindo como proxy reverso. Ou seja, toda requisição ira bater no **Nginx**, que se conectará a outro container com o **php**, que retorna alguma informação para o Nginx, que então responde para o **usuário**.

## Construindo imagens em mais de uma etapa

Para otimizar a imagem, vamos utilizar uma distribuição do Linux que é o **Alpine**. Uma versão muito leve, porem não possui nem mesmo o `apt-get` para ser feita uma atualização ou algo do tipo. Então fica a pergunta, como sera criado o projeto com Laravel sem essas ferramentas? Para resolver esse problema temos o **Multi-stage build**, que nos permite criar uma imagem em **varias etapas**, cada uma se baseando em uma imagem diferente, onde podemos copiar partes do estagio anterior para o proximo, e sendo o ultimo estagio o que ira para produção.

Vamos começar duplicando o arquivo Dockerfile e nomeando para `Dockerfile.prod`. Vejamos como ficou o arquivo após as modificações e em seguida uma lista comentando os principais pontos.

```dockerfile
# PRIMEIRA ETAPA
FROM php:8.2-cli AS builder
WORKDIR /var/www

RUN apt-get update && \
    apt-get install libzip-dev -y && \
    docker-php-ext-install zip
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    php composer-setup.php && \
    php -r "unlink('composer-setup.php');"
RUN php composer.phar create-project laravel/laravel laravel

# SEGUNDA ETAPA
FROM php:7.4-fpm-alpine
WORKDIR /var/www

RUN rm -rf /var/www/html

COPY --from=builder /var/www/laravel .

RUN ln -s public html

RUN chown -R www-data:www-data /var/www

EXPOSE 9000
CMD [ "php-fpm" ]
```

1. Na linha 1 nomeamos a primeira etapa como `builder` pois vamos precisar dos arquivos dela na proxima etapa.

2. A proxima modificação foi remover as duas linhas de comando que antes ficavam ao final do arquivo, para então começar a segunda etapa `FROM php...`, que como mencionamos anteriormente, ira se basear na imagem do Linux Alpine. Logo em seguida definimos a mesma WORKDIR.

3. O primeiro comando RUN da segunda etapa apenas remove a pasta html da pasta onde estamos trabalhando.

4. `COPY --from` : esta é uma parte importante, pois é nela que copiamos a pasta *laravel* da etapa anterior para esta nova etapa. Para efetuar um COPY no estagio anterior utilizamos o `--from=`, passando para ele o nome que definimos na primeira etapa. O restante do código é o mesmo para qualquer COPY, o primeiro endereço é a pasta alvo, e o segundo onde sera colado essa pasta.

5. No segundo comando RUN criamos um **link simbólico** (`RUN ln -s`), para quando for acessado a pasta *html* seja exibido o conteúdo da pasta *public*. Isso é necessário pois o laravel trabalha com a pasta *public*, porem o Nginx tenta acessar a pasta *html*, logo o meio mais simples é criar um link simbólico para redirecionar o acesso.

6. Já o terceiro RUN alteramos o proprietário da pasta `/var/www` para o usuário e grupo *www-data*, que passa a ter permissão para fazer qualquer alteração nesse diretório. Vejamos o código por parte.

   - `chown` : utilizado para alterar o proprietário e grupo de arquivos e diretórios. Para o contexto do Docker, é utilizado para ajustar permissões dos arquivos no container.

   - `-R` : esta opção indica que o comando sera recursivo, ou seja, a alteração sera feita em todos os arquivos e subdiretórios dentro de */var/www*.

   - `www-data:www-data` : especifica quem sera o usuário e o grupo para qual a propriedade sera passada. Nesse caso tanto o nome do usuário como o do grupo são os mesmos (*www-data*).

   - `/var/www` : define qual a pasta alvo.

7. Por fim expomos a porta **9000** e executamos o php.

> No contexto do PHP-FPM, o `www-data` é um usuário e grupo comuns que são frequentemente usados para executar serviços web, pois eles têm permissões restritas e são geralmente mais seguros.

Para construir essa imagem vamos utilizar o código abaixo. Lembrando que estamos executando esse comando de dentro da pasta *03-laravel-nginx*, e como o Dockerfile esta na pasta *laravel-optimized*, precisamos informar o endereço.

```bash
docker build -t juliucesar/laravel-optimized:prod laravel-optimized -f /laravel-optimized/Dockerfile.prod
```

Após a imagem ficar pronta podemos compara-la com a anterior, onde saímos de mais de **600MB** para algo em torno de **170MB**. É notável a diferença apos uma simples otimização.

Outro beneficio da otimização é a **segurança**, pois quanto menos bibliotecas e arquivos sobrando, menos brechas o container terá.

## Utilizando o Nginx como proxy reverso

Para a segunda parte dessa aplicação, colocaremos o Nginx como proxy reverso, ou seja, ele servira como um intermediário entre o navegador (usuário) e o servidor.

É bastante recomendado utilizar um proxy reverso em um servidor como o PHP, node, python, etc., pois existem diversas vantagens ao adicionar esse processo intermediário. Falando especificamente do Nginx, algumas vantagens dele são o balanceamento de carga, cache de conteúdo, autenticação e autorização, SSL/TLS, logs e monitoramento.

O primeiro passo sera criar o arquivo de configuração do Nginx para que ele funcione corretamento com o Laravel. Esse arquivo sera responsável por configurações de como o Nginx vai lidar com solicitações http, ira especificar regras de segurança e encaminhar solicitações para scripts PHP além de outros detalhes para um servidor web. Dentro da pasta `/nginx` vamos criar o arquivo `nginx.conf`. Dentro dele temos:

```conf
server {
    listen 80;
    index index.php index.html;
    root /var/www/html;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    charset utf-8;

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass laravel:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

- `listen` : configura a posta que o Nginx ira disponibilizar, no caso a 80.

- `index` : qual a preferencia por arquivos índice, no caso primeiro os arquivos PHP para depois os html.

- `root` : qual o diretório raiz onde estão os arquivos do site, no caso para o endereço `/var/www/html`. Lembrando que esse diretório precisa ser o mesmo do qual foi configurado no Dockerfile do Laravel, onde adicionamos um link simbólico para a pasta *html*. Dessa forma o Nginx ira buscar na pasta *html* no Laravel, e sera redirecionado para a pasta *public*.

- `add_header` : os tres *add_header* configuram os cabeçalhos para a questões de segurança.

- `location` : no primeiro `location` definimos como lidar com arquivos PHP (\\.php$). Qualquer solicitação para arquivos PHP ira ser encaminhada para o serviço PHP-FPM, que no caso estará rodando no container com nome *laravel* e porta 9000. O segundo `location` lida com qualquer outra solicitação que não seja de arquivos PHP.

Agora sera necessário injetar essa configuração na imagem do Nginx, pois a que foi construída anteriormente possui a configuração padrão. Então vamos duplicar o arquivo Dockerfile nomeando ele como `Dockerfile.prod`. Dentro dele temos as seguintes instruções:

```dockerfile
FROM nginx:1.25-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

RUN mkdir /var/www/html -p && touch /var/www/html/index.php
```

> A opção `-p` do *mkdir* serve para ele criar o diretório e sub-diretório caso eles não existam.

1. Utilizamos a versão **Alpine** do Nginx por ser uma imagem mais leve.

2. Excluímos a configuração padrão com o `RUN rm`, e em seguida copiamos o nosso arquivo de configuração para a mesma pasta com o `COPY`.

3. Criamos um arquivo `index.php` dentro do diretório *html* com o `RUN mkdir`. Isso é necessário para o funcionamento do Nginx, pois quando um usuário acessar alguma coisa, ele bater nesse arquivo PHP e fazer a chamada remota que foi a que configuramos no arquivo *nginx.conf*. Caso contrario sera exibido o erro 404.

O comando para gerar a imagem do Nginx fica:

```bash
docker build -t juliucesar/nginx:prod . -f Dockerfile.prod
```

## Executando o projeto

Para subir os containers primeiro vamos criar uma rede Bridge exclusiva para esse projeto. O comando para criar o network fica:

```bash
docker network create laranet
```

Agora para subir os containers temos os seguintes comandos:

```bash
docker run -d --network laranet --name laravel juliucesar/laravel-optimized:prod

docker run -d --network laranet --name nginx -p 8080:80 juliucesar/nginx-laravel:prod
```