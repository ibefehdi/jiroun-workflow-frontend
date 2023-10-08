import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Sidebar from '../../components/Sidebar/index';
import Topbar from '../../components/Topbar';
import { useSelector } from 'react-redux';

function Dashboard({ sidebarTabs, children, handleLogout, adminTabs }) {
  const [isOpen, setIsOpen] = useState(true);
  const permissions = useSelector(state => state.permissions); // Fetch permissions from the Redux store

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  }

  return (
    <Container fluid={true} className="vh-100">
      <Row noGutters>
        <Col xs="12" sm="3" md="2" className="border-right">
          <Sidebar
            tabs={sidebarTabs}
            adminTabs={adminTabs}
            isOpen={isOpen}
            handleLogout={handleLogout}
            permissions={permissions} // Pass permissions
          />        </Col>
        <Col xs="12" sm="9" md="10">
          {children}
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
