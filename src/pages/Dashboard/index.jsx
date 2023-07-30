import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Sidebar from '../../components/Sidebar/index'
import Topbar from '../../components/Topbar';

function Dashboard({ sidebarTabs, children, handleLogout }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  }

  return (
    <>
      <Container fluid={true}>
        <Row>
          <Col xs="2">
            <Sidebar tabs={sidebarTabs} isOpen={isOpen} handleLogout={handleLogout} />
          </Col>
          <Col xs="10">
            {children}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Dashboard;
