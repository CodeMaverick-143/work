import axios from 'axios';

const API_URL = 'http://localhost:5001/api/tasks/';

const createHeaders = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

const getTasks = async (token) => {
    const response = await axios.get(API_URL, createHeaders(token));
    return response.data;
};

const createTask = async (taskData, token) => {
    const response = await axios.post(API_URL, taskData, createHeaders(token));
    return response.data;
};

const updateTask = async (taskId, taskData, token) => {
    const response = await axios.put(API_URL + taskId, taskData, createHeaders(token));
    return response.data;
};

const deleteTask = async (taskId, token) => {
    const response = await axios.delete(API_URL + taskId, createHeaders(token));
    return response.data;
};

const taskService = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
};

export default taskService;
