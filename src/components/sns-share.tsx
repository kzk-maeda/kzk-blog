import React from 'react'
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

const SNSShare: React.FC<{title: string} & {articleUrl: string}> = ({title, articleUrl}) => {
    return (
        <div>
            <FacebookShareButton url={articleUrl}>
                <FacebookIcon size={50} round />
            </FacebookShareButton>

            <LineShareButton title={title} url={articleUrl} >
                <LineIcon size={50} round />
            </LineShareButton>

            <LinkedinShareButton title={title} url={articleUrl} >
                <LinkedinIcon size={50} round />
            </LinkedinShareButton>

            <TwitterShareButton title={title} url={articleUrl} >
                <TwitterIcon size={50} round />
            </TwitterShareButton>
        </div>
    )
}

export default SNSShare