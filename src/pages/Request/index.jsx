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



    const [achievedAmount, setAchievedAmount] = useState(null);
    const [comments, setComments] = useState('');
    const requestTypes = ['Request Item', 'Request Payment'];
    const handleSendRequest = async () => {


        const payload = {
            requestType,
            project: projectId,
            items: requestType === 'Request Item' ? items : [],
            achievedAmount: requestType === 'Request Payment' ? achievedAmount : null,
            globalStatus: 0,
            isFinalized: false,
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
                setAchievedAmount(null);
                setComments('');
                setSelectedRecipient(null);
                setSelectedManager(null);
                setSelectedDirector(null);
                handleAlert(true, 'Request Sent Successfully', 'success');

            } else {
                // Handle error
            }
        } catch (err) {
            console.error(err);
            handleAlert(true, 'An error occurred', 'danger');

        }
    };

    // Add handlers for achievedAmount and comments
    const handleAchievedAmountChange = (e) => {
        setAchievedAmount(e.target.value);
    };

    const handleCommentsChange = (e) => {
        setComments(e.target.value);
    };
    useEffect(() => {
        const getRecipients = async () => {
            let recipientOccupation = ''

            switch (userOccupation) {
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

        getRecipients();
    }, [userOccupation])
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
        fetchData();
        fetchProjectManager();
        fetchProjectDirector();
    }, [userId, projectId]);

    useEffect(() => {
        console.log(projects);
        console.log(projectId);
        console.log(projectManager);
        console.log(projectDirector);
    }, [projects, projectId, projectManager, projectDirector]);

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
            <h1 >Send Request</h1>
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
                        {requestTypes.map((type, index) => (
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
                                items.map((item, index) => (
                                    <div key={index}>
                                        <FormGroup style={{ width: "34%" }} >
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
                                        <FormGroup style={{ width: "34%" }}>
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
                                        <FormGroup style={{ width: "34%" }}>
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
                                        {index < items.length - 1 && <hr />}
                                    </div>
                                )) :
                                (<FormGroup style={{ width: "34%" }}>
                                    <Label for='achievedAmount'>Achieved Amount:</Label>
                                    <Input
                                        className="input-form"
                                        type='Number'
                                        name='achievedAmount'
                                        id='achievedAmount'
                                        placeholder='Achieved Amount'
                                        onChange={handleAchievedAmountChange}
                                    />
                                </FormGroup>)
                            }
                        </FormGroup>

                        {requestType === "Request Item" ? (<Button color="success" onClick={handleAddClick}>
                            <AddIcon /> Add
                        </Button>) : ""}
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
                    {recipients.map((recipient, index) => (
                        <option key={index} value={recipient._id}>{recipient.fName}</option>
                    ))}
                </select>


                {selectedRecipient && (
                    <Button color="primary" onClick={handleSendRequest} style={{ marginTop: "20px", width: '10%' }}>
                        Send Request
                    </Button>
                )}
            </div>)}


        </Container>
    )
}

export default Request
