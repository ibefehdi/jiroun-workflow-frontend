import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import TableContainer from '../../components/TableContainer';
import { Button, Container, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, ModalFooter, Alert } from 'reactstrap'

const Projects = () => {
    const [reload, setReload] = useState(false)

    const { data, fetchData, pageCount, totalDataCount } = useGETAPI(
        axiosInstance.get,
        'projects',
        'status',
        'data'
    );

    useEffect(() => {
        fetchData({ pageIndex: 0, pageSize: 10 });
    }, [fetchData]);


    const [modal, setModal] = useState(false);

    const [projectForm, setProjectForm] = useState({
        projectName: '',
        year: '',
        location: '',
        latitude: '',
        longitude: '',
        radius: '',
    });

    const toggle = () => setModal(!modal);

    const [alert, setAlert] = useState({
        visible: false,
        message: '',
        color: ''
    });
    const [editModal, setEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        projectName: '',
        year: '',
        location: '',
        projectManager: '',
        projectDirector: '',
        contractors: '',
        foremen: '',
        latitude: '',
        longitude: '',
        radius: '',
        _id: ''
    });
    useEffect(() => {
        if (editModal) {
            axiosInstance.get('/users/allcontractors')
                .then(response => setContractors(response.data))
                .catch(error => console.error(error));
            axiosInstance.get('/users/projectmanagers')
                .then(response => setProjectManagers(response.data))
                .catch(error => console.error(error));
            axiosInstance.get('/users/projectdirectors')
                .then(response => setProjectDirectors(response.data))
                .catch(error => console.error(error));
            axiosInstance.get('/users/foremen')
                .then(response => setForemen(response.data))
                .catch(error => console.error(error));
        }
    }, [editModal]);
    const [contractors, setContractors] = useState([]);
    const [projectManagers, setProjectManagers] = useState([]);
    const [projectDirectors, setProjectDirectors] = useState([]);
    const [foremen, setForemen] = useState([]);

    const toggleEditModal = useCallback(() => setEditModal(!editModal), [editModal]);

    const handleEditInputChange = (event) => {
        const target = event.target;
        const name = target.name;
        let value;
        if (target.multiple) {
            value = Array.from(target.selectedOptions, option => option.value);
        } else {
            value = target.type === 'checkbox' ? target.checked : target.value;
        }

        setEditForm({
            ...editForm,
            [name]: value
        });
    }

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        try {
            const formData = { ...editForm, contractors: Array.isArray(editForm.contractors) ? editForm.contractors : [] };
            const response = await axiosInstance.patch(`/projects/${editForm._id}`, formData);
            fetchData({
                pageSize: 10,
                pageIndex: 0,
            });
            handleAlert(true, 'Project Updated Successfully', 'success');
        } catch (error) {
            console.error(error);
            handleAlert(true, 'An error occurred', 'danger');
        }
        toggleEditModal();
    }

    const handleEdit = useCallback((project) => {
        setEditForm({
            projectName: project.projectName,
            year: project.year,
            location: project.location,
            projectManager: project.projectManager,
            projectDirector: project.projectDirector,
            latitude: project.latitude,
            longitude: project.longitude,
            radius: project.radius,
            contractors: project.contractors.map(c => c._id), // assuming contractors is an array of objects
            _id: project._id
        });
        toggleEditModal();
    }, [toggleEditModal])


    const handleAlert = (visible, message, color) => {
        setAlert({ visible, message, color });
        setTimeout(() => {
            setAlert({ visible: false, message: '', color: '' });
        }, 3000);
    }
    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        setProjectForm({
            ...projectForm,
            [name]: value
        });
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axiosInstance.post('/projects', projectForm);
            fetchData({
                pageSize: 10,
                pageIndex: 0,
            });
            handleAlert(true, 'Project Added Successfully', 'success');
        } catch (error) {

            console.error(error);
            handleAlert(true, 'An error occurred', 'danger');

        }
        toggle();
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
                Header: "Project Manager",
                accessor: 'projectManager',
                Cell: ({ value }) => {
                    return value && value.length > 0 ? value.map(projectManager => `${projectManager.fName} ${projectManager.lName}`).join(", ") : "No project managers";
                }

            },
            {
                Header: "Project Director",
                accessor: 'projectDirector',
                Cell: ({ value }) => {
                    return value && `${value.fName} ${value.lName}`;
                }
            },
            {
                Header: "Contractors",
                accessor: 'contractors',
                Cell: ({ value }) => {

                    return value && value.map(contractor => `${contractor.fName} ${contractor.lName}`).join(", ");
                }
            },
            {
                Header: "Foremen",
                accessor: 'foremen',
                Cell: ({ value }) => {

                    return value && value.map(foreman => `${foreman.fName} ${foreman.lName}`).join(", ");
                }
            },
            {
                Header: 'Actions',
                accessor: '_id',
                Cell: ({ row: { original } }) => (
                    <Button onClick={() => handleEdit(original)}>Edit</Button>
                ),
            },

        ],
        [handleEdit]
    );

    return (
        <Container className={'pagecontainer'}>
            {alert.visible &&
                <Alert color={alert.color} style={{ position: 'fixed', top: '10px', right: '10px', zIndex: '1000' }}>
                    {alert.message}
                </Alert>
            }
            <div className='header'>
                <h1 className='Heading'>Projects</h1>
                <Button onClick={toggle} color='success'>Add</Button>
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
                <ModalHeader toggle={toggle}>Add User</ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="projectName">Project Name</Label>
                            <Input type="text" name="projectName" id="projectName" onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="year">Year</Label>
                            <Input type="text" name="year" id="year" onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="location">Location</Label>
                            <Input type="text" name="location" id="location" onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="latitude">Latitude</Label>
                            <Input type="text" name="latitude" id="latitude" onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="longitude">Longitude</Label>
                            <Input type="text" name="longitude" id="longitude" onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="radius">Radius</Label>
                            <Input type="text" name="radius" id="radius" onChange={handleInputChange} />
                        </FormGroup>
                        <ModalFooter>
                            <Button color="primary" type="submit">Save</Button>{' '}
                            <Button color="secondary" onClick={toggle}>Cancel</Button>
                        </ModalFooter>
                    </Form>
                </ModalBody>
            </Modal>
            <Modal isOpen={editModal} toggle={toggleEditModal}>
                <ModalHeader toggle={toggleEditModal}>Edit User</ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleEditSubmit}>
                        <FormGroup>
                            <Label for="projectManager">Project Manager</Label>

                            <Input type="select" name="projectManager" id="projectManager" value={editForm.projectManager} onChange={handleEditInputChange} multiple>
                                <option>Please Select a Project Manager</option>
                                {projectManagers.map(pm => <option key={pm._id} value={pm._id}>{pm.fName}</option>)}
                            </Input>

                        </FormGroup>
                        <FormGroup>
                            <Label for="projectDirector">Project Director</Label>

                            <Input type="select" name="projectDirector" id="projectDirector" value={editForm.projectDirector} onChange={handleEditInputChange}>
                                <option>Please Select a Project Director</option>

                                {projectDirectors.map(pd => <option key={pd._id} value={pd._id}>{pd.fName}</option>)}
                            </Input>

                        </FormGroup>
                        <FormGroup>
                            <Label for="latitude">Latitude</Label>
                            <Input type="text" name="latitude" id="latitude" value={editForm.latitude} onChange={handleEditInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="longitude">Longitude</Label>
                            <Input type="text" name="longitude" id="longitude" value={editForm.longitude} onChange={handleEditInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="radius">Radius</Label>
                            <Input type="text" name="radius" id="radius" value={editForm.radius} onChange={handleEditInputChange} />
                        </FormGroup>
                        {contractors?.length > 0 && (
                            <FormGroup>
                                <Label for="contractors">Contractors</Label>

                                <Input type="select" name="contractors" id="contractors" value={editForm.contractors} onChange={handleEditInputChange} multiple>
                                    {contractors?.map(contractor => <option key={contractor._id} value={contractor._id}>{contractor.fName}</option>)}
                                </Input>

                            </FormGroup>
                        )}
                        {foremen?.length > 0 && (<FormGroup>
                            <Label for="foremen">Foremen</Label>

                            <Input type="select" name="foremen" id="foremen" value={editForm.foremen} onChange={handleEditInputChange} multiple>
                                {foremen.map(foreman => <option key={foreman._id} value={foreman._id}>{foreman.fName}</option>)}
                            </Input>

                        </FormGroup>)}
                        <ModalFooter>
                            <Button color="primary" type="submit">Save</Button>{' '}
                            <Button color="secondary" onClick={toggleEditModal}>Cancel</Button>
                        </ModalFooter>

                    </Form>
                </ModalBody>
            </Modal>
        </Container>
    )
}

export default Projects