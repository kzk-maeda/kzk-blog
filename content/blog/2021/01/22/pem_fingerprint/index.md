---
title: "ssh秘密鍵のfingerprintを確認" 
date: "2021-01-22T22:24:00.000Z"
description: "ssh秘密鍵のfingerprintから使用すべき鍵を特定する方法"
tags: ["AWS"]
---

# Overview
- EC2にsshするための秘密鍵(KeyPair)が複数あり、どの鍵がローカルにストアされているのか知りたい時、ローカルの鍵のfingerprintをみる必要がある
- 実際にfingerprintを参照する方法がややこしかったのでメモ

# Command
```bash
## AWSで作られたキーペアの秘密鍵ファイルが ~/.ssh/private.pem である場合
$ openssl pkcs8 -in ~/.ssh/private.pem -inform PEM -outform DER -topk8 -nocrypt | openssl sha1 -c
(stdin)= 5c:99:41:05:f9:05:a7:33:e2:92:ee:d9:80:cf:9a:75:6a:bc:43:ff
```

## Reference
https://serverfault.com/questions/549075/fingerprint-of-pem-ssh-key/697634?_fsi=zq6coYil#697634