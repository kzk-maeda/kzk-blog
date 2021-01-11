import * as React from 'react'
import styled from 'styled-components'

export const FooterItem = styled.div`
    display: flex;
    justify-content: center;
    padding-left: 1.25rem;
`

const Footer = () => {
    return (
        <>
            <FooterItem>
                © {new Date().getFullYear()}, Built with&nbsp;
                {` `}
                <a href="https://www.gatsbyjs.com">Gatsby</a>
                . &nbsp; Source Code is&nbsp;
                {` `}
                <a href="https://github.com/kzk-maeda/kzk-blog">Here</a>
            </FooterItem>
        </>
    )
}

export default Footer