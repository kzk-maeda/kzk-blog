---
title: TerragruntでTerraformコードを「適度に」DRYにする
date: "2022-09-26T17:17:00.000Z"
description: "terrugruntを用いたworkspace脱却検証"
tags: ["terraform", "IaC", "AWS"]
---

# Overview
terraformのコードをDRYに保ったり、CLI実行を簡素化できるツール `terragrunt` を検証します。
ユースケースとしては `workspace` 管理されているterraform環境を `terragrunt` に移植するようなケースを想定します。

# Terraformのworkspace機能とは
https://www.terraform.io/language/state/workspaces

Terraform標準機能のひとつで、複数環境で同じTerraformコードを共有する際に利用できるソリューションです。

backendを自動で環境別で管理できたり、Terraformコード内に `${terraform.workspace}` 変数を用いて環境名を注入できるので、DRY性高くTerraformのコードを記述できます。

# Terragruntとは
https://terragrunt.gruntwork.io/

TerraformのコードをDRYでメンテナンス容易に行えるツールみたいです。
今回は `backend.tf` などの共通テンプレートファイルをDRYにする機能について検証していきます。

# モチベーション
そもそも `workspace` を用いてDRYに構成されたTerraform環境を、どういうモチベーションで脱したいのかの前提を記載します。
`workspace` の使い方次第ではありますが、過度にDRYを追求すると下記の様な弊害が生まれがちです
- 特定の環境だけ少し構成を変更することが難しい
- `terraform` コマンドの実行ディレクトリが環境ごとに分離されておらず、CI/CDツールとの相性が悪い

これは持論なのですが、Terraformはそもそもインフラストラクチャを宣言的に記述するためのツールで、アプリケーションコードと違い、環境ごとに過度なDRYを追求する必要性はなく、ある程度はコードの重複管理を許容しながら柔軟に管理していくのが好ましいと考えています。

このようなモチベーションで、過度にDRYに構成されたTerraform環境を脱し、適度にDRYにコード管理が可能な `terragrunt` を導入していくことを検討します。

# 基準環境構築
## Terraformプロジェクトの作成
`terragrunt` に移植する前の、基準となるTerraform環境を構築します。
要件は下記です
- 本番環境と開発環境を `env` 配下の `tfvars` ファイルで分離
- backendはS3を指定
- 基本となるリソースはプロジェクト直下の `main.tf` と、そこから呼び出される `modules` ディレクトリ配下で定義
  - 簡単のため、作成するリソースはS3のみにしています

作成したコードは下記です。
- https://github.com/kzk-maeda/terraform-ci/commit/69451d2eb449be25b352a0ab24897e28e18a9a96

  ```
  ├── Taskfile.yml
  ├── env
  │   ├── dev
  │   │   └── terraform.tfvars
  │   └── prod
  │   │   └── terraform.tfvars
  ├── module
  │   └── s3
  │       ├── main.tf
  │       ├── output.tf
  │       ├── provider.tf
  │       └── variables.tf
  ├── backend.tf
  ├── main.tf
  ├── provider.tf
  └── variable.tf
  ```

## 各環境にapply
最初に `terraform workspace new` コマンドを用いて必要なworkspaceを作成します。

  ```bash
  terraform workspace new dev
  terraform workspace new prod
  ```
  
plan / applyのコマンドは `Taskfile.yml` にまとめていますが、基本的にはworkspaceをselectして、引数に環境ごとの `terraform.tfvars` を渡す形になります。

  ```bash
  terraform plan -var-file ./env/`terraform workspace show`/terraform.tfvars
  terraform apply -var-file ./env/`terraform workspace show`/terraform.tfvars
  ```

すると、 `bachend.tf` に定義したバケットに対応し、remote backendに下記のようにstateファイルが作成されます。

  ```
  s3://env:/dev/path/to/terraform.tfstate
  s3://env:/prod/path/to/terraform.tfstate
  ```

