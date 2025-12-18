import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
export declare class Jmt2Tool {
    description: {
        displayName: string;
        name: string;
        icon: string;
        group: string[];
        version: number;
        description: string;
        defaults: {
            name: string;
        };
        inputs: string[];
        outputs: string[];
        credentials: Array<{
            name: string;
            required: boolean;
        }>;
        properties: INodeProperties[];
    };
    execute(this: IExecuteFunctions): Promise<any>;
}
