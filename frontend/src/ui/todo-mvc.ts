import { BaseHTMLElement, customElement, first, getChild, getChildren, html, OnEvent, onEvent, onHub } from 'dom-native';
import { Todo, todoMco } from 'src/model/todo-mco';

@customElement("todo-mvc")
class TodoMvc extends BaseHTMLElement {
    #todoInputEl!: TodoInput;
    #todoListEl!: HTMLElement;

    init() {
        let htmlContent: DocumentFragment = html`
            <div class="box"></div>
            <h1>todos</h1>
            <todo-input></todo-input>
            <todo-list></todo-list>
        `;
        [this.#todoInputEl, this.#todoListEl] = getChildren(htmlContent, 'todo-input', 'todo-list');

        this.append(htmlContent);
        this.refresh();
    }

    async refresh() {
        //let todos: Todo[] = [
        //    {id: 1, title: "moch 1", status: "Close"},
        //    {id: 2, title: "moch 2", status: "Open"}
        //];
        let todos: Todo[] = await todoMco.list();

        let htmlContent = document.createDocumentFragment();
        for (const todo of todos ){
            const el = document.createElement('todo-item');
            el.data = todo;
            htmlContent.append(el);
        }

        this.#todoListEl.innerHTML = '';
        this.#todoListEl.append(htmlContent);
    }

    @onEvent('pointerup', 'c-check')
    onCheckTodo(evt: PointerEvent & OnEvent) {
        const todoItem = evt.selectTarget.closest("todo-item")!;
        const status = todoItem.data.status == 'Open' ? 'Close' : 'Open';
        // console.log("->> ",todoItem.data.status, status)
        // update to server
        todoMco.update(todoItem.data.id, { status });
    }

    @onHub('datahub', 'Todo', 'update')
    onTodoUpdate(data: Todo) {
        const todoItem = first(`todo-item.Todo-${data.id}`) as TodoItem | undefined;
        // if found, update it 
        if (todoItem) {
            todoItem.data = data; // data will be frozen
        }
    }

    @onHub('datahub', 'Todo', 'create')
    onTodoCreate(data: Todo) {
        this.refresh();
    }
}

@customElement("todo-input")
class TodoInput extends BaseHTMLElement {
    #inputEl!: HTMLInputElement;

    init() {
        let htmlContent = html`
            <input type="text" placeholder="What needs to be done?">
        `;
        this.#inputEl = getChild(htmlContent, 'input');

        this.append(htmlContent);
    }

    @onEvent('keyup', 'input')
    onInputKeyUp(evt: KeyboardEvent) {
        if (evt.key == "Enter") {
            const title = this.#inputEl.value;
            // send create to server
            todoMco.create({title});
            // don't wait, reset value input
            this.#inputEl.value = '';
        }
    }
}

// todo-input tag
declare global {
    interface HTMLElementTagNameMap {
        'todo-input': TodoInput;
    }
}

@customElement('todo-item')
export class TodoItem extends BaseHTMLElement {
    #titleEl!: HTMLElement;     
    #data!: Todo;

    set data(data: Todo){
        console.log("->> todoItem set data")
        let oldData = this.#data;
        this.#data = Object.freeze(data);
        if (this.isConnected) {
            this.refresh(oldData);
        }
    }

    get data() {return this.#data}

    init() {
        let htmlContent = html`
            <c-check><c-ico name="ico-done"></c-ico></c-check>
            <div class="title">STATIC TITLE</div>
            <c-ico name="del"></c-ico>
        `;
        this.#titleEl = getChild(htmlContent, 'div');

        this.append(htmlContent);
        this.refresh();
    }

    refresh(old?: Todo) {
        console.log("->> todo-item refresh", old)
        if (old != null) {
            this.classList.remove(`Todo-${old.id}`);
            this.classList.remove(old.status);
        }
        // render new data  
        const todo = this.#data;
        this.classList.add(`Todo-${todo.id}`);
        this.classList.add(todo.status);
        this.#titleEl.textContent = todo.title;
    }
}

// todo-item type augmentation
declare global {
    interface HTMLElementTagNameMap {
        'todo-item': TodoItem;
    }
}
