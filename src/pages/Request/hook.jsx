import React, { useEffect, useState } from 'react';
import axiosInstance from '../../constants/axiosConstant';
import { useSelector } from 'react-redux';
import { Alert, Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import "./Request.css"
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AddIcon from '@mui/icons-material/Add';
import { useFieldArray, useForm, Controller } from 'react-hook-form';

const Hook = () => {
    const userId = useSelector(state => state._id);
    const userOccupation = useSelector(state => state.occupation);
    const { register, handleSubmit, setValue, control, watch, reset } = useForm({
        defaultValues: {
            requestType: "",
            status: "",
            items: [],
            estimatedAmount: "",
            paidAmount: "",
            requiredAmount: "",
            comments: "",
        },
    });
    return (
        <div>Hook</div>
    )
}

export default Hook
