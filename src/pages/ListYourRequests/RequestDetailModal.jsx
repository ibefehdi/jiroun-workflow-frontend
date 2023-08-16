import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Input, Form } from 'reactstrap';
import axiosInstance from '../../constants/axiosConstant';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const RequestDetailModal = ({ isOpen, toggle, requestDetail }) => {

    const requestId = requestDetail?._id
    const userId = useSelector((state) => state._id)
    const occupation = useSelector((state) => state.occupation)
    const [projectManagers, setProjectManagers] = useState([]);
    const [estimatedAmount, setEstimatedAmount] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [requiredAmount, setRequiredAmount] = useState('');
    const [totalAmount, setTotalAmount] = useState('');

    const handleEstimatedAmountChange = (e) => {
        setEstimatedAmount(e.target.value);
    };

    const handlePaidAmountChange = (e) => {
        setPaidAmount(e.target.value);
    };

    const handleRequiredAmountChange = (e) => {
        setRequiredAmount(e.target.value);
    };

    const handleTotalAmountChange = (e) => {
        setTotalAmount(e.target.value);
    };
    const requestStatus = requestDetail?.globalStatus;
    const [isUserRecipient, setIsUserRecipient] = useState();
    const requestType = requestDetail?.requestType;
    const [recipients, setRecipients] = useState([]);
    useEffect(() => {
        setProjectManagers(requestDetail?.project?.projectManager)
    }, [requestDetail])


    useEffect(() => {
        async function getRecipient() {
            try {
                const response = await axiosInstance.get(`checkRecipient/${userId}/${requestId}`);
                setIsUserRecipient(response?.data?.isRecipient);

            } catch (error) {
                console.error('An error occurred while fetching recipient status', error);
            }
        }
        getRecipient();
    }, [requestId, userId]);
    useEffect(() => {
    }, [isUserRecipient])
    const RadioWrapper = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 10px 0;
    gap:20px;
`;

    const RadioLabel = styled.label`
    display: flex;
    align-items: center;
    cursor: pointer;
`;

    const RadioButton = styled.input`
    margin-right: 10px;
`;




    const { register, handleSubmit, setValue, control, watch } = useForm({
        defaultValues: {
            requestType: "",
            status: "",
            items: [],
            estimatedAmount: "",
            paidAmount: "",
            requiredAmount: "",

        },
    });
    const { formState } = useForm();
    console.log(formState);
    const watchedItems = watch('items');
    const selectedStatus = watch('status');

    const { fields: itemFields, append: itemAppend } = useFieldArray({ control, name: 'items' });

    useEffect(() => {
        if (requestDetail) {
            setValue("requestType", requestDetail?.requestType);
            setValue("status", requestDetail?.status);
            setValue("items", requestDetail?.items);
            if (requestType === "Request Payment") {
                setEstimatedAmount(requestDetail?.estimatedAmount)
                setTotalAmount(requestDetail?.totalAmount)
                setRequiredAmount(requestDetail?.requiredAmount)
                setPaidAmount(requestDetail?.paidAmount)
            }

        }
    }, [requestDetail, setValue, requestType]);


    const onSubmit = async (data) => {
        const { comments, recipient, status, items } = data;

        const payload = {
            comments: comments,
            recipient: recipient,
            sender: userId,

        };


        if (status === "3") {
            try {
                const payload = {
                    requestId: requestId,
                    userId: userId,
                    comments: comments
                };
                const deleteResponse = await axiosInstance.post(`/deleteRequest/${requestId}`, payload);

                if (deleteResponse.status === 200) {
                    toggle();
                }
            } catch (error) {
                console.error('An error occurred while deleting the request', error);
            }
            return;
        }

        payload.sender = userId;
        payload.recipient = recipient;

        console.log("Form data submitted:", data);

        try {
            if (occupation === 'Managing Partner') {
                const payload = {
                    requestId: requestId,
                    userId: userId,
                    comments: comments,
                    progress: 100
                };
                const updateResponse = await axiosInstance.put(`/requests/${requestDetail._id}`, { globalStatus: status, progress: 100 });
                const updateResponse1 = await axiosInstance.put(`/subrequests/${requestDetail?.subRequests[requestDetail.subRequests.length - 1]._id}`, { isFinalized: status });
                if (updateResponse.status === 200 && updateResponse1.status === 200) {
                    const postResponse = await axiosInstance.post(`/completeRequest/request/${requestDetail?._id}`, payload);

                }
            } else {
                const updateResponse = await axiosInstance.put(`/subrequests/${requestDetail?.subRequests[requestDetail?.subRequests?.length - 1]._id}`, { isFinalized: status });

                if (updateResponse.status === 200) {
                    const postResponse = await axiosInstance.post(`/requests/${requestDetail?._id}`, payload);
                    console.log(postResponse);

                    const items = data.items;
                    const putResponse = await axiosInstance.put(`/editrequests/${requestDetail._id}`, {
                        items,
                        estimatedAmount,
                        totalAmount,
                        requiredAmount,
                        paidAmount,
                    }); console.log("Put Response", putResponse);


                }
            }

            toggle();
        } catch (err) {
            console.error(err);
        }
    };


    useEffect(() => {
        const getRecipients = async () => {
            let recipientOccupation = ''

            switch (occupation) {
                case 'Project Manager':
                    recipientOccupation = 'projectdirectors';
                    break;
                case 'Project Director':
                    recipientOccupation = 'procurement';
                    break;
                case 'Procurement':
                    recipientOccupation = 'finance';
                    break;
                case 'Quantity Surveyor':
                    recipientOccupation = 'finance';
                    break;
                case 'Finance':
                    recipientOccupation = 'managingpartner';
                    break;
                default:
                    recipientOccupation = '';
            }

            if (recipientOccupation) {
                const response = await axiosInstance.get(`/users/${recipientOccupation}`);
                setRecipients(response?.data);
            }
        }
        const getSendersbyRequest = async () => {
            const response = await axiosInstance.get(`/getSenders/${requestDetail?._id}`);
            setRecipients(response?.data);
        }

        if (selectedStatus === '1') {
            getRecipients();

        } else if (selectedStatus === '2') { getSendersbyRequest(); }




    }, [occupation, requestDetail?._id, selectedStatus])


    if (!requestDetail) {
        return null;
    }
    const onUnitPriceChange = (event, index) => {
        const unitPrice = event.target.value;
        const quantity = watchedItems[index]?.itemQuantity;
        const newTotalPrice = unitPrice * quantity;
        setValue(`items[${index}].totalPrice`, newTotalPrice);
    }

    return (

        <Modal isOpen={isOpen} toggle={toggle} className="modern-modal">
            <ModalHeader toggle={toggle}>Add Request Detail</ModalHeader>
            <ModalBody>
                <Form onSubmit={handleSubmit(onSubmit)} className="form-container">

                    <FormGroup>
                        <Label for="requestType">Request Type</Label>
                        <Input id="requestType" {...register("requestType")} value={requestDetail?.requestType} disabled />
                    </FormGroup>

                    {isUserRecipient ? (<FormGroup>
                        <Label>Status</Label>
                        <RadioWrapper>
                            <RadioLabel>
                                <RadioButton
                                    {...register("status")}
                                    type="radio"
                                    value="1"
                                />
                                Approved
                            </RadioLabel>
                            <RadioLabel>
                                <RadioButton
                                    {...register("status")}
                                    type="radio"
                                    value="2"
                                />
                                Provide More Details
                            </RadioLabel>
                            {occupation !== 'Project Manager' && occupation !== 'Project Director' && (
                                <RadioLabel style={{ color: "red", fontWeight: "bold", textDecoration: "underline" }}>
                                    <RadioButton
                                        {...register("status")}
                                        type="radio"
                                        value="3"
                                    />
                                    Reject Request
                                </RadioLabel>
                            )}

                        </RadioWrapper>
                    </FormGroup>) : null}
                    {selectedStatus === "3" && (<h5 style={{ color: "red" }}>Caution: You are about to delete the Request. The user will have to resubmit.</h5>)}
                    {selectedStatus !== "2" && selectedStatus !== "3" && (
                        <FormGroup style={{ display: "flex", flexDirection: "column" }}>
                            {isUserRecipient ? occupation !== 'Managing Partner' && (
                                <>
                                    <Label for="recipient">Send to:</Label>

                                    <select id='recipient' {...register('recipient')} required>
                                        <option>Select User</option>
                                        {recipients?.map((recipient, index) => (
                                            <option key={recipient._id} value={recipient._id}>{recipient.fName}</option>
                                        ))}
                                    </select>

                                </>
                            ) : null}
                        </FormGroup>
                    )}


                    {selectedStatus === "2" && selectedStatus !== "3" ? (<FormGroup style={{ display: "flex", flexDirection: "column" }}>
                        <Label for="recipient">Send to:</Label>
                        <select id='recipient' {...register('recipient')} required>
                            <option>Select User</option>
                            <option value={requestDetail?.subRequests[requestDetail?.subRequests?.length - 1].sender?._id}>{requestDetail?.subRequests[requestDetail?.subRequests?.length - 1].sender?.fName}</option>
                        </select>
                    </FormGroup>) : null}
                    {requestDetail.requestType === 'Request Item' ? itemFields.map((item, index) => (
                        <FormGroup key={item.id}>
                            <Label for={`items[${index}].itemName`}>Item {index + 1} Name</Label>
                            <Input disabled id={`items[${index}].itemName`} {...register(`items[${index}].itemName`)} value={requestDetail?.items[index]?.itemName} />
                            <Label for={`items[${index}].itemQuantity`}>Item {index + 1} Quantity</Label>
                            <Input disabled id={`items[${index}].itemQuantity`} {...register(`items[${index}].itemQuantity`)} value={requestDetail?.items[index]?.itemQuantity} type='number' />
                            <Label for={`items[${index}].boqId`}>Item {index + 1} BOQ ID</Label>
                            <Input disabled id={`items[${index}].boqId`} {...register(`items[${index}].itemQuantity`)} value={requestDetail?.items[index]?.boqId} type='text' />

                            {(occupation === "Procurement" || occupation === "Quantity Surveyor" || occupation === "Finance" || occupation === "Managing Partner") && (
                                <>
                                    <Label for={`items[${index}].unitPrice`}>Item {index + 1} Unit Price</Label>
                                    <Controller
                                        name={`items[${index}].unitPrice`}
                                        control={control}
                                        defaultValue={requestDetail?.items[index]?.unitPrice || ""}
                                        render={({ field }) => (
                                            <Input
                                                id={`items[${index}].unitPrice`}
                                                {...field}
                                                disabled={occupation === "Finance" || occupation === "Managing Partner"}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    onUnitPriceChange(event, index);
                                                }}
                                            />
                                        )}
                                    />
                                </>
                            )}
                            {(occupation === "Procurement" || occupation === "Quantity Surveyor" || occupation === "Finance" || occupation === "Managing Partner") && (
                                <>
                                    <Label for={`items[${index}].totalPrice`}>Item {index + 1} Total Price</Label>
                                    <Controller
                                        name={`items[${index}].totalPrice`}
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => <Input id={`items[${index}].totalPrice`} {...field} disabled />}
                                    />
                                </>
                            )}
                        </FormGroup>
                    )) : (
                        <FormGroup>
                            <Label for="estimatedAmount">Estimated Amount</Label>
                            <Input id="estimatedAmount" value={estimatedAmount} onChange={handleEstimatedAmountChange} type="number" />
                            <Label for="paidAmount">Paid Amount</Label>
                            <Input id="paidAmount" value={paidAmount} onChange={handlePaidAmountChange} type="number" />
                            <Label for="requiredAmount">Required Amount</Label>
                            <Input id="requiredAmount" value={requiredAmount} onChange={handleRequiredAmountChange} type="number" />
                            <Label for="totalAmount">Total Amount</Label>
                            <Input id="totalAmount" value={totalAmount} onChange={handleTotalAmountChange} type="number" />
                        </FormGroup>
                    )}




                    <FormGroup >
                        <Label for="oldComment">Comments from Previous User</Label>
                        {requestDetail?.subRequests?.map((request, index) => (
                            <Input id="oldComment" {...register("oldComment")} type='textarea' defaultValue={request?.comments}
                                disabled style={{ marginBottom: "10px" }} />
                        ))}

                    </FormGroup>

                    {isUserRecipient ? (<FormGroup>
                        <Label for="comments">New Comment</Label>
                        <Input id="comments" {...register("comments")} placeholder="Please State Your Reason Of Accepting Or Rejecting This Request, Be Concise" type='textarea' onChange={e => setValue('comments', e.target.value)}
                        />
                    </FormGroup>) : null}
                    {isUserRecipient ? (<Button type="submit">Update Request</Button>) : null}

                </Form>
            </ModalBody>
        </Modal >
    );
};

export default RequestDetailModal;