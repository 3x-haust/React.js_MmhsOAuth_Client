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
import { useAuthStore } from '../features/auth'
import { Header } from '../widgets/index'
import { ThemeProvider } from 'styled-components'
import { theme } from './styles'

function App() {
  const { initializeAuth } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const showHeader = location.pathname !== '/login'

  return (
    <>
     <ThemeProvider theme={theme}>
        {showHeader && <Header />}
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/' element={<HomePage />} />
          <Route path='/oauth' element={<OAuthCallback />} />
          <Route path='/oauth/consent' element={<ConsentPage />} />
          <Route path='/oauth/manage' element={<ManageOAuthAppsPage />} />
          <Route path='/oauth/new' element={<NewOAuthAppPage />} />
          <Route path='/oauth/edit/:id' element={<EditOAuthAppPage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
     </ThemeProvider>
    </>
  )
}

export default App