---
title: "依存度の低い実装〜中級エンジニアを目指して"
date: "2020-02-04T00:00:00.000Z"
description: "Swiftでサンプルアプリを実装しながらメンテナンス性について考える"
tags: ["Swift"]
---

# 何を書いた記事か

駆け出し・初級エンジニアから、中級エンジニアに成長するための一つの指標として、コードの保守性、特にライブラリ依存について書きました。
駆け出し・初級エンジニアは、動くコードが書けさえすればいいのですが、中級エンジニアから、保守性の観点でコードが書けるようになるべきです。
でほ保守性の高いコードとは何なのか、その具体例として今回はライブラリ依存について考えていきます。

# 前提・使用技術

Swiftで実装した簡単なiOSアプリで、バックエンドとしてFirebaseを利用しているケースを例にあげます。
　※Swift/iOSの基本やFirebaseについては特に触れません。

# 雑に作ったアプリ
## アプリの概要
ログイン・サインアップ・Twitterログイン・プロファイル登録・登録内容確認の機能しか持たない、シンプルなアプリを作りました。
ログインやプロファイル登録などの各工程でFirebaseと通信を行なっています。
<img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/130140/7b233143-6446-27f1-2975-92ee27da2a79.png" width="620px">


## アプリの実装
Udemyなどでよく見る、下記の方法で実装しています。

- ソースはMVCライクに構造化されてはいる
- 一方、各ViewControllerに画面内での処理（Firebase通信含む）を全て記載している

ソースは、Model / View / Controllerごとにグルーピングして、storyboardはView層、ViewControllerはController層に配置しています（Modelはこの段階ではありません）
<img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/130140/3dbb9ad2-ddc5-8246-cce0-2248ec8ddaf7.png" width="620px">

一つのViewController、例えばLoginViewControllerを見ると、下記のように、Firebaseのライブラリを直接importして、Viewで実施したい処理を全て記載しています。

```swift
import UIKit
import Firebase

class LoginViewController: UIViewController {
    
    @IBOutlet weak var userIdField: UITextField!
    @IBOutlet weak var passwordField: UITextField!
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if segue.identifier == "loginSegue" {
            guard let userId = userIdField.text else {
                return
            }
            let resultVC: AuthResultViewController = segue.destination as! AuthResultViewController
            resultVC.userId = userId
        }
    }
    
    @IBAction func login(_ sender: Any) {
        guard let userId = userIdField.text else {
            return
        }
        guard let password = passwordField.text else {
            return
        }
        Auth.auth().signIn(withEmail: userId, password: password) { (result, error) in
            guard let result = result else {return}
            print(result)
            self.performSegue(withIdentifier: "loginSegue", sender: userId)
        }
    }
}

```

他のViewControllerでも同じように、Firebaseでの処理などその画面で行いたい操作を全て記載しています。


# 何が問題なのか？
出来上がったソース（ViewController）をみてみましょう。Firebase関連の処理部分を赤枠で囲ってあります。
<img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/130140/49fa9691-a6fa-064e-c322-e1a91b9dfe60.png" width="620px">
<img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/130140/79a2952b-64e4-1cae-90d4-e72750a7b75e.png" width="620px">

ではここで、バックエンドで利用しているFirebaseに仕様変更が入った、あるいはAmplifyや自前APIサーバなどに移行するなどの要件が発生して、コードのFirebase部分を変更しなければならなくなった状況をイメージしてみてください。

たった５画面のアプリなのに、**修正加える必要がある箇所が散らばっていて**、萎えませんか？
さらには変えたことによってViewの挙動が変わるリスクがあり、おいそれと手を入れたくない気持ちが勝手しまいそうです。

こういったコードは、動くことを最優先にして構成を考えずに書いてしまうと気づいたら出来上がってしまっているケースが多いです。
特に初学者の方の個人開発アプリなどで見かけます。
（世の中の教材の大半がこういう実装になってるので仕方ないかと。。）

# リファクタリング
## リファクタの方針
では修正に耐えられるようなコードに変えていきましょう。
やることはシンプルで、**「Firebase通信を行なっている箇所を一箇所にまとめ、VCとの依存を断ち切る」**です。

