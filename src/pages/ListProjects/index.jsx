import React, { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import axios from 'axios';
const ListProjects = () => {
    const userId = useSelector(state => state._id);
    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        'projects/' + userId,
        'status',
        'data'
    );
    useEffect(() => {
        fetchData({
            pageSize: 10,
            pageIndex: 1,
        });
        console.log(data);
    }, [fetchData])
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
                Header:"Project Manager",
                accessor: 'projectManager',
            }
           
        ],
        []
    );
    return (
        <div>ListProjects</div>
    )
}

export default ListProjects