import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Input, Form } from 'reactstrap';
import axiosInstance from '../../constants/axiosConstant';
import { useSelector } from 'react-redux';

const RequestDetailModal = ({ isOpen, toggle, requestDetail }) => {
    const userId = useSelector((state) => state._id)
    const occupation = useSelector((state) => state.occupation)
    const [projectManagers, setProjectManagers] = useState([]);
    const [recipients, setRecipients] = useState([]);

    useEffect(() => {
        setProjectManagers(requestDetail?.project?.projectManager)

    }, [requestDetail])

    useEffect(() => {
        const getRecipients = async () => {
            let recipientOccupation = ''

            switch (occupation) {
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
            chainOfCommand: [],
        },
    });

    const watchedItems = watch('items');

    const { fields: itemFields, append: itemAppend } = useFieldArray({ control, name: 'items' });
    const { fields: chainOfCommandFields, append: chainOfCommandAppend } = useFieldArray({ control, name: 'chainOfCommand' });

    useEffect(() => {
        if (requestDetail) {
            setValue("requestType", requestDetail?.requestType);
            setValue("status", requestDetail?.status);
            setValue("items", requestDetail?.items);
            setValue("chainOfCommand", requestDetail?.chainOfCommand);
        }
    }, [requestDetail, setValue]);

    const statusText = requestDetail?.status === 0 ? 'Pending' : requestDetail?.status === 1 ? 'Approved' : 'Declined';

    const onSubmit = async (data) => {
        console.log(data);
        const { newComment, ...rest } = data;

        // Create a new chain of command object with the necessary details
        const newChainCommand = {
            userId: userId, // Current user id
            nextUserId: data.nextUser, // From the "send to:" dropdown
            lastsentBy: userId, // Current user id
            status: 0, // The status of the new chainOfCommand should be 0
            comments: [
                {
                    comment: newComment,
                    madeBy: userId,
                    madeAt: new Date()
                }
            ],
        };

        // Copy previous chainOfCommand array and add the new chain command to it
        const updatedChainOfCommand = [...rest.chainOfCommand, newChainCommand];

        // Updating the status of the previous chainOfCommand item
        updatedChainOfCommand[updatedChainOfCommand.length - 2].status = data.chainOfCommand[chainOfCommandFields.length - 1].status;

        rest.chainOfCommand = updatedChainOfCommand;
        rest.status = 0;

        try {
            const updatedData = await axiosInstance.put(`/requests/${requestDetail._id}`, rest);
            console.log(updatedData);
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
                    <FormGroup style={{ display: "flex", flexDirection: "column" }}>
                        <Label for="nextUser">Send to:</Label>
                        {occupation === 'Project Director' ? (
                            <select id='nextUser' {...register('nextUser')}>
                                <option>Select User</option>
                                {projectManagers?.map((manager, index) => (
                                    <option key={manager._id} value={manager._id}>{manager.fName}</option>
                                ))}
                            </select>
                        ) : (
                            <select id='nextUser' {...register('nextUser')}>
                                <option>Select User</option>
                                {recipients?.map((recipient, index) => (
                                    <option key={recipient._id} value={recipient._id}>{recipient.fName}</option>
                                ))}
                            </select>
                        )}



                    </FormGroup>
                    <FormGroup>
                        <Label for="status">Status</Label>
                        <Input id="status" {...register("status")} value={statusText} disabled />
                    </FormGroup>
                    {itemFields.map((item, index) => (
                        <FormGroup key={item.id}>
                            <Label for={`items[${index}].itemName`}>Item {index + 1} Name</Label>
                            <Input disabled id={`items[${index}].itemName`} {...register(`items[${index}].itemName`)} value={requestDetail?.items[index]?.itemName} />
                            <Label for={`items[${index}].itemQuantity`}>Item {index + 1} Quantity</Label>
                            <Input disabled id={`items[${index}].itemQuantity`} {...register(`items[${index}].itemQuantity`)} value={requestDetail?.items[index]?.itemQuantity} type='number' />
                            <Label for={`items[${index}].unitPrice`}>Item {index + 1} Unit Price</Label>
                            <Input
                                id={`items[${index}].unitPrice`}
                                {...register(`items[${index}].unitPrice`)}
                                onChange={(event) => onUnitPriceChange(event, index)
                                }

                            />
                            <Label for={`items[${index}].totalPrice`}>Item {index + 1} Total Price</Label>
                            <Controller
                                name={`items[${index}].totalPrice`}
                                control={control}
                                defaultValue="" // make sure to set up defaultValue
                                render={({ field }) => <Input id={`items[${index}].totalPrice`} {...field} disabled />}
                            />
                        </FormGroup>
                    ))}
                    {chainOfCommandFields.map((command, index) => (
                        <FormGroup key={command.id}>
                            <Label for={`chainOfCommand[${chainOfCommandFields.length - 1}].userId`}>Name</Label>
                            <Input disabled id={`chainOfCommand[${chainOfCommandFields.length - 1}].userId`} {...register(`chainOfCommand[${chainOfCommandFields.length - 1}].userId`)} value={requestDetail?.chainOfCommand[chainOfCommandFields.length - 1]?.userId?.fName} />
                            <Label for={`chainOfCommand[${chainOfCommandFields.length - 1}].userId`}>Comments from Previous User</Label>
                            <Input disabled id={`chainOfCommand[${chainOfCommandFields.length - 1}].userId`} {...register(`chainOfCommand[${chainOfCommandFields.length - 1}].userId`)} value={requestDetail?.chainOfCommand[chainOfCommandFields.length - 1]?.comments[chainOfCommandFields.length - 1]?.comment} type='textarea' />
                            <FormGroup style={{ display: "flex", flexDirection: "column" }}>
                                <Label for={`chainOfCommand[${chainOfCommandFields.length - 1}].status`}>Previous Status</Label>
                                <select id={`chainOfCommand[${chainOfCommandFields.length - 1}].status`}
                                    {...register(`chainOfCommand[${chainOfCommandFields.length - 1}].status`)} placeholder="Enter previous status"
                                >

                                    <option value="1">Approved</option>
                                    <option value="2">Declined</option>
                                </select>
                            </FormGroup>



                        </FormGroup>
                    ))}
                    <FormGroup>
                        <Label for="newComment">New Comment</Label>
                        <Input id="newComment" {...register("newComment")} placeholder="Please State Your Reason Of Accepting Or Rejecting This Request, Be Concise" type='textarea' onChange={e => setValue('newComment', e.target.value)}
                        />
                    </FormGroup>

                    <Button type="submit">Update Request</Button>
                    <button type="button" onClick={handleSubmit(data => console.log(data))}>Log form data</button>

                </Form>
            </ModalBody>
        </Modal>
    );
};

export default RequestDetailModal;
