<div align="center">

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" height="300"/>

</div>

# Docker

Modulo de Docker curso FullCycle.

## Conceito

Para entender um funcionamento de um container docker primeiro precisamos entender o conceito de **namespaces** no Linux. Eles foram introduzidos para permitir a criação de ambientes isolados, onde cada um tem uma visão isolada dos recursos do sistema. Esse forma de separar os processos foi introduzida em 2002 e desde la foram adicionados diversos tipos de namespaces, como por exemplo:

- PID Namespace: Isola as IDs de processo, de modo que processos em diferentes namespaces possam ter o mesmo ID de processo, mas não se misturam.

- Network Namespace: Permite que processos em diferentes namespaces tenham suas próprias interfaces de rede, tabelas de roteamento e conexões de soquete, isolando completamente a rede.

- Mount Namespace: Isola as montagens e pontos de montagem do sistema de arquivos, permitindo que diferentes processos tenham sua própria hierarquia de sistemas de arquivo. Isso significa que eles podem montar sistemas de arquivos separados, ter diferentes pontos de montagem e entre outros, sem interferir nos sistemas de arquivos de outros processos ou contêineres.

- UTS Namespace: Isola o nome do nó do sistema, incluindo informações do host.

- IPC Namespace: Isola recursos de comunicação *interprocessual*, como filas de mensagens e semáforos.

- User Namespace: Isola IDs de usuário e grupo, permitindo que processos em um namespace tenham diferentes IDs do que teriam fora dele.

- Cgroup Namespace: Isola os grupos de controle (*cgroups*), que são usados para controlar e limitar recursos de sistemas para processos.

Para trabalharmos com containers temos três pilares que possibilitaram e tornaram o que o Docker é hoje. O primeiro são os **namespaces**, que separam e isolam os processos. O segundo foi a adição do **Cgroup Namespace** feita pela Google, ao qual permite gerenciar e limitar o quanto cada um pode consumir dos recursos da maquina. E o terceiro é o **Filesystem**, que torna o controle da arvore de arquivos muito mais eficiente.

### Overlay Filesystem

Falando especificamente do funcionamento do filesystem de um container, o que o torna tão mais eficiente que uma maquina virtual comum com uma imagem de um sistema operacional, é o **Overlay Filesystem**. Com ele temos uma sobreposição da arvore de arquivos, permitindo a reutilização de dependências para diferentes containers.

Vejamos por exemplo uma aplicação que tenha um tamanho de 100MB e possua outras 2 dependências de 200MB cada, caso seja necessário subir uma outra aplicação com modificações, não é preciso trazer as duas dependências, pois elas serão reutilizadas da arvore de arquivos mais baixa. Ou seja, quando um container é montado, ele consome alguns recursos da maquina, porém reutiliza diversas dependências do próprio sistema operacional, o que o torna extremamente leve comparado a uma maquina virtual.

## Imagens Docker

Outra parte fundamental de se compreender sobre o funcionamento do Docker são as imagens. Geralmente quando falamos sobre "imagem" a primeira coisa que se pensa é em um *Snapshot* de como esta a aplicação do sistema naquele momento, porem com Docker é um pouco diferente, as **imagens são construídas em camadas**, isso devido a utilizamos o filesystem.

Suponhamos que vamos construir uma imagem docker, começamos a partir de uma imagem em branco (normalmente não começamos realmente do zero, sempre é utilizado uma imagem base) e em seguida vamos adicionando as dependências, vejamos a imagem abaixo:

<div align="center">

<img src="https://github.com/juliu-cesar/TrackNWay-FullCycle/assets/121033909/a8799d48-0f38-4e77-bfa4-1b08dc740924" height="300" />

</div>

Temos a nossa imagem em branco `Scratch` e em cima dela adicionamos o `Ubuntu`. Como vimos anteriormente sobre o reaproveitamento de dependências, sera baixado apenas as partes que ainda não tenham no sistema, o resto sera aproveitado do sistema operacional (lembrando que estamos considerando que o sistema operacional da maquina é o Ubuntu). Rodando em cima do Ubuntu temos a camada de `bash` e a de `ssh`, e por ultimo temos a `aplicação` que é outra camada rodando em cima do ssh. Ou seja, para montar a imagem da aplicação sera necessário diversas camadas de dependências.

