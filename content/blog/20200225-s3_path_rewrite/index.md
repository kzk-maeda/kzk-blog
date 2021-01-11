---
title: "S3上ObjectのKeyを普通のdate形式からHive形式に変更する"
date: "2020-02-25T00:00:00.000Z"
description: "S3にとりあえず形式で出力してしまったログファイルのキー構成をHive形式に変換する方法"
tags: ["AWS" "DataPlatform"]
---

# 何を書いた記事か
ぼく「とりあえずアプリのログとか分析用データとかS3に吐き出しとこう！パス？後から考えればいいからとりあえず `yyyy-mm-dd` とかで切っておけばいいよ！」

〜１年後〜

ぼく「なんでこんな分析かけづらいパス形式でデータが保管されてるんや・・」

　　
という状態になってたのでなんとかしようという話です。

# 何が嬉しいのか
上の例のように、特に運用を考えずに下記のようなKeyでS3上に出力してしまっている場合

```
s3://BUCKET_NAME/path/to/2020-01-01/log.json
```

いざ分析にかけようと思ったとき、ここにおいたファイルに対してAthenaなどでクエリを投げる時、日付に対して適切なPartitionが効かせられないという状況に陥ります。

どういうことかというと、
「2019年1月のデータを横断的に分析しよう！」
と思っても、S3では `2019−01-01` のような文字列がKeyになっているだけで、 `2019-01-*` のようなクエリをかけることは至難の技です。


そこで、S3への保管の仕方をHive形式に変換することを考えます。Hive形式とは下記のような形式です。

```
s3://BUCKET_NAME/path/to/year=2020/month=01/date=01/log.json
```
このようなKeyでObjectを保管しておいて、Athenaのテーブル上でyyyy/mm/ddに対してPartitionを切ってあげると、SQLのWhere句で特定日付に区切ってクエリを実行することができるようになり、分析もしやすくなります。


ただ、S3はKey-Value形式でObjectを保管する形式のストレージなので、Objectに対するKeyをライトに一括変更することができません。
そこで、指定した期間のObjectに対して一括でKeyをHive形式に変更するスクリプトを作成し、Lambdaから実行しました。

# 作成したLambda関数

早速ですが、作成したLambdaは下記のようなシンプル１ファイルスクリプトです。

```python
import os
import boto3
from datetime import datetime, timedelta

# Load Environment Variables
S3_BUCKET_NAME = os.environ['S3_BUCKET_NAME']
S3_BEFORE_KEY = os.environ['S3_BEFORE_KEY']
S3_AFTER_KEY = os.environ['S3_AFTER_KEY']
S3_BEFORE_FORMAT = os.environ['S3_BEFORE_FORMAT']
FROM_DATE = os.environ['FROM_DATE']
TO_DATE = os.environ['TO_DATE']
DELETE_FRAG = os.environ['DELETE_FRAG']

def date_range(from_date: datetime, to_date: datetime):
    """
    Create Generator Range of Date

    Args:
        from_date (datetime) : datetime param of start date
        to_date (datetime) : datetime param of end date
    Returns:
        Generator
    """
    diff = (to_date - from_date).days + 1
    return (from_date + timedelta(i) for i in range(diff))

def pre_format_key():
    """
    Reformat S3 Key Parameter given 

    Args:
        None
    Returns:
        None
    """
    global S3_BEFORE_KEY
    global S3_AFTER_KEY
    if S3_BEFORE_KEY[-1] == '/':
        S3_BEFORE_KEY = S3_BEFORE_KEY[:-1]
    if S3_AFTER_KEY[-1] == '/':
        S3_AFTER_KEY = S3_AFTER_KEY[:-1]


def change_s3_key(date: datetime):
    """
    Change S3 key from datetime format to Hive format at specific date

    Args:
        date (datetime) : target date to change key
    Returns:
        None
    """
    before_date_str = datetime.strftime(date, S3_BEFORE_FORMAT)
    print('Change following date key format : {}'.format(before_date_str))
    before_path = f'{S3_BEFORE_KEY}/{before_date_str}/'
    after_path = "{}/year={}/month={}/date={}".format(
        S3_AFTER_KEY, date.strftime('%Y'), date.strftime('%m'), date.strftime('%d')
    )
    
    s3 = boto3.client('s3')
    response = s3.list_objects_v2(
        Bucket=S3_BUCKET_NAME,
        Delimiter="/",
        Prefix=before_path
    )
    try:
        for content in response["Contents"]:
            key = content['Key']
            file_name = key.split('/')[-1]
            after_key = f'{after_path}/{file_name}'
            s3.copy_object(
                Bucket=S3_BUCKET_NAME,
                CopySource={'Bucket': S3_BUCKET_NAME, 'Key': key},
                Key=after_key
            )
            if DELETE_FRAG == 'True':
                s3.delete_object(Bucket=S3_BUCKET_NAME, Key=key)
    except Exception as e:
        print(e)
        return


def lambda_handler(event, context):
    pre_format_key()
    from_date = datetime.strptime(FROM_DATE, "%Y%m%d")
    to_date = datetime.strptime(TO_DATE, "%Y%m%d")
    for date in date_range(from_date, to_date):
        change_s3_key(date)

```

実行時には下記の設定をLambdaで入れてあげる必要があります。

- 環境変数に下記を設定

| 環境変数 | 値 | 備考 |
|-----------------|------------------|------------------|
| S3_BUCKET_NAME | S3バケット名 |  |
| S3_BEFORE_KEY | 変更前S3キー（path/to） |  |
| S3_AFTER_KEY | 変更前S3キー（path/to） | キーの移動が不要であれば上と同じ値 |
| S3_BEFORE_FORMAT | 変更前日付フォーマット | `%Y-%m-%d` など、Pythonのdatetimeが認識できる形式 |
| FROM_DATE | 開始日(yyyymmdd) | キー変更を行いたいObjectの始点 |
| TO_DATE | 終了日(yyyymmdd) | キー変更を行いたいObjectの終点 |
| DELETE_FRAG | True/False | 元のObjectを削除するかどうか |


- Lambdaの実行RoleにS3の対象バケットの操作権限を付与
- 実行時間や割り当てメモリは適宜調整


必要な設定は環境変数化したので、自分の環境に合わせて好きに設定していただければと思います。
また、エラーハンドリングは面倒で実装していません。
一度だけSPOTで実行するスクリプトなので最小限の実装に止めています。気になる方は修正してください。


# 結果
既存のS3 Keyに対して通常のdate形式からHive形式に変更し、無事に分析しやすい形式にすることができました。

追加情報ですが、path/to/のレイヤーでGlue Cralwerを実行すると、Athenaで読み込めるData CatalogがPartition含めて自動的に生成されるので、よりAthenaでの分析ライフが充実したものとなります。

ここの実装がおかしいとか、もっとこうした方がいいとかあれば教えてください！
大した内容ではありませんが、リポジトリも公開しておきます。
https://github.com/kzk-maeda/change-s3-key/blob/master/lambda_function.py
