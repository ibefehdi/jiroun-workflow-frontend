
import React, { memo } from 'react';
import { Modal, ModalHeader, ModalBody, Table, Progress } from 'reactstrap';
import "./sendmodal.css";

const STATUS_MAP = {
    0: 'Pending',
    1: 'Approved',
    2: 'Declined'
};
const renderItems = (items) => items.map((item, index) => (
    <tr key={index}>
        <td>{item.itemName}</td>
        <td>{item.itemQuantity}</td>
        <td>{item.boqId}</td>
        { }
    </tr>
));

const renderSubRequests = (subRequests) => subRequests.map((subRequest, index) => (
    <tr key={index}>
        <td>{subRequest.sender.fName} {subRequest.sender.lName}</td>
        <td>{subRequest.comments}</td>
        <td>{new Date(subRequest.subRequestSentAt).toLocaleString()}</td>
    </tr>
));
const PROGRESS_DESCRIPTIONS = {
    "Request Item": {
        25: 'Your request has been forwarded to the project director.'
    },
    "Request Payment": {
        25: 'Your request has been forwarded to the quantity surveyor.'
    },
    50: 'Your request has been sent to the procurement department. Please allow some time for processing.',
    75: 'Your request is now being handled by the finance department.',
    90: 'Your request is nearing completion. A managing partner is currently in the process of finalizing it.',
    100: 'Your request has been successfully completed.'
};

const BOLD_STYLE = { fontWeight: "bolder" };

const TableRow = ({ label, value }) => (
    <tr>
        <td style={BOLD_STYLE}>{label}</td>
        <td>{value}</td>
        <td></td>
    </tr>
);

const SendDetailModal = ({ isOpen, toggle, sendDetail }) => {
    if (!sendDetail) return null;

    const { globalStatus, requestType, project, items, subRequests, progress, totalAmount, noOfLabour, transportationPrice, priceOfLabour } = sendDetail;
    const { projectName, location, year } = project;
    const status = STATUS_MAP[globalStatus];

    return (
        <Modal isOpen={isOpen} toggle={toggle} className="send-detail-modal">
            <ModalHeader toggle={toggle}>Request Details</ModalHeader>
            <ModalBody>
                <Table className="details-table" responsive striped hover bordered>
                    <tbody>
                        <TableRow label="Request Type" value={requestType} />
                        <TableRow label="Project Name" value={projectName} />
                        <TableRow label="Project Location" value={location} />
                        <TableRow label="Project Year" value={new Date(year).getFullYear()} />
                        <TableRow label="Global Status" value={status} />

                        {requestType === "Request Labour" && (
                            <>
                                <TableRow label="How Many Labours" value={noOfLabour} />
                                <TableRow label="Transportation Price" value={transportationPrice} />
                                <TableRow label="Labour Price" value={priceOfLabour} />
                                <TableRow label="Total Amount" value={totalAmount} />
                            </>
                        )}

                        {items && renderItems(items)}
                        <TableRow label="Name" value="Comment" />
                        {renderSubRequests(subRequests)}
                    </tbody>
                </Table>

                <div className="progress-section">
                    <p style={BOLD_STYLE}>Progress:</p>
                    <Progress value={progress} />
                    {progress}%
                    <p className="progress-description">
                        {PROGRESS_DESCRIPTIONS[requestType]?.[progress] || PROGRESS_DESCRIPTIONS[progress]}
                    </p>
                </div>
            </ModalBody>
        </Modal>
    );
}

export default memo(SendDetailModal);
