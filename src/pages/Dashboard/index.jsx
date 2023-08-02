import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Sidebar from '../../components/Sidebar/index';
import Topbar from '../../components/Topbar';

function Dashboard({ sidebarTabs, children, handleLogout }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  }

  return (
    <Container fluid={true} className="vh-100">
      <Row noGutters>
        <Col xs="12" sm="3" md="2" className="border-right">
          <Sidebar tabs={sidebarTabs} isOpen={isOpen} handleLogout={handleLogout} />
        </Col>
        <Col xs="12" sm="9" md="10">
          {children}
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
