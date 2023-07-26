import React, { useState } from 'react'
import { Container } from 'reactstrap'

const UserManagement = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    return (
        <Container className={sidebarOpen ? 'pagecontainer' : 'pagecontainer-closed'}>
            <h1>User Management</h1>
            <h1>User Management</h1>
            <h1>User Management</h1>
            <h1>User Management</h1>
            <h1>User Management</h1>
            <h1>User Management</h1>
            <h1>User Management</h1>
            <h1>User Management</h1>
            <h1>User Management</h1>

        </Container>
    )
}

export default UserManagement