import React, { useEffect, useMemo, useState } from 'react'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import { useSelector } from 'react-redux';
import { Button, Container, Alert } from 'reactstrap';
import TableContainer from '../../components/TableContainer';


import RequestDetailModal from './RequestDetailModal';
import SendDetailModal from './SendDetailModal';
import OldTableContainer from '../../components/TableContainer/OldTableContainer';
const ListYourProjects = () => {
  const userId = useSelector(state => state._id);
  const occupation = useSelector(state => state.occupation);
  const [modal, setModal] = useState(false);
  const [requestDetail, setRequestDetail] = useState(null);
  const [sendModal, setSendModal] = useState(false);
  const [sendDetail, setSendDetail] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [reload, setReload] = useState(false);

  const toggleSendModal = () => setSendModal(!sendModal);
  const { data, fetchData, pageCount, totalDataCount } = useGETAPI(
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

  } = useGETAPI(
    axiosInstance.get,
    `requests/sender/${userId}`,
    'status',
    'data'
  );


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
    fetchSentData({
      pageSize: 10,
      pageIndex: 1,
    });
    fetchData({
      pageSize: 10,
      pageIndex: 1,
    });
  }, [fetchData, fetchSentData])
  const refreshData = () => {
    fetchData({
      pageSize: 10,
      pageIndex: 1,
    });

    fetchSentData({
      pageSize: 10,
      pageIndex: 1,
    });
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };


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
        Header: "Contractor",
        accessor: 'contractorForPayment',
        Cell: ({ value }) => {
          if (!value) {
            return "N/A";
          }
          return `${value.fName} ${value.lName}`;
        }
      },
      {
        Header: "Initiator",
        accessor: 'initiator',
        Cell: ({ value }) => {
          if (!value) {
            return "N/A";
          }
          return `${value.fName} ${value.lName}`;
        }
      },
      {
        Header: "Request Title",
        accessor: "requestTitle",
        Cell: ({ value }) =>
          (value ? value : 'N/A')

      },
      {
        Header: "Date",
        accessor: "subRequestSentAt",
        Cell: ({ value }) => {
          return new Date(value).toLocaleDateString();
        }
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
        Header: "Contractor",
        accessor: 'contractorForPayment',
        Cell: ({ value }) => {
          if (!value) {
            return "N/A";
          }
          return `${value.fName} ${value.lName}`;
        }
      },

      {
        Header: "Date",
        accessor: "subRequestSentAt",
        Cell: ({ value }) => {
          return new Date(value).toLocaleDateString();
        }
      },
      {
        Header: 'Recipient',
        accessor: 'recipient',
        Cell: ({ value }) => {
          return `${value.fName}  ${value.lName}`
        }
      },
      {
        Header: "Initiator",
        accessor: 'initiator',
        Cell: ({ value }) => {
          if (!value) {
            return "N/A";
          }
          return `${value.fName} ${value.lName}`;
        }
      },
      {
        Header: "Request Title",
        accessor: "requestTitle",
        Cell: ({ value }) =>
          (value ? value : 'N/A')

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



  const toggle = () => setModal(!modal);

  return (
    <Container className={'pagecontainer'}>
      {showAlert && (
        <Alert color="success" isOpen={showAlert} toggle={() => setShowAlert(false)}>
          Request details have been submitted successfully!
        </Alert>

      )}
      <div className='header'>
        <h1 className='Heading'>Requests Received by User</h1>
      </div>
      <OldTableContainer
        columns={columns}
        refresh={reload}
        pageCount={pageCount}
        totalDataCount={totalDataCount}
        data={data}
        fetchData={fetchData}
        isGlobalFilter={false}
        customPageSize={10}
      />
      <RequestDetailModal isOpen={modal} toggle={toggle} requestDetail={requestDetail} onFormSubmit={refreshData} />
      <SendDetailModal isOpen={sendModal} toggle={toggleSendModal} sendDetail={sendDetail} />

      <div className='header'>

        {occupation !== "Managing Partner" && <h1 className='Heading' >Requests Sent</h1>}

      </div>
      {occupation !== "Managing Partner" && (<OldTableContainer
        columns={sentColumns}
        refresh={reload}
        pageCount={sentPageCount}
        totalDataCount={sentTotalDataCount}
        data={sentData}
        fetchData={fetchSentData}
        isGlobalFilter={false}
        customPageSize={10}
      />)}


    </Container>
  )
}

export default ListYourProjects