ここでのポイントは、 `terraform workspace` に対応する環境が自動的に `:env/dev` や `:env/prod` というKeyに置き換えられているということです。
`terraform workspace` では、このようにして複数環境のstateファイルを分割管理します。

これでworkspace管理されたTerraformのプロジェクトが作成されたので、次にこれを `terragrunt` 管理のものに変更していきます。

# Terragruntの導入
## インストール
インストールは下記のサイトを参照の上環境に合わせて行います
- https://terragrunt.gruntwork.io/docs/getting-started/install/

基本的にはパッケージマネージャーで管理されているので難しくないはずです。

## stateファイルの移動
`terraform workspace` で作成されたstateファイルを `terragrunt` で管理できる場所に移動します。

前述の通り、 `terraform workspace` では下記のようなKeyの下にstateファイルが作成されます。

  ```
  s3://env:/dev/path/to/terraform.tfstate
  s3://env:/prod/path/to/terraform.tfstate
  ```

この `env:dev` の階層が曲者で、 `terragrunt` を用いる場合はこのKeyをそのまま利用できません
なので下記のKeyの下にstateファイルを移動します。

  ```
  s3://env/dev/path/to/terraform.tfstate
  s3://env/prod/path/to/terraform.tfstate
  ```

`env:` が `env` に変わりました。
`terragrunt` では後述する設定ファイルで定義する `${path_relative_to_include()}` 関数が `env/dev` などの環境別階層に置き換えられてstateファイルを参照するので、その形に合わせてstateファイルを移動します。

## terragruntに対応したコードに修正（dev)
次に作成済みのterraformコードを、 `terragunt` で管理可能な形式に修正します。

必要なステップは下記です。

1. `*.tf` ファイルを環境別ディレクトリに移動
2. `*.tf` ファイル内で `terraform.workspace` を用いて値を埋めている箇所を、 `vars` 経由で注入できる様に修正
3. `terragrunt` でDRYに管理できる `backend.tf` や `provider.tf` を git ignore
4. `terragrunt` 設定ファイルを作成・配置

### 1. `*.tf` ファイルを環境別ディレクトリに移動

上述のディレクトリ構成を、下記の様に変更します。

  ```
  ├── Taskfile.yml
  ├── env
  │   ├── dev
  │   │   ├── main.tf
  │   │   ├── variables.tf
  │   │   ├── terragrunt.hcl
  │   │   └── terraform.tfvars
  │   └── prod
  │   │   ├── main.tf
  │   │   ├── variables.tf  
  │   │   ├── terragrunt.hcl  
  │   │   └── terraform.tfvars
  ├── module
  │   └── s3
  │       ├── main.tf
  │       ├── output.tf
  │       ├── provider.tf
  │       └── variables.tf
  ├── .gitignore
  └── terragrunt.hcl
  ```

`main.tf` などが、プロジェクト直下から環境別ディレクトリの下に移動しています
`terragrunt.hcl` などのファイルについては後述します、今はこの階層にこういうファイルが作られるものと認識してください。

### 2. `*.tf` ファイル内で `terraform.workspace` を用いて値を埋めている箇所を、 `vars` 経由で注入できる様に修正

元の `main.tf` では下記の様な記述が散見されていました。

  ```hcl
  # main.tf
  resource "aws_s3_bucket" "this" {
    bucket = "${terraform.workspace}-${var.bucket_name}-${data.aws_caller_identity.current.account_id}"
  }
  ```

`${terraform.workspace}` で記述されている箇所は、指定されたworkspace名（ `dev` など）が入るのですが、workspaceから脱却するにあたってこの指定は使えなくなります。
（厳密にはbackendに記述された `env:` Keyの下の値を参照しています）

これをvars経由で取得する形式に変更します。

  ```
  # main.tf
  resource "aws_s3_bucket" "this" {
    bucket = "${var.env}-${var.bucket_name}-${data.aws_caller_identity.current.account_id}"
  }
  ```

