import React from 'react'
import { Link, PageProps } from 'gatsby'
import kebabCase from 'lodash/kebabCase'

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button"
import Typography from '@material-ui/core/Typography';

type Props = {
    post: Post,
}

type Post = {
    frontmatter?: FrontMatter,
    fields?: Fields,
    excerpt?: string,
}

type FrontMatter = {
    title?: string,
    date?: string,
    tags?: string[],
    description?: string,
}

type Fields = {
    slug?: string
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tag: {
      margin: '10px 10px',
    },
    date: {
      padding: '0 10px',
      margin: '0 0 10px'
    },
    root: {
      minWidth: 275,
      margin: '5px',
    },
    title: {
      fontSize: 24,
      margin: '10px 0'
    },
    desc: {
      fontSize: 16,
      margin: '10px 0'
    }
  }),
);

const PostCard: React.FC<Props> = ({ post }) => {
    const classes = useStyles();
    const title = post.frontmatter?.title || post.fields?.slug

    return (
        <Card className={classes.root} variant="outlined">
            <CardContent>
                {/* <article
                className="post-list-item"
                itemScope
                itemType="http://schema.org/Article"
                > */}
                <header>
                <h3 className={classes.title}>
                    <Link to={post.fields!.slug!} itemProp="url">
                    <span itemProp="headline">{title}</span>
                    </Link>
                </h3>
                <small className={classes.date}>{post.frontmatter!.date}</small><br />
                {post.frontmatter?.tags?.map(tag => {
                    return (
                    <Button
                    className={classes.tag} variant="outlined" color="primary" size="small" href={`/tags/${kebabCase(tag)}/`}  
                    >{tag}</Button>
                    )
                })}
                </header>
                <section>
                <p  className={classes.desc}
                    dangerouslySetInnerHTML={{
                    __html: post.frontmatter!.description || post.excerpt!,
                    }}
                    itemProp="description"
                />
                </section>
            {/* </article> */}
            </CardContent>
        </Card>
    )
}

export default PostCard