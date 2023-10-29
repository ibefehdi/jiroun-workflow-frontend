import React, { useEffect, useState, useMemo } from 'react';
import { Button, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, ModalFooter, ModalHeader, Progress, Table } from 'reactstrap';
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import TableContainer from '../../components/TableContainer';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const RequestDetail = ({ requestDetail }) => {
    const wasFinalized = (isFinalized) => {
        if (isFinalized === 1) {
            return "Approved"
        } else if (isFinalized === 2) {
            return "Was sent back for more information"
        }
        else if (isFinalized === 0) {
            return "Pending"
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
                        <td onClick={() => console.log("contractor clicked")}>{requestDetail?.contractorForPayment?.fName} {requestDetail?.contractorForPayment?.lName}</td>
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
        <Table className="details-table" hover bordered striped>
            <tbody>
                <tr><td><strong>Request ID:</strong></td><td>{requestDetail?.requestID}</td><td></td></tr>
                <tr><td><strong>Request Type:</strong></td><td>{requestDetail?.requestType}</td><td></td></tr>
                <tr><td><strong>Request Title:</strong></td><td>{requestDetail?.requestTitle}</td><td></td></tr>
                <tr><td><strong>Project Name:</strong></td><td>{requestDetail?.project?.projectName}</td><td></td></tr>
                <tr><td><strong>Project Year:</strong></td><td>{new Date(requestDetail?.project?.year).getFullYear()}</td><td></td></tr>
                <tr><td><strong>Project Location:</strong></td><td>{requestDetail?.project?.location}</td><td></td></tr>
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
    );
};

const RequestDetailModal = ({ isOpen, toggle, requestDetail }) => {

    if (!requestDetail) return null;
    return (
        <Modal isOpen={isOpen} toggle={toggle} style={{ maxWidth: "70rem" }}>
            <ModalHeader toggle={toggle}>Request Detail</ModalHeader>
            <ModalBody>
                <Table>
                    <tbody>
                        <RequestDetail requestDetail={requestDetail} />
                    </tbody>
                </Table>
            </ModalBody>

        </Modal>
    );
};

const ListRequests = () => {
    const [reload, setReload] = useState(false)

    const { data, fetchData, pageCount, totalDataCount } = useGETAPI(
        axiosInstance.get,
        'requests',
        'status',
        'data'
    );

    useEffect(() => {
        fetchData({ pageIndex: 0, pageSize: 10 });
    }, [fetchData]);
    const BOLD_STYLE = { fontWeight: "bolder" };

    const [modal, setModal] = useState(false);
    const [requestDetail, setRequestDetail] = useState(null);
    const statusMap = ['Pending', 'Approved', 'Declined', 'Unknown'];



    const fetchRequestDetail = async (requestId) => {
        const response = await axiosInstance.get(`/requests/${requestId}`);
        setRequestDetail(response?.data);
        toggle();
    };
    const columns = useMemo(
        () => [
            {
                Header: "Request Id",
                accessor: "requestID",
            },
            {
                Header: "Project ID",
                accessor: "project.projectName",
            },
            {
                Header: "Request Type",
                accessor: "requestType",
            },
            {
                Header: "Request Title",
                accessor: "requestTitle",
                Cell: ({ value }) =>
                    (value ? value : 'N/A')

            },
            {
                Header: "Global Status",
                accessor: "globalStatus",
                Cell: ({ value }) => {
                    if (value === 0) {
                        return 'Pending';
                    } else if (value === 1) {
                        return 'Approved';
                    } else if (value === 2) {
                        return 'Attention Required';
                    } else {
                        return 'Deleted';
                    }
                }
            },
            {
                Header: "Contractor",
                accessor: 'contractorForPayment',
                Cell: ({ value }) => {
                    if (!value) {
                        return "N/A";
                    }
                    return `${value.fName} ${value.lName}`;
                }
            },
            {
                Header: "Progress",
                accessor: "progress",
                Cell: ({ value }) => {  // Note the use of row here
                    return `${value}%`
                }
            },
            {
                Header: "Created At",
                accessor: "createdAt",
                Cell: ({ value }) => {
                    return new Date(value).toLocaleDateString();
                }
            },
            {
                Header: "Actions",
                accessor: "_id",
                Cell: ({ cell, row }) => {
                    return (
                        <div style={{ display: "flex", gap: 10 }}>
                            <Button onClick={() => {
                                fetchRequestDetail(cell.value);
                            }}>
                                View Details
                            </Button>

                            {row.original.requestType === 'Request Payment' &&
                                <Button color='success' onClick={() => toggleChangeContractorModal(cell.value)} size='sm' outline >
                                    Change
                                </Button>
                            }
                        </div>
                    );
                },
            }

        ],
        []
    );
    const [contractors, setContractors] = useState();
    const fetchContractors = async () => {
        const contractors = await axiosInstance.get(`users/allcontractors`);
        console.log(contractors?.data)
        setContractors(contractors?.data)
    }
    const [currentRequestId, setCurrentRequestId] = useState(null);
    useEffect(() => { fetchContractors() }, [])
    const toggle = () => setModal(!modal);
    const [changeContractorModal, setChangeContractorModal] = useState(false);
    const [selectedContractor, setSelectedContractor] = useState();
    const toggleChangeContractorModal = (requestId) => {
        setCurrentRequestId(requestId);
        setChangeContractorModal(!changeContractorModal);
    };
    const changeContractor = async () => {
        try {
            const response = await axiosInstance.put(`/requests/contractor/${currentRequestId}`, { contractorForPayment: selectedContractor });
            fetchData({ pageIndex: 0, pageSize: 10 });
        } catch (err) {
            console.error(err)
        }
        toggleChangeContractorModal(null)
    };
    return (
        <Container className='pagecontainer'>
            <div className='header'>
                <h1 className='Heading'>Requests List</h1>
            </div>
            <TableContainer
                columns={columns}
                refresh={reload}
                pageCount={pageCount}
                totalDataCount={totalDataCount}
                data={data}
                fetchData={fetchData}
                isGlobalFilter={false}
                customPageSize={10}
                className="custom-header-css"
            />
            <RequestDetailModal isOpen={modal} toggle={toggle} requestDetail={requestDetail} />
            <Modal isOpen={changeContractorModal} toggle={toggleChangeContractorModal}>
                <ModalHeader toggle={toggleChangeContractorModal}>Change Contractor</ModalHeader>
                <ModalBody>
                    <select onChange={(e) => setSelectedContractor(e.target.value)}>
                        <option>------Select Contractor------</option>

                        {
                            contractors && contractors.map((contractor) => (<option value={contractor._id}>{contractor?.fName} {contractor?.lName}</option>))
                        }
                    </select>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={changeContractor}>Save</Button>
                    <Button color="secondary" onClick={toggleChangeContractorModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </Container>
    );
};

export default ListRequests;
