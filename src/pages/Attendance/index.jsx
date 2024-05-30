import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Container, Modal, ModalHeader, ModalBody, ModalFooter, Table, Input, Label, FormGroup } from 'reactstrap';
import TableContainer from '../../components/TableContainer'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
const Attendance = () => {
    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        `/attendances`,
        'status',
        'data'
    );
    useEffect(() => {
        fetchData({
            pageSize: 10,
            pageIndex: 0,
        });
    }, [fetchData])
    const columns = useMemo(
        () => [
            {
                Header: "Project Name",
                accessor: "siteId.projectName",
                Cell: ({ value }) =>
                    (value ? value : 'N/A')
            },
            {
                Header: "Location",
                accessor: "siteId.location",
                Cell: ({ value }) =>
                    (value ? value : 'N/A')

            },
            {
                Header: 'Latitude',
                accessor: 'siteId.latitude',
                Cell: ({ value }) =>
                    (value ? value : 'N/A')
            },
            {
                Header: "Longitude",
                accessor: "siteId.longitude",
                Cell: ({ value }) =>
                    (value ? value : 'N/A')
            },
            // {
            //     Header: "Radius",
            //     accessor: 'siteId.radius',
            //     Cell: ({ value }) =>
            //         (value ? value : 'N/A')
            // },
            {
                Header: "User",
                accessor: 'userId',
                Cell: ({ value }) =>
                    (value && value.fName && value.lName ? `${value.fName} ${value.lName}` : 'N/A')
            },



            {
                Header: "Check In",
                accessor: "checkIn",
                Cell: ({ value }) => {
                    if (!value) {
                        return "No date";
                    }
                    const date = new Date(value);
                    const formattedDate = date.toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',

                        hour12: true
                    });
                    return formattedDate;
                }
            },
            {
                Header: "Check Out",
                accessor: "checkOut",
                Cell: ({ value }) => {
                    if (!value) {
                        return "No date";
                    }
                    const date = new Date(value);
                    const formattedDate = date.toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',

                        hour12: true
                    });
                    return formattedDate;
                }
            },
            {
                Header: "Working Hours",
                accessor: "workingHours",
            }
            // {
            //     Header: 'Actions',
            //     accessor: '_id',
            //     Cell: ({ value: requestId }) => (
            //         <Button onClick={() => {
            //             fetchRequestDetail(requestId);
            //             setModal(true);
            //         }}>View Details
            //         </Button>
            //     ),
            // },

        ]
    )
    return (
        <Container className={'pagecontainer'}>
            <div>
                <h1 className='Heading'>Attendance</h1>
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

export default Attendance