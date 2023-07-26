
import { SET_USER_DATA, SET_AUTHENTICATION } from './actions';

const initialState = {
    fName: '',
    lName: '',
    occupation: '',
    superAdmin: false,
    username: ''
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_USER_DATA:
            return { ...state, ...action.payload };
        case SET_AUTHENTICATION:
            return { ...state, authenticated: action.payload };
        default:
            return state;
    }
};

export default userReducer;
