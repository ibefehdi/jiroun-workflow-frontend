import React, { useState, useEffect, useMemo } from 'react';
import { Button, Container, Modal, ModalHeader, ModalBody, ModalFooter, Table, Label, FormGroup } from 'reactstrap';
import TableContainer from '../../components/TableContainer';
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import MonthlyReport from './MonthlyReport';

const Attendance = () => {
    const [filter, setFilter] = useState({
        date: new Date(),
        userId: '',
        view: 'daily',
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUserAttendance, setSelectedUserAttendance] = useState(null);
    const [users, setUsers] = useState([]);
    const [monthlyData, setMonthlyData] = useState(null);

    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        `/attendanceperday`,
        'status',
        'data'
    );

    const handleFilterChange = (e) => {
        if (e instanceof Date) {
            setFilter({ ...filter, date: e });
        } else if (e.target.name === "userId") {
            setFilter({ ...filter, userId: e.target.value });
        } else if (e.target.name === "view") {
            setFilter({ ...filter, view: e.target.value });
        } else {
            setFilter({ ...filter, [e.target.name]: e.target.value });
        }
    };

    useEffect(() => {
        if (filter.view === 'daily') {
            fetchData({
                pageSize: 10,
                pageIndex: 0,
                extraFilter: {
                    date: filter.date.toISOString().split('T')[0],
                    userId: filter.userId || undefined
                }
            });
        } else if (filter.view === 'monthly' && filter.userId) {
            fetchMonthlyData();
        }
    }, [filter]);

    const fetchMonthlyData = async () => {
        try {
            const response = await axiosInstance.get('/attendance/monthly', {
                params: {
                    userId: filter.userId,
                    year: filter.date.getFullYear(),
                    month: filter.date.getMonth() + 1
                }
            });
            setMonthlyData(response.data);
        } catch (error) {
            console.error('Error fetching monthly data:', error);
        }
    };
    useEffect(() => {
        if (filter.view === 'daily') {
            fetchData({
                pageSize: 10,
                pageIndex: 0,
                extraFilter: {
                    date: filter.date.toISOString().split('T')[0],
                    userId: filter.userId || undefined
                }
            });
        } else if (filter.view === 'monthly' && filter.userId) {
            fetchMonthlyData();
        }
    }, [filter]);
    const toggleModal = () => setModalOpen(!modalOpen);

    const fetchUserAttendance = async (userId, date) => {
        try {
            const response = await axiosInstance.get('/user-attendance-for-day', {
                params: { userId, date: date.toISOString().split('T')[0] }
            });
            setSelectedUserAttendance(response.data);
            toggleModal();
        } catch (error) {
            console.error('Error fetching user attendance:', error);
        }
    };

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
            },
            {
                Header: "Overtime",
                accessor: row => {
                    const checkIn = new Date(row.firstCheckIn);
                    const checkOut = new Date(row.lastCheckOut);
                    const diff = checkOut - checkIn;
                    const hours = diff / 3600000;
                    const overtime = hours - 8;
                    return overtime;
                },
                Cell: ({ value }) => {
                    const style = {
                        color: value > 0 ? 'green' : 'red'
                    };
                    return (
                        <span style={style}>
                            {value > 0 ? `+${value.toFixed(2)}h` : `${value.toFixed(2)}h`}
                        </span>
                    );
                }
            },
            {
                Header: "Actions",
                Cell: ({ row }) => (
                    <Button onClick={() => fetchUserAttendance(row.original._id, filter.date)}>
                        View Details
                    </Button>
                )
            }
        ],
        [filter.date]
    );

    useEffect(() => {
        async function fetchUsers() {
            const users = await axiosInstance.get(`users/allusersfilteration`);
            setUsers(users?.data)
        }

        fetchUsers();
    }, []);

    return (
        <Container className={'pagecontainer'}>
            <div>
                <h1 className='Heading'>Attendance</h1>
            </div>
            <div style={{ display: "flex", gap: "20px", marginBottom: '2rem', alignItems: "flex-end" }}>
                <div style={{ flex: "1" }}>
                    <Label for="datePicker">
                        {filter.view === 'daily' ? 'Date:' : 'Month:'}
                    </Label>
                    <DatePicker
                        selected={filter.date}
                        onChange={(date) => handleFilterChange(date)}
                        className="form-control"
                        dateFormat={filter.view === 'daily' ? "yyyy-MM-dd" : "MMMM yyyy"}
                        showMonthYearPicker={filter.view === 'monthly'}
                    />
                </div>
                <div style={{ flex: "1" }}>
                    <Label for="userId">User:</Label>
                    <select
                        className="input-form"
                        name="userId"
                        id="userId"
                        onChange={handleFilterChange}
                        style={{ width: "100%" }}
                    >
                        <option value="">------Select User------</option>
                        {users?.map((user, index) => (
                            <option key={index} value={user?._id}>
                                {user?.fName} {user?.lName}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ flex: "1" }}>
                    <Label for="view">View:</Label>
                    <select
                        className="input-form"
                        name="view"
                        id="view"
                        onChange={handleFilterChange}
                        style={{ width: "100%" }}
                    >
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
            </div>
            {filter.view === 'monthly' && (
                <div style={{ marginBottom: '1rem', color: 'blue' }}>
                    <strong>Note:</strong> For monthly view, both a user and a month must be selected.
                </div>
            )}
            {filter.view === 'daily' ? (
                <TableContainer
                    data={data}
                    pageCount={pageCount}
                    fetchData={fetchData}
                    loading={loadStatus}
                    totalDataCount={totalDataCount}
                    columns={columns}
                />
            ) : (
                <MonthlyReport data={monthlyData} />
            )}
            <Modal isOpen={modalOpen} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>Attendance Details</ModalHeader>
                <ModalBody>
                    {selectedUserAttendance && (
                        <div>
                            <h4>{selectedUserAttendance.fName} {selectedUserAttendance.lName}</h4>
                            <p>Project: {selectedUserAttendance.projectName}</p>
                            <p>Date: {new Date(selectedUserAttendance.date).toLocaleDateString()}</p>
                            <p>Total Working Hours: {selectedUserAttendance.totalWorkingHours}</p>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                        <th>Working Hours</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedUserAttendance.attendances.map((attendance, index) => (
                                        <tr key={index}>
                                            <td>{new Date(attendance.checkIn).toLocaleString()}</td>
                                            <td>{attendance.checkOut ? new Date(attendance.checkOut).toLocaleString() : 'N/A'}</td>
                                            <td>{attendance.workingHours}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>Close</Button>
                </ModalFooter>
            </Modal>
        </Container>
    );
};

export default Attendance;