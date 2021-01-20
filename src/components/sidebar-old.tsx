import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { slide as Menu } from "react-burger-menu"
import { graphql, PageProps, useStaticQuery} from "gatsby";
import Image from "gatsby-image";

export const Item = styled.a`
  line-height: 3;
  color: #b8b7ad;
`

const Sidebar = () => {
  const data = useStaticQuery<GatsbyTypes.SideBioOldQuery>(graphql`
    query SideBioOld {
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

  return (
      <Menu pageWrapId={"page-wrap"} outerContainerId={ "outer-container" } disableAutoFocus >
          <div>
            {avatar && (
              <Image
                fixed={avatar}
                alt={author?.name || ``}
                className="bio-avatar"
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
          <Item href="/">
            Blog Top
          </Item>
          <Item href="/tags">
            Tags
          </Item>
          <Item href="/about">
            About Me
          </Item>
          <Item href={`https://twitter.com/${social?.twitter || ``}`}>
            Twitter
          </Item>
          <Item href={`https://github.com/${social?.github || ``}`}>
            Github
          </Item>
          <Item href={`https://www.linkedin.com/in/${social?.linkedin || ``}`}>
            Linkedin
          </Item>
      </Menu>
  )
}

export default Sidebar
