import React, { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import { useTable } from 'react-table';
import { Container } from 'reactstrap';
import TableContainer from '../../components/TableContainer';

const ListProjects = () => {
    const userId = useSelector(state => state._id);
    const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
        axiosInstance.get,
        `/projects/${userId}`,
        'status',
        'data'
    );

    useEffect(() => {
        fetchData({
            pageSize: 10,
            pageIndex: 1,
        });
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
                Header: "Project Manager",
                accessor: 'projectManager',
                Cell: ({ value }) => {
                    return value && value.length > 0 ? value.map(projectManager => `${projectManager?.fName} ${projectManager?.lName}`).join(", ") : "No project managers";
                }

            },
            {
                Header: "Project Director",
                accessor: 'projectDirector',
                Cell: ({ value }) => {
                    return value ? `${value?.fName} ${value?.lName}` : '';
                }
            },
            {
                Header: "Contractors",
                accessor: 'contractors',
                Cell: ({ value }) => {

                    return value.map(contractor => `${contractor?.fName} ${contractor?.lName}`).join(", ");
                }
            }


        ],
        []
    );
    return (
        <Container className={'pagecontainer'}>
            <div className='header'>
                <h1>Projects</h1>

            </div>
            <TableContainer
                data={data}
                pageCount={pageCount}
                fetchData={fetchData}
                loading={loadStatus}
                totalDataCount={totalDataCount}
                columns={columns}

            />
        </Container>
    )
}

export default ListProjects
