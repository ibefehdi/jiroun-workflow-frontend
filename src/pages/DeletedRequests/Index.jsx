import React, { useEffect, useMemo } from 'react'
import { Container } from 'reactstrap'
import TableContainer from '../../components/TableContainer'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';

const DeletedRequests = () => {
    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        `/deletedrequests`,
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
                Header: "Request Id",
                accessor: "requestID",
            },
            {
                Header: "Project Name",
                accessor: "project.projectName"
            },
            {
                Header: 'Request Type',
                accessor: 'requestType',
            },
            {
                Header: 'Status',
                accessor: 'isFinalized',
                id: 'chainItemStatus',
                Cell: ({ value }) => {
                    if (value === 0) {
                        return 'Pending';
                    } else if (value === 1) {
                        return 'Approved';
                    } else if (value === 2) {
                        return 'Declined - Attention Required';
                    }
                    else {
                        return 'Deleted';
                    }
                }
            },
            {
                Header: "Reason for deletion",
                accessor: "comments"
            }
        ]
    )
    return (
        <Container className={'pagecontainer'}>
            <div>
                <h1>Deleted Requests</h1>
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

export default DeletedRequests