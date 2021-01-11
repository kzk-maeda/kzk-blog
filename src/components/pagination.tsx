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

const Pagination: React.FC<Props> = ({ pageContext }) => {
    console.log(pageContext)
    const { previousPagePath, nextPagePath } = pageContext;

    return (
		<div>
			{previousPagePath ? <Link to={previousPagePath}>Previous</Link> : null }
			{nextPagePath ? <Link to={nextPagePath}>Next</Link> : null }
		</div>
	)
}

export default Pagination