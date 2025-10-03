// js/script.js
document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const dateInput = document.getElementById('date-input');
    const todosContainer = document.getElementById('todos-container');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    
    // State
    let currentStatusFilter = 'all';
    let currentDateFilter = 'all';
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    
    // Inisialisasi aplikasi
    function init() {
        renderTodos();
        setupEventListeners();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        todoForm.addEventListener('submit', handleAddTodo);
        statusFilter.addEventListener('change', handleStatusFilterChange);
        dateFilter.addEventListener('change', handleDateFilterChange);
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
    
    // Handle perubahan filter status
    function handleStatusFilterChange(e) {
        currentStatusFilter = e.target.value;
        renderTodos();
    }
    
    // Handle perubahan filter tanggal
    function handleDateFilterChange(e) {
        currentDateFilter = e.target.value;
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
    
    // Fungsi untuk menentukan kategori tanggal
    function getDateCategory(todoDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset ke awal hari
        const todo = new Date(todoDate);
        todo.setHours(0, 0, 0, 0);
        
        if (todo.getTime() === today.getTime()) {
            return 'today';
        } else if (todo < today) {
            return 'past';
        } else {
            return 'future';
        }
    }
    
    // Render todos berdasarkan filter status dan tanggal
    function renderTodos() {
        // Filter todos berdasarkan status
        let filteredTodos = todos.filter(todo => {
            if (currentStatusFilter === 'completed') {
                return todo.completed;
            } else if (currentStatusFilter === 'pending') {
                return !todo.completed;
            }
            return true; // all
        });
        
        // Filter lebih lanjut berdasarkan tanggal
        filteredTodos = filteredTodos.filter(todo => {
            if (currentDateFilter === 'all') {
                return true;
            }
            const category = getDateCategory(todo.date);
            return category === currentDateFilter;
        });
        
        // Kosongkan container
        todosContainer.innerHTML = '';
        
        // Tampilkan pesan jika tidak ada todos
        if (filteredTodos.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = getEmptyMessage();
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
    
    // Fungsi untuk pesan kosong berdasarkan filter
    function getEmptyMessage() {
        let message = 'Tidak ada tugas yang sesuai dengan filter.';
        
        if (currentStatusFilter !== 'all') {
            message = `Tidak ada tugas ${currentStatusFilter === 'completed' ? 'selesai' : 'belum selesai'}.`;
        }
        
        if (currentDateFilter !== 'all') {
            const dateText = currentDateFilter === 'today' ? 'hari ini' : 
                           currentDateFilter === 'past' ? 'yang lalu' : 'yang akan datang';
            if (currentStatusFilter === 'all') {
                message = `Tidak ada tugas untuk ${dateText}.`;
            } else {
                message += ` ${dateText}.`;
            }
        }
        
        if (currentStatusFilter === 'all' && currentDateFilter === 'all') {
            message = 'Belum ada tugas yang ditambahkan.';
        }
        
        return message;
    }
    
    // Jalankan aplikasi
    init();
});