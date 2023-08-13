import React, { useEffect, useMemo, useState } from 'react'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import { useSelector } from 'react-redux';
import { Button, Container, Modal, ModalHeader, ModalBody } from 'reactstrap';
import TableContainer from '../../components/TableContainer';
import RequestDetailModal from './RequestDetailModal';
import SendDetailModal from './SendDetailModal';
const ListYourProjects = () => {
  const userId = useSelector(state => state._id);
  const occupation = useSelector(state => state.occupation);
  const [modal, setModal] = useState(false);
  const [requestDetail, setRequestDetail] = useState(null);
  const [sendModal, setSendModal] = useState(false);
  const [sendDetail, setSendDetail] = useState(null);

  const toggleSendModal = () => setSendModal(!sendModal);
  const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
    axiosInstance.get,
    `requests/receiver/${userId}`,
    'status',
    'data'
  );


  const {
    data: sentData,
    fetchData: fetchSentData,
    pageCount: sentPageCount,
    totalDataCount: sentTotalDataCount,
    loadStatus: sentLoadStatus
  } = useGETAPI(
    axiosInstance.get,
    `requests/sender/${userId}`,
    'status',
    'data'
  );
  const {
    data: completeData,
    fetchData: fetchCompleteData,
    pageCount: completePageCount,
    totalDataCount: completeTotalDataCount,
    loadStatus: completeLoadStatus
  } = useGETAPI(
    axiosInstance.get,
    `completeRequest`,
    'status',
    'data'
  );
  useEffect(() => {
    fetchSentData({
      pageSize: 10,
      pageIndex: 1,
    });
  }, [fetchSentData]);
  useEffect(() => {
    fetchCompleteData({
      pageSize: 10,
      pageIndex: 1,
    });
  }, [fetchCompleteData])
  const fetchRequestDetail = async (requestId) => {
    const response = await axiosInstance.get(`requests/${requestId}`);
    setRequestDetail(response?.data);
    toggle();
  };
  const fetchSentRequestDetail = async (requestId) => {
    if (occupation !== "Managing Partner") {
      const response = await axiosInstance.get(`requests/${requestId}`);
      setSendDetail(response?.data);
    } else {
      const response = await axiosInstance.get(`requests/${requestId}`);
      setSendDetail(response?.data);
    }

    toggleSendModal();
  };
  useEffect(() => {
    fetchData({
      pageSize: 10,
      pageIndex: 1,
    });
  }, [fetchData])

  const columns = useMemo(
    () => [
      {
        Header: "Request Id",
        accessor: "requestID",
      },
      {
        Header: 'Project Name',
        accessor: 'projectName',
      },
      {
        Header: 'Request Type',
        accessor: 'requestType',
      },
      {
        Header: 'Sender',
        accessor: 'sender',
        Cell: ({ value }) => {
          return `${value?.fName}  ${value?.lName}`
        }
      },
      {
        Header: 'Status',
        accessor: 'isFinalized',
        id: 'chainItemStatus',
        Cell: ({ value }) => {
          if (value === 0) {
            return 'Pending';
          } else if (value === 1) {
            return 'Approved';
          } else if (value === 2) {
            return 'Declined - Attention Required';
          }
          else {
            return 'Attention Required';
          }
        }
      },
      {
        Header: 'Actions',
        accessor: '_id',
        Cell: ({ value: requestId }) => (
          <Button onClick={() => fetchRequestDetail(requestId)}>
            Respond to request
          </Button>
        ),
      }
    ],
  );
  const sentColumns = useMemo(
    () => [
      {
        Header: "Request Id",
        accessor: "requestID",
      },
      {
        Header: 'Project Name',
        accessor: 'projectName',
      },
      {
        Header: 'Request Type',
        accessor: 'requestType',
      },
      {
        Header: 'Recipient',
        accessor: 'recipient',
        Cell: ({ value }) => {
          return `${value.fName}  ${value.lName}`
        }
      },
      {
        Header: 'Status',
        accessor: 'isFinalized',
        id: 'chainItemStatus',
        Cell: ({ value }) => {
          if (value === 0) {
            return 'Pending';
          } else if (value === 1) {
            return 'Approved';
          } else if (value === 2) {
            return 'Declined - Attention Required';
          }
          else {
            return 'Attention Required';
          }
        }
      },
      {
        Header: 'Actions',
        accessor: '_id',
        Cell: ({ value: requestId }) => (
          <Button onClick={() => fetchSentRequestDetail(requestId)}>
            View Details
          </Button>
        ),
      }
    ],
  );

  const completeColumns = useMemo(
    () => [
      {
        Header: 'Project Name',
        accessor: 'project.projectName',
      },
      {
        Header: 'Location',
        accessor: 'project.location'
      },
      {
        Header: 'Actions',
        accessor: '_id',
        Cell: ({ value: requestId }) => (
          <Button onClick={() => fetchSentRequestDetail(requestId)}>
            View Details
          </Button>
        ),
      }
    ],
  );

  const toggle = () => setModal(!modal);

  return (
    <Container className={'pagecontainer'}>
      <div className='header'>
        <h1>Requests Received by User</h1>
      </div>
      <TableContainer
        data={data}
        pageCount={pageCount}
        fetchData={fetchData}
        loading={loadStatus}
        totalDataCount={totalDataCount}
        columns={columns}
      />
      <RequestDetailModal isOpen={modal} toggle={toggle} requestDetail={requestDetail} />
      <SendDetailModal isOpen={sendModal} toggle={toggleSendModal} sendDetail={sendDetail} />

      <div className='header'>

        {occupation !== "Managing Partner" ? (<h1 >Requests Sent By User</h1>) : (<h1 >Requests Completed</h1>)}

      </div>
      {occupation !== "Managing Partner" ? (<TableContainer
        data={sentData}
        pageCount={sentPageCount}
        fetchData={fetchSentData}
        loading={sentLoadStatus}
        totalDataCount={sentTotalDataCount}
        columns={sentColumns}
      />) : (<TableContainer
        data={completeData}
        pageCount={completePageCount}
        fetchData={fetchCompleteData}
        loading={completeLoadStatus}
        totalDataCount={completeTotalDataCount}
        columns={completeColumns}
      />)}


    </Container>
  )
}

export default ListYourProjects
