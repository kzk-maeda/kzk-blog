import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DescriptionIcon from '@material-ui/icons/Description';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import PersonIcon from '@material-ui/icons/Person';
import TwitterIcon from '@material-ui/icons/Twitter';
import GitHubIcon from '@material-ui/icons/GitHub';
import LinkedInIcon from '@material-ui/icons/LinkedIn';

import { graphql, PageProps, useStaticQuery, Link } from "gatsby";
import Image from "gatsby-image";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    sidebarRoot: {
      display: 'flex',
    },
    appBar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    sidebarAppBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    sidebarAvatar: {
      marginLeft: theme.spacing(4),
      marginTop: theme.spacing(2),
      fontSize: '16px',
    },
    sidebarMenuButton: {
      marginRight: theme.spacing(2),
    },
    sidebarHide: {
      display: 'none',
    },
    sidebarDrawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    sidebarDrawerPaper: {
      width: drawerWidth,
    },
    sidebarDrawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
    sidebarContent: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: -drawerWidth,
    },
    sidebarContentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
  }),
);

export default function PersistentDrawerLeft() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const data = useStaticQuery<GatsbyTypes.SideBioQuery>(graphql`
    query SideBio {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50, quality: 95) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
            github
            linkedin
          }
        }
      }
    }
  `)

  const social = data.site?.siteMetadata?.social
  const avatar = data.avatar?.childImageSharp?.fixed
  const author = data.site?.siteMetadata?.author

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.sidebarRoot}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.sidebarAppBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.sidebarMenuButton, open && classes.sidebarHide)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" noWrap color="inherit">
            <Link to="/">kzk_maeda Blog</Link>
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.sidebarDrawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.sidebarDrawerPaper,
        }}
      >
        <div className={classes.sidebarDrawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <div className={classes.sidebarAvatar}>
            {avatar && (
              <Image
                fixed={avatar}
                alt={author?.name || ``}
                // className="bio-avatar"
                imgStyle={{
                  borderRadius: `50%`,
                }}
              />
            )}
            {author?.name && (
              <p>
                <strong>{author.name}</strong>
              </p>
            )}
          </div>

        <List>
          <ListItem button key="Blog Top" component="a" href='/'>
            <ListItemIcon><DescriptionIcon /></ListItemIcon>
            <ListItemText primary="Blog Top" />
          </ListItem>
          <ListItem button key="Tags" component="a" href='/tags'>
            <ListItemIcon><LocalOfferIcon /></ListItemIcon>
            <ListItemText primary="Tags" />
          </ListItem>
          <ListItem button key="About me" component="a" href='/about'>
            <ListItemIcon><PersonIcon /></ListItemIcon>
            <ListItemText primary="About me" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem button key="Twitter" component="a" href={`https://twitter.com/${social?.twitter || ``}`}>
            <ListItemIcon><TwitterIcon /></ListItemIcon>
            <ListItemText primary="Twitter" />
          </ListItem>
          <ListItem button key="Github" component="a" href={`https://github.com/${social?.github || ``}`}>
            <ListItemIcon><GitHubIcon /></ListItemIcon>
            <ListItemText primary="Github" />
          </ListItem>
          <ListItem button key="LinkedIn" component="a" href={`https://www.linkedin.com/in/${social?.linkedin || ``}`}>
            <ListItemIcon><LinkedInIcon /></ListItemIcon>
            <ListItemText primary="LinkedIn" />
          </ListItem>
        </List>
      </Drawer>
    </div>
  );
}
