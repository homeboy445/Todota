import axios from 'axios';
import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './components/Login/Login';
import Compose from './components/Notes/Compose';
import Notes from './components/Notes/Notes';
import Secrets from './components/Secrets/Secrets';
import AddTask from './components/Todo/AddTask';
import Todo from './components/Todo/Todo';
import Main from './context/main';

export default function App() {
  const uri = 'https://todota353.herokuapp.com';
  const [AuthInfo, updateAuthInfo] = useState<{
    status: boolean;
    AccessToken: string | null;
    RefreshToken: string | null;
  }>({
    status: true,
    AccessToken: null,
    RefreshToken: null,
  });
  const [counter, updateCounter] = useState<number>(0);

  const UpdateAuthInfo = (data: {
    status: boolean;
    AccessToken: string | null;
    RefreshToken: string | null;
  }) => {
    if (!data.AccessToken) {
      data.AccessToken = AuthInfo.AccessToken;
    }
    if (!data.RefreshToken) {
      data.RefreshToken = AuthInfo.RefreshToken;
    }
    updateAuthInfo(data);
    updateCounter((counter + 1) % 2);
  };

  const UpdateRefreshToken = () => {
    axios
      .post(`${uri}/refresh`, {
        email: sessionStorage.getItem('email'),
        RefreshToken: AuthInfo.RefreshToken,
      })
      .then((response) => {
        if (response.data.RefreshToken) {
          sessionStorage.setItem('AccessToken', response.data.AccessToken);
          sessionStorage.setItem('RefreshToken', response.data.RefreshToken);
          updateAuthInfo({
            ...AuthInfo,
            RefreshToken: response.data.RefreshToken,
          });
          return updateCounter((counter + 1) % 2);
        }
        throw new Error();
      })
      .catch((err) => {
        updateAuthInfo({
          status: false,
          AccessToken: null,
          RefreshToken: null,
        });
        sessionStorage.clear();
        updateCounter((counter + 1) % 2);
      });
  };

  useEffect(() => {
    const AToken = sessionStorage.getItem('AccessToken');
    if (!AuthInfo.status && AToken) {
      updateAuthInfo({
        status: true,
        AccessToken: AToken,
        RefreshToken: sessionStorage.getItem('RefreshToken'),
      });
      updateCounter((counter + 1) % 2);
    } else if (AuthInfo.status && !AToken) {
      updateAuthInfo({ ...AuthInfo, status: false });
      updateCounter((counter + 1) % 2);
    } else if (!AuthInfo.AccessToken) {
      updateAuthInfo({
        ...AuthInfo,
        AccessToken: AToken,
        RefreshToken: sessionStorage.getItem('RefreshToken'),
      });
      updateCounter((counter + 1) % 2);
    }
  }, [AuthInfo, AuthInfo.status, AuthInfo.AccessToken, counter]);

  return (
    <Main.Provider
      value={{
        AuthInfo,
        URI: uri,
        UpdateAuthInfo,
        RefreshAccessToken: UpdateRefreshToken,
        getAuthHeaders: () => {
          return {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('AccessToken')}`,
            },
          };
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={AuthInfo.status ? <Todo /> : <Login />} />
          {AuthInfo.status ? (
            <Route path="*" element={<Navigate to="/" replace />} />
          ) : null}
          <Route path="todo:addTodo" element={<AddTask />} />
          <Route path="notes" element={<Notes />} />
          <Route path="notes:compose/:type" element={<Compose />} />
          <Route path="secrets" element={<Secrets />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Main.Provider>
  );
}
