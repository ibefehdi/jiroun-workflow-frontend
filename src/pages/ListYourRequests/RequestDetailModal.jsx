import React, { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Input, Form, Table } from 'reactstrap';
import axiosInstance from '../../constants/axiosConstant';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import { useRef } from 'react';
import ReactQuill from 'react-quill';
import { Editor } from '@tinymce/tinymce-react';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import 'react-quill/dist/quill.snow.css';
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

const RequestDetailModal = ({ isOpen, toggle, requestDetail, onFormSubmit }) => {
    const componentRef = useRef();
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleClick = () => {
        window.open(requestDetail?.attachment, '_blank');
    };
    const requestId = requestDetail?._id
    const userId = useSelector((state) => state._id)
    const occupation = useSelector((state) => state.occupation)
    const [projectManagers, setProjectManagers] = useState([]);
    const [estimatedAmount, setEstimatedAmount] = useState('');
    const [noOfLabour, setNoOfLabour] = useState();
    const [priceOfLabour, setPriceOfLabour] = useState();
    const [transportationPrice, setTransportationPrice] = useState();
    const [paidAmount, setPaidAmount] = useState('');
    const [requiredAmount, setRequiredAmount] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [comments, setComments] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEstimatedAmountChange = (e) => {
        setEstimatedAmount(e.target.value);
    };
    const handleLabourAmountChange = (e) => {
        setNoOfLabour(e.target.value);
    };
    const handlePaidAmountChange = (e) => {
        setPaidAmount(e.target.value);
    };
    const handleLabourPriceAmountChange = (e) => {
        setPriceOfLabour(e.target.value);
    };
    const handleRequiredAmountChange = (e) => {
        setRequiredAmount(e.target.value);
    };
    const handleTransportationPrice = (e) => {
        setTransportationPrice(e.target.value);
    };

    const handleTotalAmountChange = useCallback(() => {
        if (requestType === "Request Labour") {
            let newTotalAmount = noOfLabour * priceOfLabour + Number(transportationPrice)
            setTotalAmount(newTotalAmount);
        } else if (requestType === "Request Payment" && occupation === "Finance") {
            let newTotalAmount = Number(estimatedAmount) - Number(paidAmount) - Number(requiredAmount)
            setTotalAmount(newTotalAmount);

        }

    });
    useEffect(() => {
        handleTotalAmountChange();
    }, [noOfLabour, transportationPrice, priceOfLabour, handleTotalAmountChange])
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
        async function getAllSenders() {
            try {
                const response = await axiosInstance.get(`getAllSenders/${requestId}`);
                setRecipients(response?.data);
            } catch (err) {
                console.error("Error while fetching the senders", err)
            }
        }
        getRecipient();
        getAllSenders();
    }, [requestId, userId]);





    const { register, handleSubmit, setValue, control, watch, reset } = useForm({
        defaultValues: {
            requestType: "",
            status: "",
            items: [],
            estimatedAmount: "",
            paidAmount: "",
            requiredAmount: "",
            comments: "",
        },
    });

    const watchedItems = watch('items');
    const selectedStatus = watch('status');

    const { fields: itemFields, append: itemAppend } = useFieldArray({ control, name: 'items' });
    const { fields: labourFields, append: labourAppend } = useFieldArray({ control, name: 'labour' });


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
            if (requestType === "Request Labour") {
                setNoOfLabour(requestDetail?.noOfLabour)
                setPriceOfLabour(requestDetail?.priceOfLabour)
                setTransportationPrice(requestDetail?.transportationPrice)
                setTotalAmount(requestDetail?.totalAmount)

            }
        }
    }, [requestDetail, setValue, requestType]);

    const makeRequestPayload = (userId, requestId, comments, progress = null) => ({
        requestId,
        userId,
        comments,
        ...(progress !== null && { progress })
    });
    // const computeSubtotal = (items) => {
    //     if (!Array.isArray(items)) {
    //         return 0;
    //     }
    //     return items.reduce((acc, currItem) => acc + (currItem.totalPrice || 0), 0);
    // }


    const onSubmit = async (data) => {
        console.log(data);
        setIsSubmitting(true);

        const { comments, recipient, status, items } = data;
        const payload = {
            comments,
            recipient,
            sender: userId,
        };

        if (status === "3") {
            try {
                const deleteResponse = await axiosInstance.post(`/deleteRequest/${requestId}`, makeRequestPayload(userId, requestId, comments));
                if (deleteResponse.status === 200) {
                    toggle();
                    onFormSubmit();
                }
            } catch (error) {
                console.error('An error occurred while deleting the request', error);
            }
            return;
        }



        try {
            const updateMainRequest = async (globalStatus, progress) => await axiosInstance.put(`/requests/${requestDetail._id}`, { globalStatus, progress });
            const updateSubRequest = async (isFinalized) => await axiosInstance.put(`/subrequests/${requestDetail?.subRequests[requestDetail.subRequests.length - 1]._id}`, { isFinalized });
            const unpaidRequest = async (payload) => await axiosInstance.post(`/unpaidRequest/request/${requestDetail?._id}`, payload);
            const completeRequest = async (payload) => await axiosInstance.post(`/completeRequest/${requestDetail?._id}`, payload)
            // if (occupation === 'Managing Partner' && requestType === "Request Labour") {
            //     const updateResponse = await updateMainRequest(status, 100);
            //     const updateResponse1 = await updateSubRequest(status);

            //     if (updateResponse.status === 200 && updateResponse1.status === 200) {
            //         await completeRequest(makeRequestPayload(userId, requestId, comments, 100));
            //     }
            // }
            if (occupation === 'Managing Partner' && status === '1') {
                const updateResponse = await updateMainRequest(status, 100);
                const updateResponse1 = await updateSubRequest(status);

                if (updateResponse.status === 200 && updateResponse1.status === 200) {
                    await unpaidRequest(makeRequestPayload(userId, requestId, comments, 100));
                }
            }
            // else if (occupation === 'Finance' && status === '1' && requestType === 'Request Labour') {
            //     const updateResponse = await updateMainRequest(status, 100);
            //     const updateResponse1 = await updateSubRequest(status);

            //     if (updateResponse.status === 200 && updateResponse1.status === 200) {
            //         await unpaidRequest(makeRequestPayload(userId, requestId, comments, 100));
            //         console.log("Request Completed");
            //     }

            // }
            else {
                const updateResponse = await updateSubRequest(status);
                if (updateResponse.status === 200) {
                    await axiosInstance.post(`/requests/${requestDetail?._id}`, payload);
                    if (requestType === "Request Item") {
                        await axiosInstance.put(`/editrequests/${requestDetail?._id}`, { updatedItems: items });
                    } else if (requestType === "Request Payment") {
                        await axiosInstance.put(`/editrequests/${requestDetail?._id}`, {
                            estimatedAmount,
                            totalAmount,
                            requiredAmount,
                            paidAmount,
                        });
                    } else if (requestType === "Request Labour") {
                        await axiosInstance.put(`/editrequests/${requestDetail?._id}`, {
                            noOfLabour,
                            totalAmount,
                            transportationPrice,
                            priceOfLabour
                        });
                    }
                }
            }
            reset({
                requestType: "",
                status: "",
                items: [],
                estimatedAmount: "",
                paidAmount: "",
                requiredAmount: "",
                comments: "",
            });
            toggle();
            onFormSubmit();
            setIsSubmitting(false);

        } catch (err) {
            console.error(err);
            setIsSubmitting(false);

        }
        finally {

            setIsSubmitting(false);
            window.location.reload();
        }
    };
    useEffect(() => {
        reset({ ...requestDetail })
    }, [requestDetail, reset])

    useEffect(() => {
        const getRecipients = async () => {
            let recipientOccupation = ''
            if (requestType === 'Request Labour') {
                switch (occupation) {

                    case 'Project Manager':
                        recipientOccupation = 'finance';
                        break;
                    case "Project Director":
                        if (noOfLabour === 0) {
                            recipientOccupation = `initiator/${requestDetail?._id}`
                        }
                        else {
                            recipientOccupation = 'finance'
                        }
                        break;
                    case 'Finance':
                        recipientOccupation = 'managingpartner';
                        break;
                    default:
                        recipientOccupation = '';
                }
            } else if (requestType === "Request Payment") {
                switch (occupation) {
                    case 'Project Manager':
                        recipientOccupation = 'qos';
                        break;
                    case 'Project Director':
                        recipientOccupation = 'qos';
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
            }
            else {
                switch (occupation) {
                    case 'Project Manager':
                        recipientOccupation = 'procurement';
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
            }


            if (recipientOccupation) {
                const response = await axiosInstance.get(`/users/${recipientOccupation}`);
                setRecipients(response?.data);
            }
        }
        async function getAllSenders() {
            try {
                const response = await axiosInstance.get(`getAllSenders/${requestId}`);
                setRecipients(response?.data);
            } catch (err) {
                console.error("Error while fetching the senders", err)
            }
        }

        if (selectedStatus === '1') {
            getRecipients();

        } else if (selectedStatus === '2') { getAllSenders(); }




    }, [occupation, requestDetail?._id, requestType, selectedStatus, requestId, noOfLabour,])


    if (!requestDetail) {
        return null;
    }
    const onUnitPriceChange = (event, index) => {


    }
    const renderSubRequests = (subRequests, occupation) => subRequests.map((subRequest, index) => {
        let commentsHTML = subRequest.comments;

        // Check if the user is a "Project Manager"
        if (occupation === "Project Manager") {
            // Creating a temporary container to parse the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = commentsHTML;

            // Find and remove <pre class="ql-syntax" spellcheck="false"> elements
            const preTags = tempDiv.querySelectorAll('pre.ql-syntax');
            preTags.forEach(preTag => preTag.parentNode.removeChild(preTag));

            // Get the modified HTML without the <pre> tags
            commentsHTML = tempDiv.innerHTML;
        }

        return (
            <tr key={index}>
                <td>{subRequest?.sender?.fName} {subRequest?.sender?.lName}</td>
                <td dangerouslySetInnerHTML={{ __html: commentsHTML }}></td>
                <td>{new Date(subRequest.subRequestSentAt).toLocaleString()}</td>
            </tr>
        );
    });

    const TableRow = ({ label, value, date }) => (
        <tr>
            <td style={{ fontWeight: 'bolder' }}>{label}</td>
            <td style={{ fontWeight: 'bolder' }}>{value}</td>
            <td style={{ fontWeight: 'bolder' }}>{date}</td>
        </tr>
    );

    return (
        <Modal ref={componentRef} isOpen={isOpen} toggle={toggle} className="modern-modal" style={{ maxWidth: '880px' }}>
            <ModalHeader toggle={toggle}>
                Add Request Detail
            </ModalHeader>
            <ModalBody >
                <Form onSubmit={handleSubmit(onSubmit)} className="form-container">
                    <Table striped bordered hover>
                        <tbody>
                            <tr><td><strong>Request ID:</strong></td><td>{requestDetail?.requestID}</td></tr>
                            <tr><td><strong>Request Type:</strong></td><td>{requestDetail?.requestType}</td></tr>
                            <tr><td><strong>Request Title:</strong></td><td>{requestDetail?.requestTitle}</td></tr>

                            <tr><td><strong>Project Name:</strong></td><td>{requestDetail?.project?.projectName}</td></tr>
                            <tr><td><strong>Project Year:</strong></td><td>{new Date(requestDetail?.project?.year).getFullYear()}</td></tr>
                            {requestType === "Request Payment" && (<tr><td><strong>Request Initiator:</strong></td><td>{requestDetail?.initiator?.fName}</td></tr>)}

                            {requestType === "Request Payment" && (<tr><td><strong>Contractor:</strong></td><td>{`${requestDetail?.contractorForPayment?.fName} ${requestDetail?.contractorForPayment?.lName}`}</td></tr>
                            )}
                        </tbody>
                    </Table>


                    {isUserRecipient ? (<FormGroup style={{ backgroundColor: "#f9f9f9", padding: "10px", borderRadius: "5px", border: "1px solid #01CCFF" }}>
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
                            {occupation !== 'Project Manager' && (
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
                    {selectedStatus === "3"
                        &&
                        (<h5 style={{ color: "red" }}>Caution: You are about to delete the Request. The user will have to resubmit.</h5>)
                    }
                    {selectedStatus && selectedStatus !== "2" && selectedStatus !== "3" && (
                        <FormGroup style={{ display: "flex", flexDirection: "column" }}>
                            {isUserRecipient ? occupation !== 'Managing Partner' && (
                                <>
                                    <Label for="recipient">Send to:</Label>

                                    <select id='recipient' {...register('recipient')} required>
                                        <option>Select User</option>
                                        {recipients?.map((recipient, index) => (
                                            <option key={recipient?._id} value={recipient?._id}>{recipient?.fName} {recipient?.lName}</option>
                                        ))}
                                    </select>

                                </>
                            ) : null}
                        </FormGroup>
                    )}


                    {selectedStatus && selectedStatus === "2" && selectedStatus !== "3" ? (<FormGroup style={{ display: "flex", flexDirection: "column" }}>
                        <Label for="recipient">Send to:</Label>
                        <select id='recipient' {...register('recipient')} required>
                            <option>Select User</option>
                            {recipients.map((sender) => (
                                <option key={sender._id} value={sender._id}>
                                    {sender.fName} {sender.lName}
                                </option>
                            ))}
                        </select>
                    </FormGroup>) : null}
                    {requestDetail.requestType === 'Request Item' && itemFields?.map((item, index) => (
                        <FormGroup key={item.id}>
                            <Label for={`items[${index}].itemName`}>Item {index + 1} Name</Label>
                            <Input disabled id={`items[${index}].itemName`} {...register(`items[${index}].itemName`)} type='textarea' value={requestDetail?.items[index]?.itemName} />
                            <>
                                <Label for={`items[${index}].itemQuantity`}>Item {index + 1} Quantity</Label>
                                <Controller name={`items[${index}].itemQuantity`}
                                    control={control}
                                    defaultValue={requestDetail?.items[index]?.itemQuantity || ""}
                                    render={({ field }) => (
                                        <Input
                                            id={`items[${index}].itemQuantity`}
                                            {...field}
                                            disabled
                                            autoComplete='off'
                                        />
                                    )}
                                />
                            </>

                            {/* <Input id={`items[${index}].itemQuantity`} {...register(`items[${index}].itemQuantity`)} value={requestDetail?.items[index]?.itemQuantity} type='number' /> */}
                            <Label for={`items[${index}].boqId`}>Item {index + 1} BOQ ID</Label>
                            <Input disabled id={`items[${index}].boqId`} {...register(`items[${index}].boqId`)} value={requestDetail?.items[index]?.boqId} type='text' />

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
                                                onBlur={(event) => {
                                                    field.onBlur(event);  // Ensure to call the default onBlur provided by Controller
                                                    onUnitPriceChange(event, index);
                                                }}
                                                autoComplete='off'
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
                                        render={({ field }) => <Input id={`items[${index}].totalPrice`} {...field} />}
                                    />
                                </>
                            )}
                        </FormGroup>
                    ))}
                    {requestDetail.requestType === 'Request Payment' && (
                        <FormGroup>
                            <Label for="estimatedAmount">Estimated Amount</Label>
                            <Input id="estimatedAmount" value={estimatedAmount} onChange={handleEstimatedAmountChange} type="text" />
                            <Label for="requiredAmount">Required Amount</Label>
                            <Input id="requiredAmount" value={requiredAmount} onChange={handleRequiredAmountChange} type="text" />

                            <Label for="paidAmount">Paid Amount</Label>
                            <Input id="paidAmount" value={paidAmount} onChange={handlePaidAmountChange} type="text" />

                            <Label for="totalAmount">Total Remaining</Label>
                            <Input id="totalAmount" value={totalAmount} onChange={handleTotalAmountChange} type="number" disabled />
                        </FormGroup>
                    )}

                    {requestDetail.requestType === "Request Labour" && (
                        <FormGroup>

                            <br />
                            <Table responsive striped hover bordered className='details-table'>
                                <thead>
                                    <tr>
                                        <th>Type of Labour</th>
                                        <th>Number of Specialized Labour</th>
                                        <th>Unit Price of Labour</th>
                                        <th>Total Price of Labour</th>
                                        <th>Unit Transportation Price</th>
                                        <th>Labour Comments</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {labourFields?.map((labour, index) => (
                                        <tr key={labour.id}>
                                            <td>{requestDetail?.labour[index]?.typeOfLabour}</td>
                                            <td>{requestDetail?.labour[index]?.numberOfSpecializedLabour}</td>
                                            <td>{requestDetail?.labour[index]?.unitPriceOfLabour}</td>
                                            <td>{requestDetail?.labour[index]?.totalPriceOfLabour}</td>
                                            <td>{requestDetail?.labour[index]?.unitTransportationPrice}</td>
                                            <td>{requestDetail?.labour[index]?.labourComments}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td>
                                            <strong> Total</strong>
                                        </td>
                                        <td>
                                            <strong> {noOfLabour}</strong>
                                        </td>
                                        <td>
                                            <strong>{priceOfLabour}</strong>
                                        </td>
                                        <td>
                                            <strong>{requestDetail?.totalAmount}</strong>
                                        </td>
                                        <td>
                                            <strong>{transportationPrice} </strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </Table>


                        </FormGroup>
                    )}



                    <FormGroup>
                       
                        <Table responsive striped hover bordered className='details-table'>
                            <TableRow label="Name" value="Comment" date={"Date"} />
                            <tbody>
                                {renderSubRequests(requestDetail?.subRequests, occupation)}
                            </tbody>
                        </Table>

                    </FormGroup>
                    <FormGroup>
                        <Label for="attachment">Attachment:</Label>
                        <br />
                        <div
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={handleClick}
                            name="attachment"
                            id="attachment"
                            style={{ display: 'inline-block', cursor: 'pointer' }}
                        >
                            <img
                                src={requestDetail?.attachment}
                                name="attachment"
                                id="attachment"
                                alt=""
                                style={{
                                    width: isHovered ? 'auto' : 100,
                                    height: isHovered ? 'auto' : 100,
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        </div>
                    </FormGroup>


                    {isUserRecipient ? (<FormGroup>
                        <Label for="comments">New Comment</Label>
                        <Controller
                            name="comments"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <ReactQuill
                                    theme="snow"
                                    value={field.value}
                                    style={{ height: '14rem' }}
                                    onChange={field.onChange}
                                    modules={{
                                        toolbar: [
                                            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                                            ['blockquote', 'code-block'],

                                            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
                                            [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
                                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],                        // text direction

                                            [{ 'size': ['small', false, 'large', 'huge'] }],
                                            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                                            [{ 'font': [] }],
                                            [{ 'align': [] }],
                                            ['hidden'],
                                            ['clean']                                         // remove formatting button
                                        ]
                                    }}
                                />
                            )}
                        />


                    </FormGroup>) : null}
                    {isUserRecipient ? (<Button color='primary' style={{ marginTop: "5rem" }} type="submit" disabled={!selectedStatus || isSubmitting}>Update Request</Button>) : null}

                </Form>
            </ModalBody>
        </Modal >

    );
};

export default RequestDetailModal;