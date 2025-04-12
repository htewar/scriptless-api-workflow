// Define a base node interface
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

// Define a start node
export interface StartNode extends BaseNode {
    type: 'start';
}

// Define an assertion interface
export interface Assertion {
    property: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'greaterThanOrEqualTo' | 'lessThan' | 'lessThanOrEqualTo';
    value: any;
}

//  Define an HTTP node
export interface HTTPNode extends BaseNode {
    type: 'http';
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers: Record<string,string>;
    queryParams: Record<string,string>;
    body: {
        type: 'raw' | 'form-data' | 'binary' | 'x-www-form-urlencoded' | 'graphql';
        payload: any;
    };    
    assertions: Assertion[];
    customerAssertions: {
        language: 'javascript';
        code: string;
    }
    state: {
        customVars: Record<string,any>;
    };    
}

// Define a function node
export interface FunctionNode extends BaseNode {
    type: 'function';
    language: 'javascript';
    code: string;
}

export type Node = StartNode | HTTPNode | FunctionNode;

export type NodeTypeString = 'start' | 'http' | 'function';

// Define the Workflow interface
export interface Workflow {
    id: string;
    name: string;
    nodes: Node[];    
}