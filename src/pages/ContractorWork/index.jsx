import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Container, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import TableContainer from '../../components/TableContainer'
import AddIcon from '@mui/icons-material/Add';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
const ContractorWork = () => {

    const [reload, setReload] = useState(false)
    const [modal, setModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [contractors, setContractors] = useState([]);
    const [contractor, setContractor] = useState(null);
    const [description, setDescription] = useState(null);
    const [quantity, setQuantity] = useState(0);
    const [unitPrice, setUnitPrice] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [editDescription, seteditDescription] = useState({});
    const [editQuantity, seteditQuantity] = useState({});
    const [editUnitPrice, seteditUnitPrice] = useState({});
    const [editTotalPrice, seteditTotalPrice] = useState({});
    const [editPaidAmount, setEditPaidAmount] = useState({});
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [subcontractsForProject, setSubcontractsForProject] = useState([]);
    const [contractorForSubcontract, setContractorForSubcontract] = useState();
    const [editContractorName, setEditContractorName] = useState()
    useEffect(() => {
        setTotalPrice(quantity * unitPrice);
    }, [quantity, unitPrice]);

    const toggle = () => {
        setModal(!modal);
        setDescription();
        setQuantity();
        setUnitPrice();
        setTotalPrice();
        setPaidAmount();
    };
    const fetchSubcontracts = async () => {
        if (selectedProjectId != null) {
            try {
                const response = await axiosInstance.get(`/subcontractsbyproject/${selectedProjectId}`);
                console.log("This is the response", response?.data);
                const subcontracts = response?.data[0].subContracts || [];

                // Setting subcontracts for project
                setSubcontractsForProject(subcontracts);
                console.log("THis is the subcontracts", subcontracts);
                // Initializing edit states with fetched data
                const initialEditStates = subcontracts.reduce((acc, contract) => {
                    const contractorName = `${contract.contractor.fName} ${contract.contractor.lName}`;

                    acc.editDescription[contract.name] = contract.name || '';
                    acc.editUnitPrice[contract.name] = contract.unitPrice || 0;
                    acc.editQuantity[contract.name] = contract.quantity || 0;
                    acc.editPaidAmount[contract.name] = contract.paidAmount || 0;
                    acc.editContractorName[contract.name] = contractorName || '';

                    return acc;
                }, { editDescription: {}, editUnitPrice: {}, editQuantity: {}, editPaidAmount: {}, editContractorName: {} });

                seteditDescription(initialEditStates.editDescription);
                seteditUnitPrice(initialEditStates.editUnitPrice);
                seteditQuantity(initialEditStates.editQuantity);
                setEditPaidAmount(initialEditStates.editPaidAmount);
                setEditContractorName(initialEditStates.editContractorName); // This now holds contractor names keyed by subcontract name
            } catch (error) {
                console.error("Error fetching subcontracts:", error);
                // Handle the error appropriately
            }
        }
    };




    const editToggle = () => {
        setEditModal(!editModal);
        fetchSubcontracts();
        setSubcontractsForProject([])

    }

    const { data, fetchData, pageCount, totalDataCount } = useGETAPI(
        axiosInstance.get,
        'projects',
        'status',
        'data'
    );

    useEffect(() => {
        fetchData({ pageIndex: 0, pageSize: 10 });
    }, [fetchData]);
    useEffect(() => {
        async function fetchData() {
            const contractors = await axiosInstance.get(`users/allcontractors`);
            console.log(contractors?.data)
            setContractors(contractors?.data)
        }
        fetchData();
    }, [])
    const submitContract = async () => {
        const payload = {
            name: description,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            paidAmount: paidAmount,
            contractorId: contractor,
        }
        const response = await axiosInstance.post(`/createsubcontract/${selectedProjectId}`, payload)
        console.log(response);
        toggle();
    }
    const handleContractorChange = (e) => {
        setContractor(e.target.value);
    };
    const handleAddContractClick = (id) => {
        setSelectedProjectId(id);
        console.log(id);
        toggle();
    };
    const handleEditContractClick = (id) => {
        setSelectedProjectId(id);
        editToggle();
    }
    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'projectName',
            },
            {
                Header: 'Year',
                accessor: 'year',
                Cell: ({ value }) => {
                    return new Date(value).getFullYear()
                }
            },
            {
                Header: 'Location',
                accessor: 'location',
            },
            {
                Header: "Total SubContracts",
                accessor: "subContractsCount"
            },
            {
                Header: 'Actions',
                accessor: '_id',
                Cell: ({ value }) => {

                    return (<div style={{ display: 'flex', gap: 10 }}>
                        <Button color='success' style={{ borderRadius: "50%", padding: "10px", display: "flex", justifyContent: "center", alignItems: "center", width: "40px", height: "40px" }} onClick={() => handleAddContractClick(value)}><AddIcon style={{ fontSize: "1rem" }} /></Button>
                        <Button color="info" style={{ borderRadius: "50%", padding: "10px", display: "flex", justifyContent: "center", alignItems: "center", width: "40px", height: "40px" }}
                            outline onClick={() => handleEditContractClick(value)}>
                            <ModeEditIcon style={{ fontSize: "1rem" }} />
                        </Button>

                    </div>


                    )
                }
            },

        ]
    );

    const handleEditPaidAmountChange = (value, contractId) => {
        // Update editPaidAmount object with the new value for the specific contract ID
        setEditPaidAmount(prevState => ({
            ...prevState,
            [contractId]: value
        }));
    };
    const handleEditDescription = (value, contractId) => {
        // Update editPaidAmount object with the new value for the specific contract ID
        seteditDescription(prevState => ({
            ...prevState,
            [contractId]: value
        }));
    };
    const handleEditQuantity = (value, contractId) => {
        // Update editPaidAmount object with the new value for the specific contract ID
        seteditQuantity(prevState => ({
            ...prevState,
            [contractId]: value
        }));
    };
    const handleTotalAmountChange = (value, contractId) => {
        // Update editPaidAmount object with the new value for the specific contract ID
        seteditTotalPrice(prevState => ({
            ...prevState,
            [contractId]: value
        }));
    };
    const handleEditUnitAmountChange = (value, contractId) => {
        // Update editPaidAmount object with the new value for the specific contract ID
        seteditUnitPrice(prevState => ({
            ...prevState,
            [contractId]: value
        }));
    };

    const handleEdit = async (subContractId) => {
        try {
            const payload = {
                name: editDescription[subContractId],
                quantity: editQuantity[subContractId],
                unitPrice: editUnitPrice[subContractId],
                paidAmount: editPaidAmount[subContractId]
            };
            const response = await axiosInstance.put(`/subcontract/${subContractId}`, payload);
            console.log("Subcontract updated:", response.data);
        }
        catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        console.log("Subcontract selected:", subcontractsForProject)
        console.log("Subcontract length:", subcontractsForProject?.length)
    }, [subcontractsForProject]);
    return (
        <Container className={'pagecontainer'}>
            <div className='header'>
                <h1 className='Heading'>Projects</h1>
            </div>
            <TableContainer
                columns={columns}
                refresh={reload}
                pageCount={pageCount}
                totalDataCount={totalDataCount}
                data={data}
                fetchData={fetchData}
                isGlobalFilter={false}
                customPageSize={10}
                className="custom-header-css"
            />
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader>
                    Add a contract
                </ModalHeader>
                <ModalBody>
                    <Label for='description'>Description</Label>
                    <Input
                        placeholder="Description"
                        type="text"
                        name='description'
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    <Label for='quantity'>Quantity</Label>
                    <Input
                        placeholder="Quantity"
                        type="Number"
                        name='quantity'
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                    />
                    <Label for='unitPrice'>Unit Price</Label>
                    <Input
                        placeholder="Unit Price"
                        type="Number"
                        name='unitPrice'
                        value={unitPrice}
                        onChange={e => setUnitPrice(e.target.value)}
                    />
                    <Label for='TotalPrice'>Total Price</Label>
                    <Input
                        placeholder="Total Price"
                        type="Number"
                        name='TotalPrice'
                        value={totalPrice}
                        readOnly
                    />
                    <Label for='paidAmount'>Paid Price</Label>
                    <Input
                        placeholder="Paid Price"
                        type="Number"
                        name='paidAmount'
                        value={paidAmount}
                        onChange={e => setPaidAmount(e.target.value)}
                    />
                    <Label for='Contractor'>Contractor</Label>
                    <select className="input-form" name="contractor" id="contractor" onChange={handleContractorChange} style={{ marginBottom: "10px", width: "100%" }}>
                        <option>-----------</option>
                        {contractors?.map((contractor, index) => (
                            <option key={index} value={contractor?._id}>
                                {contractor?.fName} {contractor?.lName}
                            </option>
                        ))}
                    </select>
                </ModalBody>
                <ModalFooter>
                    <Button color='success' onClick={submitContract}>Submit</Button>
                </ModalFooter>
            </Modal>
            <Modal isOpen={editModal} toggle={editToggle} style={{ maxWidth: "70%" }}>
                <ModalHeader>Edit The Subcontracts</ModalHeader>
                <ModalBody>
                    <Table responsive borderless >
                        <thead>
                            <tr>
                                <th>Name</th>
                                {/* <th>Contractor</th> */}
                                <th>Unit Price</th>
                                <th>Quantity</th>
                                <th>Paid Amount</th>
                                <th>Percentage</th>
                                <th>Total Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subcontractsForProject && subcontractsForProject.map(contract => (
                                <tr key={contract._id}>
                                    <td>
                                        <Input
                                            type="text"
                                            value={contract.name || ''}
                                            onChange={(e) => handleEditDescription(e.target.value, contract._id)}
                                        />
                                    </td>
                                    <td>
                                        <Input
                                            type="text"
                                            value={contract?.contractor?.fName || ''}
                                            disabled
                                        />
                                    </td>
                                    <td>
                                        <Input
                                            type="number"
                                            value={editUnitPrice[contract._id] || ''}
                                            onChange={(e) => handleEditUnitAmountChange(e.target.value, contract._id)}
                                        />
                                    </td>
                                    <td>
                                        <Input
                                            type="number"
                                            value={editQuantity[contract._id] || ''}
                                            onChange={(e) => handleEditQuantity(e.target.value, contract._id)}
                                        />
                                    </td>
                                    <td>
                                        <Input
                                            type="number"
                                            value={editPaidAmount[contract._id] || ''}
                                            onChange={(e) => handleEditPaidAmountChange(e.target.value, contract._id)}
                                        />
                                    </td>
                                    <td>
                                        <Input
                                            type="percentage"
                                            value={contract.percentage}

                                            readOnly
                                            disabled
                                        />
                                    </td>
                                    <td>
                                        <Input
                                            type="number"
                                            value={contract.totalPrice}
                                            disabled
                                            readOnly

                                        />
                                    </td>
                                    <td>
                                        <Button color='success'
                                            onClick={() => handleEdit(contract._id)}

                                        >
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </ModalBody>

                <ModalFooter>
                    <Button>Close</Button>
                </ModalFooter>
            </Modal>

        </Container>
    )
}
export default ContractorWork