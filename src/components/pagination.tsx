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
            display: 'block',
            margin: '0 auto 0 10px',
        },
        nextButton: {
            display: 'block',
            margin: '0 10px 0 auto',
        }
    }),
)


const Pagination: React.FC<Props> = ({ pageContext }) => {
    console.log(pageContext)
    const classes = useStyles();
    const { previousPagePath, nextPagePath } = pageContext;

    if (!previousPagePath && nextPagePath) {
        return (
            <div>
                <Link to={nextPagePath}>
                    <IconButton className={classes.nextButton} color="default">
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Link>
            </div>
        )
    } else if (!nextPagePath && previousPagePath) {
        return (
            <>
                <Link to={previousPagePath}>
                    <IconButton className={classes.prevButton} color="default">
                        <ArrowBackIosIcon />
                    </IconButton>
                </Link>
            </>
        )
    } else {
        return (
            <>
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
            </>
        )
    }

}

export default Pagination