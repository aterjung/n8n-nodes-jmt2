"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Jmt2 = void 0;
async function apiRequest(method, endpoint, body, qs) {
    const credentials = await this.getCredentials('jmt2Api');
    const baseUrl = credentials.baseUrl.replace(/\/$/, '');
    const options = {
        method,
        url: `${baseUrl}${endpoint}`,
        json: true,
        qs,
        body,
    };
    return this.helpers.requestWithAuthentication.call(this, 'jmt2Api', options);
}
class Jmt2 {
    constructor() {
        this.description = {
            displayName: 'JMT2',
            name: 'jmt2',
            icon: 'fa:cube',
            group: ['transform'],
            version: 1,
            description: 'Interact with JMT2 API',
            defaults: {
                name: 'JMT2',
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
                // Common filters
                {
                    displayName: 'Filters',
                    name: 'filters',
                    type: 'collection',
                    placeholder: 'Add filter',
                    default: {},
                    displayOptions: {
                        show: {
                            operation: ['list']
                        }
                    },
                    options: [
                        { displayName: 'ID', name: 'id', type: 'number', default: 0 },
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
                // Create fields for task
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
                        { displayName: 'Type', name: 'type', type: 'options', default: 0, options: [{ name: 'Time-based', value: 0 }, { name: 'Fixed price', value: 1 }] },
                        { displayName: 'Status', name: 'status', type: 'number', default: 0 },
                        { displayName: 'Predicted Duration', name: 'duration_predicted', type: 'number', default: 0 },
                        { displayName: 'Show Duration', name: 'show_duration', type: 'boolean', default: false },
                    ],
                },
                // Create fields for unit (booking)
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
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            const resource = this.getNodeParameter('resource', i);
            const operation = this.getNodeParameter('operation', i);
            if (operation === 'list') {
                const filters = this.getNodeParameter('filters', i, {});
                let endpoint = '';
                if (resource === 'customer')
                    endpoint = '/customers';
                if (resource === 'project')
                    endpoint = '/projects';
                if (resource === 'task')
                    endpoint = '/tasks';
                if (resource === 'unit')
                    endpoint = '/units';
                const data = await apiRequest.call(this, 'GET', endpoint, undefined, filters);
                for (const entry of Array.isArray(data) ? data : [data]) {
                    returnData.push({ json: entry });
                }
            }
            if (operation === 'create') {
                let endpoint = '';
                let body = {}; // <<< wichtig: als IDataObject typisieren
                if (resource === 'task') {
                    endpoint = '/tasks';
                    const taskFields = this.getNodeParameter('taskFields', i, {});
                    // je nach Logik: 0 = "nicht gesetzt"
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
                    const unitFields = this.getNodeParameter('unitFields', i, {});
                    if (unitFields.task_id === undefined || unitFields.task_id === 0) {
                        throw new Error('Task ID is required when creating a unit');
                    }
                    body = unitFields;
                }
                if (!endpoint) {
                    throw new Error('Create operation only supported for Task and Unit');
                }
                const data = await apiRequest.call(this, 'POST', endpoint, body);
                returnData.push({ json: data });
            }
        }
        return [returnData];
    }
}
exports.Jmt2 = Jmt2;
