FROM node:16-bullseye-slim
LABEL maintainer="Adrian Oanca (adrian.oanca@rpmanetworks.com)"

ENV DEBIAN_FRONTEND noninteractive
ENV LC_ALL en_US.UTF-8
ENV LANG ${LC_ALL}

ENV project webthing-client
COPY . /usr/local/${project}
WORKDIR /usr/local/${project}
RUN echo "#log: ${project}: Preparing sources" \
  && set -x \
  && npm install \
  && apt-get update \
  && apt-get install -y procps locales \
  && rm -rf /var/lib/apt/lists/*

RUN localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8

RUN mv /usr/local/${project}/npm-entrypoint.sh /usr/local/bin
ENTRYPOINT [ "npm-entrypoint.sh" ]
CMD [ "uc1" ]