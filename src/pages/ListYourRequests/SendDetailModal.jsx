import React from 'react';
import { useSelector } from 'react-redux';
import { Modal, ModalHeader, ModalBody, Table, Progress } from 'reactstrap';

const getStatus = (globalStatus) => {
    switch (globalStatus) {
        case 0: return 'Pending';
        case 1: return 'Approved';
        default: return 'Declined';
    }
};

const renderItems = (items) => items.map((item, index) => (
    <tr key={index}>
        <td>{item.itemName}</td>
        <td>{item.itemQuantity}</td>
        <td>{item.boqId}</td>
        {}
    </tr>
));

const renderSubRequests = (subRequests) => subRequests.map((subRequest, index) => (
    <tr key={index}>
        <td>{subRequest.sender.fName} {subRequest.sender.lName}</td>
        <td>{subRequest.comments}</td>
        <td>{new Date(subRequest.subRequestSentAt).toLocaleString()}</td>
    </tr>
));

const SendDetailModal = ({ isOpen, toggle, sendDetail }) => {
    if (!sendDetail) return null;
    
    const { globalStatus, requestType, project, items, subRequests, progress } = sendDetail;
    const { projectName, location, year } = project;
    const status = getStatus(globalStatus);

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Request Details</ModalHeader>
            <ModalBody>
                <Table responsive style={{ width: "100%" }} striped hover bordered >
                    <tbody>
                        <tr><td style={{ fontWeight: "bolder" }}>Request Type</td><td>{requestType}</td><td></td></tr>
                        <tr><td style={{ fontWeight: "bolder" }}>Project Name</td><td>{projectName}</td><td></td></tr>
                        <tr><td style={{ fontWeight: "bolder" }}>Project Location</td><td>{location}</td><td></td></tr>
                        <tr><td style={{ fontWeight: "bolder" }}>Project Year</td><td>{new Date(year).getFullYear()}</td><td></td></tr>
                        <tr><td style={{ fontWeight: "bolder" }}>Global Status</td><td>{status}</td><td></td></tr>
                        <tr><td style={{ fontWeight: "bolder" }}>Item Name</td><td style={{ fontWeight: "bolder" }}>Item Quantity</td><td style={{ fontWeight: "bolder" }}>Item BOQ ID</td></tr>
                        {renderItems(items)}
                        <tr><td style={{ fontWeight: "bolder" }}>Name</td><td style={{ fontWeight: "bolder" }}>Comment</td><td style={{ fontWeight: "bolder" }}>Date</td></tr>
                        {renderSubRequests(subRequests)}
                    </tbody>
                </Table>
                <div>
                    <p style={{ fontWeight: "bolder" }}>Progress:</p>
                    <Progress value={progress} />
                    {progress}%
                    <p style={{ fontSize: '12px' }}>
                        {progress === 25 && 'Your request has been forwarded to the project director.'}
                        {progress === 50 && 'Your request has been sent to the procurement department. Please allow some time for processing.'}
                        {progress === 75 && 'Your request is now being handled by the finance department.'}
                        {progress === 90 && 'Your request is nearing completion. A managing partner is currently in the process of finalizing it.'}
                        {progress === 100 && 'Your request has been successfully completed.'}
                    </p>
                    <style>
                        {`
          .progress-bar {
            background: linear-gradient(to right, #3498db  , #8e44ad  , #3498db );
            background-size: 200% 100%;
            animation: pulse 6s linear infinite;
          }

          @keyframes pulse {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}
                    </style>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default SendDetailModal;
