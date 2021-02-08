import React, { Children } from 'react'
import { graphql, PageProps } from 'gatsby'
import Layout from '../components/layout'
import SEO from '../components/seo'
import CLI from '../components/cli'
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Fade from '@material-ui/core/Fade';
import Image from "gatsby-image";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
    },
    switchContainer: {
      display: 'flex !important',
      justifyContent: 'space-between !important',
    },
  })
)

export const Item: React.FC<{content: string}> = ({content}) => {
  return (
      <ListItem>
        <ListItemIcon><ArrowRightIcon /></ListItemIcon>
        <ListItemText>{content}</ListItemText>
      </ListItem>
  )
}


const About: React.FC<PageProps<GatsbyTypes.AboutQuery>> = ( { data, location } ) => {
    const classes = useStyles()  
    const siteTitle = data.site?.siteMetadata?.title || `Title`
    const avatar = data.avatar?.childImageSharp?.fixed

    // switch which show cli or not
    const [state, setState] = React.useState(false);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log(state)
      setState((prev) => !prev);
    };
    
    return (
      <>
        <Layout location={location} title={siteTitle}>
            <div className="about-title"> 
              <h1>About Me</h1>
                <FormControlLabel
                  control={<Switch color="primary" checked={state} onChange={handleChange} name="showCli" />}
                  label="CLI Mode"
                />
            </div>
            <SEO title="About" />
            <Image
                fixed={avatar!}
                alt=""
                className="bio-avatar"
                imgStyle={{
                  borderRadius: `20%`,
                }}
            />
            <h3>Profile</h3>
            <List>
                <Item content="kzk_maeda" />
                <Item content="Progate, inc. Engineer Manager" />
            </List>
            <h3>Works</h3>
            <h5>Panasonic (2013.4 ~ 2014.11)</h5>
            <List>
                <Item content="Patent Officer" />
            </List>
            <h5>Recruit (2014.11 ~ 2020.8)</h5>
            <List>
                <Item content="SRE/Infra Engineer" />
                <Item content="Team Leader" />
                <Item content="Project Manager" />
            </List>
            <h5>Free-lance (2016.10 ~ )</h5>
            <List>
                <Item content="Patent Conslutant" />
                <Item content="Data Platform Engineer" />
            </List>
            <h5>Progate (2020.9 ~ )</h5>
            <List>
                <Item content="Engineer Manager" />
            </List>
        </Layout>
        <Fade in={state}>
          <div>
            <CLI />
          </div>
        </Fade>
      </>
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