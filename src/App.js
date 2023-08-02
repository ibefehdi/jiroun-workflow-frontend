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
import RoomIcon from '@mui/icons-material/Room';
import GroupIcon from '@mui/icons-material/Group';
import UserManagement from './pages/UserManagement/index';
import Projects from './pages/Projects';
import ListProjects from './pages/ListProjects';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import Request from './pages/Request';
import ListRequests from './pages/ListRequests';
import ListYourProjects from './pages/ListYourRequests';
function Home() {
  return <div><h1 style={{ fontSize: "100px" }}>Home Page</h1></div>;
}


function App() {
  const tabs = [
    { name: "Home", icon: HomeIcon, path: "/" },
    { name: "List Projects", icon: RoomIcon, path: "/projects" },
    { name: "Projects Management", icon: RoomIcon, path: "/projectsmanagement", adminOnly: true, },
    {
      name: "User Management", icon: GroupIcon, path: "/usermanagement", adminOnly: true,
    },
    {
      name: "Requests", icon: RequestPageIcon, path: "/addrequests",
    },
    {
      name: "List All Requests", icon: RequestPageIcon, path: "/listRequests", adminOnly: true,
    },
    {
      name: "List Your Requests", icon: RequestPageIcon, path: "/listyourrequests",
    }
  ];
  const dispatch = useDispatch();

  const authenticated = useSelector(state => state.authenticated);
  const superAdmin = useSelector(state => state.superAdmin);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token) {
      dispatch(setAuthentication(true));

    }
    if (user) {
      dispatch(setUserData(JSON.parse(user)));
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

        const userData = {
          fName: response.data.fName,
          lName: response.data.lName,
          occupation: response.data.occupation,
          superAdmin: response.data.superAdmin,
          username: response.data.username,
          _id: response.data._id,
        };

        dispatch(setUserData(userData));
        localStorage.setItem("user", JSON.stringify(userData));

        dispatch(setAuthentication(true));
        localStorage.setItem("token", response.data.token);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(setAuthentication(false));
  };

  return (
    <Router>
      {authenticated ? (
        <Switch>
          {superAdmin && (<Route path="/usermanagement" render={() => <Dashboard handleLogout={handleLogout} sidebarTabs={tabs}><UserManagement /></Dashboard>} />)}
          <Route path="/" exact render={() => <Dashboard handleLogout={handleLogout} sidebarTabs={tabs}><Home /></Dashboard>} />
          <Route path="/projects" render={() => <Dashboard handleLogout={handleLogout} sidebarTabs={tabs}><ListProjects /></Dashboard>} />
          {superAdmin && (<Route path="/projectsmanagement" render={() => <Dashboard handleLogout={handleLogout} sidebarTabs={tabs}><Projects /></Dashboard>} />)}
          <Route path="/addrequests" render={() => <Dashboard handleLogout={handleLogout} sidebarTabs={tabs}><Request /></Dashboard>} />
          {superAdmin && (<Route path="/listRequests" render={() => <Dashboard handleLogout={handleLogout} sidebarTabs={tabs}><ListRequests /></Dashboard>} />)}
          <Route path="/listyourrequests" render={() => <Dashboard handleLogout={handleLogout} sidebarTabs={tabs}><ListYourProjects /></Dashboard>} />
        </Switch>
      ) : (
        <Loginform onLogin={handleLogin} />
      )}
    </Router>
  );
}

export default App;
