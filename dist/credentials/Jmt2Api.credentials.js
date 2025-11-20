"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Jmt2Api = void 0;
class Jmt2Api {
    constructor() {
        this.name = 'jmt2Api';
        this.displayName = 'JMT2 API';
        this.properties = [
            {
                displayName: 'Base URL',
                name: 'baseUrl',
                type: 'string',
                default: '',
                placeholder: 'https://your-domain.tld/api',
                required: true,
                description: 'Base URL of your JMT2 API (include /api)'
            },
            {
                displayName: 'Token',
                name: 'token',
                type: 'string',
                default: '',
                required: true,
                typeOptions: { password: true },
                description: 'Personal access token from JMT2 (Sanctum)'
            }
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '={{"Bearer " + $credentials.token}}',
                },
            },
        };
    }
}
exports.Jmt2Api = Jmt2Api;
