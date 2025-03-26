// Animações e efeitos visuais
function showLoading() {
    const loadingSpinner = document.getElementById('loading-spinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingSpinner = document.getElementById('loading-spinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

// Animações de entrada e saída
function animateTaskEntry(element) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 50);
}

function animateTaskExit(element) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.transform = 'translateX(100px)';
    element.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        element.remove();
    }, 300);
}

// Feedback visual
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Estilos dinâmicos para notificações
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 5px;
        background-color: #4CAF50;
        color: white;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .notification.error {
        background-color: #f44336;
    }
    
    .notification.warning {
        background-color: #ff9800;
    }
`;

document.head.appendChild(style);

// Exportar funções para uso em script.js
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.animateTaskEntry = animateTaskEntry;
window.animateTaskExit = animateTaskExit;
window.showNotification = showNotification; 