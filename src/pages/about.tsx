import React, { Children } from 'react'
import { graphql, PageProps } from 'gatsby'
import Layout from '../components/layout'
import SEO from '../components/seo'
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import Image from "gatsby-image";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: 0,
      margin: 0,
      paddingInlineStart: 1
    },
  }),
);

export const Item: React.FC<{content: string}> = ({content}) => {
  const classes = useStyles();
  return (
      <ListItem className={classes.root}>
        <ListItemIcon><ArrowRightIcon /></ListItemIcon>
        <ListItemText>{content}</ListItemText>
      </ListItem>
  )
}


const About: React.FC<PageProps<GatsbyTypes.AboutQuery>> = ( { data, location } ) => {
    const siteTitle = data.site?.siteMetadata?.title || `Title`
    const avatar = data.avatar?.childImageSharp?.fixed
    const classes = useStyles();
    
    return (
        <Layout location={location} title={siteTitle}>
            <SEO title="About" />
            <h1>About Me</h1>
            <Image
                fixed={avatar}
                alt=""
                className="bio-avatar"
                imgStyle={{
                  borderRadius: `20%`,
                }}
            />
            <h3>Profile</h3>
            <List className={classes.root}>
                <Item content="kzk_maeda" />
                <Item content="Progate, inc. Engineer Manager" />
            </List>
            <h3>Works</h3>
            <h5>Panasonic (2013.4 ~ 2014.11)</h5>
            <List className={classes.root}>
                <Item content="Patent Officer" />
            </List>
            <h5>Recruit (2014.11 ~ 2020.8)</h5>
            <List className={classes.root}>
                <Item content="SRE/Infra Engineer" />
                <Item content="Team Leader" />
                <Item content="Project Manager" />
            </List>
            <h5>Free-lance (2016.10 ~ )</h5>
            <List className={classes.root}>
                <Item content="Patent Conslutant" />
                <Item content="Data Platform Engineer" />
            </List>
            <h5>Progate (2020.9 ~ )</h5>
            <List className={classes.root}>
                <Item content="Engineer Manager" />
            </List>
        </Layout>
    )
}

export default About

export const pageQuery = graphql`
  query About {
    site {
      siteMetadata {
        title
      }
    }
    avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
      childImageSharp {
        fixed(width: 70, height: 70, quality: 95) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`