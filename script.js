let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editingIndex = null;
let currentFilter = 'all';
let notificationPermission = false;
let notificationInterval = null;

// Elementos do DOM
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const completedCount = document.getElementById('completedCount');
const filterSelect = document.getElementById('filterSelect');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const totalTasksSpan = document.getElementById('totalTasks');
const activeTasksSpan = document.getElementById('activeTasks');
const completedTasksSpan = document.getElementById('completedTasks');

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Atualizar ícone do tema
    const themeIcon = document.querySelector('.theme-toggle i');
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    // Carregar tarefas
    loadTasks();
    
    // Configurar notificações
    await setupNotifications();
    
    // Event listeners
    setupEventListeners();
});

// Configuração de Notificações
async function setupNotifications() {
    if (!('Notification' in window)) {
        console.log('Este navegador não suporta notificações');
        showNotification('Seu navegador não suporta notificações', 'error');
        return;
    }

    console.log('Status atual das notificações:', Notification.permission);

    if (Notification.permission === 'granted') {
        console.log('Permissão de notificações já concedida');
        notificationPermission = true;
        startNotificationCheck();
    } else if (Notification.permission !== 'denied') {
        console.log('Solicitando permissão de notificações...');
        const permission = await Notification.requestPermission();
        console.log('Resposta da solicitação:', permission);
        
        if (permission === 'granted') {
            console.log('Permissão concedida, iniciando verificações');
            notificationPermission = true;
            startNotificationCheck();
        } else {
            console.log('Permissão negada ou ignorada');
            showNotification('Permissão de notificações não concedida', 'error');
        }
    } else {
        console.log('Permissão de notificações negada anteriormente');
        showNotification('As notificações estão bloqueadas. Por favor, habilite-as nas configurações do navegador.', 'error');
    }
}

function startNotificationCheck() {
    console.log('Iniciando verificação de notificações');
    if (notificationInterval) {
        clearInterval(notificationInterval);
    }
    // Verificar a cada 5 segundos
    notificationInterval = setInterval(checkPendingTasks, 5 * 1000);
    const notificationBtn = document.querySelector('.notification-toggle');
    notificationBtn.classList.add('active');
    
    // Enviar notificação inicial
    checkPendingTasks();
}

function checkPendingTasks() {
    if (!notificationPermission) {
        console.log('Sem permissão para notificações');
        return;
    }

    const pendingTasks = tasks.filter(task => !task.completed);
    console.log('Tarefas pendentes:', pendingTasks.length);

    if (pendingTasks.length > 0) {
        console.log('Enviando notificação...');
        try {
            const notification = new Notification('Ryzem Task - Tarefas Pendentes', {
                body: `Você tem ${pendingTasks.length} tarefa${pendingTasks.length !== 1 ? 's' : ''} pendente${pendingTasks.length !== 1 ? 's' : ''}!`,
                icon: 'logo-ryzem_task.png',
                badge: 'logo-ryzem_task.png',
                tag: 'ryzem-task-notification',
                renotify: true,
                requireInteraction: true,
                silent: false,
                vibrate: [200, 100, 200]
            });

            notification.onclick = () => {
                console.log('Notificação clicada');
                window.focus();
            };

            notification.onclose = () => {
                console.log('Notificação fechada');
            };

            notification.onerror = (error) => {
                console.error('Erro na notificação:', error);
            };

            console.log('Notificação enviada com sucesso');
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
        }
    }
}

// Configuração de Event Listeners
function setupEventListeners() {
    // Adicionar tarefa com Enter
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addTask();
        }
    });

    addTaskBtn.addEventListener('click', () => {
        const text = taskInput.value.trim();
        if (!text) return;

        tasks.unshift({
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        });

        taskInput.value = '';
        saveTasks();
        loadTasks();
        showNotification('Tarefa adicionada com sucesso', 'success');
    });

    filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderTasks();
    });

    clearCompletedBtn.addEventListener('click', () => {
        if (!confirm('Tem certeza que deseja excluir todas as tarefas concluídas?')) {
            return;
        }

        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        loadTasks();
        showNotification('Tarefas concluídas excluídas com sucesso', 'success');
    });
}

function setFilter(filter) {
    currentFilter = filter;
    loadTasks();
}

function filterTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

