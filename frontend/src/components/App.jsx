import React, { useState, useEffect, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Button, Navbar, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Provider, ErrorBoundary } from '@rollbar/react';
import { getChannels } from '../services/channelsApi.js';
import AuthContext from '../contexts/index.jsx';
import useAuth from '../hooks/index.jsx';

import LoginPage from './LoginPage';
import HomePage from './HomePage';
import NotFoundPage from './NotFoundPage';
import SignUpPage from './SignUpPage';

const rollbarConfig = {
  accessToken: process.env.REACT_APP_ROLLBAR_ACCESS_TOKEN,
  environment: 'testenv',
};

const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const { error } = getChannels();
  const logIn = () => setLoggedIn(true);
  const logOut = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setLoggedIn(false);
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      if (!error) {
        logIn();
      } else {
        logOut();
      }
    }
  }, [error]);

  const contextValue = useMemo(() => ({ loggedIn, logIn, logOut }), [loggedIn]);

  return (
    <AuthContext.Provider value={contextValue}>
      <Provider config={rollbarConfig}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </Provider>
    </AuthContext.Provider>
  );
};

const AuthButton = () => {
  const { t } = useTranslation();
  const auth = useAuth();

  return auth.loggedIn ? (
    <Button onClick={auth.logOut}>{t('navbar.logOutBtn')}</Button>
  ) : null;
};

const PrivateRoute = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  return auth.loggedIn ? children : <Navigate to="/login" state={{ from: location }} />;
};

const LoginRoute = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  return auth.loggedIn ? <Navigate to="/" state={{ from: location }} /> : children;
};

const App = () => {
  const { t } = useTranslation();

  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column h-100">
          <Navbar bg="white" expand="lg" className="shadow-sm">
            <Container>
              <Navbar.Brand as={Link} to="/">{t('navbar.homeLink')}</Navbar.Brand>
              <AuthButton />
            </Container>
          </Navbar>
          <Routes>
            <Route
              path="/"
              element={(
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              )}
            />
            <Route
              path="/login"
              element={(
                <LoginRoute>
                  <LoginPage />
                </LoginRoute>
              )}
            />
            <Route
              path="/signup"
              element={(
                <LoginRoute>
                  <SignUpPage />
                </LoginRoute>
              )}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
