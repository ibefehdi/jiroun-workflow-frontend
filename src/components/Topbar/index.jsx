// Topbar.js
import React from 'react';
import './topbar.css';
import jirounIcon from '../../assets/img/jirounicon.png'
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
function Topbar({ toggleSidebar, isOpen }) {
    return (
        <div className="topbar">
            <button onClick={toggleSidebar} className='toggle-btn'>
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <img src={jirounIcon} alt="" />
            <h1>Jiroun Workflow</h1>
            {/* Add your desired topbar components or functionality here */}
        </div>
    );
}

export default Topbar;
