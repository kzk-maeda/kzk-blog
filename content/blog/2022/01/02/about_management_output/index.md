---
title: "マネジメントの仕事と成果について"
date: "2022-01-02T20:35:00.000Z"
description: "エンジニアの頃は仕事の成果がわかりやすかった。マネージャーになってから、何が成果なのかわからなくなった。そんな話"
tags: ["poem"]
---

# 最近思っていること

2021年にエンジニアマネージャーとしての仕事を始めてから、1年が経ちました。

これまでのキャリアで、エンジニアを始め、法務、コンサルティング、システムディレクション、プロジェクトマネジメントなどいくつかの職務を経験してきましたが、エンジニアマネジメント、特に人や組織といった経営資源のマネジメントはこれまでの仕事に比べて大きく異質に感じる部分が多く、そのギャップに日々悩みを抱えています。

一方で、自分が何について悩んでいるのか、もやもやしているのかをこれまでうまく言語化できていなかったので、2022年明けの休み期間を使ってちょっと考え、言語化してみました。


# 仕事と成果
そもそも、仕事とは価値変換だと個人的に考えています。
なんらかの課題が、自分のところに流れてき、それを変換して別の誰か/何かにパスするというイメージです。

関数、Functionに近いものを個人的にイメージしていて、入力 `x` が自分の仕事関数 `f` を経由することで、出力 `y` に変換されるようなものだと考えています。

```
y = f(x)
```

この時出力される `y` が、その人の仕事の成果です。

また、そもそも仕事は1人で完結して価値提供できるものはむしろ少なく、自分が出した小さな成果 `y` が、他の誰かの仕事 `f'` によって更に価値変換されたり、より大きな系（システム）の一部として作用して大きな価値 `Y` を生み出すようなことが行われているような関係性だと思っています。

```
Y = F(Σf'(y(x)))
```

このとき、成果物を僕は2つに分けて考えています。
一つは、個人の仕事/タスクの結果生み出された小さな成果物 `y` で、もう一つは、その小さな `y` が更に変換され、価値が積み重なり、より大きな成果物となった `Y` です。
便宜的に `y` を一次成果物、 `Y` をニ次成果物物と呼ぶこととします。

これは自分が経験してきたそれぞれの仕事においてもよく当てはまると思っていて、

- エンジニア
  - 一次成果物 : 自分で立てたサーバや書いたコードなど
  - ニ次成果物 : 提供機能・サービス
- システムディレクター
  - 一次成果物 : 要件定義書など
  - ニ次成果物 : 開発機能
- プロジェクトマネージャー
  - 一次成果物 : プロジェクト憲章、WBS、報告資料など
  - ニ次成果物 : プロジェクトスコープ（リリース成果物）

といったように関連づけされると思っています。

# マネジメントと成果

上記の、仕事と成果物の対応を整理して感じることは、これまで僕が経験してきた職種では、一次成果物もニ次成果物もそれなりに高い解像度でイメージでき、また、その成果物による実際の成果も肌で感じやすい距離感にあったなということです。

エンジニアメインでワークしていた時は、担当しているチケットの消化状況で一次成果物に対する達成感を感じることができるし、それらの塊が機能としてリリースされると、より大きな達成感を得ることができます。

プロジェクトマネージャーに関しては、もう少し達成感までの成果の抽象度が上がりますが、それでも最初にプロジェクト憲章の中で「Why/What/How」や「QCDS」を明確にして、期限を決めて走っているので、ゴールに対する心理的距離は近く、やり遂げたときの達成感も一入です。


一方、エンジニアマネージャーとして組織や人をメインで見るようになった時、これらの一次成果物・ニ次成果物に対する抽象度が非常に高くなることを感じています。


- エンジニア（組織）マネージャー
  - 一次成果物 : 組織図？、1on1ノート？、OKRシート？、チームカルチャー定義？
  - ニ次成果物 : 
    - 良い組織？
      - 心理的安全性？メンバーコンディション？離職率？
    - チームでの開発成果物？
      - バリューストリーム？デプロイ回数？


「組織を理想的な状態にする」、「良いチームをつくる」、といったのが組織マネジメントの究極のゴールだと思うのですが、それが一体何で、どういう一次成果物を積み上げ、他の仕事と相互作用させると目指すべきニ次成果物に到達できるのかがイメージできてなく、五里霧中、暗中模索状態を繰り返しているという実感があります。


# これからどうしたいか
「組織を理想的な状態にする」、「良いチームをつくる」という目標の抽象度が高すぎることで、何から手をつけるかも明確にできないまま、所謂マネージャー業務に奔走していた、というのが去年の自分だったのかなと思っています。

なので、この状況を打破するため、まずは抽象的な「マネージャー業務」を細分化し、優先度を決めて、それぞれに何をニ次成果物として目指すのかを明確にすることから始めてみようと思います。

ざっくりとマネージャー業務としてありうるのは

- 組織構築
  - 組織編成
  - 開発リソース調整
- 育成・メンタリング
  - 目標設計
  - 1on1
  - オンボーディング
  - 評価
- 採用
  - 書類選考
  - 面談・面接
  - 引き継ぎ
  

などでしょうか、真面目にリストアップしていくとまだまだ出てきますが、ここはイメージだけ。

それぞれの項目ごとにニ次成果物、つまり最終的に自分以外の人や系による価値変換、積み重ねを経て目指したい成果を明確に定義し、更にそれらに優先順位を立てることで、注力すべきことと力を抜く、あるいは別の人に委譲すべきことをはっきりとさせることが一手目に必要だと感じました。

また、当然ですがそれを経営陣や自チームメンバー、あるいは協業する他チームメンバーと認識合わせを行うことも重要です。

昨年うまくこなすことができなかったマネージャー業務、今年は計画立ててうまく成果に繋げていきたいという年始の所信表明でした。