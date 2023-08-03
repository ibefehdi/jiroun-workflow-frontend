import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Input, Form } from 'reactstrap';
import axiosInstance from '../../constants/axiosConstant';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const RequestDetailModal = ({ isOpen, toggle, requestDetail }) => {
    const userId = useSelector((state) => state._id)
    const occupation = useSelector((state) => state.occupation)
    const [projectManagers, setProjectManagers] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(0); // Default to 'Pending'
    const [projectDirector, setProjectDirector] = useState();
    console.log(projectDirector);
    console.log(projectManagers)
    const [recipients, setRecipients] = useState([]);
    console.log(requestDetail, "unit PRice", requestDetail?.items.unitPrice)
    useEffect(() => {
        setProjectManagers(requestDetail?.project?.projectManager)
        setProjectDirector(requestDetail?.project?.projectDirector)
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

    // const statusText = requestDetail?.status === 0 ? 'Pending' : requestDetail?.status === 1 ? 'Approved' : 'Declined';

    const onSubmit = async (data) => {
        console.log("This is the data you are sending to the server ", data);
        const { newComment, nextUser, ...rest } = data;

        // Create a new chain of command object with the necessary details
        let newChainCommand = {
            userId: userId, // Current user id
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

        // if nextUser is defined (occupation is not 'Managing Partner'), include nextUserId
        // However, if the selected status is 'Declined', the next user should be the previous sender
        if (selectedStatus === 2) { // 'Declined'
            const lastChainOfCommand = rest.chainOfCommand[rest.chainOfCommand.length - 1];
            newChainCommand.nextUserId = lastChainOfCommand.lastsentBy;
            newChainCommand.lastsentBy = lastChainOfCommand.userId; // set lastsentBy as the userId of the last sender
        }


        // Copy previous chainOfCommand array and add the new chain command to it
        const updatedChainOfCommand = [...rest.chainOfCommand, newChainCommand];

        // Updating the status of the previous chainOfCommand item
        if (updatedChainOfCommand.length > 1) { // Only update if there is a previous item
            updatedChainOfCommand[updatedChainOfCommand.length - 2].status = selectedStatus;
        }

        rest.chainOfCommand = updatedChainOfCommand;
        rest.status = 0;
        console.log('newChainCommand', newChainCommand);
        console.log('rest', rest);
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
                        <Input id="requestType" {...register("requestType")} value={requestDetail?.requestType} disabled />
                    </FormGroup>
                    <FormGroup style={{ display: "flex", flexDirection: "column" }}>
                        {occupation !== 'Managing Partner' && (
                            <>
                                <Label for="nextUser">Send to:</Label>
                                {occupation === 'Project Director' ? (
                                    <select id='nextUser' {...register('nextUser')} required disabled={selectedStatus === 2}>
                                        <option>Select User</option>
                                        {projectManagers && projectManagers?.map((manager, index) => (
                                            manager ? <option key={manager?._id} value={manager?._id}>{manager?.fName}</option> : null
                                        ))}
                                    </select>
                                ) : occupation === 'Contractor' ? (
                                    <select id='nextUser' {...register('nextUser')} required disabled={selectedStatus === 2}>
                                        <option>Select User</option>

                                        <option key={projectDirector?._id} value={projectDirector?._id}>{projectDirector?.fName}</option> : null

                                    </select>
                                ) : (
                                    <select id='nextUser' {...register('nextUser')} required disabled={selectedStatus === 2}>
                                        <option>Select User</option>
                                        {recipients && recipients?.map((recipient, index) => (
                                            recipient ? <option key={recipient?._id} value={recipient?._id}>{recipient?.fName}</option> : null
                                        ))}
                                    </select>
                                )}
                            </>
                        )}
                    </FormGroup>


                    {occupation === "Managing Partner" && (
                        <FormGroup>
                            <Label>Status</Label>
                            <RadioWrapper>

                                <RadioLabel>
                                    <RadioButton type="radio" name="status" value="1" {...register("status")} />
                                    Approved
                                </RadioLabel>
                                <RadioLabel>
                                    <RadioButton type="radio" name="status" value="2" {...register("status")} />
                                    Declined
                                </RadioLabel>
                            </RadioWrapper>
                        </FormGroup>

                    )}
                    {itemFields.map((item, index) => (
                        <FormGroup key={item.id}>
                            <Label for={`items[${index}].itemName`}>Item {index + 1} Name</Label>
                            <Input disabled id={`items[${index}].itemName`} {...register(`items[${index}].itemName`)} value={requestDetail?.items[index]?.itemName} />
                            <Label for={`items[${index}].itemQuantity`}>Item {index + 1} Quantity</Label>
                            <Input disabled id={`items[${index}].itemQuantity`} {...register(`items[${index}].itemQuantity`)} value={requestDetail?.items[index]?.itemQuantity} type='number' />
                            {occupation === "Quantity Surveyor" ? (<>
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
                            </>) : (
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
                                                disabled
                                                onChange={(event) => {
                                                    field.onChange(event); // react-hook-form change handler
                                                    onUnitPriceChange(event, index); // your own change handler
                                                }}
                                            />
                                        )}
                                    />
                                </>
                            )}


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
                            <Label for={`chainOfCommand[${index}].userId`}>Name</Label>
                            <Input disabled id={`chainOfCommand[${index}].userId`} {...register(`chainOfCommand[${index}].userId`)} value={requestDetail?.chainOfCommand[index]?.userId?.fName} />
                            <Label for={`chainOfCommand[${index}].userId`}>Comments from Previous User</Label>
                            <Input disabled id={`chainOfCommand[${index}].userId`} {...register(`chainOfCommand[${index}].userId`)} value={requestDetail?.chainOfCommand[index]?.comments.slice(-1)[0]?.comment} type='textarea' />

                            {index === chainOfCommandFields.length - 1 && (
                                <FormGroup>
                                    <Label for={`chainOfCommand[${index}].status`}>Previous Status</Label>
                                    <RadioWrapper id={`chainOfCommand[${index}].status`} {...register(`chainOfCommand[${index}].status`)}>
                                        <RadioLabel>
                                            <RadioButton type="radio" name={`status_${index}`} value="1"
                                                onChange={() => setSelectedStatus(1)} // When 'Approved' is selected, update the state
                                            />
                                            Approved
                                        </RadioLabel>
                                        <RadioLabel>
                                            <RadioButton type="radio" name={`status_${index}`} value="2"
                                                onChange={() => setSelectedStatus(2)} // When 'Declined' is selected, update the state
                                            />
                                            Declined
                                        </RadioLabel>
                                    </RadioWrapper>
                                </FormGroup>
                            )}
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
