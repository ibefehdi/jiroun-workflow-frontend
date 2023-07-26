import React, { useState } from 'react'
import './loginform.css'
import { Button, Form, FormGroup, Input, Label } from 'reactstrap'
import jirounLogo from '../../assets/img/jirounlogo.png'
const Loginform = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");



    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <div className="center-form">
            <img src={jirounLogo} alt="Jiroun Logo" className='logo' />

            <Form className='signin-form' onSubmit={handleSubmit}>

                <FormGroup>
                    <Label for="Email">
                        Username:
                    </Label>
                    <Input
                        id="Email"
                        name="username"
                        placeholder="Username"
                        type="text"
                        className='input'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="Password">
                        Password
                    </Label>
                    <Input
                        id="Password"
                        name="password"
                        placeholder="Password"
                        type="password"
                        className='input'
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        required
                    />
                </FormGroup>

                <Button className='loginButton'>
                    Submit
                </Button>
            </Form>
        </div>

    )
}

export default Loginform