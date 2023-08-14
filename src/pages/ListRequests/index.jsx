import React, { useEffect, useMemo, useState } from 'react'
import { Button, Container, Modal, ModalBody, ModalHeader, Table } from 'reactstrap'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import TableContainer from '../../components/TableContainer';

const RequestDetailModal = ({ isOpen, toggle, requestDetail }) => {
    if (!requestDetail) {
        return null;
    }

    const { requestType, project, items, chainOfCommand } = requestDetail;
    const { projectManager, projectDirector } = project;
    const requestSentTo = chainOfCommand[0]?.nextUserId;

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Request Detail</ModalHeader>
            <ModalBody>
                <Table>
                    <tbody>
                        <tr>
                            <th>Request Type</th>
                            <td>{requestType}</td>
                        </tr>
                        <tr>
                            <th>Project Name</th>
                            <td>{project.projectName}</td>
                        </tr>
                        <tr>
                            <th>Project Managers</th>
                            <td>
                                {projectManager && projectManager.map((manager, index) => (
                                    <div key={index}>
                                        {manager.fName} {manager.lName}
                                    </div>
                                ))}
                            </td>
                        </tr>
                        <tr>
                            <th>Project Director</th>
                            <td>{projectDirector.fName} {projectDirector.lName}</td>
                        </tr>
                        <tr>
                            <th>Request Sent To</th>
                            <td>{requestSentTo?.fName} {requestSentTo?.lName}</td>
                        </tr>
                        {items.map((item, index) => (
                            <React.Fragment key={index}>
                                <tr>
                                    <th>Item {index + 1} Name</th>
                                    <td>{item.itemName}</td>
                                </tr>
                                <tr>
                                    <th>Item {index + 1} Quantity</th>
                                    <td>{item.itemQuantity}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </Table>
            </ModalBody>
        </Modal>
    )
}


const ListRequests = () => {
    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        'requests',
        'status',
        'data'
    );
    useEffect(() => {
        console.log("data", data);
    }, [data])

    const [modal, setModal] = useState(false);
    const [requestDetail, setRequestDetail] = useState(null);

    useEffect(() => {
        fetchData({
            pageSize: 10,
            pageIndex: 1,
        });
    }, [fetchData])

    const fetchRequestDetail = async (requestId) => {
        const response = await axiosInstance.get(`/requests/${requestId}`);
        setRequestDetail(response.data);
        toggle();
    };

    const columns = useMemo(
        () => [
            {
                Header: 'Project Name',
                accessor: 'project.projectName', // This is a nested field
            },


            {
                Header: 'Request Type',
                accessor: 'requestType',
            },


            {
                Header: 'Status',
                accessor: 'globalStatus',
                Cell: ({ value }) => {
                    if (value === 0) {
                        return 'Pending';
                    } else if (value === 1) {
                        return 'Approved';
                    } else if (value === 2) {
                        return 'Declined';
                    } else {
                        return 'Unknown';
                    }
                }
            },
         
            {
                Header: 'Actions',
                accessor: '_id',
                Cell: ({ value: requestId }) => (
                    <Button onClick={() => fetchRequestDetail(requestId)}>
                        View Details
                    </Button>
                ),
            }
        ],
        [fetchRequestDetail]
    );

    const toggle = () => setModal(!modal);

    return (
        <Container className='pagecontainer'>
            <div className='header'>
                <h1 className='Heading'>Requests List</h1>
            </div>
            <TableContainer
                data={data}
                pageCount={pageCount}
                fetchData={fetchData}
                loading={loadStatus}
                totalDataCount={totalDataCount}
                columns={columns}
            />
            <RequestDetailModal
                isOpen={modal}
                toggle={toggle}
                requestDetail={requestDetail}
            />
        </Container>
    )
}

export default ListRequests
