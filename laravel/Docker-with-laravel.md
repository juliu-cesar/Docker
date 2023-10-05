# Criando um container com Laravel

Neste documento vamos explicar como criar um container docker que quando executado suba uma aplicação Laravel. Vejamos o arquivo *Dockerfile*.

```dockerfile
FROM php:8.2-cli

WORKDIR /var/www

RUN apt-get update && \
    apt-get install libzip-dev -y && \
    docker-php-ext-install zip

RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    php composer-setup.php && \
    php -r "unlink('composer-setup.php');"

RUN php composer.phar create-project laravel/laravel laravel

ENTRYPOINT [ "php","laravel/artisan","serve" ]

CMD [ "--host=0.0.0.0" ]
```

- FROM : escolhemos a versão 8.2 do php para este container.

- WORKDIR : definimos a pasta de trabalho como sendo `var/www`.

- 1º RUN : primeiramente atualizamos o container, em seguida instalamos a biblioteca *libzip* para extrair alguns arquivos e por fim instalamos a extensão *zip* que sera necessária para os próximos comandos.

- 2º RUN : os 3 comandos executados são parte do passo a passo para instalar o Composer, que é um gerenciador de pacotes do php.

- 3º RUN : finalmente criamos um projeto Laravel utilizando o Composer.

- ENTRYPOINT : iniciamos o servidor do Laravel

- CMD : adiciona um opção ao Entrypoint de que qualquer host possa acessar o servidor Laravel. Porem como é um *CMD*, pode ser sobrescrito no comando para executar o container.

## Comando para criar o container

```bash
docker build -t nome_do_usuario/laravel:latest .
```

## Comando para executar o container

```bash
docker run --rm -d --name laravel -p 8000:8000 juliucesar/laravel
```

> A opção *--rm* serve para o container quando parado, não entre para o histórico.
