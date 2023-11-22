import React, { useEffect, useMemo, useState } from 'react'
import { Button, Container, Modal, ModalHeader, ModalBody, ModalFooter, Table } from 'reactstrap';
import TableContainer from '../../components/TableContainer'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
const CompletedRequests = () => {
    const componentRef = useRef();

    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        `/completedrequests`,
        'status',
        'data'
    );
    useEffect(() => {
        fetchData({
            pageSize: 10,
            pageIndex: 0,
        });
    }, [fetchData])
    const [modal, setModal] = useState(false);
    const [requestDetail, setRequestDetail] = useState(null);
    const fetchRequestDetail = async (id) => {
        const response = await axiosInstance.get(`/completedrequest/${id}`);
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
                Header: "Request Title",
                accessor: "requestTitle",
                Cell: ({ value }) =>
                    (value ? value : 'N/A')

            },
            {
                Header: 'Status',
                accessor: 'globalStatus',
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
                        return 'Rejected';
                    }
                }
            },
            {
                Header: "Acceptance Reason",
                accessor: "comments"
            },
            {
                Header: "Reference Number",
                accessor: "referenceNumber"
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
            },

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
            return "Was Declined"
        }
    }
    const renderRequestPayment = () => {
        if (requestDetail?.requestType === "Request Payment") {
            return (
                <>
                    <tr>
                        <td><strong>Payment Type:</strong></td>
                        <td>{requestDetail?.paymentType}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td><strong>Contractor for payment:</strong></td>
                        <td>{requestDetail?.contractorForPayment?.fName} {requestDetail?.contractorForPayment?.lName}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td><strong>Estimated Amount:</strong></td>
                        <td>{requestDetail?.estimatedAmount}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td><strong>Required Amount:</strong></td>
                        <td>{requestDetail?.requiredAmount}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td><strong>Paid Amount:</strong></td>
                        <td>{requestDetail?.paidAmount}</td>
                        <td></td>
                    </tr>


                </>
            );
        }
        return null;
    };
    return (
        <Container className={'pagecontainer'}>
            <div>
                <h1 className='Heading'>Completed Requests</h1>
            </div>
            <TableContainer
                data={data}
                pageCount={pageCount}
                fetchData={fetchData}
                loading={loadStatus}
                totalDataCount={totalDataCount}
                columns={columns}

            />
            <Modal ref={componentRef} isOpen={modal} toggle={() => setModal(!modal)} className="custom-modal" style={{ maxWidth: '900px' }}>
                <ModalHeader toggle={() => setModal(!modal)} className="modal-header">Request Details <ReactToPrint
                    trigger={() => (
                        <button style={{ background: "none", color: 'black' }}>
                            <PrintIcon />
                        </button>
                    )}
                    content={() => componentRef.current}
                />
                </ModalHeader>
                <ModalBody className="modal-body">
                    <Table className="details-table" hover bordered striped>
                        <tbody>
                            <tr><td><strong>Request ID:</strong></td><td>{requestDetail?.requestID}</td><td></td></tr>
                            <tr><td><strong>Request Type:</strong></td><td>{requestDetail?.requestType}</td><td></td></tr>
                            <tr><td><strong>Request Title:</strong></td><td>{requestDetail?.requestTitle}</td><td></td></tr>
                            <tr><td><strong>Project Name:</strong></td><td>{requestDetail?.project?.projectName}</td><td></td></tr>
                            <tr><td><strong>Project Year:</strong></td><td>{new Date(requestDetail?.project?.year).getFullYear()}</td><td></td></tr>
                            <tr><td><strong>Project Location:</strong></td><td>{requestDetail?.project?.location}</td><td></td></tr>
                            <tr><td><strong>Reference Number:</strong></td><td>{requestDetail?.referenceNumber}</td><td></td></tr>

                            <tr><td><strong style={{ color: "green" }}>Reason for Acceptance:</strong></td><td>{requestDetail?.comments}</td><td></td></tr>
                            <tr><td><strong style={{ color: "green" }}>Accepted At:</strong></td><td>{requestDetail?.subRequestSentAt}</td></tr>
                            {requestDetail?.requestType === "Request Item" && (<tr><td style={{ fontWeight: "bolder" }}>Item Name</td><td style={{ fontWeight: "bolder" }}>Quantity</td><td style={{ fontWeight: "bolder" }}>BOQ ID</td></tr>)}

                            {requestDetail?.requestType === "Request Item" && requestDetail?.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.itemName}</td>
                                    <td>{item.itemQuantity}</td>
                                    <td>{item.boqId}</td>

                                </tr>
                            ))}
                            {(renderRequestPayment())}
                            {requestDetail?.subRequests?.map((subRequest, index) => (
                                <tr key={index}>
                                    <td><strong>Sub Request {index + 1}:</strong></td>
                                    <td>
                                        <div><strong>Sender:</strong> {`${subRequest?.sender?.fName} ${subRequest?.sender?.lName}`}</div>
                                        <div><strong>Recipient:</strong> {`${subRequest?.recipient?.fName} ${subRequest?.recipient?.lName}`}</div>
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

export default CompletedRequests