import React from 'react';

const Main = React.createContext<{
  AuthInfo: { status: boolean; AccessToken: string | null };
  URI: string;
  UpdateAuthInfoState: (data: {
    status: boolean;
    AccessToken: string | null;
    RefreshToken: string | null;
  }) => void;
  RefreshAccessToken: (err: Error) => void;
  getAuthHeaders: () => {
    headers: {
      Authorization: string;
    };
  };
  isProdMode: boolean;
}>({
  AuthInfo: { status: false, AccessToken: null },
  URI: '',
  UpdateAuthInfo: (...args) => {},
  RefreshAccessToken: () => {},
  getAuthHeaders: () => {
    return {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('AccessToken')}`,
      },
    };
  },
});
export default Main;
