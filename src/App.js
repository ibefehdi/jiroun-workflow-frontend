import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import axiosInstance from './constants/axiosConstant.js';
import Loginform from './components/Loginform/index'
import { useEffect, useState } from 'react';
function App() {
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthenticated(true);
      // Optionally, you can verify the token with your server
      // to get the user information and set the user state
    }
  }, []);
  const handleLogin = async (username, password) => {
    try {
      const response = await axiosInstance.post("/users/login", {
        username,
        password,
      });

      if (response.status === 200) {
        console.log(response.data);

        setAuthenticated(true);
        localStorage.setItem("token", response.data.token); // Save the token to localStorage
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthenticated(false);

  };
  return (
    <div className="App">
      {authenticated ? (
        <div>Authenticated</div>
      ) : (
        <Loginform onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
