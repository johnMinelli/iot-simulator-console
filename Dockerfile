FROM centos:7

MAINTAINER Jens Reimann <jreimann@redhat.com>
LABEL maintainer="Jens Reimann <jreimann@redhat.com>"

EXPOSE 8080

RUN mkdir -p /console
ADD . /console/iot-simulator-console

RUN \
    yum -y update && \
    yum -y install epel-release && \
    curl -sL https://rpm.nodesource.com/setup_10.x | bash -  && \
    yum -y install nodejs gcc-c++ make && \
    node --version && \
    cd /console/iot-simulator-console && \
    npm install serve && \
    npm install && \
    npm run build && \
#    cd cmd && \
#    go build -o /iot-simulator-console . && \
#    cd .. && \
    mv build / && \
#    echo "Clean up" && \
#    rm -Rf go && \
#    yum -y history undo last && yum -y clean all && \
    true
