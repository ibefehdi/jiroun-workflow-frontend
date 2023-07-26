import React, { useEffect, useMemo, useState } from 'react'
import { Container } from 'reactstrap'
import axiosInstance from '../../constants/axiosConstant'
import TableContainer from '../../components/TableContainer'
import { useGETAPI } from '../../hooks/useGETAPI'

const UserManagement = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        '/users',
        'status',
        'data'
    );

    useEffect(() => {
        fetchData({
            pageSize: 10,
            pageIndex: 1,
        });
    }, [fetchData])

    const columns = useMemo(
        () => [
            {
                Header: 'First Name',
                accessor: 'fName',
            },
            {
                Header: 'Last Name',
                accessor: 'lName',
            },
            {
                Header: 'Username',
                accessor: 'username',
            },   
            {
                Header: 'Occupation',
                accessor: 'occupation',
            },
        ],
        []
    );
    if (loadStatus) {
        return <div>Loading...</div>;
    }
    return (
        <Container className={sidebarOpen ? 'pagecontainer' : 'pagecontainer-closed'}>
            <h1>User Management</h1>
            <TableContainer data={data} columns={columns} />
        </Container>
    )
}

export default UserManagement
