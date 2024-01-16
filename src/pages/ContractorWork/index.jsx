import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Container, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
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
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [subcontractsForProject, setSubcontractsForProject] = useState([]);
    useEffect(() => {
        setTotalPrice(quantity * unitPrice);
    }, [quantity, unitPrice]);

    const toggle = () => {
        setModal(!modal);
        setDescription();
        setQuantity();
        setUnitPrice();
        setTotalPrice();
    };
    const fetchSubcontracts = async () => {
        if (selectedProjectId != null) {
            try {
                const response = await axiosInstance.get(`/subcontractsbyproject/${selectedProjectId}`);
                console.log(response?.data);
                setSubcontractsForProject(response?.data);
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
                    <Label for='Description'>Description</Label>
                    <Input
                        placeholder="Description"
                        type="text"
                        name='Description'
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    <Label for='Quantity'>Quantity</Label>
                    <Input
                        placeholder="Quantity"
                        type="Number"
                        name='Quantity'
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                    />
                    <Label for='UnitPrice'>Unit Price</Label>
                    <Input
                        placeholder="Unit Price"
                        type="Number"
                        name='UnitPrice'
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
            <Modal isOpen={editModal} toggle={editToggle}>
                <ModalHeader>Edit The Subcontracts</ModalHeader>
                <ModalBody>
                    <Container style={{ display: 'flex', gap: "2.2rem" }}>
                        <h5>Name</h5>
                        <h5>Unit Price</h5>
                        <h5>Quantity</h5>
                        <h5>Total Price</h5>

                    </Container>
                    {subcontractsForProject && subcontractsForProject.map(contract => (
                        <Container key={contract._id} style={{ marginBottom: '10px', display: 'flex' }}>
                            <Input
                                type="text"
                                value={contract.name}
                                onChange={(e) => {/* handle name change here */ }}
                                style={{ marginRight: '5px' }}
                            />
                            <Input
                                type="number"
                                value={contract.unitPrice}
                                onChange={(e) => {/* handle unitPrice change here */ }}
                                style={{ marginRight: '5px' }}
                            />
                            <Input
                                type="number"
                                value={contract.quantity}
                                onChange={(e) => {/* handle quantity change here */ }}
                                style={{ marginRight: '5px' }}
                            />
                            <Input
                                type="number"
                                value={contract.totalPrice}
                                disabled
                                style={{ marginRight: '5px' }}
                            />
                        </Container>
                    ))}
                </ModalBody>
                <ModalFooter>
                    <Button>Close</Button>
                </ModalFooter>
            </Modal>

        </Container>
    )
}
export default ContractorWork