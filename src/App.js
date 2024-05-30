import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from './constants/axiosConstant.js';
import Loginform from './components/Loginform/index'
import React, { useEffect, useState } from 'react';
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
import ListYourRequests from './pages/ListYourRequests';
import Home from './pages/Home';

import DeletedRequests from './pages/DeletedRequests/Index';
import CompletedRequests from './pages/CompletedRequests';
import ChangePasswordModal from './components/ChangePasswordModal';
import Contractors from './pages/Contractors';
import ApprovedPaymentRequests from './pages/ApprovedPaymentRequests';
import ApprovedItemRequests from './pages/ApprovedItemRequests';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';
import ContractorWork from './pages/ContractorWork/index.jsx';
import Notification from './components/Notification/index.js';
import ApprovedLabourRequest from './pages/ApprovedLabourRequest/index.jsx';
import Attendance from './pages/Attendance/index.jsx';



function App() {
  const allRoutes = [

    { name: "List Projects", icon: RoomIcon, path: "/projects_list", component: ListProjects },

    {
      name: "Create Request", icon: RequestPageIcon, path: "/add_requests", component: Request,
    },

    {
      name: "Pending Requests", icon: RequestPageIcon, path: "/list_your_requests", component: ListYourRequests,
    },
    { name: "Projects Management", icon: RoomIcon, path: "/projects_management", component: Projects },
    {
      name: "User Management", icon: GroupIcon, path: "/user_management", component: UserManagement,
    },
    {
      name: "Contractors Management", icon: GroupIcon, path: "/contractors_management", component: Contractors,
    },
    {
      name: "List All Requests", icon: RequestPageIcon, path: "/list_requests", component: ListRequests
    },
    {
      name: "Rejected Requests", icon: RequestPageIcon, path: "/deleted_requests", component: DeletedRequests
    },
    {
      name: "Approved Payment Requests", icon: RequestPageIcon, path: "/approved_payment", component: ApprovedPaymentRequests
    },
    {
      name: "Approved Items Requests", icon: RequestPageIcon, path: "/approved_items", component: ApprovedItemRequests
    },
    {
      name: "Approved Labour Requests", icon: RequestPageIcon, path: "/approved_labour", component: ApprovedLabourRequest
    },
    {
      name: "Completed Requests", icon: RequestPageIcon, path: "/completed_requests", component: CompletedRequests
    },
    {
      name: "Attendance", icon: RequestPageIcon, path: "/attendance", component: Attendance
    },
    {
      name: "Contractor Work", icon: RequestPageIcon, path: "/contractor_work", component: ContractorWork
    }

  ];

  const permissions = useSelector(state => state.permissions);  // Fetch permissions from the Redux store

  const dispatch = useDispatch();
  const [count, setCount] = useState()
  useEffect(() => {
    const fetchData = async () => {

      const userCount = await axiosInstance.get('/userscount')

      setCount(userCount?.data?.count)

    }
    fetchData();
  }, [count])
  const authenticated = useSelector(state => state.authenticated);
  const superAdmin = useSelector(state => state.superAdmin);
  const hasChangedPassword = useSelector(state => state.hasChangedPassword);
  const APP_VERSION = '1.0.2'; // Update this with every release

  useEffect(() => {
    // Check app version only once when the component mounts
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion !== APP_VERSION) {
      localStorage.clear();
      dispatch(setAuthentication(false));  // Ensure user is logged out
    }

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token) {
      dispatch(setAuthentication(true));
    }
    if (user) {
      dispatch(setUserData(JSON.parse(user)));
    }
  }, [dispatch]);  // Empty dependency array ensures this effect runs only once when component mounts


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
        const userData = {
          fName: response.data.fName,
          lName: response.data.lName,
          occupation: response.data.occupation,
          superAdmin: response.data.superAdmin,
          username: response.data.username,
          hasChangedPassword: response.data.hasChangedPassword,
          permissions: response.data.permissions,
          _id: response.data._id,
        };

        dispatch(setUserData(userData));
        localStorage.setItem("user", JSON.stringify(userData));

        dispatch(setAuthentication(true));
        localStorage.setItem("token", response.data.token);

        // Set the app_version in localStorage when user logs in
        localStorage.setItem('app_version', APP_VERSION);
      }
    } catch (error) {
      console.error(error);
    }
  };

  function NotificationBubble({ count }) {
    if (count <= 0) return null; // Don't display the bubble if count is 0 or negative
    return (
      <div className="notification-bubble">
        {count}
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(setAuthentication(false));
  };


  return (
    <Router>
      {hasChangedPassword === false && <ChangePasswordModal />}
      {authenticated ? (
        <Dashboard handleLogout={handleLogout} sidebarTabs={allRoutes}>
          <Switch>
            <Route path="/" exact component={Home} />

            {permissions.length === 0 ? (
              <Redirect to="/" />
            ) : (
              allRoutes.map(route => (
                permissions.includes(route.path.substring(1)) &&
                <Route
                  key={route.path}
                  path={route.path}
                  component={route.component}
                />
              ))
            )}
          </Switch>
        </Dashboard>
      ) : (
        <Loginform onLogin={handleLogin} />
      )}
    </Router>
  );
}

export default App;
