import React from 'react';

const Main = React.createContext<{
  AuthInfo: { status: boolean; AccessToken: string | null };
  URI: string;
  UpdateAuthInfo: (data: {
    status: boolean;
    AccessToken: string | null;
    RefreshToken: string | null;
  }) => void;
  RefreshAccessToken: () => void;
  getAuthHeaders: () => {
    headers: {
      Authorization: string;
    };
  };
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
