import React from 'react'
import styled from 'styled-components'
import {
    FacebookShareButton,
    FacebookIcon,
    LineShareButton,
    LineIcon,
    LinkedinShareButton,
    LinkedinIcon,
    TwitterShareButton,
    TwitterIcon
} from 'react-share'

export const Buttons = styled.div`
    display: flex;
    padding: 20px;
    justify-content: center;
`

export const Button = styled.div`
    margin-left: 20px;
    margin-right: 20px
`

const SNSShare: React.FC<{title: string} & {articleUrl: string}> = ({title, articleUrl}) => {
    return (
        <Buttons>
            <Button>
                <FacebookShareButton url={articleUrl}>
                    <FacebookIcon size={40} round />
                </FacebookShareButton>
            </Button>
            <Button>
                <LineShareButton title={title} url={articleUrl} >
                    <LineIcon size={40} round />
                </LineShareButton>
            </Button>
            <Button>
                <LinkedinShareButton title={title} url={articleUrl} >
                    <LinkedinIcon size={40} round />
                </LinkedinShareButton>
            </Button>
            <Button>
                <TwitterShareButton title={title} url={articleUrl} >
                    <TwitterIcon size={40} round />
                </TwitterShareButton>
            </Button>
        </Buttons>
    )
}

export default SNSShare