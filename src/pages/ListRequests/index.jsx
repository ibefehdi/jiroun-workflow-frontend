import React, { useEffect, useState, useMemo, useRef, forwardRef } from 'react';
import { Button, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Label, Input, Modal, ModalBody, ModalFooter, ModalHeader, Progress, Table } from 'reactstrap';
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import TableContainer from '../../components/TableContainer';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useSelector } from 'react-redux';
import OldTableContainer from '../../components/TableContainer/OldTableContainer';

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
    const renderRequestLabour = () => {
        if (requestDetail?.requestType === "Request Labour") {
            return <>
                <tr>
                    <td><strong>Number of Labour:</strong></td>
                    <td>{requestDetail?.noOfLabour}</td>
                    <td></td><td></td><td></td>
                </tr>
                <tr>
                    <td><strong>Contractor for payment:</strong></td>
                    <td>{requestDetail?.priceOfLabour}</td>
                    <td></td><td></td><td></td>
                </tr>
                <tr>
                    <td><strong>Transportation Price:</strong></td>
                    <td>{requestDetail?.transportationPrice}</td>
                    <td></td><td></td><td></td>
                </tr>
                <tr>
                    <td><strong>Total Amount:</strong></td>
                    <td>{requestDetail?.totalAmount}</td>
                    <td></td>
                    <td></td><td></td>
                </tr>
                <tr>
                    <td>Type of labour</td>
                    <td>Number of labour</td>
                    <td>Unit Price</td>
                    <td>Total Price Of Labour</td>
                    <td>Transportation Price</td>
                </tr>

                {requestDetail?.labour?.map((item, index) => (

                    <tr key={index}>
                        <td>{item.typeOfLabour}</td>
                        <td>{item.numberOfSpecializedLabour}</td>
                        <td>{item.unitPriceOfLabour}</td>
                        <td>{item.totalPriceOfLabour}</td>
                        <td>{item.unitTransportationPrice}</td>
                    </tr>

                ))}
            </>
        }
    }
    const renderRequestPayment = () => {
        if (requestDetail?.requestType === "Request Payment") {
            return (
                <>
                    <tr>
                        <td><strong>Payment Type:</strong></td>
                        <td>{requestDetail?.paymentType}</td>
                        <td></td><td></td><td></td>
                    </tr>
                    <tr>
                        <td><strong>Contractor for payment:</strong></td>
                        <td onClick={() => console.log("contractor clicked")}>{requestDetail?.contractorForPayment?.fName} {requestDetail?.contractorForPayment?.lName}</td>
                        <td></td><td></td><td></td>
                    </tr>
                    <tr>
                        <td><strong>Estimated Amount:</strong></td>
                        <td>{requestDetail?.estimatedAmount}</td>
                        <td></td><td></td><td></td>
                    </tr>
                    <tr>
                        <td><strong>Required Amount:</strong></td>
                        <td>{requestDetail?.requiredAmount}</td>
                        <td></td><td></td><td></td>
                    </tr>
                    <tr>
                        <td><strong>Paid Amount:</strong></td>
                        <td>{requestDetail?.paidAmount}</td>
                        <td></td><td></td><td></td>
                    </tr>


                </>
            );
        }
        return null;
    };
    const userRole = useSelector(state => state.occupation)
    function processComments(commentsHTML,) {

        if (userRole === "Project Manager") {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = commentsHTML;

            const preTags = tempDiv.querySelectorAll('pre.ql-syntax');
            preTags.forEach(preTag => preTag.parentNode.removeChild(preTag));

            return tempDiv.innerHTML;
        }
        return commentsHTML;
    }
    return (
        <Table className="details-table" hover bordered striped>
            <tbody>
                <tr><td><strong>Request ID:</strong></td><td>{requestDetail?.requestID}</td><td></td><td></td><td></td></tr>
                <tr><td><strong>Request Type:</strong></td><td>{requestDetail?.requestType}</td><td></td><td></td><td></td></tr>
                <tr><td><strong>Request Title:</strong></td><td>{requestDetail?.requestTitle}</td><td></td><td></td><td></td></tr>
                <tr><td><strong>Project Name:</strong></td><td>{requestDetail?.project?.projectName}</td><td></td><td></td><td></td></tr>
                <tr><td><strong>Project Year:</strong></td><td>{new Date(requestDetail?.project?.year).getFullYear()}</td><td></td><td></td><td></td></tr>
                <tr><td><strong>Project Location:</strong></td><td>{requestDetail?.project?.location}</td><td></td><td></td><td></td></tr>
                {requestDetail?.requestType === "Request Item" && (<tr><td style={{ fontWeight: "bolder" }}>Item Name</td><td style={{ fontWeight: "bolder" }}>Quantity</td><td style={{ fontWeight: "bolder" }}>BOQ ID</td><td></td><td></td></tr>)}
                {requestDetail?.completionReason && (<tr><td><strong style={{ color: "green" }}>Reason for Acceptance:</strong></td><td dangerouslySetInnerHTML={{ __html: requestDetail?.completionReason }}></td><td></td><td></td><td></td></tr>
                )}
                {requestDetail?.deletedReason && (<tr><td><strong style={{ color: "red" }}>Reason for Deleteion:</strong></td><td dangerouslySetInnerHTML={{ __html: requestDetail?.deletedReason }}></td><td></td><td></td><td></td></tr>
                )}
                {requestDetail?.unpaidReason && (<tr><td><strong style={{ color: "red" }}>Reason for Approval:</strong></td><td dangerouslySetInnerHTML={{ __html: requestDetail?.unpaidReason }}></td><td></td><td></td><td></td></tr>
                )}
                {requestDetail?.requestType === "Request Item" && requestDetail?.items?.map((item, index) => (
                    <tr key={index}>
                        <td>{item.itemName}</td>
                        <td>{item.itemQuantity}</td>
                        <td>{item.boqId}</td>

                    </tr>
                ))}
                {(renderRequestPayment())}
                {(renderRequestLabour())}
                {requestDetail?.subRequests?.map((subRequest, index) => (
                    <tr key={index}>
                        <td><strong>Sub Request {index + 1}:</strong></td>
                        <td>
                            <div><strong>Sender:</strong> {`${subRequest?.sender?.fName} ${subRequest?.sender?.lName}`}</div>
                            <div><strong>Recipient:</strong> {`${subRequest?.recipient?.fName} ${subRequest?.recipient?.lName}`}</div>
                            <div><strong>Was the subrequest approved?</strong> {wasFinalized(subRequest?.isFinalized)}</div>
                            <div><strong>Comments:</strong>
                                <div dangerouslySetInnerHTML={{ __html: processComments(subRequest?.comments, userRole) }} />
                            </div>
                            <div>
                                <strong>Sent at: </strong>{new Date(subRequest.subRequestSentAt).toLocaleString()}
                            </div>

                        </td>
                        <td></td>
                        <td></td><td></td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

const RequestDetailModal = ({ isOpen, toggle, requestDetail }) => {
    const componentRef = useRef();
    const PrintableModalContent = forwardRef((props, ref) => {
        return (
            <div ref={ref}>
                <ModalBody ref={componentRef}>
                    <Table>
                        <tbody>
                            <RequestDetail requestDetail={requestDetail} />
                        </tbody>
                    </Table>
                </ModalBody>
            </div>
        )

    })
    if (!requestDetail) return null;
    return (
        <Modal isOpen={isOpen} toggle={toggle} style={{ maxWidth: "70rem" }}>
            <ModalHeader toggle={toggle}>Request Detail
                <ReactToPrint
                    trigger={() => (
                        <button style={{ background: "none", color: 'black' }}>
                            <PrintIcon />
                        </button>
                    )}
                    content={() => componentRef.current}
                />
            </ModalHeader>
            <ModalBody>
                <PrintableModalContent ref={componentRef} />
            </ModalBody>

        </Modal>
    );
};

const ListRequests = () => {
    const [reload, setReload] = useState(false)
    const permissions = useSelector(state => state.permissions)
    const changeContractorPermission = permissions.includes('change_contractor');

    const { data, fetchData, pageCount, totalDataCount } = useGETAPI(
        axiosInstance.get,
        'requests',
        'status',
        'data'
    );


    // const BOLD_STYLE = { fontWeight: "bolder" };
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
    useEffect(() => {
        fetchData({ pageIndex: 0, pageSize: 10, extraFilter: filter });
    }, [fetchData, filter]);
    // const applyFilters = () => {
    //     fetchData({ pageIndex: 0, pageSize: 10, extraFilter: filter });
    // };
    const [modal, setModal] = useState(false);
    const [requestDetail, setRequestDetail] = useState(null);
    const statusMap = ['Pending', 'Approved', 'Declined', 'Unknown'];



    const fetchRequestDetail = async (requestId) => {
        const response = await axiosInstance.get(`/requests/${requestId}`);
        console.log(response?.data)
        setRequestDetail(response?.data);
        toggle();
    };
    const requestTypes = ['Request Payment', "Request Item", "Request Labour"];
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
                Header: "Initiator",
                accessor: 'initiator',
                Cell: ({ value }) => {
                    if (!value) {
                        return "N/A";
                    }
                    return `${value.fName} ${value.lName}`;
                }
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
                Header: "Attachment",
                accessor: "attachment",
                Cell: ({ value }) => {
                    return value ? <a href={value} target="_blank" rel="noopener noreferrer">Link</a> : null;
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

                            {changeContractorPermission && row.original.requestType === 'Request Payment' &&
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
    const [users, setUsers] = useState();
    const [projects, setProjects] = useState();
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
    useEffect(() => {
        async function fetchContractors() {

            const contractors = await axiosInstance.get(`users/allcontractors`);
            setContractors(contractors?.data)
        }
        async function fetchUsers() {
            const users = await axiosInstance.get(`users/allusersfilteration`);
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
    const changeContractor = async () => {
        try {
            const response = await axiosInstance.patch(`/requests/contractor/${currentRequestId}`, { contractorForPayment: selectedContractor });
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
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ flex: "1" }}>
                        <Label for="requestID">Request ID:</Label>

                        <Input className='input-form' placeholder='Request ID' name='requestID' id='requestID' onChange={handleFilterChange} style={{ width: "100%" }} type='number' />
                    </div>

                </div>
                {/* Apply Filters Button */}
                {/* <div style={{ marginTop: "10px" }}>
                    <Button color='success' onClick={applyFilters}>Apply</Button>
                </div> */}
            </div>
            <OldTableContainer
                columns={columns}
                refresh={reload}
                pageCount={pageCount}
                totalDataCount={totalDataCount}
                data={data}
                fetchData={fetchData}
                isGlobalFilter={false}
                customPageSize={10}
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
