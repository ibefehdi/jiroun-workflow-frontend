import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Container, Modal, ModalHeader, ModalBody, ModalFooter, Table, Input, Label, FormGroup } from 'reactstrap';
import TableContainer from '../../components/TableContainer'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import { Form } from 'react-hook-form';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
const ApprovedItemRequests = () => {
    const componentRef = useRef();

    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        `/itemUnpaid`,
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
        const response = await axiosInstance.get(`/unpaidrequests/${id}`);
        setRequestDetail(response?.data);

    };

    const [reference, setReference] = useState('');
    const [comments, setComments] = useState('');

    // Change handlers
    const handleReferenceChange = (event) => {
        setReference(event.target.value);
    };

    const handleCommentChange = (event) => {
        setComments(event.target.value);
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
                Header: "Approval Reason",
                accessor: "comments",
                Cell: ({ value }) => {
                    return <div dangerouslySetInnerHTML={{ __html: value }} />
                }
            },
            {
                Header: 'Actions',
                accessor: '_id',
                Cell: ({ value: requestId }) => (
                    <Button onClick={() => {
                        fetchRequestDetail(requestId);
                        setModal(true);
                    }}>View Details
                    </Button>
                ),
            },

        ]
    )

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
    const handlePostRequest = (id) => {
        try {
            const response = axiosInstance.post(`/completeRequest/request/${id}`, { comments: comments, reference: reference });
            setModal(false);
            fetchData({
                pageSize: 10,
                pageIndex: 0,
            });

        }
        catch (err) {
            console.log(err);
        }
    }

    const PrintableModalContent = forwardRef((props, ref) => {
        return (
            <div ref={ref}>
                <ModalBody ref={componentRef}>
                    <Table className="details-table" hover bordered striped>
                        <tbody>
                            <tr><td><strong>Request ID:</strong></td><td>{requestDetail?.requestID}</td><td></td></tr>
                            <tr><td><strong>Request Type:</strong></td><td>{requestDetail?.requestType}</td><td></td></tr>
                            <tr><td><strong>Request Title:</strong></td><td>{requestDetail?.requestTitle}</td><td></td></tr>
                            <tr><td><strong>Project Name:</strong></td><td>{requestDetail?.project?.projectName}</td><td></td></tr>
                            <tr><td><strong>Project Year:</strong></td><td>{new Date(requestDetail?.project?.year).getFullYear()}</td><td></td></tr>
                            <tr><td><strong>Project Location:</strong></td><td>{requestDetail?.project?.location}</td><td></td></tr>
                            <tr><td><strong>Reference Number:</strong></td><td>{requestDetail?.referenceNumber}</td><td></td></tr>

                            <tr><td><strong style={{ color: "green" }}>Reason for Acceptance:</strong></td><td dangerouslySetInnerHTML={{ __html: requestDetail?.comments }}></td><td></td></tr>
                            <tr><td><strong style={{ color: "green" }}>Accepted At:</strong></td><td>{requestDetail?.subRequestSentAt}</td></tr>
                            {requestDetail?.requestType === "Request Item" && (<tr><td style={{ fontWeight: "bolder" }}>Item Name</td><td style={{ fontWeight: "bolder" }}>Quantity</td><td style={{ fontWeight: "bolder" }}>BOQ ID</td></tr>)}

                            {requestDetail?.requestType === "Request Item" && requestDetail?.items?.map((item, index) => (
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
            </div>
        )
    })
    const [filter, setFilter] = useState({
        startDate: '',
        endDate: '',
        initiator: '',
        project: '',
    });

    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
        console.log(filter);

    };
    useEffect(() => {
        fetchData({ pageIndex: 0, pageSize: 10, extraFilter: filter });
    }, [filter]);
    const [users, setUsers] = useState();
    const [projects, setProjects] = useState();
    useEffect(() => {

        async function fetchUsers() {
            const users = await axiosInstance.get(`users/all`);
            setUsers(users?.data)
        }
        async function fetchProjects() {
            const projects = await axiosInstance.get(`projects`);
            setProjects(projects?.data?.data)
        }
        fetchUsers();
        fetchProjects()
    }, [])
    return (
        <Container className={'pagecontainer'}>
            <div>
                <h1 className='Heading'>Approved Item Requests</h1>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: '2rem' }}>
                {/* Row 1 */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ flex: "1" }}>
                        <Label for="startDate">Start Date:</Label>

                        <Input type="date" name="startDate" value={filter.startDate} onChange={handleFilterChange} />
                    </div>
                    <div style={{ flex: "1" }}>
                        <Label for="startDate">End Date:</Label>

                        <Input type="date" name="endDate" value={filter.endDate} onChange={handleFilterChange} />
                    </div>
                </div>

                {/* Row 2 */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>

                    <div style={{ flex: "1" }}>
                        <Label for="initiator">Initiator:</Label>
                        <select className="input-form" name="initiator" id="initiator" onChange={handleFilterChange} style={{ width: "100%" }}>
                            <option value={""}>------Select Initiator------</option>
                            {users?.map((user, index) => (
                                <option key={index} value={user?._id}>
                                    {user?.fName} {user?.lName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Row 3 */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ flex: "1" }}>
                        <Label for="project">Project:</Label>
                        <select className="input-form" name="project" id="project" onChange={handleFilterChange} style={{ width: "100%" }}>
                            <option value={""}>------Select Project------</option>
                            {projects?.map((project, index) => (
                                <option key={index} value={project?._id}>
                                    {project?.projectName}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                {/* Apply Filters Button */}
                {/* <div style={{ marginTop: "10px" }}>
                    <Button color='success' onClick={applyFilters}>Apply</Button>
                </div> */}
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
                    <PrintableModalContent ref={componentRef} />

                    <Container>
                        <h4>Add Details</h4>
                        <Label for="reference">Reference No:</Label>
                        <Input type="text" name='reference' id='reference' value={reference} onChange={handleReferenceChange} />
                        <Label for="comments">Comment</Label>
                        <Input type="textarea" name='comments' id='comments' value={comments} onChange={handleCommentChange} />
                    </Container>
                </ModalBody>
                <ModalFooter className="modal-footer">
                    <Button color="secondary" onClick={() => handlePostRequest(requestDetail?._id)}>Save</Button>
                    <Button color="secondary" onClick={() => setModal(false)}>Close</Button>
                </ModalFooter>
            </Modal>
        </Container>
    )
}

export default ApprovedItemRequests