import React from 'react';
import { Table } from 'reactstrap';

const MonthlyReport = ({ data }) => {
    if (!data) {
        return <div>Loading monthly report...</div>;
    }

    return (
        <div>
            <h2>Monthly Attendance Report</h2>
            <h3>{data.fName} {data.lName}</h3>
            <p>Month: {new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
            <p>Total Working Hours: {data.totalWorkingHours}</p>
            <Table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>First Check In</th>
                        <th>Last Check Out</th>
                        <th>Working Hours</th>
                    </tr>
                </thead>
                <tbody>
                    {data.attendances.map((attendance, index) => (
                        <tr key={index}>
                            <td>{new Date(attendance.date).toLocaleDateString()}</td>
                            <td>{attendance.firstCheckIn ? new Date(attendance.firstCheckIn).toLocaleString() : 'N/A'}</td>
                            <td>{attendance.lastCheckOut ? new Date(attendance.lastCheckOut).toLocaleString() : 'N/A'}</td>
                            <td>{attendance.workingHours}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default MonthlyReport;