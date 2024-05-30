import React, { useEffect, useMemo, useState } from 'react'
import { Button, Container, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, ModalFooter, Alert } from 'reactstrap'
import axiosInstance from '../../constants/axiosConstant'
import TableContainer from '../../components/TableContainer'
import { useGETAPI } from '../../hooks/useGETAPI'
import './UserManagement.css';
import { useSelector } from 'react-redux'

const UserManagement = () => {
    const allowedOccupations = ['Foreman', 'Project Manager', 'Project Director', 'Procurement', 'Quantity Surveyor', 'Managing Partner', 'Developer', 'Finance'];
    const userId = useSelector(state => state._id);

    const [editingId, setEditingId] = useState(null);

    const [reload, setReload] = useState(false)
    const [selectedOccupation, setSelectedOccupation] = useState("")
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
    const [editModal, setEditModal] = useState(false);
    const toggle = () => setModal(!modal);
    const editToggle = () => setEditModal(!editModal);
    const [userForm, setUserForm] = useState({
        username: '',
        fName: '',
        lName: '',
        email: '',
        phoneNo: '',
        occupation: allowedOccupations[0],
        superAdmin: false,
        password: ""
    });
    const [editUserForm, setEditUserForm] = useState({
        username: '',
        fName: '',
        lName: '',
        phoneNo: '',
        email: '',
        permissions: []
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
    const handleEditInputChange = (event) => {
        const target = event.target;
        const name = target.name;
        let value;
        if (target.multiple) {
            value = Array.from(target.selectedOptions, option => option.value);
        } else {
            value = target.type === 'checkbox' ? target.checked : target.value;
        }


        setEditUserForm({
            ...editUserForm,
            [name]: value
        });
    }
    const permissions = [
        { name: "List Projects", permissionId: "projects_list" },
        { name: "Create Request", permissionId: "add_requests" },
        { name: "Pending Requests", permissionId: "list_your_requests" },
        { name: "Projects Management", permissionId: "projects_management" },
        { name: "User Management", permissionId: "user_management" },
        { name: "Contractors Management", permissionId: "contractors_management" },
        { name: "List All Requests", permissionId: "list_requests" },
        { name: "Rejected Requests", permissionId: "deleted_requests" },
        { name: "Approved Payment Requests", permissionId: "approved_payment" },
        { name: "Approved Items Requests", permissionId: "approved_items" },
        { name: "Approved Labour Request", permissionId: "approved_labour" },
        { name: "Completed Requests", permissionId: "completed_requests" },
        { name: "Change Contractor", permissionId: "change_contractor" },
        { name: "Attendance", permissionId: "attendance" },

        { name: "Assign Contractor To Project", permissionId: "contractor_work" }
    ];


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
    const handleEditClick = (id) => {
        setEditingId(id);
        setEditModal(true);
    };
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
                Header: 'Email Address',
                accessor: "email"
            },
            {
                Header: 'Phone Number',
                accessor: 'phoneNo'
            },
            // {
            //     Header: 'Super Admin',
            //     accessor: 'superAdmin',
            //     Cell: ({ value }) => {
            //         if (value === true) {
            //             // Green circle for true
            //             return (
            //                 <svg height="30" width="30">
            //                     <defs>
            //                         <filter id="dropshadow" height="130%">
            //                             <feDropShadow dx="1" dy="1" stdDeviation="0.5" floodColor="lightgray" />
            //                         </filter>
            //                     </defs>
            //                     <circle cx="15" cy="15" r="10" fill="#28a745" filter="url(#dropshadow)" />
            //                 </svg>
            //             );
            //         } else if (value === false) {
            //             // Red circle for false
            //             return (
            //                 <svg height="30" width="30">
            //                     <defs>
            //                         <filter id="dropshadow" height="130%">
            //                             <feDropShadow dx="1" dy="1" stdDeviation="0.5" floodColor="lightgray" />
            //                         </filter>
            //                     </defs>
            //                     <circle cx="15" cy="15" r="10" fill="#dc3545" filter="url(#dropshadow)" />
            //                 </svg>
            //             );
            //         } else {
            //             return null;
            //         }
            //     }
            // },
            {
                Header: "Permissions",
                accessor: 'permissions',
                Cell: ({ value }) => {
                    const maxDisplay = 3; // Maximum number of permissions to display

                    // Function to transform permission name
                    const transformPermission = (permission) => {
                        return permission
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                    };

                    if (value && value.length > 0) {
                        const transformedValues = value.map(permission => transformPermission(permission));

                        if (transformedValues.length > maxDisplay) {
                            const displayed = transformedValues.slice(0, maxDisplay).join(", ");
                            return `${displayed} + ${transformedValues.length - maxDisplay} more`;
                        } else {
                            return transformedValues.join(", ");
                        }
                    } else {
                        return "No Permissions Assigned";
                    }
                }
            }

            ,
            {
                Header: 'Actions',
                accessor: '_id',
                Cell: ({ value }) => {
                    return (<Button onClick={() => handleEditClick(value)}>Edit</Button>)
                }
            },

        ],
        []
    );
    const handleEditSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axiosInstance.put(`/users/${editingId}`, editUserForm);
            if (response.status === 200) {
                fetchData({
                    pageSize: 10,
                    pageIndex: 0,
                });
                setEditUserForm({
                    username: '',
                    fName: '',
                    lName: '',
                    email: '',
                })
            }

            handleAlert(true, 'User Edited Successfully', 'success');
        } catch (error) {

            console.error(error);
            handleAlert(true, 'An error occurred', 'danger');

        }
        editToggle();
    }
    const EditModal = (
        <Modal isOpen={editModal} toggle={editToggle}>
            <ModalHeader toggle={editToggle}>Edit User</ModalHeader>
            <ModalBody>
                <Form onSubmit={handleEditSubmit}>
                    <FormGroup>
                        <Label for="username">Username</Label>
                        <Input type="text" name="username" id="username" onChange={handleEditInputChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="fName">First Name</Label>
                        <Input type="text" name="fName" id="fName" onChange={handleEditInputChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="lName">Last Name</Label>
                        <Input type="text" name="lName" id="lName" onChange={handleEditInputChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="phoneNo">Mobile</Label>
                        <Input type="text" name="phoneNo" id="phoneNo" onChange={handleEditInputChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="email">Email Address</Label>
                        <Input type="email" name="email" id="email" onChange={handleEditInputChange} />
                    </FormGroup>
                    {/* <FormGroup check>
                        <Label check>
                            <Input type="checkbox" name="superAdmin" id="superAdmin" onChange={handleEditInputChange} />{' '}
                            Super Admin
                        </Label>
                    </FormGroup> */}
                    <FormGroup>
                        <Label for="permissions">Permissions</Label>

                        <Input type="select" name="permissions" id="permissions" onChange={handleEditInputChange} multiple>
                            <option>Please Select Permissions</option>
                            {permissions.map(p => <option key={p.permissionId} value={p.permissionId}>{p.name}</option>)}
                        </Input>

                    </FormGroup>
                    <ModalFooter>
                        <Button color="primary" type="submit">Save</Button>{' '}
                        <Button color="secondary" onClick={editToggle}>Cancel</Button>
                    </ModalFooter>
                </Form>
            </ModalBody>
        </Modal>
    )

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
                            <Label for="email">Email Address</Label>
                            <Input type="email" name="email" id="email" onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="phoneNo">Mobile</Label>
                            <Input type="text" name="phoneNo" id="phoneNo" onChange={handleInputChange} />
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
                        {/* <FormGroup check>
                            <Label check>
                                <Input type="checkbox" name="superAdmin" id="superAdmin" onChange={handleInputChange} />{' '}
                                Super Admin
                            </Label>
                        </FormGroup> */}
                        {userForm.occupation !== 'Contractor' && (<FormGroup>
                            <Label for="password">Password</Label>
                            <Input type="password" name="password" id="password" onChange={handleInputChange} />
                        </FormGroup>)}
                        <ModalFooter>
                            <Button color="primary" type="submit">Save</Button>{' '}
                            <Button color="secondary" onClick={toggle}>Cancel</Button>
                        </ModalFooter>
                    </Form>
                </ModalBody>
            </Modal>
            {EditModal}
        </Container>
    )
}

export default React.memo(UserManagement)
