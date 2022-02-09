import React, { useState } from 'react';
import axios from 'axios';
const config = require('../config/config.json');
let API_URL;
if (process.env.NODE_ENV === 'development') {
    API_URL = config.development.API_URL;
} else {
    API_URL = config.production.API_URL;
}


function ChangePassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const changePassword = () => {

        if (oldPassword === '' || newPassword === '' || confirmNewPassword === '') {
            alert('Please fill-in all fields');
        }
        else {
            if (newPassword !== confirmNewPassword) {
                alert('You did not enter the new Password correctly in the confirm field');
            }
            else {
                axios.put(`${API_URL}/auth/change-password`,
                    {
                        oldPassword: oldPassword,
                        newPassword: newPassword
                    },
                    {
                        headers: {
                            accessToken: localStorage.getItem('accessToken')
                        }
                    })
                    .then(response => {
                        if (response.data.error) {
                            if (response.data.error.name === 'JsonWebTokenError') {
                                alert('You are Not Logged in');
                            }
                            else {
                                alert(response.data.error);
                            }
                        }
                        else {
                            alert(response.data);
                            // Clear All Input Fields
                            setNewPassword('');
                            setConfirmNewPassword('');
                            setOldPassword('');
                        }
                    })
            }
        }
    };

    return (
        <div>
            <h1>Change Your Password</h1>
            <input
                type='password'
                placeholder='old password'
                onChange={(event) => { setOldPassword(event.target.value) }}
            />
            <input
                type='password'
                placeholder='new password'
                onChange={(event) => { setNewPassword(event.target.value) }}
            />
            <input
                type='password'
                placeholder='confirm new password'
                onChange={(event) => { setConfirmNewPassword(event.target.value) }}
            />
            <button onClick={changePassword}>Save Changes</button>
        </div>
    )
}

export default ChangePassword;
