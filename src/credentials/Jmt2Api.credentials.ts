import type { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class Jmt2Api implements ICredentialType {
	name = 'jmt2Api';
	displayName = 'JMT2 API';
	properties: INodeProperties[] = [
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
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.token}}',
			},
		},
	};
}
