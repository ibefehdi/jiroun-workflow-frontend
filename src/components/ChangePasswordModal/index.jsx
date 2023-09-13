import React, { useEffect, useState } from 'react'
import { Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import axiosInstance from '../../constants/axiosConstant';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, setAuthentication } from '../../redux/actions';
import './changepassword.css'
const ChangePasswordModal = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(true);
    const userId = useSelector(state => state._id);
    const [passwordError, setPasswordError] = useState('');
    const isValidPassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return regex.test(password);
    };

    const changePassword = async () => {
        if (!isValidPassword(newPassword)) {
            setPasswordError('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirmation password don't match.");
            return;
        }
        setPasswordError('');  // clear any previous errors
        try {
            const response = await axiosInstance.post(`/users/${userId}/changePassword`, {
                oldPassword, newPassword
            })
            if (response.status === 201) {
                const userData = {
                    fName: response.data.fName,
                    lName: response.data.lName,
                    occupation: response.data.occupation,
                    superAdmin: response.data.superAdmin,
                    username: response.data.username,
                    hasChangedPassword: response.data.hasChangedPassword,
                    _id: response.data._id,
                };
                dispatch(setUserData(userData));
                localStorage.setItem("user", JSON.stringify(userData));

                dispatch(setAuthentication(true));
                localStorage.setItem("token", response.data.token);
                setIsOpen(false)
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <Modal isOpen={isOpen} className="modern-modal">
            <ModalHeader>Please Change Your Password</ModalHeader>
            <ModalBody>
                <Label for='oldPassword'>Enter Old Password:</Label>
                <Input name='oldPassword' id='oldPassword' type='password' value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                <Label for='newPassword'>Enter New Password:</Label>
                <Input name='newPassword' id='newPassword' type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <Label for='confirmPassword'>Confirm New Password:</Label>
                <Input name='confirmPassword' id='confirmPassword' type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                {passwordError && <div className={`error-message ${passwordError ? 'active' : ''}`}>{passwordError}</div>}

            </ModalBody>
            <ModalFooter>
                <Button onClick={changePassword}>Change Password</Button>
            </ModalFooter>
        </Modal>
    )
}

export default ChangePasswordModal