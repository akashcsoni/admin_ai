import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import '../styles/account-theme.css'

function isAccountRoute(pathname: string): boolean {
  return pathname === '/account' || pathname.startsWith('/account/')
}

export default function Layout() {
  const location = useLocation()
  const onAccount = isAccountRoute(location.pathname)

  return (
    <div className={`site-shell${onAccount ? ' site-shell--account' : ''}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="site-main">
        <Outlet />
      </main>
      {!onAccount ? <Footer /> : null}
    </div>
  )
}
