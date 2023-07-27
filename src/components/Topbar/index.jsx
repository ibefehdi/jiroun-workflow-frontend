// Topbar.js
import React from 'react';
import './topbar.css';
import jirounIcon from '../../assets/img/jirounicon.png'
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
function Topbar({ toggleSidebar, isOpen, handleLogout }) {

    return (
        <div className="topbar">
            <button onClick={toggleSidebar} className='toggle-btn'>
                {isOpen ? <MenuIcon /> : <MenuIcon />}
            </button>
            <img src={jirounIcon} alt="" />
            <h1>Jiroun Workflow</h1>
            {/* Add your desired topbar components or functionality here */}
            <button onClick={handleLogout} className='signout-btn'><LogoutIcon /></button>

        </div>
    );
}

export default Topbar;
