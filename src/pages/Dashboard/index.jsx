import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import Sidebar from '../../components/Sidebar/index'
import { Outlet } from 'react-router-dom';

function Dashboard({ sidebarTabs, children }) {
    return (
        <Container fluid={true}>
        <Row>
          <Col xs="2">
            <Sidebar tabs={sidebarTabs} />
          </Col>
          <Col xs="10">
            <Outlet />
          </Col>
        </Row>
      </Container>
    );
}

export default Dashboard;
