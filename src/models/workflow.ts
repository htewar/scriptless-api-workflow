export interface BaseNode {
    id: string;
    name: string;
    type: string;
    wires: string[];
    metadata: {
        position: {
            x: number;
            y: number;
        }
    };
}

export interface StartNode extends BaseNode {
    type: 'start';
}

export interface HTTPNode extends BaseNode {
    type: 'http';
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers: Record<string,string>;
    queryParams: Record<string,string>;
    payload: Record<string,any>;
    assertions: Array<{
        properties: string;
        operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
        value: any;
    }>;
    customerAssertions: {
        language: 'javascript';
        code: string;
    }
    state: {
        customVariables: Record<string,any>;
    };    
}

export interface FunctionNode extends BaseNode {
    type: 'function';
    language: 'javascript';
    code: string;
}

// Define a type that includes all node types
export type NodeType = StartNode | HTTPNode | FunctionNode;


export interface Workflow {
    id: string;
    name: string;
    nodes: NodeType[];    
}