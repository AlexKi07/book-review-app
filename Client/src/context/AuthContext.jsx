import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.access_token) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          throw new Error('Missing access token');
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        logout(); 
      }
    }

    setIsLoadingAuth(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('https://book-review-app-kgew.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();

      if (!data.access_token || !data.user) {
        throw new Error('Invalid response from server');
      }

      const fullUserData = {
        ...data.user,
        access_token: data.access_token,
        refresh_token: data.refresh_token || '',
      };

      localStorage.setItem('user', JSON.stringify(fullUserData));
      setUser(fullUserData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        login,
        logout,
        setUser,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