function createTaskElement(task) {
        const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;

    const taskTextContainer = document.createElement('div');
    taskTextContainer.classList.add('task-text');

    if (editingIndex === tasks.indexOf(task)) {
            const editTextArea = document.createElement('textarea');
            editTextArea.value = task.text; 
            editTextArea.classList.add('edit-input');
            editTextArea.focus();
        
            editTextArea.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && event.shiftKey) {
                    event.preventDefault();
                saveTask(tasks.indexOf(task), editTextArea.value);
            }
        });
        
        taskTextContainer.appendChild(editTextArea);
    } else {
        taskTextContainer.innerHTML = task.text.replace(/\n/g, '<br>');
    }

    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('task-actions');

    if (editingIndex === tasks.indexOf(task)) {
            const saveButton = document.createElement('button');
            saveButton.classList.add('save');
        saveButton.innerHTML = '<i class="fas fa-save"></i> Salvar';
        saveButton.onclick = () => saveTask(tasks.indexOf(task), taskTextContainer.querySelector('textarea').value);

        const cancelButton = document.createElement('button');
        cancelButton.classList.add('remove');
        cancelButton.innerHTML = '<i class="fas fa-times"></i> Cancelar';
        cancelButton.onclick = () => {
            editingIndex = null;
            loadTasks();
        };

        actionsDiv.appendChild(saveButton);
        actionsDiv.appendChild(cancelButton);
    } else {
            const completeButton = document.createElement('button');
            completeButton.classList.add('complete');
        completeButton.innerHTML = `<i class="fas ${task.completed ? 'fa-times' : 'fa-check'}"></i> ${task.completed ? 'Desfazer' : 'Concluir'}`;
        completeButton.onclick = () => toggleCompletion(tasks.indexOf(task));

        const editButton = document.createElement('button');
        editButton.classList.add('edit');
        editButton.innerHTML = '<i class="fas fa-edit"></i> Editar';
        editButton.onclick = () => editTask(tasks.indexOf(task));

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('remove');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i> Excluir';
        deleteButton.onclick = () => deleteTask(tasks.indexOf(task));

        actionsDiv.appendChild(completeButton);
        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
    }

            li.appendChild(taskTextContainer);
    li.appendChild(actionsDiv);

    return li;
}

function loadTasks() {
    const filteredTasks = filterTasks();
    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="task-item" style="text-align: center; padding: 2rem;">
                <p style="color: var(--text-color); opacity: 0.7;">
                    Nenhuma tarefa ${currentFilter === 'active' ? 'ativa' : currentFilter === 'completed' ? 'concluída' : 'cadastrada'}.
                </p>
            </div>
        `;
    } else {
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }
    
    updateTaskStats();
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) {
        showNotification('Por favor, digite uma tarefa!', 'warning');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };

    // Adiciona a nova tarefa no início do array
    tasks.unshift(task);
    saveTasks();
    taskInput.value = '';
    loadTasks();
    showNotification('Tarefa adicionada com sucesso!', 'success');
}

function editTask(index) {
    editingIndex = index;
        loadTasks();
}

function saveTask(index, newText) {
    if (newText.trim() === '') {
        showNotification('A tarefa não pode estar vazia!', 'error');
        return;
    }

    tasks[index].text = newText;
    editingIndex = null;
    saveTasks();
        loadTasks();
    showNotification('Tarefa atualizada com sucesso!', 'success');
}

function deleteTask(index) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
        return;
    }

    tasks.splice(index, 1);
    saveTasks();
        loadTasks();
    showNotification('Tarefa excluída com sucesso!', 'success');
}

function toggleCompletion(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    loadTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTaskStats() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    const completedTasks = tasks.filter(task => task.completed).length;
    
    taskCount.textContent = `${activeTasks} tarefa${activeTasks !== 1 ? 's' : ''} pendente${activeTasks !== 1 ? 's' : ''}`;
    completedCount.textContent = `${completedTasks} concluída${completedTasks !== 1 ? 's' : ''}`;
}

function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.querySelector('.theme-toggle i');
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    showNotification(`Tema alterado para ${newTheme === 'dark' ? 'escuro' : 'claro'}!`, 'success');
}

function clearAllTasks() {
    if (!confirm('Tem certeza que deseja limpar todas as tarefas? Esta ação não pode ser desfeita.')) {
        return;
    }

    tasks = [];
    saveTasks();
    loadTasks();
    showNotification('Todas as tarefas foram removidas!', 'success');
    
    // Limpar notificações pendentes
    if (notificationInterval) {
        clearInterval(notificationInterval);
    }
}

async function toggleNotifications() {
    console.log('Tentando alternar notificações');
    if (!('Notification' in window)) {
        console.log('Navegador não suporta notificações');
        showNotification('Seu navegador não suporta notificações', 'error');
        return;
    }

    const notificationBtn = document.querySelector('.notification-toggle');
    
    if (Notification.permission === 'denied') {
        console.log('Permissão de notificações negada');
        showNotification('As notificações estão bloqueadas. Por favor, habilite-as nas configurações do navegador.', 'error');
        return;
    }

    if (Notification.permission === 'granted') {
        if (notificationInterval) {
            console.log('Desativando notificações');
            clearInterval(notificationInterval);
            notificationInterval = null;
            notificationBtn.classList.remove('active');
            showNotification('Notificações desativadas', 'success');
        } else {
            console.log('Ativando notificações');
            startNotificationCheck();
            showNotification('Notificações ativadas', 'success');
        }
    } else {
        console.log('Solicitando permissão de notificações');
        const permission = await Notification.requestPermission();
        console.log('Resposta da solicitação:', permission);
        
        if (permission === 'granted') {
            console.log('Permissão concedida, iniciando verificações');
            notificationPermission = true;
            startNotificationCheck();
            showNotification('Notificações ativadas', 'success');
        } else {
            console.log('Permissão negada ou ignorada');
            showNotification('Permissão de notificações não concedida', 'error');
        }
    }
}




