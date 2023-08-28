import React, { useEffect, useState } from 'react';
import { Nav, NavItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import "./sidebar.css"
import { useSelector } from 'react-redux';
import HomeIcon from '@mui/icons-material/Home';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import InfoIcon from '@mui/icons-material/Info';
import jirounLogo from '../../assets/img/jirounicon.png';
import LogoutIcon from '@mui/icons-material/Logout';
import { useHistory } from 'react-router-dom';

function Sidebar({ tabs, isOpen, handleLogout, adminTabs }) {

    const fName = useSelector(state => state.fName);
    const lName = useSelector(state => state.lName);
    const occupation = useSelector(state => state.occupation);
    const superAdmin = useSelector(state => state.superAdmin);
    const [isSidebarForcedClosed, setIsSidebarForcedClosed] = useState(window.innerWidth <= 768);
    const history = useHistory();
    useEffect(() => {
        const handleResize = () => {
            setIsSidebarForcedClosed(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const isSidebarOpen = isOpen && !isSidebarForcedClosed;


    return (
        <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
            <div className="logodiv" onClick={() => { history.push("/") }}>
                <img src={jirounLogo} alt={"JirounIcon"} className='jiroun-logo' />
            </div>

            <div className={`user-info ${isSidebarOpen ? '' : 'hidden'}`}>
                <h2>{fName} {lName}</h2>
                <h4>{occupation}</h4>
            </div>
            <Nav vertical>
                {tabs.map((tab, index) => (
                    (superAdmin || !tab.adminOnly) &&
                    <NavItem key={index}>
                        <Link to={tab.path} className="nav-link">
                            <tab.icon style={{ fontSize: 20, marginRight: 10 }} />
                            <span className={`link-text ${isSidebarOpen ? '' : 'hidden'}`}>{tab.name}</span>
                        </Link>
                        {tab.subItems && isSidebarOpen && (
                            <div className="sub-menu">
                                {tab.subItems.map((subItem, subIndex) => (
                                    <Link key={subIndex} to={subItem.path} className="nav-link">
                                        <span className="link-text">{subItem.name}</span>
                                    </Link>
                                ))}
                            </div>
                        )}

                    </NavItem>
                ))}
                {superAdmin && <div className={''} style={{ marginTop: "20px", color: "white" ,marginLeft:"10px"}}>
                    <h3>Administration</h3>
                </div>}
                {adminTabs?.map((tab, index) => (
                    (superAdmin || !tab.adminOnly) &&
                    <NavItem key={index}>
                        <Link to={tab.path} className="nav-link">
                            <tab.icon style={{ fontSize: 20, marginRight: 10 }} />
                            <span className={`link-text ${isSidebarOpen ? '' : 'hidden'}`}>{tab.name}</span>
                        </Link>
                        {tab.subItems && isSidebarOpen && (
                            <div className="sub-menu">
                                {tab.subItems.map((subItem, subIndex) => (
                                    <Link key={subIndex} to={subItem.path} className="nav-link">
                                        <span className="link-text">{subItem.name}</span>
                                    </Link>
                                ))}
                            </div>
                        )}

                    </NavItem>
                ))}
                <NavItem onClick={() => { handleLogout() }}>
                    <Link to="#" className="nav-link" style={{ position: "absolute", bottom: 0, width: "100%" }}>
                        <LogoutIcon style={{ fontSize: 20, marginRight: 10 }} />
                        <span className='link-text'>Sign Out</span>
                    </Link>
                </NavItem>
            </Nav>

        </div>
    );
}

export default Sidebar;
