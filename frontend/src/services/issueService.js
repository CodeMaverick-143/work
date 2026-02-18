import axios from 'axios';

const API_URL = 'http://localhost:5001/api/issues/';

const getIssues = async (projectId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.get(API_URL + projectId, config);
    return response.data;
};

const createIssue = async (projectId, issueData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.post(API_URL + projectId, issueData, config);
    return response.data;
};

const updateIssue = async (issueId, issueData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.put(API_URL + 'item/' + issueId, issueData, config);
    return response.data;
};

const deleteIssue = async (issueId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.delete(API_URL + 'item/' + issueId, config);
    return response.data;
};

const issueService = {
    getIssues,
    createIssue,
    updateIssue,
    deleteIssue,
};

export default issueService;
