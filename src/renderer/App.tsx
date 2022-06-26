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
  const uri = 'http://localhost:3005';
  const [AuthInfo, updateAuthInfo] = useState<{
    status: boolean;
    AccessToken: string | null;
    RefreshToken: string | null;
  }>({
    status: true,
    AccessToken: null,
    RefreshToken: null,
  });
  const [WindowType, changeWindowType] = useState<string>('parent');
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
        RefreshToken: sessionStorage.getItem('RefreshToken'),
      })
      .then((response) => {
        if (response.data.RefreshToken) {
          console.log('Refreshing Token...');
          sessionStorage.setItem('AccessToken', response.data.AccessToken);
          sessionStorage.setItem('RefreshToken', response.data.RefreshToken);
          updateAuthInfo({
            ...AuthInfo,
            RefreshToken: response.data.RefreshToken,
          });
          return updateCounter((counter + 1) % 2);
        }
        throw new Error(response.toString());
      })
      .catch((err) => {
        console.log('ERROR: ', err);
        updateAuthInfo({
          status: false,
          AccessToken: null,
          RefreshToken: null,
        });
        sessionStorage.clear();
        (window as any).electron.ipcRenderer.send('session-expired', true);
      });
  };

  useEffect(() => {
    const AToken = sessionStorage.getItem('AccessToken');
    (window as any).electron.ipcRenderer.once('window-type', (data: string) => {
      console.log('WINDOW-TYPE: ', data);
      changeWindowType(data);
      updateAuthInfo({
        ...AuthInfo,
        status: data === 'parent' ? AuthInfo.status : true,
      });
    });
    if (!AuthInfo.status && AToken) {
      updateAuthInfo({
        status: true,
        AccessToken: AToken,
        RefreshToken: sessionStorage.getItem('RefreshToken'),
      });
      updateCounter((counter + 1) % 2);
    } else if (AuthInfo.status && !AToken && WindowType === 'parent') {
      updateAuthInfo({ ...AuthInfo, status: false });
      updateCounter((counter + 1) % 2);
    } else if (AuthInfo.AccessToken !== AToken) {
      updateAuthInfo({
        ...AuthInfo,
        AccessToken: AToken,
        RefreshToken: sessionStorage.getItem('RefreshToken'),
      });
      updateCounter((counter + 1) % 2);
    }
  }, [AuthInfo, WindowType, counter]);

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
        {AuthInfo.status ? (
          <Routes>
            <Route path="/" element={<Todo />} />
            <Route path="todo:addTodo" element={<AddTask />} />
            <Route path="notes" element={<Notes />} />
            <Route path="notes:compose/:type" element={<Compose />} />
            <Route path="secrets" element={<Secrets />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </Router>
    </Main.Provider>
  );
}
