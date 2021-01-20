import React from "react"
import { Link, graphql, PageProps } from "gatsby"
import kebabCase from 'lodash/kebabCase'

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import Pagination from "../components/pagination"
import PostCard from "../components/post-card"

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button"

const { pageate } = require('gatsby-awesome-pagination')

const BlogIndex: React.FC<PageProps<GatsbyTypes.BlogIndexQuery>> = ({ data, pageContext, location }) => {
  const siteTitle = data.site?.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <SEO title="All posts" />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    )
  }

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts" />
        {posts.map(post => {

          return (
            <PostCard post={post}></PostCard>
          )
        })}

      <Pagination pageContext={pageContext} />
    </Layout>
  )
}

export default BlogIndex

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
          tags
        }
      }
    }
  }
`
