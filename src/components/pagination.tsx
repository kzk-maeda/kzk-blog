import { Link } from 'gatsby'
import React from 'react'

import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

type Props = {
    pageContext: PageContext,
}

type PageContext = {
    previousPagePath?: string,
    nextPagePath?: string,
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        prevButton: {
            display: 'inline-block',
            margin: '0 auto 0 10px',
            textAlign: 'right',
        },
        nextButton: {
            display: 'inline-block',
            margin: '0 10px 0 auto',
            textAlign: 'right',
        },
        parent: {
            display: 'flex',
            justifyContent: 'space-between',
        }
    }),
)


const Pagination: React.FC<Props> = ({ pageContext }) => {
    console.log(pageContext)
    const classes = useStyles();
    const { previousPagePath, nextPagePath } = pageContext;

    if (!previousPagePath && nextPagePath) {
        return (
            <div className={classes.parent}>
                <div className={classes.prevButton} />
                <Link to={nextPagePath}>
                    <IconButton className={classes.nextButton} color="default">
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Link>
            </div>
        )
    } else if (!nextPagePath && previousPagePath) {
        return (
            <div className={classes.parent}>
                <Link to={previousPagePath}>
                    <IconButton className={classes.prevButton} color="default">
                        <ArrowBackIosIcon />
                    </IconButton>
                </Link>
                <div className={classes.nextButton} />
            </div>
        )
    } else {
        return (
            <div className={classes.parent}>
                <Link to={previousPagePath || "/"}>
                    <IconButton className={classes.prevButton} color="default">
                        <ArrowBackIosIcon />
                    </IconButton>
                </Link>
                <Link to={nextPagePath || "/"}>
                    <IconButton className={classes.nextButton} color="default">
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Link>
            </div>
        )
    }

}

export default Pagination