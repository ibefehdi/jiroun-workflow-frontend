import React, { useEffect, useMemo, useState } from 'react'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import TableContainer from '../../components/TableContainer';
import { Button, Container, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, ModalFooter, Alert } from 'reactstrap'

const Projects = () => {
    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        '/projects',
        'status',
        'data'
    );
    useEffect(() => {
        fetchData({
            pageSize: 10,
            pageIndex: 1,
        });

    }, [fetchData])

    const [modal, setModal] = useState(false);

    const [projectForm, setProjectForm] = useState({
        projectName: '',
        year: '',
        location: '',
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
        _id: ''
    });
    const toggleEditModal = () => setEditModal(!editModal);

    const handleEditInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        setEditForm({
            ...editForm,
            [name]: value
        });
    }

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axiosInstance.patch(`/projects/${editForm._id}`, editForm);
            console.log(response.data);
            fetchData({
                pageSize: 10,
                pageIndex: 1,
            });
            handleAlert(true, 'Project Updated Successfully', 'success');
        } catch (error) {
            console.error(error);
            handleAlert(true, 'An error occurred', 'danger');
        }
        toggleEditModal();
    }

    const handleEdit = (project) => {
        setEditForm({
            projectName: project.projectName,
            year: project.year,
            location: project.location,
            projectManager: project.projectManager,
            projectDirector: project.projectDirector,
            contractors: project.contractors,
            _id: project._id
        });
        toggleEditModal();
    }

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
            console.log(response.data);
            fetchData({
                pageSize: 10,
                pageIndex: 1,
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
            },
            {
                Header: 'Location',
                accessor: 'location',
            },
            {
                Header: 'Actions',
                accessor: '_id',
                Cell: ({ row: { original } }) => (
                    <Button onClick={() => handleEdit(original)}>Edit</Button>
                ),
            },

        ],
        []
    );
    if (loadStatus) {
        return <div>Loading...</div>;
    }
    return (
        <Container className={'pagecontainer'}>
            {alert.visible &&
                <Alert color={alert.color} style={{ position: 'fixed', top: '10px', right: '10px', zIndex: '1000' }}>
                    {alert.message}
                </Alert>
            }
            <div className='header'>
                <h1>Projects</h1>
                <Button onClick={toggle} color='success'>Add</Button>
            </div>
            <TableContainer
                data={data}
                pageCount={pageCount}
                fetchData={fetchData}
                loading={loadStatus}
                totalDataCount={totalDataCount}
                columns={columns}
                onEdit={handleEdit}
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
                            <Input type="text" name="projectManager" id="projectManager" value={editForm.projectManager} onChange={handleEditInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="projectDirector">Project Director</Label>
                            <Input type="text" name="projectDirector" id="projectDirector" value={editForm.projectDirector} onChange={handleEditInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="contractors">Contractors</Label>
                            <Input type="text" name="contractors" id="contractors" value={editForm.contractors} onChange={handleEditInputChange} />
                        </FormGroup>
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