Caso seja criado uma outra aplicação vizinha que também precise do `bash`, sera reutilizado parte da imagem anterior para construir essa nova. Com isso não sera necessário baixar novamente o `bash` e nem mesmo o `Ubuntu`.

Uma das desvantagens da reutilização de dependências do Docker é que caso seja exista uma falha no Ubuntu por exemplo, toda a arvore de dependências acima dele sera afetada. Obviamente como contra ponto temos a necessidade de consertar o problema em apenas um único lugar e, apos isso fazer o re-build da aplicação.

Apos adicionar todas as dependências necessárias, podemos então criar uma imagem. Por convenção colocamos um nome para a imagem seguido pela versão.

<div align="center">

<img src="https://github.com/juliu-cesar/TrackNWay-FullCycle/assets/121033909/d5442b04-68f3-4df0-9c29-e47885481df8" height="300" />

</div>

Uma imagem sera então um conjunto de dependências encadeadas dispostas em uma *arvore de dependências* pronta para ser utilizada para executar a aplicação.

## Dockerfile

Para construirmos uma imagem precisamos de um **arquivo de definição de imagens**, ou seja, um arquivo declarativo onde escrevemos como sera a imagem que queremos *buildar*, e esse arquivo é o **Dockerfile**. Dentro desse arquivo temos alguns comando que veremos abaixo:

- `FROM: ImageName` : informa qual a imagem base que sera utilizada para construir a nossa imagem personalizada. Como visto anteriormente partimos de uma imagem em branco, porem na pratica sempre vamos partir de alguma outra imagem ja pronta.

- `RUN:` : executa comandos no sistema de arquivos da imagem durante a construção. Ou seja podemos executar comandos como `RUN apt-get update && apt-get install` para efetuar a atualização do sistema e instalar o o que for necessário na imagem.

- `COPY` e `ADD` : copiam arquivos ou diretórios do host para a imagem. O COPY é usado para copiar arquivos locais para a imagem, enquanto ADD também pode baixar arquivos da internet e extrair arquivos compactados.

- `WORKDIR` : define o diretório de trabalho para instruções subsequentes, onde os comandos serão executados. Por exemplo `WORKDIR /app` fara com que os comandos sejam executados dentro dessa pasta no container. Também é possível definir mais de um diretório de trabalho no dockerfile, onde um trecho de código é executado em uma pasta, e outro trecho em uma nova pasta.

- `ENV` : Define variáveis de ambiente na imagem, exemplo `ENV MY_ENV_VARIABLE=my_value`.

- `EXPOSE: 8080` : permite expor portas para se comunicar com o container.

O Dockerfile é utilizado apenas para construir imagens, ou seja, se temos a necessidade de rodar apenas a imagem do Ubuntu sem nenhuma alteração, não sera necessário criar um Dockerfile, podemos executar apenas um `docker run -it ubuntu:20.04`.

## Funcionamento dos Containers

Agora que entendemos que os processos são separados por namespaces, vamos olhar individualmente um processo rodando um container. Dentro desso processo temos a *imagem* que possui um **estado imutável**, não podendo ser alterada, e junto com ela é criado uma camada de **escrita e leitura**, que nos permite adicionar e editar arquivos no container, porem a imagem em si não é modificada. Por esse fato que é necessário destruir e subir novamente o container quando efetuamos uma alteração na imagem, e quando esse processo é executado a camada de leitura e escrita é perdida (caso não tenha sido declarado um `volume`).

Sempre que executamos o build do Dockerfile, criamos uma nova imagem com as características faladas no paragrafo anterior.

### Docker Commit

O comando **Docker commit** é uma outra forma de criarmos um container. Vamos supor que temos um container rodando e, apos efetuar diversas alterações na camada de leitura e escrita executamos o comando `docker commit`, com isso seria criado um outro container com as modificações já incorporadas na imagem, tornando elas imutáveis. Porem existem algumas desvantagens para esse método, como por exemplo:

- Falta de Rastreabilidade: ao criar uma imagem usando *docker commit*, não há um histórico claro das alterações feitas, ao qual teríamos utilizando o Dockerfile. Podendo dificultar a manutenção e o entendimento das mudanças feitas na imagem.

