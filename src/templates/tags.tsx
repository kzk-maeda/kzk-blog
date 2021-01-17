import React from 'react'
import { Link, graphql, PageProps } from 'gatsby'

import Layout from "../components/layout"
import SEO from "../components/seo"

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import NoteSharpIcon from '@material-ui/icons/NoteSharp';

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
                    <ListItem key={node.fields?.slug!}>
                        <ListItemAvatar>
                            <NoteSharpIcon />
                        </ListItemAvatar>
                        <Link to={node.fields?.slug!}>
                            <ListItemText primary={node.frontmatter?.title!} />
                        </Link>
                    </ListItem> 
                )
              }
              )}
          </List>
            {/*
              This links to a page that does not yet exist.
              You'll come back to it!
            */}
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