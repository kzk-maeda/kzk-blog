#!/bin/bash

# "2021-01-12T00:00:00.000Z"
datehour=`date '+%Y-%m-%dT%H:%M:00.000Z'`
year=`date '+%Y'`
month=`date '+%m'`
day=`date '+%d'`
title=$1

if [ -z ${title} ]; then
    echo "input title"
    exit
else
    echo "${year}/${month}/${day}/${title}"
    blogDir="${year}/${month}/${day}/${title}"
fi

SCRIPT_DIR=$(cd $(dirname $0); pwd)
echo ${SCRIPT_DIR}
PARENT_DIR=${SCRIPT_DIR}/../

mkdir -p ${PARENT_DIR}content/blog/${blogDir}

cat <<EOS >> ${PARENT_DIR}content/blog/${blogDir}/index.md 
---
title: 
date: "${datehour}"
description: 
tags: 
---
EOS

code ${PARENT_DIR}

cd ${PARENT_DIR}
# yarn develop