import React, { useEffect, useState } from 'react';
import axiosInstance from '../../constants/axiosConstant';
import { useSelector } from 'react-redux';
import { Alert, Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import "./Request.css"
import ReactQuill from 'react-quill';
import { Editor } from '@tinymce/tinymce-react';
import 'react-quill/dist/quill.snow.css';
import AddIcon from '@mui/icons-material/Add';
const Request = () => {
    const userId = useSelector(state => state._id);
    const userOccupation = useSelector(state => state.occupation);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const [noOfLabour, setNoOfLabour] = useState(0);
    const [priceOfLabour, setPriceOfLabour] = useState(0);
    const [transportationPrice, setTransportationPrice] = useState(0);
    const [labour, setLabour] = useState([{ typeOfLabour: '', numberOfSpecializedLabour: '', unitPriceOfLabour: '', totalPriceOfLabour: '', unitTransportationPrice: '', labourComments: '' }]);
    const handleLabourChange = (e, index) => {
        const { name, value } = e.target;
        const list = [...labour];
        list[index][name] = value;
        setLabour(list);
    };
    const handleAddLabourClick = () => {
        setLabour([...labour, { typeOfLabour: '', numberOfSpecializedLabour: '', unitPriceOfLabour: '', totalPriceOfLabour: '', unitTransportationPrice: '' }]);
    };
    const [requestTitle, setRequestTitle] = useState("");
    const [paymentType, setPaymentType] = useState(null);
    const [contractor, setContractor] = useState(null);
    const [comments, setComments] = useState('');
    let requestTypes = ['Request Item', 'Request Payment', 'Request Labour'];
    if (userOccupation === 'Foreman') {
        requestTypes = ['Request Labour'];
    }
    const handleLabourAttachmentChange = (e, index) => {
        const files = Array.from(e.target.files);
        setLabour((prevLabour) => {
            const updatedLabour = [...prevLabour];
            updatedLabour[index] = {
                ...updatedLabour[index],
                attachments: files,
            };
            return updatedLabour;
        });
    };
    const paymentTypes = ['Advance Payment', "Progressive Payment", "Handover Payment", "Final Payment"]
    const handleSendRequest = async () => {
        setIsSubmitting(true);
        if (requestType === 'Request Item') {
            const isAnyItemEmpty = items.some(item => !item.itemName || !item.itemQuantity || !item.boqId);

            if (isAnyItemEmpty) {
                handleAlert(true, 'Please fill in all item details before sending the request', 'warning');
                return; // Prevents the function from proceeding further
            }
        }

        const formData = new FormData();
        if (requestType === 'Request Labour') {
            labour.forEach((item, index) => {
                if (item.attachments && item.attachments.length > 0) {
                    item.attachments.forEach((file) => {
                        formData.append(`attachments_${index}`, file);
                    });
                }
            });
        }
        formData.append('requestType', requestType);
        formData.append('project', projectId);
        formData.append('requestTitle', requestTitle);
        formData.append('paymentType', requestType === 'Request Payment' ? paymentType : null);
        formData.append('noOfLabour', requestType === 'Request Labour' ? noOfLabour : null);
        formData.append('priceOfLabour', requestType === 'Request Labour' ? priceOfLabour : null);
        formData.append('transportationPrice', requestType === 'Request Labour' ? transportationPrice : null);
        formData.append('totalAmount', requestType === 'Request Labour' ? totalAmount : null);
        formData.append('globalStatus', 0);
        formData.append('isFinalized', false);
        formData.append('contractorForPayment', contractor);
        formData.append('subRequest', JSON.stringify({
            recipient: selectedRecipient,
            sender: userId,
            comments: comments,
        }));
        formData.append('labour', requestType === 'Request Labour' ? JSON.stringify(labour) : null);

        if (requestType === 'Request Item') {
            formData.append('items', JSON.stringify(items));
        }

        if (selectedFile) {
            formData.append('attachment', selectedFile);
        }

        try {
            const response = await axiosInstance.post("requests", formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 201) {
                setRequestType(null);
                setItems([{ itemName: '', itemQuantity: '', boqId: '' }]);
                setPaymentType(null);
                setNoOfLabour(null);
                setPriceOfLabour(null);
                setTransportationPrice(null);
                setRequestType(null);
                setComments('');
                setRequestTitle('');
                setSelectedRecipient(null);
                setSelectedManager(null);
                setSelectedDirector(null);
                setSelectedFile(null);
                handleAlert(true, 'Request Sent Successfully', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
            }
        } catch (err) {
            console.error(err);
            handleAlert(true, 'An error occurred', 'danger');
        }
        setIsSubmitting(false);

    };
    const [selectedFile, setSelectedFile] = useState(null);
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
    // const handleCommentsChange = (e) => {
    //     setComments(e.target.value);
    // };
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
                    if (requestType === 'Request Labour') {
                        recipientOccupation = 'finance';
                    }
                    else if (requestType === 'Request Payment') {
                        recipientOccupation = 'qos';
                    }
                    else if (requestType === 'Request Item') {
                        recipientOccupation = 'procurement';
                    }
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
                case 'Quantity Surveyor':
                    recipientOccupation = 'all'
                    break;
                case 'Developer':
                    recipientOccupation = 'all'
                    break;
                case 'Managing Partner':
                    recipientOccupation = 'all'
                    break;
                default:
                    recipientOccupation = '';
            }

            if (recipientOccupation) {

                const response = await axiosInstance.get(`/users/${recipientOccupation}`);
                setRecipients(response.data)


            }
        }
        const getQosUsers = async (req, res) => {
            const response = await axiosInstance.get(`/users/all`);
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
                if (userOccupation === "Quantity Surveyor" || userOccupation === "Developer" || userOccupation === "Managing Partner") {
                    const projects = await axiosInstance.get(`/projects/`);
                    setProjects(projects.data.data);
                } else {
                    const projects = await axiosInstance.get(`/projects/${userId}`);
                    setProjects(projects.data.data);
                }

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
                const contractors = await axiosInstance.get(`users/allcontractors`);
                console.log(contractors?.data)
                setContractors(contractors?.data)
            }
        }
        fetchData();
        fetchProjectManager();
        fetchProjectDirector();
        fetchContractors()
    }, [userId, projectId, requestType, userOccupation]);



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
                    <h4> 3. Please Add A Request Title</h4>
                    <FormGroup className='form-group'>

                        <Input className='inputbox' type='text' name='requestTitle' id='requestTitle' placeholder='Describe What The Request is About, Be Brief' onChange={(e) => setRequestTitle(e.target.value)} />
                    </FormGroup>
                </div>
            )}
            {requestType && (

                <div className='sectioninput'>
                    <h4> 4. Select The Details</h4>
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
                                                type='text'
                                                name='itemQuantity'
                                                id='itemQuantity'
                                                placeholder='Item Quantity'
                                                value={item.itemQuantity}
                                                onChange={e => handleItemChange(e, index)}
                                            />
                                        </FormGroup>
                                        <FormGroup>
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
                                {labour.map((item, index) => (
                                    <div key={index}>
                                        <FormGroup>
                                            <Label for={`typeOfLabour${index}`}>Type of Labour {index + 1}:</Label>
                                            <Input
                                                type='select'
                                                name='typeOfLabour'
                                                id={`typeOfLabour${index}`}
                                                value={item.typeOfLabour}
                                                onChange={e => handleLabourChange(e, index)}
                                            >
                                                <option value="">Select type of labour</option>
                                                <option value="Carpenter">Carpenter</option>
                                                <option value="Electrician">Electrician</option>
                                                <option value="Tile Work">Tile Work</option>
                                                <option value="Gypsum Board">Gypsum Board</option>
                                                <option value="HVAC Work">HVAC Work</option>
                                                <option value="Steel Work">Steel Work</option>
                                                <option value="Unskilled">Unskilled</option>
                                            </Input>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for={`numberOfSpecializedLabour${index}`}>Number of Specialized Labour {index + 1}:</Label>
                                            <Input
                                                type='text'
                                                name='numberOfSpecializedLabour'
                                                id={`numberOfSpecializedLabour${index}`}
                                                placeholder='Enter number of specialized labour'
                                                value={item.numberOfSpecializedLabour}
                                                onChange={e => handleLabourChange(e, index)}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for={`unitPriceOfLabour${index}`}>Unit Price of Labour {index + 1}:</Label>
                                            <Input
                                                type='text'
                                                name='unitPriceOfLabour'
                                                id={`unitPriceOfLabour${index}`}
                                                placeholder='Enter unit price of labour'
                                                value={item.unitPriceOfLabour}
                                                onChange={e => handleLabourChange(e, index)}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for={`totalPriceOfLabour${index}`}>Total Price of Labour {index + 1}:</Label>
                                            <Input
                                                type='text'
                                                name='totalPriceOfLabour'
                                                id={`totalPriceOfLabour${index}`}
                                                placeholder='Enter total price of labour'
                                                value={item.totalPriceOfLabour}
                                                onChange={e => handleLabourChange(e, index)}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for={`unitTransportationPrice${index}`}>Unit Transportation Price {index + 1}:</Label>
                                            <Input
                                                type='text'
                                                name='unitTransportationPrice'
                                                id={`unitTransportationPrice${index}`}
                                                placeholder='Enter unit transportation price'
                                                value={item.unitTransportationPrice}
                                                onChange={e => handleLabourChange(e, index)}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for={`comment${index}`}>Comment {index + 1}:</Label>
                                            <Input
                                                type='text'
                                                name='labourComments'
                                                id={`labourComments${index}`}
                                                placeholder='Enter labourComments'
                                                value={item.labourComments}
                                                onChange={e => handleLabourChange(e, index)}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for={`attachments${index}`}>Attachments {index + 1}:</Label>
                                            <Input
                                                type='file'
                                                name={`attachments_${item._id}`}
                                                id={`attachments${index}`}
                                                multiple
                                                onChange={(e) => handleLabourAttachmentChange(e, index)}
                                            />
                                        </FormGroup>
                                    </div>
                                ))}
                                <Button color="success" onClick={handleAddLabourClick}>
                                    <AddIcon /> Add Labour
                                </Button>
                            </>
                        )}
                        <FormGroup>
                            <Label for="attachment">Attachment:</Label>
                            <Input
                                type="file"
                                name="attachment"
                                id="attachment"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                            />
                        </FormGroup>
                        <FormGroup style={{ marginTop: "20px", paddingBottom: "3rem" }}>
                            <Label for="comments">Write Description About Your Request:</Label>
                            <ReactQuill

                                value={comments}
                                onChange={(newComments) => setComments(newComments)}
                                theme='snow'
                                modules={{
                                    toolbar: [
                                        ['undo', 'redo'], // Custom toolbar buttons
                                        [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                        [{ 'color': [] }, { 'background': [] }],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        ['link', 'image', 'video'],
                                        ['clean'], // remove formatting
                                        ['align']
                                    ]
                                }}
                                formats={[
                                    'header', 'font', 'size',
                                    'bold', 'italic', 'underline', 'strike', 'blockquote',
                                    'list', 'bullet', 'indent',
                                    'link', 'image', 'video'
                                ]}
                                style={{ height: '300px' }} // Set height as desired
                            />

                        </FormGroup>

                    </Form>

                </div>
            )}

            {requestType && (<div className='sectioninput' style={{ display: "flex", flexDirection: 'column' }} >
                <h4>5. Please indicate the preferred Recipient</h4>
                <select style={{ background: "white" }} onChange={(e) => setSelectedDirector(e.target.value)}>
                    <option>-----------</option>
                    {recipients?.map((recipient, index) => (
                        <option key={index} value={recipient?._id}>{recipient?.fName} {recipient?.lName}</option>
                    ))}
                </select>


                {selectedRecipient && (
                    <Button
                        color="primary"
                        onClick={handleSendRequest}
                        style={{ marginTop: "20px", width: '15%', padding: "10px" }}
                        disabled={isSubmitting} // Disable the button when isSubmitting is true
                    >
                        {isSubmitting ? 'Submitting...' : 'Send Request'}
                    </Button>
                )}
            </div>)}


        </Container>
    )
}

export default Request
