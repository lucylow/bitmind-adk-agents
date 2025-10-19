import { StacksDataAPI, ChainalysisAPI } from './blockchainAPIs';
import { CoinMarketCapAPI, AlphaVantageAPI } from './marketDataAPIs';
import { CohereAPI, HuggingFaceAPI } from './enhancedAI';
import { TwilioAPI, DiscordAPI } from './communicationAPIs';
import { PinataAPI } from './documentAPIs';
export class BitMindAPIManager {
    constructor() {
        Object.defineProperty(this, "apis", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.initializeAPIs();
    }
    initializeAPIs() {
        // Blockchain APIs
        const hiroKey = import.meta.env.VITE_HIRO_API_KEY;
        if (hiroKey) {
            this.apis.set('hiro', new StacksDataAPI(hiroKey));
        }
        const chainalysisKey = import.meta.env.VITE_CHAINALYSIS_API_KEY;
        if (chainalysisKey) {
            this.apis.set('chainalysis', new ChainalysisAPI(chainalysisKey));
        }
        // Market Data APIs
        const cmcKey = import.meta.env.VITE_COINMARKETCAP_API_KEY;
        if (cmcKey) {
            this.apis.set('cmc', new CoinMarketCapAPI(cmcKey));
        }
        const alphaVantageKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
        if (alphaVantageKey) {
            this.apis.set('alphaVantage', new AlphaVantageAPI(alphaVantageKey));
        }
        // AI APIs
        const cohereKey = import.meta.env.VITE_COHERE_API_KEY;
        if (cohereKey) {
            this.apis.set('cohere', new CohereAPI(cohereKey));
        }
        const hfKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
        if (hfKey) {
            this.apis.set('huggingface', new HuggingFaceAPI(hfKey));
        }
        // Communication APIs
        const twilioSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
        const twilioToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
        const twilioNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
        if (twilioSid && twilioToken && twilioNumber) {
            this.apis.set('twilio', new TwilioAPI(twilioSid, twilioToken, twilioNumber));
        }
        const discordWebhook = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
        if (discordWebhook) {
            this.apis.set('discord', new DiscordAPI(discordWebhook));
        }
        // Document APIs
        const pinataKey = import.meta.env.VITE_PINATA_API_KEY;
        const pinataSecret = import.meta.env.VITE_PINATA_SECRET_KEY;
        if (pinataKey && pinataSecret) {
            this.apis.set('pinata', new PinataAPI(pinataKey, pinataSecret));
        }
    }
    getAPI(name) {
        return this.apis.get(name);
    }
    isAPIAvailable(name) {
        return this.apis.has(name);
    }
    getAvailableAPIs() {
        return Array.from(this.apis.keys());
    }
    getAPIStatus() {
        return {
            blockchain: {
                hiro: this.isAPIAvailable('hiro'),
                chainalysis: this.isAPIAvailable('chainalysis'),
            },
            marketData: {
                coinmarketcap: this.isAPIAvailable('cmc'),
                alphaVantage: this.isAPIAvailable('alphaVantage'),
            },
            ai: {
                cohere: this.isAPIAvailable('cohere'),
                huggingface: this.isAPIAvailable('huggingface'),
            },
            communication: {
                twilio: this.isAPIAvailable('twilio'),
                discord: this.isAPIAvailable('discord'),
            },
            storage: {
                pinata: this.isAPIAvailable('pinata'),
            },
        };
    }
}
// Export singleton instance
export const apiManager = new BitMindAPIManager();
