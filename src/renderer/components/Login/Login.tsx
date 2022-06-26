import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Main from 'renderer/context/main';
import './Login.css';

const Login = () => {
  const context = useContext(Main);
  const [email, updateEmail] = useState('');
  const [password, updatePassword] = useState('');
  const [disableButton, toggleButton] = useState(false);

  return (
    <form className="login-main">
      <h1>Login</h1>
      <div className="login-input">
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => updateEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => updatePassword(e.target.value)}
        />
      </div>
      <div className="login-final">
        <h2>Forgot password?</h2>
        <button
          type="submit"
          disabled={disableButton}
          onClick={() => {
            if (!email.trim() || !password.trim()) {
              return;
            }
            toggleButton(true);
            axios
              .post(`${context.URI}/login`, {
                email: email.trim(),
                password: password.trim(),
              })
              .then((response) => {
                sessionStorage.setItem('email', email.trim());
                sessionStorage.setItem(
                  'AccessToken',
                  response.data.AccessToken
                );
                sessionStorage.setItem(
                  'RefreshToken',
                  response.data.RefreshToken
                );
                return context.UpdateAuthInfoState({
                  status: true,
                  AccessToken: response.data.AccessToken,
                  RefreshToken: response.data.RefreshToken,
                });
              })
              .catch((err) => {
                toggleButton(false);
              });
          }}
        >
          Sign-In
        </button>
      </div>
    </form>
  );
};

export default Login;
