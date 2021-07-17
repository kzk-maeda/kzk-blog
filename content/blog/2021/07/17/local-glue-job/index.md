---
title: "ローカル環境でGlueJobを開発する"
date: "2021-07-17T23:54:00.000Z"
description: "マネコンからいちいちGlueJob触ってデバッグするの大変だったので重い腰を上げてローカル環境構築した"
tags: ["AWS", "DataPlatform"]
---

# Overview
- 仕事の関係でGlueJobを用いたETLを書くことが多いのですが、これまでは面倒でちょっとした変更検証などもずっとAWSのマネコンから行ってました
- ただ、ちょっとした変更の途中でのデータを見たりするためだけにマネコンでGlueJob動かすのお金がもったいないなと思い始めて、先日ようやくローカルでGlueJobを実行できる環境を準備しました
- その時の備忘録です
- AWS SSO環境を想定していますが、鍵の渡し方が変わるだけです

# 環境構築
## 0. AWS Credentials準備
- 作業用ディレクトリに移動
- AWSのlocal profileで使用する `.aws/config` と `.aws/credentials` を作成
    - credentialsに記述する鍵情報はAWS SSOの ` Command line or programmatic access` から取得

    ```bash
    # 例：WorkDirの下にsecretsディレクトリを作成してcredentialファイルを配置
    $ ls -l ./secrets
    total 16
    -rw-r--r--  1 kzk_maeda  staff    43  6 14 22:49 config
    -rw-r--r--  1 kzk_maeda  staff  1058  6 23 12:37 credentials
    
    # defaultプロファイルとして記述
    $ cat ./secrets/config
    [default]
    region=ap-northeast-1
    output=json
    
    $ cat ./secrets/credentials
    [default]
    aws_access_key_id=<AWS_ACCESS_KEY_ID>
    aws_secret_access_key=<AWS_SECRET_ACCESS_KEY>
    aws_session_token=<AWS_SESSION_TOKEN>
    ```

## 1. イメージ立ち上げ
- AWS公式のDocker Imageを手元にPull

    ```bash
    $ docker pull amazon/aws-glue-libs:glue_libs_1.0.0_image_01
    ```

- Docker起動
    - 基本コマンド
        ```bash
        docker run -itd -p <port_on_host>:<port_on_container_either_8888_or_8080> -p 4040:4040 <credential_setup_to_access_AWS_resources> --name <container_name> amazon/aws-glue-libs:glue_libs_1.0.0_image_01 <command_to_start_notebook_server>
        ```

    - 例：Jupyter notebook利用、step0で用意したcredentials利用の場合
        ```bash
        docker run -itd -p 8888:8888 -p 4040:4040 -v ${PWD}/secrets:/root/.aws:ro --name glue_jupyter amazon/aws-glue-libs:glue_libs_1.0.0_image_01 /home/jupyter/jupyter_start.sh
        ```

## 2. Job開発
- Jupyter notebookには `localhost:8888` からアクセス
- Pyspark用のファイルを新規に作成して、GlueJobを記述
    - GlueContextの定義が、Glue Consoleから作成したJobと異なります
        ```python
        from awsglue.transforms import Map, DropNullFields
        from awsglue.utils import getResolvedOptions
        from pyspark.context import SparkContext
        from awsglue.context import GlueContext
        from awsglue.dynamicframe import DynamicFrame
        
        glueContext = GlueContext(SparkContext.getOrCreate())  # here
        ```

    - AWSのcredentialsがコンテナにマウントされているので、権限のあるAWSリソースにアクセスできる→S3から直接DataSetを読み込むことなど可能です

        ```python
        dyf = glueContext.create_dynamic_frame.from_options(
            connection_type="s3",
            connection_options={"paths":[INPUT_S3_PATH], "recurse": True},
            format="json",
        )
        ```
        - <span style="color: red">注意：あまりにも大きなDataSetをローカルに持ってくるとリソースがしんどいので、小さなDataであることを確認するか、テスト用に切り出してローカルに持ってくるかした方がいいです</span>

### 開発Tips
- [count](https://docs.aws.amazon.com/ja_jp/glue/latest/dg/aws-glue-api-crawler-pyspark-extensions-dynamic-frame.html#aws-glue-api-crawler-pyspark-extensions-dynamic-frame-count)や[printSchema](https://docs.aws.amazon.com/ja_jp/glue/latest/dg/aws-glue-api-crawler-pyspark-extensions-dynamic-frame.html#aws-glue-api-crawler-pyspark-extensions-dynamic-frame-printSchema)など活用して、ジョブのStepごとの状況確認がやりやすくなります
- docker内のローカルにDynamicFrame/DataFrameを出力して経過を確認することもできます
    - その際、 `/home/jupyter/jupyter_default_dir/` の下に出すとJupyterのコンソールから確認し易いです
        ```python
        LOCAL_PATH = f'/home/jupyter/jupyter_default_dir/path/to/{table_name}'
        df = dyf.toDF()
        df.repartition(1).write.mode("overwrite").format("json").save(LOCAL_PATH)
        ```
- 途中で出力されるエラーも同様にファイル書き出しして精査できます
    ```python
    errors = dyf.errorsAsDynamicFrame().toDF().toPandas()
    errors.to_json(r'/home/jupyter/jupyter_default_dir/errors/erros.json')
    ```
- 結果を直接S3に書き出して、GlueCrawler + Athenaで確認することもできます。その際に既存のデータを上書きしてしまわないようtmpディレクトリなどに出力することを推奨します
- 一定期間Jupyterを操作していないと、セッションが失われます
    - その場合はkernelのrestartかコンテナ自体のrestartで再開できます（他のいいやり方知りたい）
- AWS SSOで払い出されたTokenがexpiredになったら、dockerにマウントしているcredentialsファイルを修正してください

# 免責
- 僕もまだ使い始めたところで、効率的なローカル開発方法の追求に至っておりません
- いいTips見つけたら更新していくつもりですが、他にもいいやり方あったらぜひ教えていただきたいです

# 参考
- https://aws.amazon.com/jp/blogs/big-data/developing-aws-glue-etl-jobs-locally-using-a-container/
- https://hub.docker.com/r/amazon/aws-glue-libs
- https://docs.aws.amazon.com/glue/latest/dg/aws-glue-programming-etl-libraries.html#develop-local-python