import { Link, PageProps } from 'gatsby'
import React from 'react'
import styled from 'styled-components'

type Props = {
    pageContext: PageContext,
}

type PageContext = {
    previousPagePath?: string,
    nextPagePath?: string,
}

export const PreviousLink = styled.div`
    display: flex;
    justify-content: flex-start
    margin-left: 10px;
`

export const NextLink = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-right: 10px
`


const Pagination: React.FC<Props> = ({ pageContext }) => {
    console.log(pageContext)
    const { previousPagePath, nextPagePath } = pageContext;

    return (
		<>
            <PreviousLink>
			    {previousPagePath ? <Link to={previousPagePath}>Previous</Link> : null }
            </PreviousLink>
            <NextLink>
			    {nextPagePath ? <Link to={nextPagePath}>Next</Link> : null }
            </NextLink>
		</>
	)
}

export default Pagination