import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import axiosInstance from './constants/axiosConstant.js';
import Loginform from './components/Loginform/index'
import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard/index';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, setAuthentication } from './redux/actions';

function Home() {
  return <h1>Home Page</h1>;
}

function About() {
  return <h1>About Page</h1>;
}

function Contact() {
  return <h1>Contact Page</h1>;
}

function App() {
  const tabs = ['Home', 'About', 'Contact'];
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
    <Router >
      {authenticated ? (
        <Dashboard sidebarTabs={tabs}>

          <Route path="/" element={<Home />} index />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />


        </Dashboard>
      ) : (
        <Loginform onLogin={handleLogin} />
      )}
    </Router>
  );
}

export default App;
