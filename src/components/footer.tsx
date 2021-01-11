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
                © {new Date().getFullYear()}, Built with
                {` `}
                <a href="https://www.gatsbyjs.com">Gatsby</a>
                .  Source Code is 
                {` `}
                <a href="https://github.com/kzk-maeda/kzk-blog">Here</a>
            </FooterItem>
        </>
    )
}

export default Footer