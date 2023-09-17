import React, { useEffect, useMemo } from 'react'
import { Button, Container } from 'reactstrap'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import TableContainer from '../../components/TableContainer'

const Contractors = () => {
    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        `users/contractors`,
        'status',
        'data'
    );
    console.log(data)
    useEffect(() => {
        fetchData({
            pageSize: 10,
            pageIndex: 0,
        });
    }, [fetchData])
    const columns = useMemo(
        () => [
            {
                Header: "First Name",
                accessor: "fName",
            },
            {
                Header: "Last Name",
                accessor: "lName",
            },
            {
                Header: "Username",
                accessor: "username",
            },
            {
                Header: "Actions",
                accessor: "_id",
                Cell: ({ value }) => (
                    <Button onClick={() => {
                        console.log("You clicked", value);
                    }}>                        View Details
                    </Button>
                ),
            }

        ],
        []
    );

    return (
        <Container className={'pagecontainer'}>
            <div>
                <h1 className='Heading'>Contractors</h1>
            </div>
            <TableContainer
                data={data}
                pageCount={pageCount}
                fetchData={fetchData}
                loading={loadStatus}
                totalDataCount={totalDataCount}
                columns={columns}

            />
        </Container>
    )
}

export default Contractors