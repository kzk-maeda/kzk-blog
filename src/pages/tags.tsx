import React from 'react'
import { Link, graphql, PageProps } from 'gatsby'
import Layout from '../components/layout'
import SEO from '../components/seo'
import kebabCase from 'lodash/kebabCase'


const Tags: React.FC<PageProps<GatsbyTypes.TagsIndexQuery>> = ({data, location}) => {
  const siteTitle = data.site?.siteMetadata?.title || `Title`
  const group = data.allMarkdownRemark.group
  return (
      <Layout title={siteTitle} location={location}>
      <SEO title="Tags"/>
      <h1>Tags</h1>
      <ul>
        {group.map(tag => (
          <li key={tag.fieldValue}>
            <Link to={`/tags/${kebabCase(tag.fieldValue)}/`}>
              {tag.fieldValue} ({tag.totalCount})
            </Link>
          </li>
        ))}
      </ul>
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