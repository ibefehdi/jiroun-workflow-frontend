import React from 'react';
import { Nav, NavItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import "./sidebar.css"
import { useSelector } from 'react-redux';
function Sidebar({ tabs }) {
    const fName = useSelector(state => state.fName);
    const lName = useSelector(state => state.lName);
    const occupation = useSelector(state => state.occupation);


    
    return (
        <div className='sidebar'>
            <div className='user-info'>
                <h2>{fName} {lName}</h2>
                <h4>{occupation}</h4>
            </div>
            <Nav vertical>
                {tabs.map((tab, index) => (
                    <NavItem key={index} >
                        <Link to={`/${tab.toLowerCase()}`} className="nav-link">{tab}</Link>
                    </NavItem>
                ))}
            </Nav>
        </div>
    );
}

export default Sidebar;
