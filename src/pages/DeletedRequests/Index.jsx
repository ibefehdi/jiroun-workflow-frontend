import React, { useEffect, useMemo, useState } from 'react'
import { Button, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Label, Input, Modal, ModalBody, ModalFooter, ModalHeader, Progress, Table } from 'reactstrap';
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
                Header: "Request Title",
                accessor: "requestTitle",
                Cell: ({ value }) =>
                    (value ? value : 'N/A')

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
                        return 'Rejected';
                    }
                }
            },
            {
                Header: "Reason for deletion",
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
    const [contractors, setContractors] = useState();
    const [users, setUsers] = useState();
    const [projects, setProjects] = useState();
    useEffect(() => {
        async function fetchContractors() {

            const contractors = await axiosInstance.get(`users/allcontractors`);
            setContractors(contractors?.data)
        }
        async function fetchUsers() {
            const users = await axiosInstance.get(`/users/allusersfilteration`);
            setUsers(users?.data)
        }
        async function fetchProjects() {
            const projects = await axiosInstance.get(`projects`);
            setProjects(projects?.data?.data)
        }
        fetchContractors();
        fetchUsers();
        fetchProjects()
    }, [])
    const [filter, setFilter] = useState({
        requestType: '',
        startDate: '',
        endDate: '',
        initiator: '',
        contractorForPayment: '',
        project: '',
    });
    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };
    useEffect(() => {
        fetchData({ pageIndex: 0, pageSize: 10, extraFilter: filter });
    }, [filter]);
    // const applyFilters = () => {
    //     fetchData({ pageIndex: 0, pageSize: 10, extraFilter: filter });
    // };
    const requestTypes = ['Request Payment', "Request Item", "Request Labour"];

    return (
        <Container className={'pagecontainer'}>
            <div>
                <h1 className='Heading'>Rejected Requests</h1>
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
                        <Label for="contractorForPayment">Contractor:</Label>
                        <select className="input-form" name="contractorForPayment" id="contractorForPayment" onChange={handleFilterChange} style={{ width: "100%" }}>
                            <option value={""}>------Select Contractor------</option>
                            {contractors?.map((contractor, index) => (
                                <option key={index} value={contractor?._id}>
                                    {contractor?.fName} {contractor?.lName}
                                </option>
                            ))}
                        </select>
                    </div>
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
                    <div style={{ flex: "1" }}>
                        <Label for="requestType">Request Type:</Label>
                        <select className="input-form" name="requestType" id="requestType" onChange={handleFilterChange} style={{ width: "100%" }}>
                            <option value="">------Select Request Type------</option>
                            {requestTypes.map((type, index) => (
                                <option key={index} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Apply Filters Button
                <div style={{ marginTop: "10px" }}>
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
                <ModalHeader toggle={() => setModal(!modal)} className="modal-header">Request Details</ModalHeader>
                <ModalBody className="modal-body">
                    <Table className="details-table" hover bordered striped>
                        <tbody>
                            <tr><td><strong>Request ID:</strong></td><td>{requestDetail?.requestID}</td><td></td></tr>
                            <tr><td><strong>Request Type:</strong></td><td>{requestDetail?.requestType}</td><td></td></tr>
                            <tr><td><strong>Request Title:</strong></td><td>{requestDetail?.requestTitle}</td><td></td></tr>
                            <tr><td><strong>Project Name:</strong></td><td>{requestDetail?.project?.projectName}</td><td></td></tr>
                            <tr><td><strong>Project Year:</strong></td><td>{new Date(requestDetail?.project?.year).getFullYear()}</td><td></td></tr>
                            <tr><td><strong>Project Location:</strong></td><td>{requestDetail?.project?.location}</td><td></td></tr>
                            <tr><td><strong style={{ color: "red" }}>Reason for deletion:</strong></td><td><div dangerouslySetInnerHTML={{ __html: requestDetail?.comments }}></div></td><td></td></tr>
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
                                        <div><strong>Comments:</strong>
                                            <div dangerouslySetInnerHTML={{ __html: subRequest?.comments }} />
                                        </div>                                        <div>
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