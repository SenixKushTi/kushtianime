// ========================================
// 🎨 НОВЫЙ МОДУЛЬ УТИЛИТ (UI)
// ========================================
// Все вспомогательные функции для UI

// ========================================
// TOAST УВЕДОМЛЕНИЯ
// ========================================
export function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    toast.innerHTML = `<i class="fas fa-${icon} mr-2"></i>${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
// ========================================
export function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        if (icon) icon.className = 'fas fa-sun text-custom-primary';
    } else {
        if (icon) icon.className = 'fas fa-moon text-custom-primary';
    }
}

export function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        if (icon) icon.className = 'fas fa-moon text-custom-primary';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-mode');
        if (icon) icon.className = 'fas fa-sun text-custom-primary';
        localStorage.setItem('theme', 'light');
    }
}

// ========================================
// ЭКРАНИРОВАНИЕ HTML
// ========================================
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// ФОРМАТИРОВАНИЕ ДАТЫ
// ========================================
export function formatDate(timestamp, locale = 'kk-KZ') {
    try {
        return new Date(timestamp).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Дата қатесі';
    }
}

// ========================================
// ФОРМАТИРОВАНИЕ ЧИСЕЛ
// ========================================
export function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// ========================================
// ПРОВЕРКА ВАЛИДНОСТИ USERNAME
// ========================================
export function validateUsername(username) {
    if (!username || username.trim().length === 0) {
        return { valid: false, error: 'Никнейм бос болмауы керек!' };
    }
    
    const trimmed = username.trim();
    
    if (trimmed.length < 3) {
        return { valid: false, error: 'Никнейм кемінде 3 символ болуы керек!' };
    }
    
    if (trimmed.length > 20) {
        return { valid: false, error: 'Никнейм 20 символдан аспауы керек!' };
    }
    
    // Разрешаем только буквы, цифры, подчеркивание
    if (!/^[a-zA-Zа-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ0-9_]+$/.test(trimmed)) {
        return { valid: false, error: 'Никнейм тек әріптер, цифрлар және _ болуы керек!' };
    }
    
    return { valid: true, username: trimmed };
}

// ========================================
// ПРОВЕРКА ВАЛИДНОСТИ EMAIL
// ========================================
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========================================
// ПРОВЕРКА ВАЛИДНОСТИ ПАРОЛЯ
// ========================================
export function validatePassword(password) {
    if (!password || password.length < 6) {
        return { valid: false, error: 'Құпия сөз кемінде 6 символ болуы керек!' };
    }
    
    return { valid: true };
}

// ========================================
// LOADER (ПОКАЗАТЬ/СКРЫТЬ)
// ========================================
export function showLoader(elementId = 'loading') {
    const loader = document.getElementById(elementId);
    if (loader) loader.classList.remove('hidden');
}

export function hideLoader(elementId = 'loading') {
    const loader = document.getElementById(elementId);
    if (loader) loader.classList.add('hidden');
}

// ========================================
// СКРОЛЛ К ЭЛЕМЕНТУ
// ========================================
export function scrollToElement(elementId, behavior = 'smooth') {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior, block: 'start' });
    }
}

// ========================================
// КОПИРОВАНИЕ В БУФЕР ОБМЕНА
// ========================================
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Көшірілді!', 'success');
        return true;
    } catch (error) {
        console.error('Copy to clipboard error:', error);
        showToast('Көшіру қатесі!', 'error');
        return false;
    }
}

// ========================================
// ДЕБАУНС (для поиска)
// ========================================
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// ПОЛУЧИТЬ URL ПАРАМЕТРЫ
// ========================================
export function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ========================================
// ОБНОВИТЬ URL БЕЗ ПЕРЕЗАГРУЗКИ
// ========================================
export function updateUrl(param, value) {
    const url = new URL(window.location);
    if (value) {
        url.searchParams.set(param, value);
    } else {
        url.searchParams.delete(param);
    }
    window.history.pushState({}, '', url);
}

// ========================================
// OFFLINE/ONLINE ИНДИКАТОР
// ========================================
export function initOfflineIndicator() {
    const banner = document.getElementById('offline-banner');
    
    window.addEventListener('online', () => {
        if (banner) banner.classList.add('hidden');
        showToast('Интернет байланысы қалпына келді!', 'success');
    });
    
    window.addEventListener('offline', () => {
        if (banner) banner.classList.remove('hidden');
    });
}

// ========================================
// КАТЕГОРИЯ ИКОНОК
// ========================================
export function getCategoryIcon(category) {
    const icons = {
        'anime': '🎌',
        'series': '📺',
        'dorama': '🎭',
        'movie': '🎬'
    };
    return icons[category] || '📽️';
}

// ========================================
// ЦВЕТА ДЛЯ ТЕМЫ
// ========================================
export function getThemeColors() {
    const isLight = document.body.classList.contains('light-mode');
    
    return {
        cardBg: isLight ? 'bg-white' : 'bg-zinc-900',
        cardBorder: isLight ? 'border-zinc-300' : 'border-zinc-700',
        textPrimary: isLight ? 'text-zinc-900' : 'text-white',
        textSecondary: isLight ? 'text-zinc-600' : 'text-zinc-400',
        hoverBorder: isLight ? 'hover:border-orange-400' : 'hover:border-orange-500'
    };
}

// ========================================
// TRUNCATE TEXT
// ========================================
export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ========================================
// ГЕНЕРАЦИЯ СЛУЧАЙНОГО ID
// ========================================
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// ========================================
// ПРОВЕРКА МОБИЛЬНОГО УСТРОЙСТВА
// ========================================
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ========================================
// ПЛАВНАЯ АНИМАЦИЯ ЧИСЕЛ
// ========================================
export function animateNumber(element, start, end, duration = 1000) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}
