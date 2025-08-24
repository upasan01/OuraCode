import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_CONTROLLER_API_URL;

export const downloadCode = async (code, roomId) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/download?roomId=${roomId}`,
            { code },
            {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000 
            }
        );

        // Check if we actually received data
        if (!response.data || response.data.size === 0) {
            throw new Error('No data received from server');
        }

        // Extract filename from response headers
        const contentDisposition = response.headers['content-disposition'];
        const filename = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : 'code.txt';

        // Create and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true };

    } catch (error) {
        console.error('Download error:', error);

        if (error.code === 'ECONNABORTED') {
            throw new Error('Download timeout - server is not responding');
        }

        if (error.response?.data) {
            // Handle blob error responses
            if (error.response.data instanceof Blob) {
                const errorText = await error.response.data.text();
                const errorObj = JSON.parse(errorText);
                throw new Error(errorObj.message);
            }
            // Handle JSON error responses
            throw new Error(error.response.data.message || 'Download failed');
        }

        if (error.request) {
            throw new Error('No response from server - check if backend is running');
        }

        throw new Error(error.message || 'Download failed');
    }
};


export const saveCode = async (roomId, code) => {
    try {
        const res = await axios.post(
            `${API_BASE_URL}/save?roomId=${roomId}`,
            { code },
            {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 30000
            }
        );

        return { success: true, message: res.data.message || "Code saved successfully" };
    } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Error saving code";
        console.error("Error saving code:", errorMsg);
        throw new Error(errorMsg);
    }
};

// currently not in use, maybe will not use it ever
/*export const changeLanguage = async (language, roomId) => {
    try{
        const response = await axios.post(
            `${API_BASE_URL}/change?roomId=${roomId}`,
            { language },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000
            }
        );

        return { success: true, message: response?.data?.message || "Language changed successfully" };
    }
    catch (error) {
        const errorMsg = error.response?.data?.message || "Error changing language";
        console.error("Error changing language:", errorMsg);
        throw new Error(errorMsg);
    }
};*/

// Switched to ws connection for input responses too no more rest api
// export const runCode = async (code, roomId) => {
//     try {
//         const response = await axios.post(
//             `${API_BASE_URL}/run?roomId=${roomId}`,
//             { code },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 timeout: 30000
//             });
//         return {
//             success: true,
//             output: response?.data.output,
//             error: response?.data.error
//         };
//     } catch (error) {
//         console.error('Run code error:', error);

//         if (error.code === 'ECONNABORTED') {
//             throw new Error('Code execution timeout - process took too long');
//         }

//         if (error.response?.data) {
//             throw new Error(error.response.data.message || 'Code execution failed');
//         }

//         if (error.request) {
//             throw new Error('No response from server - check if backend is running');
//         }

//         throw new Error(error.message || 'Code execution failed');
//     }
// };


