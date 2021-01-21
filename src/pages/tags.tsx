import React from 'react'
import { Link, graphql, PageProps } from 'gatsby'
import Layout from '../components/layout'
import SEO from '../components/seo'
import kebabCase from 'lodash/kebabCase'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import FolderIcon from '@material-ui/icons/Folder';


const Tags: React.FC<PageProps<GatsbyTypes.TagsIndexQuery>> = ({data, location}) => {
  const siteTitle = data.site?.siteMetadata?.title || `Title`
  const group = data.allMarkdownRemark.group
  return (
      <Layout title={siteTitle} location={location}>
      <SEO title="Tags"/>
      <h3>Tags</h3>
      {/* <List className={classes.tagsRoot}> */}
      <List>
        {group.map(tag => (
          <ListItem key={tag.fieldValue}>
            <ListItemAvatar>
              <FolderIcon />
            </ListItemAvatar>
            <Link to={`/tags/${kebabCase(tag.fieldValue)}/`}>
              <ListItemText primary={`${tag.fieldValue} (${tag.totalCount})`}/>
            </Link>
          </ListItem>
        ))}
      </List>
      </Layout>
  )
}

export default Tags

export const pageQuery=graphql`
  query TagsIndex {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(limit: 2000) {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
  }
`