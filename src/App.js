import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import axiosInstance from './constants/axiosConstant.js';
import Loginform from './components/Loginform/index'
import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard/index';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, setAuthentication } from './redux/actions';
import HomeIcon from '@mui/icons-material/Home';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import UserManagement from './pages/UserManagement/index';
function Home() {
  return <div><h1 style={{ fontSize: "100px" }}>Home Page</h1></div>;
}


function App() {
  const tabs = [
    { name: "Home", icon: HomeIcon, path: "/" },
    { name: "User Management", icon: GroupIcon, path: "/usermanagement" }
  ];
  const dispatch = useDispatch();

  const authenticated = useSelector(state => state.authenticated);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(setAuthentication(true));

    }
  }, [dispatch]);
  const handleLogin = async (username, password) => {
    try {
      const response = await axiosInstance.post("/users/login", {
        username,
        password,
      });

      if (response.status === 200) {
        console.log(response.data);

        dispatch(setUserData({
          fName: response.data.fName,
          lName: response.data.lName,
          occupation: response.data.occupation,
          superAdmin: response.data.superAdmin,
          username: response.data.username
        }));

        dispatch(setAuthentication(true));
        localStorage.setItem("token", response.data.token);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(setAuthentication(false));

  };
  return (
    <Router>
      {authenticated ? (
        <Switch>
          <Route path="/usermanagement" render={() => <Dashboard sidebarTabs={tabs}><UserManagement /></Dashboard>} />
          <Route path="/" exact render={() => <Dashboard sidebarTabs={tabs}><Home /></Dashboard>} />
        </Switch>
      ) : (
        <Loginform onLogin={handleLogin} />
      )}
    </Router>
  );
}

export default App;
