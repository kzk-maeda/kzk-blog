---
title: "SwiftでURLSessionを用いて汎用的なAPI Clientを作成"
date: "2019-12-29T00:00:00.000Z"
description: "SwiftでURLSessionを用いて汎用的なAPI Clientを作成"
tags: "Swift"
---

## はじめに
Swiftを勉強し始めたひよこです。
API処理周りで結構苦労したので記録用に記載します。
普段はAWS周りのインフラレイヤ触ることが多いので、やってることが正しいのかどうかすら自身ありません、、

## 課題
Alamofireなどのライブラリを活用せず、標準ライブラリであるURLSessionを用いたAPI Clientを作成したかったのですが、思い通りに動作させるのに下記の課題にぶち当たりました。

- 任意の型のResponseに対応できない
- Responseだけでなく、エラーも呼び出し元に返したい
- テスト時にスタブに差し替えたい

## 解決方法
### どうやって解決したか

それぞれの課題について下記の対応で乗り切りました。

- 任意の型のResponse → Genericsで型を抽象化
- エラーも呼び出し元に返す → Responseとエラーを含む構造体を作成し、内容を詰める
- スタブ差し替え → Protocolを実装

### 作成したコード

最終的に作成したコードは下記です。
簡単のためPost部分のみ記載しています。
Headerとか決め打ちなのは一旦気にしないでください。

```swift
import Foundation

struct Output<T> {
    var response : T?
    var transformError : ErrorInfo?
    var connectionError : Error?
}

protocol APIClientProtocol {
    func post<T:Codable>(url urlString: String, params: [String: Any], type: T.Type, completion: @escaping ((Output<T>) -> Void))
}

class APIClient: APIClientProtocol {    
    func post<T:Codable>(url urlString: String, params: [String: Any], type: T.Type, completion: @escaping ((Output<T>) -> Void)) {
        guard let url = URL(string: urlString)
            else {return}
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        let paramsString: String = params.enumerated().reduce("") { (input, tuple) -> String in
            switch tuple.element.value {
            case let int as Int: return input + tuple.element.key + "=" + String(int) + (params.count - 1 > tuple.offset ? "&" : "")
            case let string as String: return input + tuple.element.key + "=" + string + (params.count - 1 > tuple.offset ? "&" : "")
            default: return input
            }
        }
        request.httpBody = paramsString.data(using: String.Encoding.utf8)!        
        var output = Output<T>()

        let task = URLSession.shared.dataTask(with: request) {
            (data, response, error) in
            if error != nil {
                output.connectionError = error
            }
            guard let data = data else { return }
            
            do {
                let json = try JSONDecoder().decode(T.self, from: data)
                output.response = json
            } catch {
                let errorJson = try? JSONDecoder().decode(ErrorInfo.self, from: data)
                output.transformError = errorJson
            }
            DispatchQueue.main.async {
                completion(output)
            }
        }
        task.resume()
    }
}
```

#### 任意の型のResponseに対応する
##### 実装
今回作成しているAPI Clientの責務として、ResponseのDecodeまでは担わせたいと考えておりました。
その場合、API Client内でResponseの型にDecodeする必要があるのですが、アプリの中で呼び出すAPIは一つではないので、当然実行内容によって想定されるResponseの型は異なってきます。

例えば認証セッションを取得する際に、下記の型でResponseを受け取りたいと考えます。

```swift
struct Session: Codable {
    let statusCode: String
    let userId: String
    let AccessToken: String
}
```

このとき、型SessionをそのままAPI Client内でDecodeしようとすると、他のAPI実行時に使いまわせずにAPI毎にClientを実装することとなり、非常に非効率です。
という愚痴を社内Slackでこぼしたら、「Generics使えばええやん」って即答もらったので調べて実装しました。

API Client内で、Decodeしたい型をGenericsで抽象化し、 `T` という型にDecodeするように記載しています。

```swift
func post<T:Codable>(url urlString: String, params: [String: Any], type: T.Type, completion: @escaping ((Output<T>) -> Void)) {
// ~略~
   let json = try JSONDecoder().decode(T.self, from: data)
// ~略~
}
```
##### 使い方
これにより、API Client呼び出し元でDecodeしたい型を指定するだけで、同じAPI Clientをアプリ全体で再利用することができるようになりました。

```swift
client = APIClient()
client.post(url: url, params: params, type: Session.self, completion: { response in
  // code
}
```

#### エラーも呼び出し元に返す
##### 実装
初期実装の間、正常にDecodeできたResponseしか呼び出し元に返せないような実装になっていました。