- Eficiência e Reprodutibilidade: o *docker commit* pode resultar em imagens maiores e menos eficientes, pois não permite a otimização de camadas, além de ser mais complexo rastrear todas as modificações feitas para tentar reproduzir o container em questão.

- Falta de Automação: diferente do *commit*, o processo de criar imagens utilizando o Dockerfile permite que ele seja automatizado, versionado e compartilhado por meio de sistemas de controle de versão, como Git.

### Image Registry

O Image Registry é um serviço que nos permite armazenar, compartilhar e distribuir imagens Docker. Ele pode ser tanto um serviço publico como o [Docker Hub](https://hub.docker.com), quanto um Registry privado configurado na própria maquina.

Quando efetuamos o build de uma imagem, ela é construída na maquina e então podemos efetuar o **push** para algum *image registry*. O mesmo vale para quando estamos configurando uma imagem e utilizamos outra como base, logo sera feito o **pull** de um registry para trazer as dependências necessárias.

### Docker Host

Quando nos referimos a **Docker Host** estamos falando da maquina em que o **Docker Engine** esta instalado. Ou seja, é onde os containers serão criados e gerenciados. Abaixo temos uma imagem que mostra o funcionamento do Docker Host.

<div align="center">

<img src="https://github.com/juliu-cesar/TrackNWay-FullCycle/assets/121033909/9e42f05f-2f6e-4d23-8070-882b017dd14c" height="300" />

</div>

O conceito de Host possui quatro pontos principais que são:

1. Docker Daemon : o host fica rodando em segundo plano a *daemon* do docker que além de outras funções disponibiliza uma porta de comunicação com o cliente do Docker.

2. Cache : sempre que executamos um **pull** do registry, ou efetuamos um **build** de uma imagem, o docker armazena em cache essas imagens, e quando precisar utilizar elas em outros containers, não sera necessário refazer o download. Além disso quando executamos um **push** o docker envia a imagem guardada em cache para o registry.

3. Volumes : gerencia os volumes que serão utilizados para **persistir** os dados dos containers. Como visto anteriormente, quando um container é desmontado todos os seus dados são perdidos, e isso é resolvido definindo um *volume* (uma pasta na maquina) onde sera salvo esses dados. Podemos também definir uma mesma pasta para diversos containers, onde eles poderão trocar arquivos utilizando esse mesmo volume.

4. Network : por padrão o network criado pelo docker é do tipo *bridge*, que cria uma rede privada para os containers na qual eles podem se **comunicar**, mas não com o host ou outros dispositivos. Mais a frente veremos outros tipos de network.

Além do Host temos mais duas instancias importantes, que são a:

1. Docker Client : cliente que é instalado na maquina e serve para se comunicar com o Host. Por padrão utilizamos uma interface de linha de comando para gerenciar os containers. Sempre que digitamos um comando `docker alguma_coisa` estamos se comunicando com o Host.

2. Registry : como visto anteriormente, ele é responsável por armazenar as imagens, e pode ser tanto um registry publico como privado.

## Docker com WSL 2

Para instalar tanto o wsl 2 como o docker basta seguir o tutorial [Guia rápido do WSL2 + Docker](https://github.com/codeedu/wsl2-docker-quickstart).

## Primeiro Hello World

Após a instalação o comando `docker` vai estar habilitado, e dentre esses comandos o que sera muito utilizado é o `docker ps` que exibe todos os containers que estão rodando no momento. Obviamente como acabamos de instalar o docker, não temos nenhum container rodando, então vamos subir um para ver ele na lista. No Docker Hub temos a clássica imagem `hello-world`, e podemos executa-la utilizando o comando:

```bash
docker run hello-world
```

A primeira mensagem que sera exibida é que não foi encontrado nenhuma imagem com esse nome no *cache*, então em seguida é iniciado o download da imagem, que por fim é executada. O que essa imagem faz é exibir algumas informações na tela, sendo uma delas sobre o bash do Ubuntu que veremos em seguida.

Porem ao rodar o *docker ps* novamente, uma lista vazia é exibida. Isso ocorre por que o **entrypoint** desse container em especifico apenas chama um executável que após terminar suas tarefas ele morre, logo o container não fica de pé e não pode ser visto na lista. Porem dentro do comando *ps* temos uma **opção de linha de comando** que nos permite ver tanto os container que estão de pé como os que ja foram destruídos, que é o:

```bash
docker ps -a
```

Sera exibido diversas informações como o:

- CONTAINER ID : o ID do container.

- IMAGE : o nome da imagem.

- COMMAND : o comando ou entrypoint executado.

- CREATED : quando o container foi criado.

- STATUS : o estado do container. Se esta rodando, se foi parado, se ele finalizou as tarefas, etc.

- PORTS : as portas que o container disponibiliza.

- NAMES : o nome do container. Caso não informado, sera gerado um nome aleatório.

## Executando um container com o Ubuntu

Uma das mensagem que foi exibida pela imagem *hello-world* foi para testarmos um comando para rodar um container com Ubuntu, que foi o:

```bash
docker run -it ubuntu bash
```

Temos algumas informações para destacar nesse comando, que são o `run`, a opção de linha de comando `-it`, a imagem `ubuntu` e o `bash`.

- `run` : comando utilizado para executar um container.

- `-i` e `-t` : após o *run* podemos utilizar as opções de linha de comando, sendo a primeira uma opção que torna a execução interativa (*--interactive*), permitindo que seja executados comandos diretamente no terminal do container. Já a segunda é uma opção serve para alocar um pseudo-terminal para o container (*--tty*), isso é necessário para seja possível interagir com o shell do container.

- `ubuntu` : é a imagem base que vamos executar. Como não passamos nenhum parâmetro de versão, sera utilizado sempre a ultima versão disponível dessa imagem (*ubuntu:latest*).

- `bash` : este é o comando que sera executando quando o container iniciar. Logo ele ira iniciar o shell Bash dentro do container.

Ao executar o comando, o que teremos sera uma aplicação Linux rodando.

### Mantendo um container em pé

Uma das características desse container é que ele se mantém executando devido ao comando *bash*, que fica sempre em espera de algum comando no shell. E isso é a base de como funciona um container, ele **é um processo que é executado e, apenas continuara de pé caso alguma coisa mantenha ele nesse estado**. Caso contrario, ele sera derrubado.

Podemos conferir que ele se mantém de pé abrindo um segundo terminal e executar o comando `docker ps` para ver que ele esta lista de containers que estão rodando.

> Para sair de um container que esta executando basta digitar o comando `Ctrl` + `d`.

### Executando um container sem adiciona-lo no histórico

Uma forma de não adicionarmos um container ao histórico dos que foram executados (*docker ps -a*), é utilizando a opção de linha de comando `--rm`, que ira remover ele do histórico assim que o container for derrubado. Utilizando o container anterior como exemplo, ficaria o comando: `docker run -it --rm ubuntu bash`.

## Portas do container

Outro ponto que é importante ser destacado é a conectividade dos containers. Vamos pegar por exemplo o comando `docker run nginx` que ira subir um container com a imagem base do Nginx. Ele é utilizado para diversas tarefas como balanceamento de carga de servidores back end, como um servidor para hospedar sites, como um proxy reverso para lidar com requisições de clientes web, entre outros.

Apos subir o container, ele disponibiliza-ra a porta 80, e podemos ver isso através do comando `docker ps` em um segundo terminal. Porem ao entrar em um navegador e digitar o endereço `localhost:80`, não aparece nada. Isso ocorre devido ao fato de termos **duas instancias diferentes**, uma sendo o docker host (maquina que esta executando o docker) e o container. A porta disponibilizada pelo Nginx **esta na rede do docker**, enquanto a nossa maquina possui outra rede. Logo se a tentativa fosse feita em um outro container, como por exemplo o ubuntu do tópico anterior, ele conseguiria conectar nessa porta.

### Redirecionando a porta do container

O docker disponibiliza um ferramenta para fazer o redirecionamento de porta, que é a opção `-p` ou `--publish`. Ela ira publicar uma porta na maquina host (não necessariamente o Docker Host, uma vez que ele pode estar até em outra maquina) que ira encaminhar o trafego para a porta do container. Dessa forma podermos executar o container do Nginx com o comando:

```bash
docker run -p 8080:80 nginx
```

Apos a opção *-p* informamos as portas. A primeira é a porta que iremos publicar no host, e a segunda é a porta do container que desejamos redirecionar. Agora ao tentar entrar no endereço `localhost:8080`, iremos receber as informações do Nginx.

> Lembrando que podemos publicar qualquer porta no host, porem a porta do container tem que ser a que foi configurada quando o mesmo subiu, e por padrão o Nginx sobe a porta 80.

## Separando o terminal do host e do container

Quando executamos o Nginx o terminal ficou travado no container, e exibindo todos os logs do nginx. Porem podemos executar esse container em segundo plano sem que o terminal fique preso. E isso pode ser feito com a opção `-d` ou `--detach`. Utilizando o comando anterior como exemplo, logo ficaria `docker run -d -p 80:80 nginx`.

## Trabalhando com o histórico de containers

Além de um recurso visual e informativo, podemos utilizar o histórico de container (*docker ps -a*) para outros fins, e, para essa tarefa temos alguns comandos:

- `docker start <ID ou NOME>` : serve para iniciar um contêiner que está parado. Basta adicionar o ID ou nome do contêiner que você deseja iniciar. Por exemplo: `docker start 538597f60787`.

- `docker restart <ID ou NOME>` : serve para reiniciar um contêiner em execução. Útil quando é necessário reiniciar um serviço dentro do contêiner.

- `docker stop <ID ou NOME>` : serve para parar um contêiner em execução. Encerra o contêiner de forma controlada.

- `docker rm <ID ou NOME>` : serve para remover um contêiner do histórico. É necessário parar um contêiner antes de removê-lo, ou utilizar a opção `-f` (force). Por exemplo `docker rm pensive_mendeleev -f`.

- `docker rm $(docker ps -a -q)` : remove todos os contêineres parados no sistema.

- `docker logs <ID ou NOME>` : serve para ver os logs de um contêiner.

## Nomes para os containers

Por padrão o Docker adicionar nomes aleatórios aos containers, porem podemos escolher um nome para eles utilizando a opção `--name`. Por exemplo o comando `docker run --name nginx_web -d -p 8080:80 nginx`.

## Executando comandos no container

O comando `exec` serve para executarmos outros comando dentro de um container que ja esta rodando. Podemos por exemplo executar o bash dentro do container do Nginx utilizando o comando `docker exec -it nginx_web bash`, lembrando de utilizar as opções *-it* para tornar o terminal interativo. Com isso teremos o terminal anexado com o bash do container.

Agora, suponhamos que seja necessário editar o arquivo *index.html* do Nginx no caminho `/usr/share/nginx/html/`, podemos então utilizar o popular **Vim**, e, como a imagem do Nginx é baseado no Ubuntu, bastaria efetuar um `apt-get install vim` para instala-lo, porem como grande parte do cache da imagem foi removida, é preciso primeiro executar o comando `apt-get update` para instalar as dependências. Após fazer o update e a instalação, podemos utilizar o comando `vim index.html` (caso ja esteja no caminho mencionado) para abrir o editor do arquivo.

## Trabalhando com volumes

Como vimos até o momento, os containers tem apenas uma camada de escrita e leitura que apos ele ser derrubado são perdidos, porem podemos criar um **volume** para salvar essas informações. Um volume é uma forma de persistir os dados dos containers e até mesmo para compartilhar informações entre eles.

Podemos criar um volume explicitamente com o comando `docker volume create`, ou de forma automática no momento de subir um container utilizando as opções `-v` ou `--mount`. Vamos olhar com mais detalhe essas duas opções.

### Criando um Bind Mount com -v e --mount

Primeiramente vamos criar um *bind mount*, que pode ser utilizado para persistir os dados, porem não é gerenciado pelo docker e os dados não são automaticamente salvos na pasta, mas possui uma vantagem de poder ser montado a partir de qualquer local no sistema. O que ele faz é juntar uma pasta no host (maquina que roda o docker) com uma pasta dentro do container.

As opções `-v` e `--mount` possuem muitas semelhanças e, o que mais difere as duas são a sintaxe. Porem a opção `-v` é mais antiga e compatível com versões mais antigas do docker. Já o `--mount` é uma opção mais nova e possui uma sintaxe mais explicita do que esta sendo executado. Vejamos um exemplo de cada:

- Utilizando a opção -v

```bash
docker run -d --name nginx -p 8080:80 -v /home/user/html:/usr/share/nginx/html
```

- Utilizando a opção --mount

```bash
docker run -d --name nginx -p 8080:80 --mount type=bind,source="$(pwd)"/html,target=/usr/share/nginx/html
```

Como é possível notar, com o **mount** a ação de montar um volume é mais explicita, temos o tipo sendo *bind* pois queremos *ligar* uma pasta na outra, temos o caminho na maquina sendo o *source* e o caminho alvo no container sendo o *target*. Já com a opção **-v**, separamos a pasta no host da pasta no container através do `:`.

É necessário utilizar o caminho completo para a pasta, e nos exemplos utilizamos duas formas diferentes, uma passando o caminho completo e outro utilizando o `"$(pwd)"` para pegar o caminho atual do terminal.

Uma outra diferença importante é que, o **-v** cria o diretório no host caso ele não exista. Já para o diretório no container, ambos conseguem criar.

### Criando um volume

Os volumes são mais indicados para serem utilizados pois são gerenciados pelo Docker, a persistência ocorre de maneira automática, são mais flexíveis correlação aos diretórios, entre outros. Vejamos então uma forma de criar um volume:

```bash
docker volume create my_volume
```

Com isso criamos um volume com o nome *my_volume*, e, apos isso é possível mapear esse volume para dentro de uma pasta no container.

```bash
docker run --name nginx_volume -d -p 8080:80 --mount type=volume,source=my_volume,target=/app nginx

docker run --name nginx_volume -d -p 8080:80 -v my_volume:/app nginx
```

Podemos utilizar qualquer uma das duas opções, porem é preciso notar que agora o tipo do mount é **volume**, no *source* colocamos o nome do volume e no *target* colocamos o nome da pasta que sera mapeado o volume no container. Lembrando que o *mount* consegue criar a pasta dentro do container caso ela não exista.

Caso seja adicionado um novo container também com esse volume, os dois poderão compartilhar informação através do volume Docker.

### Limpando os volumes

Caso seja necessário remover todos os volumes da maquina, podemos utilizar o seguinte comando:

```bash
docker volume prune
```

## Docker Hub

O image registry padrão é o Docker Hub, ou seja, sempre que o Docker não encontrar uma imagem na maquina, ele ira procurar no Hub se aquela imagem existe, e, caso exista efetua o download. Podemos também baixar uma imagem para o repositório local utilizando o comando `docker pull nome_da_imagem`, não sendo necessário subir um container só para efetuar o download da mesma. Lembrando que apos o nome da imagem, é possível escolher a versão dela:

```bash
docker pull ubuntu:mantic-20230819
```

## Network

Anteriormente vimos que o network padrão gerado pelo docker é o *bridge*, porem existem outros tipos de conexão, que são eles:

- **Bridge** : esse é o network padrão no docker quando é criado um novo container. O docker gera uma rede privada na qual o containers podem se comunicar entre si, mas não com o host ou outros dispositivos externos. Ou seja, ele promove um isolamento de rede a menos que seja configurado de outra forma.

- **Host** : mescla a rede do host com a rede dos containers, o que significa que o contêiner não tem sua própria interface de rede. Isso pode gerar um desempenho ligeiramente melhor se comparado com as redes bridge, pois elimina a sobrecarga da tradução de endereços de rede (NAT). No entanto, é importante salientar que pode ser menos seguro em alguns cenários, uma vez que o contêiner está diretamente exposto à rede do host.

- **Overlay** : este tipo de rede é utilizado para permitir que containers em diferentes hosts se comuniquem entre si, criando uma rede que abrange vários hosts. Essa tipo de network é frequentemente usada em clusters de **Docker Swarm** (ferramenta de orquestração de contêineres nativa do Docker) ou Kubernetes para facilitar a comunicação entre contêineres em diferentes nós, permitindo que a aplicação docker tenha uma maior escala.

- **Macvlan** : a rede macvlan permite que os contêineres se conectem diretamente à rede física do host, onde é preciso definir um mac address para cada container que se conecte na rede. É um tipo de network pouco utilizado.

- **None Network** : é utilizado apenas para desabilitar completamente a rede em um contêiner. Pode ser util quando é preciso isolar um container de qualquer conexão.

Para verificar a lista de comando disponíveis para a parte de network, basta digitar `docker network`. Um dos comando que exibe todos os networks da maquina é o `docker network ls`.

## Trabalhando com Bridge network

Como este tipo de network é o mais utilizado, vamos criar alguns containers e testar o funcionamento dessa rede.

```bash
docker run -d -it --name ubuntu1 bash

docker run -d -it --name ubuntu2 bash
```

Note que apesar de rodar o container com a opção `-it` para tornar o terminal interativo, utilizamos também o `-d` que desanexa o terminal. Logo sera necessário anexar novamente o terminal para poder executar algum comando, mas veremos isso no tópico seguinte.

Uma das opções da lista de comandos exibidas pelo *docker network* é o **inspect**, que como o nome sugere serve para inspecionar uma rede.

```bash
docker network inspect bridge
```

Ele exibira um json com diversas informações sobre a rede *bridge* e dentre elas a opção *Containers*, que mostra todos os containers que no momento estão utilizando este tipo de network, nesse caso o *ubuntu1* e *ubuntu2*. Algumas informações sobre os containers também serão exibidas, como o endereço Mac e o ipv4.

### Anexando o terminal com o shell do container

Para anexar o terminal novamente podemos tanto utilizar o comando `docker exec` como o `docker attach`, mas nesse caso vamos usar a segunda opção.

```bash
docker attach ubuntu1
```

Agora podemos *pingar* o outro container para conferir que estão na mesma rede utilizando o comando `ping 172.17.0.3`. Porem com a configuração padrão do network bridge, a rede **não faz a resolução de nome**, ou seja, não conseguimos efetuar uma conexão utilizando o nome do container, por exemplo `ping ubuntu2`.

### Criando um network personalizado

Caso seja necessário a funcionalidade de resolução de nome na rede, podemos criar um network personalizado, vejamos abaixo:

```bash
docker network create --driver bridge redepersonalizada
```

Com isso criamos um network do tipo bridge com o nome *redepersonalizada*. É possível verificar essa nova rede com o `docker network ls`. Agora vamos criar dois containers nessa rede.

```bash
docker run -dit --name ubuntu1 --network redepersonalizada bash

docker run -dit --name ubuntu2 --network redepersonalizada bash
```

Para selecionar em que rede o container sera criado, basta passar a opção `--network` com o nome do network.

Entrando no ubuntu1 e efetuando um `ping ubuntu2`, verificamos que agora esse comando funciona com o nome do container.

Caso seja criado um terceiro container que esteja na rede padrão bridge, ele não poderá se conectar com os outros dois containers, pois são redes separadas. Porem podemos conectar manualmente esse container na rede personalizada.

```bash
docker network connect redepersonalizada ubuntu3
```

Com isso o container ubuntu3 se conectou na rede personalizada, e, agora possui acesso as novas funcionalidades dessa rede. Case seja feito um `network inspect` na rede *bridge* e na *redepersonalizada*, perceberemos que o ubuntu3 esta em ambas.

## Trabalhando com Host network

Este tipo de network também é muito importante de se conhecer, apesar de ser muito simples de compreender seu funcionamento. Como visto anteriormente este tipo mescla a rede do container com o do Host, vejamos um exemplo.

```bash
docker run -d --name nginxhost --network host nginx
```

Criando esse container com a rede *host*, podemos acessar o site do nginx apenas digitando o endereço `http://localhost` na maquina host, sem a necessidade de efetuar o bind das portas.

## Acessando o host através do container

Ainda falando sobre network, outro tipo de funcionalidade que pode ser necessária, é de o container precisar se conectar com a maquina host do docker, mas sem ter que criar uma rede para isso.

Suponhamos que estamos com alguma api rodando no host na porta 8080 e algum container precise se conectar a essa api, podemos usar o seguinte comando:

```bash
curl http://host.docker.internal:8080
```

Com esse endereço o container consegue acessar o host sem precisar do endereço ip ou de precisar estar em alguma rede especifica.
