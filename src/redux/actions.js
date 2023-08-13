
export const SET_USER_DATA = 'SET_USER_DATA';
export const SET_AUTHENTICATION = 'SET_AUTHENTICATION';
export const fetchRequestsStart = () => ({
    type: 'FETCH_REQUESTS_START',
});

export const fetchRequestsSuccess = (data) => ({
    type: 'FETCH_REQUESTS_SUCCESS',
    payload: data,
});

export const fetchRequestsFailure = (error) => ({
    type: 'FETCH_REQUESTS_FAILURE',
    payload: error,
});

export const notifyNewRequest = () => ({
    type: 'NOTIFY_NEW_REQUEST',
});

export const setUserData = (userData) => {
    return {
        type: SET_USER_DATA,
        payload: userData
    }
};

export const setAuthentication = (authStatus) => {
    return {
        type: SET_AUTHENTICATION,
        payload: authStatus
    }
};

