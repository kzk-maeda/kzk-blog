import React from 'react'
import { Link, graphql, PageProps } from 'gatsby'

import Layout from "../components/layout"
import SEO from "../components/seo"
import PostCard from "../components/post-card"

import List from '@material-ui/core/List';

type Props = {
    tag: string
}

type Slug = {
    slug: string
}

const Tags: React.FC<PageProps<GatsbyTypes.TagsQuery, Props>> = ({ data, pageContext, location }) => {
    const siteTitle = data.site?.siteMetadata?.title || `Title`
    const { tag } = pageContext
    const { edges, totalCount } = data.allMarkdownRemark
    const tagHeader = `${totalCount} post${
        totalCount === 1 ? "" : "s"
      } tagged with "${tag}"`
    
    return (
        <Layout location={location} title={siteTitle}>
          <SEO title="All tags" />
          <h1>{tagHeader}</h1>
          <List>
              {edges.map( ({node})  => {
                return (
                    <PostCard post={node}></PostCard>
                )
              }
              )}
          </List>
            <Link to="/tags">All tags</Link>
        </Layout>
    )
}

export default Tags


export const pageQuery = graphql`
  query Tags($tag: String) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            description
            tags
            title
          }
        }
      }
    }
  }
`