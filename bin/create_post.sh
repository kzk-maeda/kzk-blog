#!/bin/bash

datehour=`date '+%Y%m%d%H'`
title=$1

if [ -z ${title} ]; then
    echo "input title"
    exit
else
    echo ${datehour}-${title}
    blogDir="${datehour}-${title}"
fi

SCRIPT_DIR=$(cd $(dirname $0); pwd)
echo ${SCRIPT_DIR}
PARENT_DIR=${SCRIPT_DIR}/../

mkdir ${PARENT_DIR}content/blog/${blogDir}

cat <<EOS >> ${PARENT_DIR}content/blog/${blogDir}/index.md 
---
title: 
date: 
description: 
tags: 
---
EOS

code ${PARENT_DIR}

cd ${PARENT_DIR}
yarn develop