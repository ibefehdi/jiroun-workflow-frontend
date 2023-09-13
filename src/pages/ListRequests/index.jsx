import React, { useEffect, useState, useMemo } from 'react';
import { Button, Container, Modal, ModalBody, ModalHeader, Progress, Table } from 'reactstrap';
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import TableContainer from '../../components/TableContainer';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

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
                    {projectManager?.map(({ fName, lName }, index) => (
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
                Header: "Progress",
                accessor: "progress",
                Cell: ({ value, row }) => {  // Note the use of row here
                    const requestType = row.original.requestType; // Access requestType from row
                    return (
                        <div style={{ width: "80px" ,height:"80px"}}>
                            <CircularProgressbar value={value} text={`${value}%`} strokeWidth={5}
                            />

                        </div>
                    )
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
                Cell: ({ value: requestId }) => (
                    <Button onClick={() => {
                        fetchRequestDetail(requestId);
                        // setModal(true); // Assuming setModal is a state setter for showing a modal
                    }}>
                        View Details
                    </Button>
                ),
            }
        ],
        []
    );


    const toggle = () => setModal(!modal);

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
        </Container>
    );
};

export default ListRequests;
