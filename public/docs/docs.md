# 미림마이스터고 OAuth 구현 가이드

이 문서는 미림마이스터고 OAuth 서비스를 웹 애플리케이션에 연동하는 방법을 설명합니다. 본 가이드는 필요한 API 엔드포인트, 인증 흐름, 예제 코드를 포함하고 있습니다.

## 목차

1. [시작하기 전에](#시작하기-전에)
2. [OAuth 흐름 개요](#oauth-흐름-개요)
3. [클라이언트 등록](#클라이언트-등록)
4. [인증 요청 (로그인)](#인증-요청-로그인)
5. [액세스 토큰 얻기](#액세스-토큰-얻기)
6. [사용자 정보 가져오기](#사용자-정보-가져오기)
7. [토큰 갱신](#토큰-갱신)
8. [전체 구현 예제](#전체-구현-예제)
9. [자주 묻는 질문](#자주-묻는-질문)

## 시작하기 전에

미림마이스터고 OAuth 서비스를 사용하기 위해서는 다음이 필요합니다:

- OAuth 클라이언트 ID 및 시크릿
- 등록된 리디렉션 URI
- 요청할 권한 범위(scope) 결정

## OAuth 흐름 개요

미림마이스터고 OAuth는 표준 OAuth 2.0 인증 코드 흐름을 따릅니다:

- 사용자가 서비스에서 "미림마이스터고 계정으로 로그인" 버튼 클릭
- 사용자가 미림마이스터고 OAuth 서버로 리디렉션되어 로그인
- 사용자가 요청된 권한을 승인
- 사용자가 원래 서비스로 인증 코드와 함께 리디렉션
- 서비스가 인증 코드를 액세스 토큰으로 교환
- 액세스 토큰을 사용하여 사용자 정보에 액세스

## 클라이언트 등록

OAuth를 사용하기 전에 클라이언트 애플리케이션을 등록해야 합니다:

- [미림마이스터고 OAuth 관리 페이지](https://auth.mmhs.app/oauth/manage)에 로그인
- "새 애플리케이션 등록" 버튼 클릭
- 필요한 정보 입력:
  - 서비스 이름
  - 서비스 도메인
  - 리디렉션 URI (인증 후 사용자가 리디렉션될 URL)
  - 필요한 권한 범위(scope)
  - 허용할 사용자 타입 (모든 사용자, 학생만, 교사만)
- 제출하면 클라이언트 ID와 시크릿이 발급됩니다

> **중요**: 클라이언트 시크릿은 안전하게 보관하고 절대 프론트엔드 코드에 노출시키지 마세요!

## 인증 요청 (로그인)

사용자가 미림마이스터고 계정으로 로그인하도록 하려면, 아래 URL로 리디렉션합니다:

```javascript
function loginWithMMHS() {
  const clientId = "YOUR_CLIENT_ID";
  const redirectUri = encodeURIComponent("YOUR_REDIRECT_URI");
  const scope = "email,nickname,role"; // 필요한 권한 범위
  
  const authUrl = `https://oauth.mmhs.kr/api/v1/oauth/authorize?state=code&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  
  window.location.href = authUrl;
}
```

> **참고**: `state` 파라미터는 CSRF 공격 방지를 위해 고유한 값을 사용하는 것이 좋습니다.

## 액세스 토큰 얻기

사용자가 권한을 승인하면, 설정한 리디렉션 URI로 인증 코드와 함께 리디렉션됩니다. 이 코드를 사용하여 액세스 토큰을 요청하세요:

```javascript
async function getAccessToken(code, state) {
  const tokenEndpoint = 'https://oauth.mmhs.kr/api/v1/oauth/token';
  
  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code,
        state: state,
        clientId: 'YOUR_CLIENT_ID',
        clientSecret: 'YOUR_CLIENT_SECRET',
        redirectUri: 'YOUR_REDIRECT_URI',
        scopes: 'email,nickname,role'
      })
    });
    
    const data = await response.json();
    
    if (data.status === 200) {
      // 토큰 저장
      localStorage.setItem('accessToken', data.data.access_token);
      localStorage.setItem('refreshToken', data.data.refresh_token);
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to get access token');
    }
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
}
```

> **중요**: 이 요청은 반드시 백엔드에서 처리해야 합니다. 클라이언트 시크릿이 노출되지 않도록 주의하세요.

## 사용자 정보 가져오기

액세스 토큰이 있으면 사용자 정보를 요청할 수 있습니다:

```javascript
async function getUserInfo(accessToken) {
  try {
    const response = await fetch('https://oauth.mmhs.kr/api/v1/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.status === 200) {
      return data.data;
    } else if (data.status === 401 && data.message === 'TOKEN_EXPIRED') {
      // 토큰 갱신 필요
      const newToken = await refreshAccessToken();
      if (newToken) {
        return getUserInfo(newToken);
      }
    } else {
      throw new Error(data.message || 'Failed to get user info');
    }
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
}
```

## 토큰 갱신

액세스 토큰이 만료되면 리프레시 토큰을 사용하여 새 액세스 토큰을 요청할 수 있습니다:

```javascript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    return null;
  }
  
  try {
    const response = await fetch('https://oauth.mmhs.kr/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    });
    
    const data = await response.json();
    
    if (data.status === 200 && data.data?.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken);
      return data.data.accessToken;
    } else {
      // 리프레시 토큰이 유효하지 않은 경우
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}
```

## 전체 구현 예제

아래는 React 앱에서 미림마이스터고 OAuth를 구현하는 전체 예제입니다:

### 프론트엔드 - React 컴포넌트

```jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// OAuth 설정
const OAUTH_CONFIG = {
  clientId: process.env.REACT_APP_OAUTH_CLIENT_ID,
  clientSecret: process.env.REACT_APP_OAUTH_CLIENT_SECRET,
  redirectUri: `${window.location.origin}/oauth/callback`,
  scope: 'email,nickname,role,major',
  oauthServerUrl: 'https://oauth.mmhs.kr'
};

// 로그인 버튼 컴포넌트
export function LoginButton() {
  const handleLogin = () => {
    // 인증 상태를 저장하기 위한 고유한 state 값 생성
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('oauth_state', state);
    
    const authUrl = `${OAUTH_CONFIG.oauthServerUrl}/api/v1/oauth/authorize?state=${state}&client_id=${OAUTH_CONFIG.clientId}&redirect_uri=${encodeURIComponent(OAUTH_CONFIG.redirectUri)}&response_type=code&scope=${OAUTH_CONFIG.scope}`;
    
    window.location.href = authUrl;
  };

  return (
    <button onClick={handleLogin} className="login-button">
      미림마이스터고 계정으로 로그인
    </button>
  );
}

// 콜백 처리 컴포넌트
export function OAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state');
      const savedState = localStorage.getItem('oauth_state');
      
      // state 값 확인 (CSRF 방지)
      if (!code || state !== savedState) {
        setError('인증에 실패했습니다. 유효하지 않은 상태값입니다.');
        return;
      }
      
      try {
        // 백엔드에 인증 코드 전달
        const response = await fetch('/api/oauth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code, state })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // 인증 성공 시 처리
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          
          // 사용자를 원래 페이지로 리디렉션
          const redirectPath = localStorage.getItem('oauth_redirect') || '/';
          localStorage.removeItem('oauth_state');
          localStorage.removeItem('oauth_redirect');
          navigate(redirectPath);
        } else {
          setError(data.message || '인증에 실패했습니다.');
        }
      } catch (err) {
        setError('서버와의 통신 중 오류가 발생했습니다.');
        console.error('OAuth 콜백 처리 오류:', err);
      }
    };
    
    handleCallback();
  }, [location, navigate]);
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return <div className="loading">인증 처리 중...</div>;
}
```

### 사용자 정보 및 토큰 갱신 처리

```jsx
// 사용자 정보 컴포넌트
export function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserInfo = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        // 로그인 페이지로 리디렉션
        localStorage.setItem('oauth_redirect', window.location.pathname);
        navigate('/login');
        return;
      }
      
      try {
        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setUser(data.user);
        } else if (data.error === 'token_expired') {
          // 토큰 갱신 시도
          const refreshSuccess = await refreshAccessToken();
          if (refreshSuccess) {
            fetchUserInfo(); // 성공하면 다시 시도
          } else {
            // 로그인 페이지로 리디렉션
            localStorage.setItem('oauth_redirect', window.location.pathname);
            navigate('/login');
          }
        } else {
          console.error('사용자 정보 가져오기 실패:', data.error);
        }
      } catch (err) {
        console.error('사용자 정보 요청 중 오류:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserInfo();
  }, [navigate]);
  
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return false;
    }
    
    try {
      const response = await fetch('/api/oauth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });
      
      const data = await response.json();
      
      if (data.success && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      return false;
    }
  };
  
  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }
  
  if (!user) {
    return <div>사용자 정보를 불러올 수 없습니다.</div>;
  }
  
  return (
    <div className="user-profile">
      <h2>{user.nickname || user.email} 님 환영합니다!</h2>
      <p>이메일: {user.email}</p>
      {user.role && <p>역할: {user.role}</p>}
      {user.major && <p>전공: {user.major}</p>}
      {user.isGraduated !== undefined && (
        <p>졸업 여부: {user.isGraduated ? '졸업' : '재학 중'}</p>
      )}
      <button onClick={() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      }}>로그아웃</button>
    </div>
  );
}
```

### 백엔드 구현 (Express.js)

> **참고**: 보안을 위해 실제 구현에서는 토큰 교환과 갱신을 백엔드에서 처리하는 것이 좋습니다.

```javascript
const express = require('express');
const axios = require('axios');
const router = express.Router();