あとは `variables.tf` など修正してvars経由で `env` 変数を注入できるようにすればOKです。


### 3. `terragrunt` でDRYに管理できる `backend.tf` や `provider.tf` を git ignore
次のstepで `terragrunt` を導入しますが、 `terragrunt` は実行すると対象のディレクトリに `backend.tf` や `provider.tf` を作成しにいきます。
せっかくこれらのファイルをDRYに管理できるようにしようとしているので、作成するたびにgit管理下に置かれると結局管理対象ファイルが増えてしまい、メリットが享受できません。

なので `.gitignore` でこれらのファイルをignoreします。

  ```
  # .gitignre
  backend.tf
  provider.tf
  ```

### 4. `terragrunt` 設定ファイルを作成・配置
`terragrunt` 設定ファイルを、プロジェクト直下と環境ごとのディレクトリの２ヶ所に配置します。
設定ファイル名はどちらも `terragrunt.hcl` です。

まず、プロジェクト直下の設定ファイルは下記の様に記述します。
  ```
  remote_state {
    backend = "s3"
    generate = {
      path      = "backend.tf"
      if_exists = "overwrite_terragrunt"
    }
    config = {
      bucket = "kzk-sandbox-terraform-tfstate"

      key = "${path_relative_to_include()}/terragrunt/terraform.tfstate"
      region         = "ap-northeast-1"
      encrypt        = true
    }
  }

  generate "provider" {
    path = "provider.tf"
    if_exists = "overwrite_terragrunt"
    contents = <<EOF
  provider "aws" {
    region                  = "ap-northeast-1"
    version                 = "~>4.0"
    shared_credentials_file = ".aws/credential"
    profile                 = "ci"
  }
  data "aws_caller_identity" "current" {}
  data "aws_region" "current" {}
  EOF
  }
  ```

`remote_state` ブロックでは、 `backend.tf` に記述する内容のテンプレートを書きます。

`"${path_relative_to_include()}/` に注目してください。
この階層が、前述した `env/dev` などのKeyに置換されることになります。

`generate "provider"` ブロックでは、 `provider.tf` に記述する内容を書きます。


次に、環境別ディレクトリ配下の設定ファイルを記述します。

  ```
  include "root" {
    path = find_in_parent_folders()
  }
  ```

これら2つの設定ファイルを配置することで、環境別に分散したterraformコードのうち、共通で利用できるものをDRYに記述することができます。

## stateファイルを指定してplanを実行
`terragrunt` は専用コマンドを実行することで `terraform` ライクに操作することが可能です。
環境別のディレクトリに移動して、 `terragrunt` コマンドを実行します。

  ```
  cd path/to/env/dev/
  terragrunt init
  terragrunt plan
  terragrunt apply
  ```

`terragrunt init` を実行することで、 `env/dev` ディレクトリの下に `backend.tf` と `provider.tf` が作成されるのが見えるかと思います。
その後 `plan` / `apply` とおなじみのコマンドを実行して環境に差分を適用しましょう。


この手順で `terragrunt` を当てることができたかと思います。
参考の差分はこちらです。

https://github.com/kzk-maeda/terraform-ci/pull/26



# 最後に
`terraform workspace` から `terragrunt` に移行する手順を記載しました。

複数環境のTerraformコードをDRYに管理するのに、最初はmoduleの導入から始め次にworkspaceへ、という流れを踏んでいるところは一定数あるかと思いますが、過度にDRYに記述する弊害を感じてworkspaceから脱却したい、ただ、無駄に同じファイルを重複管理したくない、といった時に利用できるソリューションとして `terragrunt` を試してみました。

Terraformのベストプラクティスに則った管理はまだまだ自分の中でも勉強中で、今回導入検証した `terragrunt` は、環境ごとの柔軟性を担保しつつ、ある程度DRYにコード管理できるちょうどいいソリューションに感じました。

同じ悩みを感じている方になんらかの参考になれば幸いです。
