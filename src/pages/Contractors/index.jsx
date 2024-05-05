import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Container, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import OldTableContainer from '../../components/TableContainer/OldTableContainer';

const Contractors = () => {
    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        `users/contractors`,
        'status',
        'data'
    );
    const [modal, setModal] = useState(false);
    const [userForm, setUserForm] = useState({
        username: '',
        fName: '',
        lName: '',
        email: '',
        occupation: 'Contractor',
        superAdmin: false,
        password: "C0nTr@cTor!234!@#$&*&*^@#&^*!&*%56246822842462"
    });
    const toggle = () => setModal(!modal);
    useEffect(() => {
        fetchData({
            pageSize: 10,
            pageIndex: 0,
        });
    }, [fetchData])
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
                pageIndex: 0,
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
                Header: "First Name",
                accessor: "fName",
            },
            {
                Header: "Last Name",
                accessor: "lName",
            },
            {
                Header: "Username",
                accessor: "username",
            },
            {
                Header: "Email",
                accessor: "email",
            },
            {
                Header: "Phone Number",
                accessor: "phoneNo"
            }

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
                <h1 className='Heading'>Contractors</h1>
                <Button onClick={toggle} color='success'>Add</Button>
            </div>

            <OldTableContainer
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
                            <Label for="email">Email Address</Label>
                            <Input type="email" name="email" id="email" onChange={handleInputChange} />
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

export default Contractors