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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tag: {
      margin: '0 10px',
    },
    date: {
      padding: '0 10px'
    }
  }),
);

const BlogIndex: React.FC<PageProps<GatsbyTypes.BlogIndexQuery>> = ({ data, pageContext, location }) => {
  const siteTitle = data.site?.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const classes = useStyles();

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
      <ol style={{ listStyle: `none` }}>
        {posts.map(post => {
          const title = post.frontmatter?.title || post.fields?.slug

          return (
            // <li key={post.fields!.slug!}>
            //   <article
            //     className="post-list-item"
            //     itemScope
            //     itemType="http://schema.org/Article"
            //   >
            //     <header>
            //       <h2>
            //         <Link to={post.fields!.slug!} itemProp="url">
            //           <span itemProp="headline">{title}</span>
            //         </Link>
            //       </h2>
            //       <small className={classes.date}>{post.frontmatter!.date}</small>
            //       {post.frontmatter?.tags?.map(tag => {
            //         return (
            //           <Button
            //           className={classes.tag} variant="outlined" color="primary" size="small" href={`/tags/${kebabCase(tag)}/`}  
            //           >{tag}</Button>
            //         )
            //       })}
            //     </header>
            //     <section>
            //       <p
            //         dangerouslySetInnerHTML={{
            //           __html: post.frontmatter!.description || post.excerpt!,
            //         }}
            //         itemProp="description"
            //       />
            //     </section>
            //   </article>
            // </li>
            <PostCard post={post}></PostCard>
          )
        })}
      </ol>
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
