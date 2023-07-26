import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Sidebar from '../../components/Sidebar/index'
import { Outlet } from 'react-router-dom';
import Topbar from '../../components/Topbar';

function Dashboard({ sidebarTabs, children }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  }

  return (
    <>
      <Topbar toggleSidebar={toggleSidebar} isOpen={isOpen} />
      <Container fluid={true}>
        <Row>
          <Col xs="2">
            <Sidebar tabs={sidebarTabs} isOpen={isOpen} />
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
