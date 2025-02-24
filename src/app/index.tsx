import { Route, Routes } from 'react-router-dom'
import { LoginPage } from '../pages/login'
import { NotFoundPage } from '../pages/notfound'
import { OAuthCallback } from '../pages/oauth'
import { HomePage } from '../pages/home'

function App() {
  return (
    <>
      <Routes>
        <Route path='/oauth-login' element={<LoginPage />} />
        <Route path='/' element={<HomePage />} />
        <Route path='/oauth' element={<OAuthCallback />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App