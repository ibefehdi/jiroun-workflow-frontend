import React, { useEffect, useState } from 'react';
import axiosInstance from '../../constants/axiosConstant';
import { useSelector } from 'react-redux';
import { Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';

import "./Request.css"
import AddIcon from '@mui/icons-material/Add';
const Request = () => {
    const userId = useSelector(state => state._id);

    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState();

    const [requestType, setRequestType] = useState(null);
    const [items, setItems] = useState([{ itemName: '', itemQuantity: '', boqId: '' }]);

    const requestTypes = ['Request Item', 'Request Payment'];

    useEffect(() => {
        async function fetchData() {
            const projects = await axiosInstance.get(`/projects/${userId}`)
            setProjects(projects.data.data);
        }
        fetchData();
    }, [userId]);

    useEffect(() => {
        console.log(projects);
        console.log(projectId);
    }, [projects, projectId]);

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
            <h1>Send Request</h1>
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
                                    <Label for='acheivedAmount'>Acheived Amount:</Label>
                                    <Input className="input-form" type='Number' name='acheivedAmount' id='acheivedAmount' placeholder='Acheived Amount' />
                                </FormGroup>)
                            }
                        </FormGroup>

                        {requestType === "Request Item" ? (<Button color="success" onClick={handleAddClick}>
                            <AddIcon /> Add
                        </Button>) : ""}
                        <FormGroup style={{ marginTop: "20px" }}>
                            <Label for="comments">Write Description About Your Request:</Label>
                            <Input type='textarea' placeholder='Please Describe Your Request in Detail, Be Concise.' name='comments' id='comments' />
                        </FormGroup>
                    </Form>
                </div>
            )}
        </Container>
    )
}

export default Request
