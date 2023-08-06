import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Input, Form, Table } from 'reactstrap';
import axiosInstance from '../../constants/axiosConstant';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const SendDetailModal = ({ isOpen, toggle, sendDetail }) => {
    console.log('SentDetailModal', sendDetail);

    const userId = useSelector((state) => state._id)
    const occupation = useSelector((state) => state.occupation)
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Request Details</ModalHeader>
            <ModalBody>
                {sendDetail && (
                    <Table style={{ width: "100%" }} striped hover>
                        <tbody>

                            <tr>
                                <td>Request Type</td>
                                <td>{sendDetail.requestType}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Project Name</td>
                                <td>{sendDetail.project.projectName}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Project Location</td>
                                <td>{sendDetail.project.location}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Project Year</td>
                                <td>{new Date(sendDetail.project.year).getFullYear()}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Status</td>
                                <td>{sendDetail?.status === 1 ? 'Approved' : 'Pending'}</td>
                                <td></td>

                            </tr>
                            <tr>
                                <td>Sender</td>
                                <td>{`${sendDetail?.sender.fName} ${sendDetail?.sender.lName}`}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Recipient</td>
                                <td>{`${sendDetail?.recipient?.fName} ${sendDetail?.recipient?.lName}`}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Your Comment</td>
                                <td>{sendDetail?.comments}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Sent At</td>
                                <td>{new Date(sendDetail.sentAt).toLocaleString()}</td>
                                <td></td>
                            </tr>



                            <tr>
                                <td>Name</td>
                                <td>Comment</td>
                                <td>Date</td>
                            </tr>
                            {sendDetail.allRequests.map((request, index) => (
                                <tr key={index}>
                                    <td>
                                        {request.sender.fName} {request.sender.lName}
                                    </td>
                                    <td>{request.comments}</td>
                                    <td>{new Date(request.sentAt).toLocaleString()}</td>
                                </tr>
                            ))}


                        </tbody>
                    </Table>
                )}
            </ModalBody>
        </Modal>
    )
}

export default SendDetailModal