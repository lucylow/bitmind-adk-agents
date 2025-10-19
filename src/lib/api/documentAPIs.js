import axios from 'axios';
export class PinataAPI {
    constructor(apiKey, secretKey) {
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "secretKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.apiKey = apiKey;
        this.secretKey = secretKey;
    }
    async uploadInvoiceDocument(file, metadata) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('pinataMetadata', JSON.stringify({
                name: `BitMind Invoice ${metadata.invoiceId}`,
                keyvalues: {
                    invoiceId: metadata.invoiceId,
                    createdAt: new Date().toISOString(),
                    ...metadata,
                },
            }));
            formData.append('pinataOptions', JSON.stringify({
                cidVersion: 1,
            }));
            const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                maxBodyLength: Infinity,
                headers: {
                    'Content-Type': `multipart/form-data`,
                    pinata_api_key: this.apiKey,
                    pinata_secret_api_key: this.secretKey,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Pinata API error:', error);
            return { error: true, message: 'Failed to upload to IPFS' };
        }
    }
    async uploadJSON(jsonData, name) {
        try {
            const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
                pinataContent: jsonData,
                pinataMetadata: {
                    name,
                },
                pinataOptions: {
                    cidVersion: 1,
                },
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    pinata_api_key: this.apiKey,
                    pinata_secret_api_key: this.secretKey,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Pinata API error:', error);
            return { error: true, message: 'Failed to upload JSON to IPFS' };
        }
    }
    async getFileByHash(ipfsHash) {
        try {
            const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
            return response.data;
        }
        catch (error) {
            console.error('Pinata API error:', error);
            return null;
        }
    }
    async listFiles(limit = 10) {
        try {
            const response = await axios.get('https://api.pinata.cloud/data/pinList', {
                params: {
                    pageLimit: limit,
                    status: 'pinned',
                },
                headers: {
                    pinata_api_key: this.apiKey,
                    pinata_secret_api_key: this.secretKey,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Pinata API error:', error);
            return { rows: [] };
        }
    }
}
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET_KEY;
export const pinataAPI = PINATA_API_KEY && PINATA_SECRET ? new PinataAPI(PINATA_API_KEY, PINATA_SECRET) : null;
