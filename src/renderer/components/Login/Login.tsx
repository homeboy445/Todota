import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Main from 'renderer/context/main';
import './Login.css';

const Login = () => {
  const context = useContext(Main);
  const [email, updateEmail] = useState<string>('');
  const [password, updatePassword] = useState<string>('');
  const [disableButton, toggleButton] = useState<boolean>(false);
  const [errorLoggingIn, updateErrorState] = useState<{
    status: boolean;
    message: string;
  }>({ status: false, message: '' });

  return (
    <form className="login-main">
      <h1>Login</h1>
      {errorLoggingIn.status ? (
        <h3 className="wrong-pass-notif">{errorLoggingIn.message}</h3>
      ) : null}
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
                const errorString = JSON.stringify(err);
                updateErrorState({
                  status: true,
                  message: errorString.includes('401')
                    ? 'Wrong email/password!'
                    : 'Server error, please try later!',
                });
                setTimeout(() => {
                  updateErrorState({
                    status: false,
                    message: '',
                  });
                }, 3000);
              }); // TODO: Create a setTimeout wrapper for periodically changing states like the above one.
          }} // TODO: You could create your API - frontend status syncer and may include special conditioning and messaging facility for different response status codes.
        >
          Sign-In
        </button>
      </div>
    </form>
  );
};

export default Login;
