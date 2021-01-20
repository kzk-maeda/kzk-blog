import React from 'react'
import { Link, graphql, PageProps } from 'gatsby'
import Layout from '../components/layout'
import SEO from '../components/seo'
import kebabCase from 'lodash/kebabCase'

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import FolderIcon from '@material-ui/icons/Folder';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tagsRoot: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

const Tags: React.FC<PageProps<GatsbyTypes.TagsIndexQuery>> = ({data, location}) => {
  const siteTitle = data.site?.siteMetadata?.title || `Title`
  const group = data.allMarkdownRemark.group
  const classes = useStyles();
  return (
      <Layout title={siteTitle} location={location}>
      <SEO title="Tags"/>
      <h1>Tags</h1>
      <List className={classes.tagsRoot}>
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