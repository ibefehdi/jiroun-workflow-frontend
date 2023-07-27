
export const SET_USER_DATA = 'SET_USER_DATA';
export const SET_AUTHENTICATION = 'SET_AUTHENTICATION';

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

