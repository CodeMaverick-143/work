const API_URL = 'http://localhost:5001/api';

const runVerification = async () => {
    try {
        console.log('Starting Backend Verification...');

        // Helper for requests
        const request = async (url, method, body, token) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const config = {
                method,
                headers,
            };
            if (body) config.body = JSON.stringify(body);

            const res = await fetch(url, config);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Request failed: ${res.status} ${text}`);
            }
            return res.json();
        };

        // 1. Register User
        const userData = {
            username: 'testuser_' + Date.now(),
            email: 'test_' + Date.now() + '@example.com',
            password: 'password123',
        };
        console.log('Registering user...', userData);
        const registerRes = await request(`${API_URL}/users`, 'POST', userData);
        const token = registerRes.token;
        console.log('User registered. Token received.');

        // 2. Create Project
        const projectData = {
            title: 'Test Project',
            description: 'This is a test project',
            deadline: new Date().toISOString(),
            priority: 'High',
        };
        console.log('Creating project...', projectData);
        const projectRes = await request(`${API_URL}/projects`, 'POST', projectData, token);
        const projectId = projectRes._id;
        console.log('Project created:', projectId);

        // 3. Create Issue
        const issueData = {
            title: 'Test Issue',
            description: 'This is a test issue',
            severity: 'High',
        };
        console.log('Creating issue...', issueData);
        const issueRes = await request(`${API_URL}/issues/${projectId}`, 'POST', issueData, token);
        console.log('Issue created:', issueRes._id);

        // 4. Create Task
        const taskData = {
            title: 'Test Task',
            description: 'This is a test task',
            dueDate: new Date().toISOString(),
        };
        console.log('Creating task...', taskData);
        const taskRes = await request(`${API_URL}/tasks`, 'POST', taskData, token);
        console.log('Task created:', taskRes._id);

        // 5. Create Meeting
        const meetingData = {
            title: 'Test Meeting',
            description: 'This is a test meeting',
            date: new Date().toISOString(),
        };
        console.log('Creating meeting...', meetingData);
        const meetingRes = await request(`${API_URL}/meetings`, 'POST', meetingData, token);
        console.log('Meeting created:', meetingRes._id);

        console.log('Backend Verification Completed Successfully!');
    } catch (error) {
        console.error('Verification Failed:', error.message);
    }
};

runVerification();
