import React, { useEffect, useMemo, useState } from 'react'
import { Button, Container, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, ModalFooter, Alert } from 'reactstrap'
import axiosInstance from '../../constants/axiosConstant'
import TableContainer from '../../components/TableContainer'
import { useGETAPI } from '../../hooks/useGETAPI'
import './UserManagement.css'; // Importing the CSS file

const UserManagement = () => {
    const allowedOccupations = ['Contracter', 'Project Manager', 'Project Director', 'Procurement', 'Quantity Surveyor', 'Managing Partner', 'Developer'];

    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        '/users',
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

    const toggle = () => setModal(!modal);

    const [userForm, setUserForm] = useState({
        username: '',
        fName: '',
        lName: '',
        occupation: allowedOccupations[0],
        superAdmin: false,
        password: ''
    });

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

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        setUserForm({
            ...userForm,
            [name]: value
        });
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axiosInstance.post('/users/signup', userForm);
            console.log(response.data);
            fetchData({
                pageSize: 10,
                pageIndex: 1,
            });
            handleAlert(true, 'User Added Successfully', 'success');
        } catch (error) {

            console.error(error);
            handleAlert(true, 'An error occurred', 'danger');

        }
        toggle(); // Close the modal
    }

    const columns = useMemo(
        () => [
            {
                Header: 'First Name',
                accessor: 'fName',
            },
            {
                Header: 'Last Name',
                accessor: 'lName',
            },
            {
                Header: 'Username',
                accessor: 'username',
            },
            {
                Header: 'Occupation',
                accessor: 'occupation',
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
                <h1>User Management</h1>
                <Button onClick={toggle} color='success'>Add</Button>
            </div>
            <TableContainer
                data={data}
                pageCount={pageCount}
                fetchData={fetchData}
                loading={loadStatus}
                totalDataCount={totalDataCount}
                columns={columns}
            />
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Add User</ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="username">Username</Label>
                            <Input type="text" name="username" id="username" onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="fName">First Name</Label>
                            <Input type="text" name="fName" id="fName" onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="lName">Last Name</Label>
                            <Input type="text" name="lName" id="lName" onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="occupation">Occupation</Label>
                            <Input type="select" name="occupation" id="occupation" onChange={handleInputChange}>
                                {allowedOccupations.map((occupation) => (
                                    <option key={occupation} value={occupation}>
                                        {occupation}
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input type="checkbox" name="superAdmin" id="superAdmin" onChange={handleInputChange} />{' '}
                                Super Admin
                            </Label>
                        </FormGroup>
                        <FormGroup>
                            <Label for="password">Password</Label>
                            <Input type="password" name="password" id="password" onChange={handleInputChange} />
                        </FormGroup>
                        <ModalFooter>
                            <Button color="primary" type="submit">Save</Button>{' '}
                            <Button color="secondary" onClick={toggle}>Cancel</Button>
                        </ModalFooter>
                    </Form>
                </ModalBody>
            </Modal>
        </Container>
    )
}

export default React.memo(UserManagement)
