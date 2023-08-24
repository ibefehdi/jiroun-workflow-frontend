import React, { useEffect, useMemo, useState } from 'react'
import { Button, Container, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, ModalFooter, Alert } from 'reactstrap'
import axiosInstance from '../../constants/axiosConstant'
import TableContainer from '../../components/TableContainer'
import { useGETAPI } from '../../hooks/useGETAPI'
import './UserManagement.css';

const UserManagement = () => {
    const allowedOccupations = ['Contractor', 'Project Manager', 'Project Director', 'Procurement', 'Quantity Surveyor', 'Managing Partner', 'Developer', 'Finance'];

    const [reload, setReload] = useState(false)

    const { data, fetchData, pageCount, totalDataCount } = useGETAPI(
        axiosInstance.get,
        'users',
        'status',
        'data'
    );

    useEffect(() => {
        fetchData({ pageIndex: 0, pageSize: 10 });
    }, [fetchData]);

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
            fetchData({
                pageSize: 10,
                pageIndex: 1,
            });
            handleAlert(true, 'User Added Successfully', 'success');
        } catch (error) {

            console.error(error);
            handleAlert(true, 'An error occurred', 'danger');

        }
        toggle();
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
            {
                Header: 'Super Admin',
                accessor: 'superAdmin',
                Cell: ({ value }) => {
                    if (value === true) {
                        // Green circle for true
                        return (
                            <svg height="30" width="30">
                                <defs>
                                    <filter id="dropshadow" height="130%">
                                        <feDropShadow dx="1" dy="1" stdDeviation="0.5" floodColor="lightgray" />
                                    </filter>
                                </defs>
                                <circle cx="15" cy="15" r="10" fill="#28a745" filter="url(#dropshadow)" />
                            </svg>
                        );
                    } else if (value === false) {
                        // Red circle for false
                        return (
                            <svg height="30" width="30">
                                <defs>
                                    <filter id="dropshadow" height="130%">
                                        <feDropShadow dx="1" dy="1" stdDeviation="0.5" floodColor="lightgray" />
                                    </filter>
                                </defs>
                                <circle cx="15" cy="15" r="10" fill="#dc3545" filter="url(#dropshadow)" />
                            </svg>
                        );
                    } else {
                        return null;
                    }
                }
            },
        ],
        []
    );


    return (
        <Container className={'pagecontainer'}>
            {alert.visible &&
                <Alert color={alert.color} style={{ position: 'fixed', top: '10px', right: '10px', zIndex: '1000' }}>
                    {alert.message}
                </Alert>
            }
            <div className='header'>
                <h1 className='Heading'>User Management</h1>
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
                                {allowedOccupations?.map((occupation) => (
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