```swift
class APIClient: APIClientProtocol {
    func post<T:Codable>(url urlString: String, params: [String: Any], type: T.Type, completion: @escaping ((T?) -> Void)) {
        guard let url = URL(string: urlString) else {return}
        // ~略~
        let task = URLSession.shared.dataTask(with: request) {
            (data, response, error) in
            // ~略~
            do {
                let json = try JSONDecoder().decode(T.self, from: data)
                DispatchQueue.main.async {
                    completion(json)
                }
            } catch {
                return
            }
        }
        task.resume()
    }
}
```

これ作ってたときは、postメソッドの引数としてGenericsで指定した型 `T` しかクロージャ内で渡せないとなぜか思っていて、catchの中で拾ったエラーを握りつぶしてしまっていました。
で、いろいろ考えていたんですが、errorも含んだ一つ抽象度の高い型を別途作成して、そこに結果を詰めて返せばいいんじゃないか？と思い、下記のように修正しました。

```swift
struct Output<T> {
    var response : T?
    var transformError : ErrorInfo?
    var connectionError : Error?
}

class APIClient: APIClientProtocol {
    func get<T:Codable> (url urlString: String, type: T.Type, completion: @escaping ((Output<T>) -> Void)) {
// ~略~
        let task = URLSession.shared.dataTask(with: request) {
            (data, response, error) in
            if error != nil {
                output.connectionError = error
            }
            guard let data = data else { return }
            
            do {
                let json = try JSONDecoder().decode(T.self, from: data)
                output.response = json
            } catch {
                let errorJson = try? JSONDecoder().decode(ErrorInfo.self, from: data)
                output.transformError = errorJson
            }
            DispatchQueue.main.async {
                completion(output)
            }
        }
        task.resume()
    }
}
```

`Output` という構造体を別途定義し、Optional型でエラーとレスポンスを詰めれるようにしました。
そして、postメソッドの中で、エラーを拾う、あるいはレスポンスを正常にDecodeできるとOutput型の変数に詰めて、最後に `DispatchQueue.main.async` を呼び出してOutput型の変数 `output` をメインスレッドに渡すようにしました。

##### 使い方

例えば、受け取ったエラーをUIAlertControllerで表示させる場合、下記のようにします。
（Alertの実装は今回関係ないので割愛します）

```swift
client = APIClient()
client.post(url: url, params: params, type: Session.self, completion: {output in            
    // transformErrorの場合
    if output.transformError != nil {
        let transformError = output.transformError
        error(transformError)
    }

func error(error: ErrorInfo?) {
        // エラー表示
        let alert = Alert()
        let vcUtil = ViewControllerUtil()
        if error != nil {
            alert.display(fromViewController: vcUtil.getTopVC()!, error: error!)
        }
    }
```

#### テストでスタブに差し替えられるようにする
##### 実装
これはSwiftに置ける基本的なDIの考え方だと思うのですが、スタブに差し替えて注入したいモジュール系はProtocolをImplementする形で実装することが一般的かと思います。
今回API Clientも、UnitTest内では実際のAPI実行ではなくて適当なデータを返すように実装したかったので、ProtocolをImplementする形で実装しています。

```swift
protocol APIClientProtocol {
    func post<T:Codable>(url urlString: String, params: [String: Any], type: T.Type, completion: @escaping ((Output<T>) -> Void))
}

class APIClient: APIClientProtocol {
// ~略~
}
```

##### 使い方
UnitTest内では、 `APIClientProtocol` を実装したFakeのAPI Clientを利用します。

```swift
class FakeAPIClient : APIClientProtocol {
    let fakeResponse : Codable
    init(fakeResponse : Codable) {
        self.fakeResponse = fakeResponse
    }
    
    func post<T>(url urlString: String, params: [String : Any], type: T.Type, completion: @escaping ((Output<T>) -> Void)) where T : Decodable, T : Encodable {
        completion(self.fakeResponse as! Output<T>)
    }
}
```

あとはテストコードの中でFakeAPIClientのインスタンスを注入してあげればおｋです。

## まとめ
ある程度汎用的なAPI Clientを実装する上で下記の点工夫したので、メモとして残しました。

- 任意の型のResponse → Genericsで型を抽象化
- エラーも呼び出し元に返す → Responseとエラーを含む構造体を作成し、内容を詰める
- スタブ差し替え → Protocolを実装

誰かの参考になれば幸いです。
また、もっといい実装あるよ、などのコメントいただけると非常に嬉しいです。
