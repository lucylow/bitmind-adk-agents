import axios from 'axios';
export class CohereAPI {
    constructor(apiKey) {
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.apiKey = apiKey;
    }
    async classifyInvoiceType(text) {
        try {
            const response = await axios.post('https://api.cohere.ai/v1/classify', {
                model: 'embed-english-v3.0',
                inputs: [text],
                examples: [
                    { text: 'Milestone payment for development work', label: 'milestone' },
                    { text: 'Full payment upon project completion', label: 'lump_sum' },
                    { text: 'Monthly recurring service fee', label: 'recurring' },
                    { text: 'Hourly consulting services', label: 'hourly' },
                    { text: 'One-time purchase order', label: 'purchase_order' },
                ],
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Cohere API error:', error);
            return { classifications: [{ prediction: 'unknown', confidence: 0 }] };
        }
    }
    async detectFraudulentInvoice(invoiceText) {
        try {
            const response = await axios.post('https://api.cohere.ai/v1/classify', {
                model: 'embed-english-v3.0',
                inputs: [invoiceText],
                examples: [
                    { text: 'URGENT payment needed immediately wire transfer only', label: 'suspicious' },
                    { text: 'Please send Bitcoin to this address right away', label: 'suspicious' },
                    { text: 'Professional service invoice for software development', label: 'legitimate' },
                    { text: 'Consulting services rendered per contract agreement', label: 'legitimate' },
                    { text: 'Monthly retainer for ongoing support services', label: 'legitimate' },
                ],
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Cohere API error:', error);
            return { classifications: [{ prediction: 'unknown', confidence: 0 }] };
        }
    }
    async generateInvoiceSummary(invoiceText) {
        try {
            const response = await axios.post('https://api.cohere.ai/v1/summarize', {
                text: invoiceText,
                length: 'short',
                format: 'paragraph',
                extractiveness: 'medium',
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Cohere API error:', error);
            return { summary: 'Unable to generate summary' };
        }
    }
}
export class HuggingFaceAPI {
    constructor(apiKey) {
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.apiKey = apiKey;
    }
    async extractEntities(text) {
        try {
            const response = await axios.post('https://api-inference.huggingface.co/models/dbmdz/bert-large-cased-finetuned-conll03-english', { inputs: text }, {
                headers: { Authorization: `Bearer ${this.apiKey}` },
            });
            return response.data;
        }
        catch (error) {
            console.error('HuggingFace API error:', error);
            return [];
        }
    }
    async sentimentAnalysis(text) {
        try {
            const response = await axios.post('https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', { inputs: text }, {
                headers: { Authorization: `Bearer ${this.apiKey}` },
            });
            return response.data;
        }
        catch (error) {
            console.error('HuggingFace API error:', error);
            return [];
        }
    }
}
const COHERE_API_KEY = import.meta.env.VITE_COHERE_API_KEY;
export const cohereAPI = COHERE_API_KEY ? new CohereAPI(COHERE_API_KEY) : null;
