FROM node:16-bullseye-slim
LABEL maintainer="Adrian Oanca (adrian.oanca@rpmanetworks.com)"

#ENV DEBIAN_FRONTEND noninteractive
ENV LC_ALL en_US.UTF-8
ENV LANG ${LC_ALL}

ENV project webthing-server
COPY . /usr/local/${project}/${project}
WORKDIR /usr/local/${project}/${project}
RUN echo "#log: ${project}: Preparing sources" \
  && set -x \
  && which npm \
  && npm --version \
  && npm install \
  && sync

# && apt-get install -y procps tcpdump && rm -rf /var/lib/apt/lists/*

EXPOSE 8888
WORKDIR /usr/local/${project}/${project}
ENTRYPOINT [ "/usr/local/bin/npm", "run" ]
CMD [ "uc1" ]
