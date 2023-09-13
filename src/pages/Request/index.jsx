import React, { useEffect, useState } from 'react';
import axiosInstance from '../../constants/axiosConstant';
import { useSelector } from 'react-redux';
import { Alert, Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';

import "./Request.css"
import AddIcon from '@mui/icons-material/Add';
const Request = () => {
    const userId = useSelector(state => state._id);
    const userOccupation = useSelector(state => state.occupation);
    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState();
    const [requestType, setRequestType] = useState(null);
    const [items, setItems] = useState([{ itemName: '', itemQuantity: '', boqId: '' }]);
    const [projectManager, setProjectManager] = useState([])
    const [projectDirector, setProjectDirector] = useState()
    const [selectedRecipient, setSelectedRecipient] = useState();
    const [recipients, setRecipients] = useState([]);
    const [contractors, setContractors] = useState([]);
    const [selectedManager, setSelectedManager] = useState();
    const [selectedDirector, setSelectedDirector] = useState();
    const [alert, setAlert] = useState({
        visible: false,
        message: '',
        color: ''
    });
    const handleAlert = (visible, message, color) => {
        setAlert({ visible, message, color });
        setTimeout(() => {
            setAlert({ visible: false, message: '', color: '' });
        }, 3000);
    }

    const [noOfLabour, setNoOfLabour] = useState();
    const [priceOfLabour, setPriceOfLabour] = useState();
    const [transportationPrice, setTransportationPrice] = useState(0);

    const [paymentType, setPaymentType] = useState(null);
    const [contractor, setContractor] = useState(null);
    const [comments, setComments] = useState('');
    let requestTypes = ['Request Item', 'Request Payment', 'Request Labour'];
    if (userOccupation === 'Foreman') {
        requestTypes = ['Request Labour'];
    }

    const paymentTypes = ['Advance Payment', "Progressive Payment", "Handover Payment", "Final Payment"]
    const handleSendRequest = async () => {


        const payload = {
            requestType,
            project: projectId,
            items: requestType === 'Request Item' ? items : null,
            paymentType: requestType === 'Request Payment' ? paymentType : null,
            noOfLabour: requestType === 'Request Labour' ? noOfLabour : null,
            priceOfLabour: requestType === 'Request Labour' ? priceOfLabour : null,
            transportationPrice: requestType === 'Request Labour' ? transportationPrice : null,
            totalAmount: requestType === 'Request Labour' ? totalAmount : null,
            globalStatus: 0,
            isFinalized: false,
            contractorForPayment: contractor,
            subRequest: {
                recipient: selectedRecipient,
                sender: userId,
                comments: comments,
            }
        };

        try {
            const response = await axiosInstance.post("requests", payload);
            if (response.status === 201) {
                setRequestType(null);
                setItems([{ itemName: '', itemQuantity: '', boqId: '' }]);
                setPaymentType(null);
                setNoOfLabour(null);
                setPriceOfLabour(null);
                setTransportationPrice(null);
                setRequestType(null);
                setComments('');
                setSelectedRecipient(null);
                setSelectedManager(null);
                setSelectedDirector(null);
                handleAlert(true, 'Request Sent Successfully', 'success');

            } else {

            }
        } catch (err) {
            console.error(err);
            handleAlert(true, 'An error occurred', 'danger');

        }
    };

    const handleLabourAmount = (e) => {
        setNoOfLabour(e.target.value);
    };
    const handlePriceLabour = (e) => {
        setPriceOfLabour(e.target.value);
    };
    let totalAmount = noOfLabour * priceOfLabour + Number(transportationPrice)

    const handlePaymentType = (e) => {
        setPaymentType(e.target.value);
    };
    const handleContractorChange = (e) => {
        setContractor(e.target.value);
    };
    const handleCommentsChange = (e) => {
        setComments(e.target.value);
    };
    const handleTransportationPrice = (e) => {
        setTransportationPrice(e.target.value);
    }
    useEffect(() => {
        const getRecipients = async () => {
            let recipientOccupation = ''

            switch (userOccupation) {
                case 'Foreman':
                    recipientOccupation = 'projectmanagers';
                    break;
                case 'Project Manager':
                    recipientOccupation = 'projectdirectors';
                    break;
                case 'Project Director':
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
        const getQosUsers = async (req, res) => {
            const response = await axiosInstance.get(`/users/qos`);
            setRecipients(response.data);
        }
        if (requestType === "Request Item" || requestType === "Request Labour" || requestType === "Request Payment") {
            getRecipients();
        } else {
            getQosUsers();

        }

    }, [userOccupation, requestType])
    useEffect(() => {
        async function fetchData() {
            if (userId) {
                const projects = await axiosInstance.get(`/projects/${userId}`);
                setProjects(projects.data.data);
            }
        }
        async function fetchProjectManager() {
            if (projectId) {
                const projectManager = await axiosInstance.get(`/projects/${projectId}/managers`);
                setProjectManager(projectManager.data);
            }
        }
        async function fetchProjectDirector() {
            if (projectId) {
                const projectDirector = await axiosInstance.get(`/projects/${projectId}/directors`);
                setProjectDirector(projectDirector.data);
            }
        }
        async function fetchContractors() {
            if (requestType === "Request Payment") {
                const contractors = await axiosInstance.get(`/projects/${projectId}/contractors`);
                console.log(contractors?.data)
                setContractors(contractors?.data)
            }
        }
        fetchData();
        fetchProjectManager();
        fetchProjectDirector();
        fetchContractors()
    }, [userId, projectId, requestType]);



    // Update selectedRecipient when selectedManager changes
    useEffect(() => {
        setSelectedRecipient(selectedManager);
    }, [selectedManager]);

    // Update selectedRecipient when selectedDirector changes
    useEffect(() => {
        setSelectedRecipient(selectedDirector);
    }, [selectedDirector]);


    const handleItemChange = (e, index) => {
        const { name, value } = e.target;
        const list = [...items];
        list[index][name] = value;
        setItems(list);
    };

    const handleAddClick = () => {
        setItems([...items, { itemName: '', itemQuantity: '', boqId: '' }]);
    };

    return (
        <Container className='pagecontainer' style={{ marginTop: "20px" }}>
            {alert.visible &&
                <Alert color={alert.color} style={{ position: 'fixed', top: '10px', right: '10px', zIndex: '1000' }}>
                    {alert.message}
                </Alert>
            }
            <h1 className='Heading'>Send Request</h1>
            <div className='sectioninput'>
                <h4>1. Select A Project:</h4>
                <select style={{ background: "white" }} onChange={(e) => setProjectId(e.target.value)}>
                    <option>-----------</option>
                    {projects.map((project, index) => (

                        <option key={index} value={project._id}>
                            {project.projectName}
                        </option>
                    ))}
                </select>
            </div>
            {projectId && (
                <div className='sectioninput'>
                    <h4> 2. Select Request Type:</h4>
                    <select style={{ background: "white" }} onChange={(e) => setRequestType(e.target.value)}>
                        <option>-----------</option>
                        {requestTypes?.map((type, index) => (
                            <option key={index} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {requestType && (
                <div className='sectioninput'>
                    <h4> 3. Select The Details</h4>
                    <Form method='post' action>
                        <FormGroup className='form-group'>
                            {requestType === "Request Item" ?
                                items && Array.isArray(items) && items.map((item, index) => (
                                    <div key={index} style={{ display: "flex", gap: "10rem" }}>
                                        <FormGroup >
                                            <Label for={`itemName${index}`}>Item {index + 1} Name:</Label>
                                            <Input
                                                className="input-form"
                                                type='text'
                                                name='itemName'
                                                id='itemName'
                                                placeholder='Item Name'
                                                value={item.itemName}
                                                onChange={e => handleItemChange(e, index)}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for={`itemQuantity${index}`}>Item {index + 1} Quantity:</Label>
                                            <Input
                                                className="input-form"
                                                type='number'
                                                name='itemQuantity'
                                                id='itemQuantity'
                                                placeholder='Item Quantity'
                                                value={item.itemQuantity}
                                                onChange={e => handleItemChange(e, index)}
                                            />
                                        </FormGroup>
                                        <FormGroup >
                                            <Label for={`boqId${index}`}>Item {index + 1} BOQ ID:</Label>
                                            <Input
                                                className="input-form"
                                                type="text"
                                                name="boqId"
                                                placeholder="Please Enter BOQ ID"
                                                value={item.boqId}
                                                onChange={e => handleItemChange(e, index)}
                                                required
                                            />
                                        </FormGroup>
                                        {index < items.length - 1 && <br />}
                                    </div>
                                )) :
                                (requestType === "Request Payment" && <FormGroup style={{ width: "34%" }}>
                                    <Label for="contractor">Contractor:</Label>
                                    <select className="input-form" name="contractor" id="contractor" onChange={handleContractorChange} style={{ marginBottom: "10px", width: "100%" }}>
                                        <option>-----------</option>
                                        {contractors?.map((contractor, index) => (
                                            <option key={index} value={contractor?._id}>
                                                {contractor?.fName} {contractor?.lName}
                                            </option>
                                        ))}
                                    </select>
                                    <Label for="paymentType">Payment Type:</Label>
                                    <select
                                        className="input-form"
                                        name="paymentType"
                                        id="paymentType"
                                        onChange={handlePaymentType}
                                        style={{ width: "100%" }}
                                    >
                                        <option>-----------</option>
                                        {paymentTypes.map((paymentType, index) => (
                                            <option key={index} value={paymentType}>
                                                {paymentType}
                                            </option>
                                        ))}
                                    </select>
                                </FormGroup>
                                )
                            }
                        </FormGroup>

                        {requestType === "Request Item" ? (<Button color="success" onClick={handleAddClick}>
                            <AddIcon /> Add
                        </Button>) : ""}
                        {requestType === "Request Labour" && (
                            <>
                                <div style={{ display: "flex" }}>
                                    <FormGroup>
                                        <Label for="number_of_labour">Number of Labour:</Label>
                                        <Input
                                            type='number'
                                            name='number_of_labour'
                                            id='number_of_labour'
                                            placeholder='Enter number of labour'
                                            value={noOfLabour}
                                            onChange={handleLabourAmount} style={{ width: "100%" }}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="price_of_labour">Cost of Labour:</Label>
                                        <Input
                                            type='number'
                                            name='price_of_labour'
                                            id='price_of_labour'
                                            placeholder='Enter price of labour (KWD)'
                                            value={priceOfLabour}
                                            onChange={handlePriceLabour}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="transportation_of_labour">Transportation Price:</Label>
                                        <Input
                                            type='number'
                                            name='transportation_of_labour'
                                            id='transportation_of_labour'
                                            placeholder='Enter price of Transportation (KWD)'
                                            value={transportationPrice}
                                            onChange={handleTransportationPrice}
                                        />
                                    </FormGroup>
                                </div>
                                <FormGroup>
                                    <Label for="total_price_of_labour">Total Price of Labour:</Label>
                                    <Input
                                        type='number'
                                        name='total_price_of_labour'
                                        id='total_price_of_labour'
                                        placeholder='Total price (KWD)'
                                        value={totalAmount}
                                        disabled
                                    />
                                </FormGroup>
                            </>
                        )}
                        <FormGroup style={{ marginTop: "20px" }}>
                            <Label for="comments">Write Description About Your Request:</Label>
                            <Input
                                type='textarea'
                                placeholder='Please Describe Your Request in Detail, Be Concise.'
                                name='comments'
                                id='comments'
                                onChange={handleCommentsChange}
                            />
                        </FormGroup>
                    </Form>

                </div>
            )}

            {requestType && (<div className='sectioninput' style={{ display: "flex", flexDirection: 'column' }} >
                <h4>4. Please indicate the preferred Recipient</h4>
                <select style={{ background: "white" }} onChange={(e) => setSelectedDirector(e.target.value)}>
                    <option>-----------</option>
                    {recipients?.map((recipient, index) => (
                        <option key={index} value={recipient?._id}>{recipient?.fName} {recipient?.lName}</option>
                    ))}
                </select>


                {selectedRecipient && (
                    <Button color="primary" onClick={handleSendRequest} style={{ marginTop: "20px", width: '15%', padding: "10px" }}>
                        Send Request
                    </Button>
                )}
            </div>)}


        </Container>
    )
}

export default Request
