import axios from 'axios';

const API_URL = 'http://localhost:5001/api/meetings/';

const createHeaders = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

const getMeetings = async (token) => {
    const response = await axios.get(API_URL, createHeaders(token));
    return response.data;
};

const createMeeting = async (meetingData, token) => {
    const response = await axios.post(API_URL, meetingData, createHeaders(token));
    return response.data;
};

const deleteMeeting = async (meetingId, token) => {
    const response = await axios.delete(API_URL + meetingId, createHeaders(token));
    return response.data;
};

const updateMeeting = async (meetingId, meetingData, token) => {
    const response = await axios.put(API_URL + meetingId, meetingData, createHeaders(token));
    return response.data;
};

const meetingService = {
    getMeetings,
    createMeeting,
    deleteMeeting,
    updateMeeting,
};

export default meetingService;
