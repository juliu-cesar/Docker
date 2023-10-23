FROM node:18

WORKDIR /usr/src

RUN echo '#!/bin/bash\nnpm install\nnode index.js' > start.sh

RUN chmod +x start.sh

WORKDIR /usr/src/app

EXPOSE 3000
ENTRYPOINT [ "../start.sh" ]