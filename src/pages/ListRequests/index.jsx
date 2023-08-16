import React, { useEffect, useState, useMemo } from 'react';
import { Button, Container, Modal, ModalBody, ModalHeader, Table } from 'reactstrap';
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import TableContainer from '../../components/TableContainer';

const RequestDetail = ({ requestType, project, items }) => {
    const { projectName, projectManager, projectDirector } = project;
    return (
        <>
            <tr>
                <th>Request Type</th>
                <td>{requestType}</td>
            </tr>
            <tr>
                <th>Project Name</th>
                <td>{projectName}</td>
            </tr>
            <tr>
                <th>Project Managers</th>
                <td>
                    {projectManager.map(({ fName, lName }, index) => (
                        <div key={index}>
                            {fName} {lName}
                        </div>
                    ))}
                </td>
            </tr>
            <tr>
                <th>Project Director</th>
                <td>{projectDirector.fName} {projectDirector.lName}</td>
            </tr>
            {items && items.map((item, index) => (
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
        </>
    );
};

const RequestDetailModal = ({ isOpen, toggle, requestDetail }) => {
    if (!requestDetail) return null;
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Request Detail</ModalHeader>
            <ModalBody>
                <Table>
                    <tbody>
                        <RequestDetail {...requestDetail} />
                    </tbody>
                </Table>
            </ModalBody>
        </Modal>
    );
};

const ListRequests = () => {
    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        'requests',
        'status',
        'data'
    );
    const [modal, setModal] = useState(false);
    const [requestDetail, setRequestDetail] = useState(null);
    const statusMap = ['Pending', 'Approved', 'Declined', 'Unknown'];

    useEffect(() => {
        fetchData({ pageSize: 10, pageIndex: 1 });
    }, [fetchData]);

    const fetchRequestDetail = async (requestId) => {
        const response = await axiosInstance.get(`/requests/${requestId}`);
        setRequestDetail(response.data);
        toggle();
    };

    const columns = useMemo(
        () => [
            { Header: 'Project Name', accessor: 'project.projectName' },
            { Header: 'Request Type', accessor: 'requestType' },
            {
                Header: 'Status',
                accessor: 'globalStatus',
                Cell: ({ value }) => statusMap[value] || statusMap[3],
            },
            {
                Header: 'Actions',
                accessor: '_id',
                Cell: ({ value: requestId }) => (
                    <Button onClick={() => fetchRequestDetail(requestId)}>View Details</Button>
                ),
            },
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
            <RequestDetailModal isOpen={modal} toggle={toggle} requestDetail={requestDetail} />
        </Container>
    );
};

export default ListRequests;
