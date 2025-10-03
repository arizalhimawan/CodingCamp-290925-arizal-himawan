// js/script.js
document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const dateInput = document.getElementById('date-input');
    const todosContainer = document.getElementById('todos-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    
    // State
    let currentFilter = 'all';
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    
    // Inisialisasi aplikasi
    function init() {
        renderTodos();
        setupEventListeners();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        todoForm.addEventListener('submit', handleAddTodo);
        filterButtons.forEach(btn => {
            btn.addEventListener('click', handleFilterChange);
        });
        deleteAllBtn.addEventListener('click', handleDeleteAll);
    }
    
    // Handle tambah todo
    function handleAddTodo(e) {
        e.preventDefault();
        
        // Validasi input
        if (!todoInput.value.trim()) {
            alert('Silakan masukkan tugas!');
            return;
        }
        
        if (!dateInput.value) {
            alert('Silakan pilih tanggal!');
            return;
        }
        
        // Buat todo baru
        const newTodo = {
            id: Date.now(),
            text: todoInput.value.trim(),
            date: dateInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Tambahkan ke array dan simpan
        todos.push(newTodo);
        saveTodos();
        
        // Reset form
        todoInput.value = '';
        dateInput.value = '';
        
        // Render ulang
        renderTodos();
    }
    
    // Handle perubahan filter
    function handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        
        // Update state filter
        currentFilter = filter;
        
        // Update UI button active state
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        // Render ulang dengan filter baru
        renderTodos();
    }
    
    // Handle hapus semua
    function handleDeleteAll() {
        if (!todos.length) {
            alert('Tidak ada tugas untuk dihapus!');
            return;
        }
        
        if (confirm('Apakah Anda yakin ingin menghapus semua tugas?')) {
            todos = [];
            saveTodos();
            renderTodos();
        }
    }
    
    // Toggle status completed
    function toggleTodoStatus(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveTodos();
        renderTodos();
    }
    
    // Hapus todo individual
    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }
    
    // Simpan todos ke localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // Format tanggal untuk tampilan
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Render todos berdasarkan filter
    function renderTodos() {
        // Filter todos berdasarkan state currentFilter
        let filteredTodos = todos;
        
        if (currentFilter === 'completed') {
            filteredTodos = todos.filter(todo => todo.completed);
        } else if (currentFilter === 'pending') {
            filteredTodos = todos.filter(todo => !todo.completed);
        }
        
        // Kosongkan container
        todosContainer.innerHTML = '';
        
        // Tampilkan pesan jika tidak ada todos
        if (filteredTodos.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = currentFilter === 'all' 
                ? 'Belum ada tugas yang ditambahkan.' 
                : `Tidak ada tugas ${currentFilter === 'completed' ? 'selesai' : 'belum selesai'}.`;
            emptyMessage.classList.add('empty-message');
            todosContainer.appendChild(emptyMessage);
            return;
        }
        
        // Render todos
        filteredTodos.forEach(todo => {
            const todoElement = document.createElement('div');
            todoElement.classList.add('todo-item');
            if (todo.completed) {
                todoElement.classList.add('completed');
            }
            
            todoElement.innerHTML = `
                <div class="todo-content">
                    <span class="todo-text">${todo.text}</span>
                    <span class="todo-date">${formatDate(todo.date)}</span>
                </div>
                <div class="todo-actions">
                    <button class="toggle-btn">${todo.completed ? 'Batal' : 'Selesai'}</button>
                    <button class="delete-btn">Hapus</button>
                </div>
            `;
            
            // Tambahkan event listeners untuk tombol
            const toggleBtn = todoElement.querySelector('.toggle-btn');
            const deleteBtn = todoElement.querySelector('.delete-btn');
            
            toggleBtn.addEventListener('click', () => toggleTodoStatus(todo.id));
            deleteBtn.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
                    deleteTodo(todo.id);
                }
            });
            
            todosContainer.appendChild(todoElement);
        });
    }
    
    // Jalankan aplikasi
    init();
});