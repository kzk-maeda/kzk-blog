import React from 'react'
import { Link, graphql, PageProps } from 'gatsby'

type Props = {
    tag: string
}

type Slug = {
    slug: string
}

const Tags: React.FC<PageProps<GatsbyTypes.TagsQuery, Props>> = ({ data, pageContext, location }) => {
    const { tag } = pageContext
    const { edges, totalCount } = data.allMarkdownRemark
    const tagHeader = `${totalCount} post${
        totalCount === 1 ? "" : "s"
      } tagged with "${tag}"`
    
    return (
        <>
          <h1>{tagHeader}</h1>
          <ul>
              {edges.map( ({node})  => {
                return (
                    <li key={node.fields?.slug!}>
                        <Link to={node.fields?.slug!}>{node.frontmatter?.title!}</Link>
                    </li> 
                )
              }
              )}
          </ul>
            {/*
              This links to a page that does not yet exist.
              You'll come back to it!
            */}
            <Link to="/tags">All tags</Link>
        </>
    )
}

export default Tags


export const pageQuery = graphql`
  query Tags($tag: String) {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
          }
        }
      }
    }
  }
`