## 修正したコード
コードの構成は下記のようになります。Model層にファイルが増えていることがわかるかと思います。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/130140/c1dcca7f-ea5a-114b-4bd2-9f77ff0a2253.png)

まずはAPI通信系の処理で実装しなければいけないメソッドを集めたprotocolを作成します。

```swift
import Foundation

protocol APIClientProtocol {
    func signin(email: String, password: String,  completion: @escaping () -> Void)
    func createUser(email: String, password: String,  completion: @escaping () -> Void)
    func twitterLogin(comlpetion: @escaping () -> Void)
    func insertDB<T: Codable> (data: T, database: String, completion: @escaping () -> Void) -> String
    func selectDB(id: String, database: String, completion: @escaping ([String : Any]) -> Void)
    func timestampToString(date: NSObject) -> String
}
```

今回は実装しませんが、テストコード書くためにAPI処理をMock化してコンストラクタインジェクションするときなど、このProtocolは役に立つので、一旦Protocolを挟んで抽象化することには慣れておくといいと思います。

次に実際のFirebase関連処理を、上のProtocolを実装する形で定義します。

```swift
import Foundation
import Firebase
import FirebaseFirestoreSwift

struct APIClient: APIClientProtocol {
    
    func signin(email: String, password: String, completion: @escaping () -> Void) {
        Auth.auth().signIn(withEmail: email, password: password) { (result, error) in
            if error != nil {
                return
            }
            guard let result = result else {return}
            print(result)
            completion()
        }
    }
    
    func createUser(email: String, password: String, completion: @escaping () -> Void) {
        Auth.auth().createUser(withEmail: email, password: password) { (result, error) in
            if error != nil {
                return
            }
            guard let result = result else {return}
            print(result)
            completion()
        }
    }
// 中略
}
```

signIn、signUpのところだけ抜粋しました。
引数としてフォームから受け取った値をとって、処理が完了したときの操作をクロージャで実行しています。

次に、最初に見たLoginViewControllerがどう変わるか見てみましょう。

```swift
import UIKit

class LoginViewController: UIViewController {
    
    @IBOutlet weak var userIdField: UITextField!
    @IBOutlet weak var passwordField: UITextField!
    
    override func viewDidLoad() {
        super.viewDidLoad()

    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if segue.identifier == "loginSegue" {
            guard let userId = userIdField.text else {
                return
            }
            let resultVC: AuthResultViewController = segue.destination as! AuthResultViewController
            resultVC.userId = userId
        }
    }
    
    @IBAction func login(_ sender: Any) {
        guard let userId = userIdField.text else {
            return
        }
        guard let password = passwordField.text else {
            return
        }
        let apiClient = APIClient()
        apiClient.signin(email: userId, password: password, completion: toNextVC)
    }
    
    private func toNextVC() -> Void {
        performSegue(withIdentifier: "loginSegue", sender: String.self)
    }

    @IBAction func twitterLogin(_ sender: Any) {
        let apiClient = APIClient()
        apiClient.twitterLogin(comlpetion: toNextVC)
    }
    
}
```

APIClientをインスタンス化して、ログインメソッドを実行しています。
**Firebaseに関する処理が直接全く記載されていないところに注目してください。**ViewControllerのレイヤーではFirebaseを意識しなくても済むような実装に変わっています。Firebaseライブラリもimportしていません。

ほかのViewControllerも同様なので、上で述べたようなバックエンドの変更が必要になった場合でも、修正するファイルは１つだけで、かつアプリのメインの挙動には手を入れなくてもいいような作りになっています。

# まとめ
一応断っておくと、各ViewControllerにAPIロジックがベタで書かれているパターンが間違いという訳でもありません。
スピード重視でリリースするために、細かいことは後回しにしてまずは動くものを作る、という戦略を取ることも往々にしてあると思います。

アーキテクチャに正解はないのですが、常に「どうやったら保守性が高いコードが作れるか？」「どうやったら拡張しやすいか？変更に強いか？」などを考えて、その時その時で最適なアーキテクチャを考えることが、初級から中級への第一歩だよ、というのが僕が言いたかったことです。

まぁゆうて自分もSwift触り始めて１ヶ月とかなんで。一緒に勉強していきましょう。
