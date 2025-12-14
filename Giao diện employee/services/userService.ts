
export interface User {
    id: string;
    full_name: string;
    email: string;
    department_id: string;
    status: string;
    avatar_url?: string;
    department_name?: string;
}

export const userService = {
    getAllUsers: async (): Promise<User[]> => {
        return [
            { id: '1', full_name: 'Alice Smith', email: 'alice@nexus.com', department_id: 'IT', status: 'Active', department_name: 'IT' },
            { id: '2', full_name: 'Bob Jones', email: 'bob@nexus.com', department_id: 'HR', status: 'Active', department_name: 'HR' }
        ];
    }
};
