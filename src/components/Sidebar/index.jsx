import React from 'react';
import { Nav, NavItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import "./sidebar.css"
import { useSelector } from 'react-redux';
import HomeIcon from '@mui/icons-material/Home';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import InfoIcon from '@mui/icons-material/Info';

function Sidebar({ tabs, isOpen }) {
    const fName = useSelector(state => state.fName);
    const lName = useSelector(state => state.lName);
    const occupation = useSelector(state => state.occupation);
    const superAdmin = useSelector(state => state.superAdmin);
    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className={`user-info ${isOpen ? '' : 'hidden'}`}>
                <h2>{fName} {lName}</h2>
                <h4>{occupation}</h4>
            </div>
            <Nav vertical>
                {tabs.map((tab, index) => (
                    <NavItem key={index}>
                        <Link to={tab.path} className="nav-link">
                            <tab.icon style={{ fontSize: 20, marginRight: 10 }} />
                            <span className={`link-text ${isOpen ? '' : 'hidden'}`}>{tab.name}</span>
                        </Link>
                    </NavItem>

                ))}
            </Nav>
        </div>
    );
}

export default Sidebar;
