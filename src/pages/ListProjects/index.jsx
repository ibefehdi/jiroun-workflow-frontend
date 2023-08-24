import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import { Container } from 'reactstrap';
import TableContainer from '../../components/TableContainer';

const ListProjects = () => {
    const userId = useSelector(state => state._id);
    const [reload, setReload] = useState(false)

    const { data, fetchData, pageCount, totalDataCount } = useGETAPI(
        axiosInstance.get,
        `projects/${userId}`,
        'status',
        'data'
    );

    useEffect(() => {
        fetchData({ pageIndex: 0, pageSize: 10 });
    }, [fetchData]);

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'projectName',
            },
            {
                Header: 'Year',
                accessor: 'year',
                Cell: ({ value }) => {
                    return new Date(value).getFullYear()
                }
            },
            {
                Header: 'Location',
                accessor: 'location',
            },
            {
                Header: "Project Manager",
                accessor: 'projectManager',
                Cell: ({ value }) => {
                    return value && value.length > 0 ? value.map(projectManager => `${projectManager.fName} ${projectManager.lName}`).join(", ") : "No project managers";
                }

            },
            {
                Header: "Project Director",
                accessor: 'projectDirector',
                Cell: ({ value }) => {
                    return value ? `${value.fName} ${value.lName}` : '';
                }
            },
            {
                Header: "Contractors",
                accessor: 'contractors',
                Cell: ({ value }) => {

                    return value.map(contractor => `${contractor.fName} ${contractor.lName}`).join(", ");
                }
            }


        ],
        []
    );
    return (
        <Container className={'pagecontainer'}>
            <div className='header'>
                <h1 className='Heading'>Projects</h1>
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
        </Container>
    )
}

export default ListProjects
