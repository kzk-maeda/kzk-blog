---
title: "gatsbyで作成したブログにPaginationを実装する"
date: "2021-01-12T00:00:00.000Z"
description: "gatsby製ブログに、gatsby-awsome-paginateを利用し、TypeScriptでPaginationを実装"
tags: ["Frontend", "Gatsby"]
---

# 概要
ブログのコンテンツが増えてきた時のために、Index PageにPaginationを実装しようとしました。

しかし、このBlogはGatsby+TypeScriptで実装しており、ググって出てくるサンプルコードそのままではPaginationを実装できなかったので、メモを残しておきます。

# 構成
- Paginationには `gatsby-awesome-pagination` を利用
- Paginationは独立したComponentとし、`Styled` でスタイリング

# やったこと
## プラグインの追加
- node_modulesに使用するプラグインをインストール

```bash
yarn add gatsby-awesome-pagination
```

- `@types`のものは配布されていなかったので上だけ追加


## gatsby-nodeの修正
- `src/gatsby-node/index.ts`にてpaginationの読み込みを行うが、`@types`が配布されていないので、そのままimportするとTypeScriptのエラーが発生してしまう
- 型定義ファイルを作成するのも面倒なので、今回は `require` で逃げる
- 投稿データの一覧を取得する箇所の下に、読み込んだ`paginate()`関数を実行する
  - pageNumberに応じてpathを変更するようにしているが、pageNumberが定義されていないので型定義を入れる必要がある

```javascript
import { GatsbyNode, Actions } from 'gatsby';
const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)
const { paginate } = require('gatsby-awesome-pagination') /// Import paginate

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql<{ allMarkdownRemark: Pick<GatsbyTypes.Query["allMarkdownRemark"], 'nodes'> }>(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: ASC }
          limit: 1000
        ) {
          nodes {
            id
            fields {
              slug
            }
          }
        }
      }
    `
  )

  const posts = result!.data!.allMarkdownRemark.nodes

  /// Paginationの定義
  const pathPrefix = ({ pageNumber }: {pageNumber: number}) => pageNumber === 0 ? '/' : '/page'
  paginate({
    createPage,
    items: posts,
    itemsPerPage: 5,
    pathPrefix: pathPrefix,
    component: path.resolve('src/templates/index.tsx'),　///index.tsxをtemplate下に移動する
  })

  if (posts.length > 0) {
    posts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : posts[index - 1].id
      const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id

      createPage({
        path: post!.fields!.slug!,
        component: blogPost,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
      })
    })
  }
}
```

## index.tscの修正
- `src/pages` 配下にある `index.tsx` を、`src/templates` 配下に移動する
- GraphQLのクエリを修正する(skip/limitの追加)
  ```javascript
    export const pageQuery = graphql`
        query BlogIndex($skip: Int!, $limit: Int!) {
            site {
            siteMetadata {
                title
            }
            }
            allMarkdownRemark(
            sort: { fields: [frontmatter___date], order: DESC }
            skip: $skip
            limit: $limit
            ) {
            nodes {
                excerpt
                fields {
                    slug    
                }
                frontmatter {
                    date(formatString: "MMMM DD, YYYY")
                    title
                    description
                }
            }
        }
    }
    `   
  ```

## Pagination Componentの作成
- `src/components/pagination.tsx` の作成
  - PageContentなど、自前で型を定義する必要があることに注意

```javascript
import { Link, PageProps } from 'gatsby'
import React from 'react'
import styled from 'styled-components'

type Props = {
    pageContext: PageContext,
}

type PageContext = {
    previousPagePath?: string,
    nextPagePath?: string,
}

export const PreviousLink = styled.div`
    display: flex;
    justify-content: flex-start;
    margin-left: 10px;
`

export const NextLink = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-right: 10px
`


const Pagination: React.FC<Props> = ({ pageContext }) => {
    console.log(pageContext)
    const { previousPagePath, nextPagePath } = pageContext;

    return (
		<>
            <PreviousLink>
			    {previousPagePath ? <Link to={previousPagePath}>Previous</Link> : null }
            </PreviousLink>
            <NextLink>
			    {nextPagePath ? <Link to={nextPagePath}>Next</Link> : null }
            </NextLink>
		</>
	)
}

export default Pagination
```

- 作成したPagination Componentを `src/templates/index.tsx` にて読み込み

```javascript
import Pagination from "../components/pagination"

// 略

<Pagination pageContext={pageContext} />

```


これでうまくいくはずです。