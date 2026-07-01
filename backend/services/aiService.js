const axios = require("axios");

const AI_BASE_URL = "http://127.0.0.1:5001";

async function healthCheck() {
    const response = await axios.get(`${AI_BASE_URL}/health`);
    return response.data;
}

async function testDetect() {
    const response = await axios.get(`${AI_BASE_URL}/test-detect`);
    return response.data;
}

module.exports = {
    healthCheck,
    testDetect
};