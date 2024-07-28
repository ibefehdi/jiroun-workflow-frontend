import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Container, Modal, ModalHeader, ModalBody, ModalFooter, Table, Input, Label, FormGroup } from 'reactstrap';
import TableContainer from '../../components/TableContainer'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
const Attendance = () => {
    const [filter, setFilter] = useState({
        date: new Date(),
        projectName: '',
        userName: '',
    });
    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        `/attendanceperday`,
        'status',
        'data'
    );
    const handleFilterChange = (e) => {
        if (e instanceof Date) {
            setFilter({ ...filter, date: e });
        } else {
            setFilter({ ...filter, [e.target.name]: e.target.value });
        }
    };
    useEffect(() => {
        fetchData({
            pageSize: 10,
            pageIndex: 0,
            extraFilter: {
                date: filter.date.toISOString().split('T')[0],

            }
        });
    }, [filter]);
    const columns = useMemo(
        () => [
            {
                Header: "Project Name",
                accessor: "projectName",
                Cell: ({ value }) => (value ? value : 'N/A')
            },
            {
                Header: "Location",
                accessor: "location",
                Cell: ({ value }) => (value ? value : 'N/A')
            },

            {
                Header: "User",
                accessor: row => `${row.fName} ${row.lName}`,
                Cell: ({ value }) => (value ? value : 'N/A')
            },
            {
                Header: "Check In",
                accessor: "firstCheckIn",
                Cell: ({ value }) => {
                    if (!value) {
                        return "No date";
                    }
                    const date = new Date(value);
                    return date.toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    });
                }
            },
            {
                Header: "Check Out",
                accessor: "lastCheckOut",
                Cell: ({ value }) => {
                    if (!value) {
                        return "No date";
                    }
                    const date = new Date(value);
                    return date.toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    });
                }
            },
            {
                Header: "Working Hours",
                accessor: row => {
                    const checkIn = new Date(row.firstCheckIn);
                    const checkOut = new Date(row.lastCheckOut);
                    const diff = checkOut - checkIn;
                    const hours = Math.floor(diff / 3600000);
                    const minutes = Math.floor((diff % 3600000) / 60000);
                    return `${hours}h ${minutes}m`;
                },
            }
        ],
        []
    )
    return (
        <Container className={'pagecontainer'}>
            <div>
                <h1 className='Heading'>Attendance</h1>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: '2rem' }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ flex: "1" }}>
                        <Label for="datePicker">Date:</Label>
                        <DatePicker
                            selected={filter.date}
                            onChange={(date) => handleFilterChange(date)}
                            className="form-control"
                            dateFormat="yyyy-MM-dd"
                        />
                    </div>

                </div>

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