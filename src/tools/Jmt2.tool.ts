import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

// Reuse of apiRequest helper similar to node implementation
async function apiRequest(this: IExecuteFunctions, method: string, endpoint: string, body?: IDataObject, qs?: IDataObject) {
    const credentials = await this.getCredentials('jmt2Api');
    const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
    const options: any = {
        method,
        url: `${baseUrl}${endpoint}`,
        json: true,
        qs,
        body,
    };
    // uses the same auth definition from credentials
    // @ts-ignore - helper available at runtime in n8n
    return this.helpers.requestWithAuthentication.call(this, 'jmt2Api', options);
}

// Minimal tool shape compatible with n8n community packages.
// We avoid explicit interface typing to keep compatibility across n8n versions.
export class Jmt2Tool {
    // Tool description (mirrors node properties for a generic tool usage)
    description: {
        displayName: string;
        name: string;
        icon: string;
        group: string[];
        version: number;
        description: string;
        defaults: { name: string };
        inputs: string[];
        outputs: string[];
        credentials: Array<{ name: string; required: boolean }>;
        properties: INodeProperties[];
    } = {
        displayName: 'JMT2 Tool',
        name: 'jmt2Tool',
        icon: 'fa:cube',
        group: ['transform'],
        version: 1,
        description: 'Greift generisch auf die JMT2 API zu (als Tool nutzbar).',
        defaults: {
            name: 'JMT2 Tool',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'jmt2Api',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                options: [
                    { name: 'Customer', value: 'customer' },
                    { name: 'Project', value: 'project' },
                    { name: 'Task', value: 'task' },
                    { name: 'Unit', value: 'unit' },
                ],
                default: 'customer',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    { name: 'List', value: 'list', description: 'List items' },
                    { name: 'Create', value: 'create', description: 'Create item (Task/Unit only)' },
                ],
                default: 'list',
            },
            // Gemeinsame Filter für List-Operationen
            {
                displayName: 'Filters',
                name: 'filters',
                type: 'collection',
                placeholder: 'Add filter',
                default: {},
                displayOptions: {
                    show: {
                        operation: ['list'],
                    },
                },
                options: [
                    { displayName: 'ID', name: 'id', type: 'number', default: 0 },
                    { displayName: 'Asana ID', name: 'asana_id', type: 'string', default: '' },
                    { displayName: 'Customer ID', name: 'customer_id', type: 'number', default: 0 },
                    { displayName: 'Project ID', name: 'project_id', type: 'number', default: 0 },
                    { displayName: 'Task ID', name: 'task_id', type: 'number', default: 0 },
                    { displayName: 'From', name: 'from', type: 'string', default: '' },
                    { displayName: 'To', name: 'to', type: 'string', default: '' },
                    { displayName: 'Invoiced', name: 'invoiced', type: 'boolean', default: false },
                    { displayName: 'Type', name: 'type', type: 'number', default: 0 },
                    { displayName: 'Status', name: 'status', type: 'number', default: 0 },
                ],
            },
            // Create-Felder: Task
            {
                displayName: 'Task',
                name: 'taskFields',
                type: 'collection',
                placeholder: 'Set Task Fields',
                default: {},
                displayOptions: { show: { resource: ['task'], operation: ['create'] } },
                options: [
                    { displayName: 'Project ID', name: 'project_id', type: 'number', default: 0 },
                    { displayName: 'Title', name: 'title', type: 'string', default: '' },
                    { displayName: 'Description', name: 'description', type: 'string', default: '' },
                    { displayName: 'Asana ID', name: 'asana_id', type: 'string', default: '' },
                    { displayName: 'Type', name: 'type', type: 'options', default: 0, options: [ { name: 'Time-based', value: 0 }, { name: 'Fixed price', value: 1 } ] },
                    { displayName: 'Status', name: 'status', type: 'number', default: 0 },
                    { displayName: 'Predicted Duration', name: 'duration_predicted', type: 'number', default: 0 },
                    { displayName: 'Show Duration', name: 'show_duration', type: 'boolean', default: false },
                ],
            },
            // Create-Felder: Unit (Buchung)
            {
                displayName: 'Unit',
                name: 'unitFields',
                type: 'collection',
                placeholder: 'Set Unit Fields',
                default: {},
                displayOptions: { show: { resource: ['unit'], operation: ['create'] } },
                options: [
                    { displayName: 'Task ID', name: 'task_id', type: 'number', default: 0 },
                    { displayName: 'Info', name: 'info', type: 'string', default: '' },
                    { displayName: 'Start Time', name: 'start_time', type: 'string', default: '', description: 'ISO date-time' },
                    { displayName: 'Stop Time', name: 'stop_time', type: 'string', default: '', description: 'ISO date-time' },
                    { displayName: 'Invoiced', name: 'invoiced', type: 'boolean', default: false },
                ],
            },
        ],
    };

    // Ausführung analog zum Node – generisch für List/Create
    async execute(this: IExecuteFunctions): Promise<any> {
        const items = this.getInputData();
        const result: any[] = [];

        for (let i = 0; i < items.length; i++) {
            const resource = this.getNodeParameter('resource', i) as string;
            const operation = this.getNodeParameter('operation', i) as string;

            if (operation === 'list') {
                const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
                let endpoint = '';
                if (resource === 'customer') endpoint = '/customers';
                if (resource === 'project') endpoint = '/projects';
                if (resource === 'task') endpoint = '/tasks';
                if (resource === 'unit') endpoint = '/units';
                const data = await apiRequest.call(this, 'GET', endpoint, undefined, filters);
                if (Array.isArray(data)) {
                    for (const entry of data) result.push({ json: entry });
                } else {
                    result.push({ json: data });
                }
            }

            if (operation === 'create') {
                let endpoint = '';
                let body: IDataObject = {};

                if (resource === 'task') {
                    endpoint = '/tasks';
                    const taskFields = this.getNodeParameter('taskFields', i, {}) as IDataObject;
                    if (taskFields.project_id === undefined || taskFields.project_id === 0) {
                        throw new Error('Project ID is required when creating a task');
                    }
                    if (!taskFields.title) {
                        throw new Error('Title is required when creating a task');
                    }
                    body = taskFields;
                }

                if (resource === 'unit') {
                    endpoint = '/units';
                    const unitFields = this.getNodeParameter('unitFields', i, {}) as IDataObject;
                    if (unitFields.task_id === undefined || unitFields.task_id === 0) {
                        throw new Error('Task ID is required when creating a unit');
                    }
                    body = unitFields;
                }

                if (!endpoint) {
                    throw new Error('Create operation only supported for Task and Unit');
                }

                const data = await apiRequest.call(this, 'POST', endpoint, body);
                result.push({ json: data });
            }
        }

        return [result];
    }
}