// OAuth 콜백 처리
router.post('/api/oauth/callback', async (req, res) => {
  const { code, state } = req.body;
  
  try {
    const response = await axios.post('https://oauth.mmhs.kr/api/v1/oauth/token', {
      code,
      state,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      redirectUri: `${process.env.APP_URL}/oauth/callback`,
      scopes: process.env.OAUTH_SCOPES
    });
    
    const tokenData = response.data;
    
    if (tokenData.status === 200) {
      // 필요한 경우 세션에 토큰 저장
      req.session.accessToken = tokenData.data.access_token;
      req.session.refreshToken = tokenData.data.refresh_token;
      
      return res.json({
        success: true,
        accessToken: tokenData.data.access_token,
        refreshToken: tokenData.data.refresh_token
      });
    }
    
    res.json({ success: false, message: tokenData.message || '인증에 실패했습니다.' });
  } catch (error) {
    console.error('OAuth 토큰 교환 오류:', error.response?.data || error.message);
    res.json({ success: false, message: '토큰 교환 중 오류가 발생했습니다.' });
  }
});

// 사용자 정보 가져오기
router.get('/api/user', async (req, res) => {
  const accessToken = req.headers.authorization?.split(' ')[1];
  
  if (!accessToken) {
    return res.json({ success: false, error: 'no_token' });
  }
  
  try {
    const response = await axios.get('https://oauth.mmhs.kr/api/v1/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const userData = response.data;
    
    if (userData.status === 200) {
      return res.json({ success: true, user: userData.data });
    }
    
    res.json({ success: false, error: userData.message });
  } catch (error) {
    if (error.response?.data?.message === 'TOKEN_EXPIRED') {
      return res.json({ success: false, error: 'token_expired' });
    }
    console.error('사용자 정보 요청 오류:', error.response?.data || error.message);
    res.json({ success: false, error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 토큰 갱신
router.post('/api/oauth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.json({ success: false, error: 'no_refresh_token' });
  }
  
  try {
    const response = await axios.post('https://oauth.mmhs.kr/api/v1/auth/refresh', {
      refreshToken
    });
    
    const data = response.data;
    
    if (data.status === 200 && data.data?.accessToken) {
      // 필요한 경우 세션의 액세스 토큰 갱신
      if (req.session) {
        req.session.accessToken = data.data.accessToken;
      }
      
      return res.json({ success: true, accessToken: data.data.accessToken });
    }
    
    res.json({ success: false, error: data.message || 'refresh_failed' });
  } catch (error) {
    console.error('토큰 갱신 오류:', error.response?.data || error.message);
    res.json({ success: false, error: '토큰 갱신 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
```

## 자주 묻는 질문

### Q: 어떤 권한 범위(scope)를 요청할 수 있나요?

사용 가능한 권한 범위는 다음과 같습니다:

- `email`: 사용자의 이메일 주소
- `nickname`: 사용자의 닉네임
- `role`: 사용자의 역할 (학생/교사)
- `major`: 사용자의 전공 정보
- `admission`: 사용자의 입학년도
- `generation`: 사용자의 기수 정보
- `isGraduated`: 사용자의 졸업 여부

### Q: 토큰은 얼마나 오래 유효한가요?

액세스 토큰은 일반적으로 15분 동안 유효하며, 리프레시 토큰은 30일 동안 유효합니다.

### Q: 사용자가 권한을 취소할 수 있나요?

네, 사용자는 미림마이스터고 OAuth 설정 페이지에서 언제든지 애플리케이션에 부여한 권한을 취소할 수 있습니다.

### Q: 리디렉션 URI를 변경할 수 있나요?

리디렉션 URI는 OAuth 관리 페이지에서 변경할 수 있지만, 기존 사용자의 인증에 영향을 줄 수 있으므로 주의해서 변경하세요.

### Q: 토큰 만료 오류는 어떻게 처리하나요?

API 요청에서 `TOKEN_EXPIRED` 오류가 발생하면 리프레시 토큰을 사용해 새 액세스 토큰을 요청하고, 성공하면 원래 요청을 재시도하세요.

---

이 가이드를 통해 미림마이스터고 OAuth 서비스 연동에 필요한 기본 정보를 제공했습니다. 추가 질문이나 문제가 있으면 [미림마이스터고 지원 서비스 팀](mailto:mmhs.service@gmail.com) 또는 [하이픈 인스타](https://instagram.com/hyphen_team)로 문의하세요.