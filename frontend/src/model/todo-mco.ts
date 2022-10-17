import { hub } from 'dom-native';
import { webGet, webPatch, webPost, webDelete} from '../webc';

export interface Todo {
    id: number;
    title: string;
    status: 'Open' | 'Close';
}

export type TodoPatch = Partial<Omit<Todo, 'id'>>;

class TodoMco {

    async list(): Promise<Todo[]> {
        const data = await webGet("todos");
        console.log(data);
        return data as Todo[];
    }

    async create(data: TodoPatch): Promise<Todo> {
        // guard (TODO - validate data)
        if (data.title == null || data.title.trim().length == 0) {
            throw new Error("Cannot create Todo with empty title.");
        }
        // to server
        const newData = await webPost('todos', data);
        // sending event
        hub('datahub').pub('Todo', 'create', newData);

        return newData as Todo;
    }

    async update(id: number, data: TodoPatch): Promise<Todo> {
        // TODO - validate data
        // to server:webPatch
        console.log("->>", data)
        const newData = await webPatch(`todos/${id}`, data);
        // event
        hub('datahub').pub('Todo', 'update', newData);

        return newData as Todo;
    }

    async delete(id: number): Promise<Todo> {
        // to server:webPatch
        const oldData = await webDelete(`todos/${id}`);
        // event
        hub('datahub').pub('Todo', 'delete', oldData);

        return oldData as Todo;
    }
}

export const todoMco = new TodoMco();
