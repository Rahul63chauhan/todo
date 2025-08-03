class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.todoInput.value = '';
        this.saveToLocalStorage();
        this.render();
        this.showNotification('Task added successfully!');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToLocalStorage();
        this.render();
        this.showNotification('Task deleted!');
    }

    startEdit(id) {
        this.editingId = id;
        this.render();
    }

    saveEdit(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            this.saveToLocalStorage();
            this.render();
            this.showNotification('Task updated!');
        }
        this.editingId = null;
    }

    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        this.todos = this.todos.filter(t => !t.completed);
        this.saveToLocalStorage();
        this.render();
        this.showNotification(`${completedCount} completed tasks cleared!`);
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = '';
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
            this.todoList.innerHTML = filteredTodos.map(todo => this.createTodoElement(todo)).join('');
        }

        this.updateTaskCount();
        this.bindTodoEvents();
    }

    createTodoElement(todo) {
        const isEditing = this.editingId === todo.id;
        
        if (isEditing) {
            return `
                <li class="todo-item editing" data-id="${todo.id}">
                    <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="todoApp.toggleTodo(${todo.id})"></div>
                    <input type="text" class="edit-input" value="${todo.text}" maxlength="100">
                    <div class="todo-actions">
                        <button class="save-btn" onclick="todoApp.saveEdit(${todo.id}, this.parentElement.previousElementSibling.value)">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="cancel-btn" onclick="todoApp.cancelEdit()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </li>
            `;
        }

        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="todoApp.toggleTodo(${todo.id})"></div>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="edit-btn" onclick="todoApp.startEdit(${todo.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
    }

    bindTodoEvents() {
        // Bind edit input events
        const editInputs = document.querySelectorAll('.edit-input');
        editInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const todoItem = e.target.closest('.todo-item');
                    const id = parseInt(todoItem.dataset.id);
                    todoApp.saveEdit(id, e.target.value);
                }
            });
            
            input.addEventListener('blur', (e) => {
                const todoItem = e.target.closest('.todo-item');
                const id = parseInt(todoItem.dataset.id);
                todoApp.saveEdit(id, e.target.value);
            });

            // Focus the input when editing starts
            input.focus();
            input.select();
        });
    }

    updateTaskCount() {
        const activeCount = this.todos.filter(t => !t.completed).length;
        const totalCount = this.todos.length;
        
        if (totalCount === 0) {
            this.taskCount.textContent = 'No tasks';
        } else if (activeCount === 0) {
            this.taskCount.textContent = 'All tasks completed!';
        } else {
            this.taskCount.textContent = `${activeCount} of ${totalCount} tasks remaining`;
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-size: 0.9rem;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

// Add some sample todos for demonstration
setTimeout(() => {
    if (todoApp.todos.length === 0) {
        const sampleTodos = [
            'Welcome to your Todo App!',
            'Click the checkbox to mark as complete',
            'Use the edit button to modify tasks',
            'Filter tasks using the buttons above'
        ];
        
        sampleTodos.forEach(text => {
            const todo = {
                id: Date.now() + Math.random(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            todoApp.todos.push(todo);
        });
        
        todoApp.saveToLocalStorage();
        todoApp.render();
    }
}, 1000); 