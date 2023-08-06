import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Input, Form } from 'reactstrap';
import axiosInstance from '../../constants/axiosConstant';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const RequestDetailModal = ({ isOpen, toggle, requestDetail }) => {
    console.log('RequestDetailModal', requestDetail);
    const userId = useSelector((state) => state._id)
    const occupation = useSelector((state) => state.occupation)
    const [projectManagers, setProjectManagers] = useState([]);
    //const [selectedStatus, setSelectedStatus] = useState(null);
    const requestStatus = requestDetail?.status;
    console.log(requestStatus);
    console.log(projectManagers)
    const [recipients, setRecipients] = useState([]);
    useEffect(() => {
        setProjectManagers(requestDetail?.project?.projectManager)
    }, [requestDetail])

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


    useEffect(() => {
        const getRecipients = async () => {
            let recipientOccupation = ''

            switch (occupation) {
                case 'Contractor':
                    recipientOccupation = 'projectdirectors';
                    break;
                case 'Project Manager':
                    recipientOccupation = 'qos';
                    break;
                case 'Quantity Surveyor':
                    recipientOccupation = 'procurement';
                    break;
                case 'Procurement':
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
                setRecipients(response.data);
            }
        }

        getRecipients();
    }, [occupation])

    const { register, handleSubmit, setValue, control, watch } = useForm({
        defaultValues: {
            requestType: "",
            status: "",
            items: [],
            previousRequestId: requestDetail?._id
        },
    });

    const watchedItems = watch('items');
    const selectedStatus = watch('status');

    const { fields: itemFields, append: itemAppend } = useFieldArray({ control, name: 'items' });

    useEffect(() => {
        if (requestDetail) {
            setValue("requestType", requestDetail?.requestType);
            setValue("status", requestDetail?.status);
            setValue("items", requestDetail?.items);
            setValue("previousRequestId", requestDetail?._id);
        }
    }, [requestDetail, setValue]);


    const onSubmit = async (data) => {
        console.log("This is the data you are sending to the server ", data);
        const { comments, recipient, status, previousRequestId, items, ...rest } = data;


        if (status === 2) {
            // When status is 2, reverse the roles of sender and recipient
            rest.recipient = requestDetail?.sender?._id;
            rest.sender = requestDetail?.recipient?._id;
        } else {
            // Otherwise, use the original recipient and sender
            rest.recipient = recipient;
            rest.sender = userId;
        }
        rest.project = requestDetail?.project?._id


        rest.comments = comments;


        rest.previousRequestId = requestDetail?._id;
        rest.status = 0;

        rest.items = items;
        console.log(rest.items)

        try {
            const postResponse = await axiosInstance.post(`new/requests/`, rest);
            console.log("Post response", postResponse);

            const putResponse = await axiosInstance.put(`new/requests/${requestDetail._id}`, { status })
            console.log("Put Response", putResponse);
            toggle();
        } catch (err) {
            console.error(err);
        }
    };




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

        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Add Request Detail</ModalHeader>
            <ModalBody>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormGroup>
                        <Label for="requestType">Request Type</Label>
                        <Input id="requestType" {...register("requestType")} value={requestDetail.requestType} disabled />
                    </FormGroup>
                    {selectedStatus !== "2" && (
                        <FormGroup style={{ display: "flex", flexDirection: "column" }}>
                            {requestStatus === 0 && occupation !== 'Managing Partner' && (
                                <>
                                    <Label for="recipient">Send to:</Label>
                                    {occupation === 'Project Director' ? (
                                        <select id='recipient' {...register('recipient')} required>
                                            <option>Select User</option>
                                            {projectManagers?.map((manager, index) => (
                                                manager ? <option key={manager._id} value={manager._id}>{manager.fName}</option> : null
                                            ))}
                                        </select>
                                    ) : (
                                        <select id='recipient' {...register('recipient')} required>
                                            <option>Select User</option>
                                            {recipients?.map((recipient, index) => (
                                                <option key={recipient._id} value={recipient._id}>{recipient.fName}</option>
                                            ))}
                                        </select>
                                    )}
                                </>
                            )}
                        </FormGroup>
                    )}


                    {selectedStatus === '2' && (<FormGroup style={{ display: "flex", flexDirection: "column" }}>
                        <Label for="recipient">Send to:</Label>
                        <select id='recipient' {...register('recipient')} required>
                            <option value={requestDetail?.sender?._id}>{requestDetail?.sender?.fName}</option>

                        </select>
                    </FormGroup>)}
                    {requestStatus === 0 ? (<FormGroup>
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
                                Declined
                            </RadioLabel>
                        </RadioWrapper>
                    </FormGroup>) : null}
                    {selectedStatus !== "2" && itemFields.map((item, index) => (
                        <FormGroup key={item.id}>
                            <Label for={`items[${index}].itemName`}>Item {index + 1} Name</Label>
                            <Input disabled id={`items[${index}].itemName`} {...register(`items[${index}].itemName`)} value={requestDetail?.items[index]?.itemName} />
                            <Label for={`items[${index}].itemQuantity`}>Item {index + 1} Quantity</Label>
                            <Input disabled id={`items[${index}].itemQuantity`} {...register(`items[${index}].itemQuantity`)} value={requestDetail?.items[index]?.itemQuantity} type='number' />
                            {occupation === "Quantity Surveyor" && (
                                <>
                                    <Label for={`items[${index}].unitPrice`}>Item {index + 1} Unit Price</Label>
                                    <Controller
                                        name={`items[${index}].unitPrice`}
                                        control={control}
                                        defaultValue={requestDetail?.items[index]?.unitPrice || ""} // Fetch the initial price from the server
                                        render={({ field }) => (
                                            <Input
                                                id={`items[${index}].unitPrice`}
                                                {...field}
                                                onChange={(event) => {
                                                    field.onChange(event); // react-hook-form change handler
                                                    onUnitPriceChange(event, index); // your own change handler
                                                }}
                                            />
                                        )}
                                    />
                                </>
                            )}
                            {occupation === "Quantity Surveyor" && (
                                <>
                                    <Label for={`items[${index}].totalPrice`}>Item {index + 1} Total Price</Label>
                                    <Controller
                                        name={`items[${index}].totalPrice`}
                                        control={control}
                                        defaultValue="" // make sure to set up defaultValue
                                        render={({ field }) => <Input id={`items[${index}].totalPrice`} {...field} disabled />}
                                    />
                                </>
                            )}
                        </FormGroup>
                    ))}



                    <FormGroup>
                        <Label for="oldComment">Comment from Previous User</Label>
                        <Input id="oldComment" {...register("oldComment")} type='textarea' defaultValue={requestDetail?.comments}
                            disabled />
                    </FormGroup>

                    {requestStatus === 0 ? (<FormGroup>
                        <Label for="comments">New Comment</Label>
                        <Input id="comments" {...register("comments")} placeholder="Please State Your Reason Of Accepting Or Rejecting This Request, Be Concise" type='textarea' onChange={e => setValue('comments', e.target.value)}
                        />
                    </FormGroup>) : null}
                    {requestStatus === 0 ? (<Button type="submit">Update Request</Button>) : null}
                    <Button type="button" onClick={handleSubmit(data => console.log(data))}>Log form data</Button>

                </Form>
            </ModalBody>
        </Modal>
    );
};

export default RequestDetailModal;