import React from "react"
import { Link, PageProps } from "gatsby"
import { WindowLocation } from "@reach/router"
import Sidebar from "./sidebar"
import Footer from "./footer"

const Layout: React.FC<{title: string} & {location: WindowLocation<unknown>}> = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
    )
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {title}
      </Link>
    )
  }

  return (
    <div className="global-wrapper" id="outer-container" data-is-root-path={isRootPath}>
      <Sidebar />
      <div className="contents-wrapper" id="page-wrap">
        <header className="global-header">{header}</header>
          <main className="main-content">{children}</main>
          <br />
          <hr />
          <Footer />
      </div>
    </div>
  )
}

export default Layout
