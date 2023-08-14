import React, { useEffect, useMemo, useState } from 'react'
import { Button, Container, Modal, ModalHeader, ModalBody, ModalFooter, Table } from 'reactstrap';
import TableContainer from '../../components/TableContainer'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import "./deletedrequests.css"
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
    const [modal, setModal] = useState(false);
    const [requestDetail, setRequestDetail] = useState(null);
    const fetchRequestDetail = async (id) => {
        const response = await axiosInstance.get(`/deletedrequests/${id}`);
        setRequestDetail(response?.data);

    };
    const columns = useMemo(
        () => [
            {
                Header: "Request Id",
                accessor: "requestID",
            },
            {
                Header: "Project Name",
                accessor: "project.projectName",

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
            },
            {
                Header: 'Actions',
                accessor: '_id',
                Cell: ({ value: requestId }) => (
                    <Button onClick={() => {
                        fetchRequestDetail(requestId);
                        setModal(true);
                    }}>                        View Details
                    </Button>
                ),
            }
        ]
    )
    const renderItems = (items) => items.map((item, index) => (
        <tr key={index}>
            <td>{item.itemName}</td>
            <td>{item.itemQuantity}</td>
            <td>{item.boqId}</td>
            { }
        </tr>
    ));
    const wasFinalized = (isFinalized) => {
        if (isFinalized === 1) {
            return "Approved"
        } else if (isFinalized === 2) {
            return "Was sent back for more information"
        }
        else if (isFinalized === 0) {
            return "Was Pending"
        }
    }

    return (
        <Container className={'pagecontainer'}>
            <div>
                <h1 className='Heading'>Deleted Requests</h1>
            </div>
            <TableContainer
                data={data}
                pageCount={pageCount}
                fetchData={fetchData}
                loading={loadStatus}
                totalDataCount={totalDataCount}
                columns={columns}

            />
            <Modal isOpen={modal} toggle={() => setModal(!modal)} className="custom-modal" style={{ maxWidth: '900px' }}>
                <ModalHeader toggle={() => setModal(!modal)} className="modal-header">Request Details</ModalHeader>
                <ModalBody className="modal-body">
                    <Table className="details-table" hover bordered striped>
                        <tbody>
                            <tr><td><strong>Request ID:</strong></td><td>{requestDetail?.requestID}</td><td></td></tr>
                            <tr><td><strong>Request Type:</strong></td><td>{requestDetail?.requestType}</td><td></td></tr>
                            <tr><td><strong>Project Name:</strong></td><td>{requestDetail?.project?.projectName}</td><td></td></tr>
                            <tr><td><strong>Project Year:</strong></td><td>{new Date(requestDetail?.project?.year).getFullYear()}</td><td></td></tr>
                            <tr><td><strong>Project Location:</strong></td><td>{requestDetail?.project?.location}</td><td></td></tr>
                            <tr><td><strong style={{ color: "red" }}>Reason for deletion:</strong></td><td>{requestDetail?.comments}</td><td></td></tr>
                            <tr><td style={{ fontWeight: "bolder" }}>Item Name</td><td style={{ fontWeight: "bolder" }}>Quantity</td><td style={{ fontWeight: "bolder" }}>BOQ ID</td></tr>

                            {requestDetail?.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.itemName}</td>
                                    <td>{item.itemQuantity}</td>
                                    <td>{item.boqId}</td>

                                </tr>
                            ))}
                            {requestDetail?.subRequests?.map((subRequest, index) => (
                                <tr key={index}>
                                    <td><strong>Sub Request {index + 1}:</strong></td>
                                    <td>
                                        <div><strong>Sender:</strong> {subRequest?.sender?.username}</div>
                                        <div><strong>Recipient:</strong> {subRequest?.recipient?.username}</div>
                                        <div><strong>Was the subrequest approved?</strong> {wasFinalized(subRequest?.isFinalized)}</div>
                                        <div><strong>Comments:</strong> {subRequest?.comments}</div>
                                        <div>
                                            <strong>Sent at: </strong>{new Date(subRequest.subRequestSentAt).toLocaleString()}
                                        </div>
                                        
                                    </td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </ModalBody>
                <ModalFooter className="modal-footer">
                    <Button color="secondary" onClick={() => setModal(false)}>Close</Button>
                </ModalFooter>
            </Modal>
        </Container>
    )
}

export default DeletedRequests