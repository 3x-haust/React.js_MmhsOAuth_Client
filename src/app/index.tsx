import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { LoginPage } from '../pages/login'
import { NotFoundPage } from '../pages/notfound'
import { OAuthCallback } from '../pages/oauth'
import { HomePage } from '../pages/home'
import { ConsentPage } from '../pages/oauth/consent'
import { ManageOAuthAppsPage } from '../pages/oauth/manage'
import { NewOAuthAppPage } from '../pages/oauth/new'
import { EditOAuthAppPage } from '../pages/oauth/edit'
import { DocsPage } from '../pages/docs'
import { useAuthStore } from '../features/auth'
import { Footer, Header } from '../widgets'
import { ThemeProvider } from 'styled-components'
import { theme } from './styles'

function App() {
  const { initializeAuth } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const showHeaderFooter = location.pathname !== '/login'

  return (
    <>
     <ThemeProvider theme={theme}>
        {showHeaderFooter && <Header />}
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/' element={<HomePage />} />
          <Route path='/oauth' element={<OAuthCallback />} />
          <Route path='/oauth/consent' element={<ConsentPage />} />
          <Route path='/oauth/manage' element={<ManageOAuthAppsPage />} />
          <Route path='/oauth/new' element={<NewOAuthAppPage />} />
          <Route path='/oauth/edit/:id' element={<EditOAuthAppPage />} />
          <Route path='/docs' element={<DocsPage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
        {showHeaderFooter && <Footer />}
     </ThemeProvider>
    </>
  )
}

export default App