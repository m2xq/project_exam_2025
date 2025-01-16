// Переменные для текущей страницы и количества товаров на странице
let currentPage = 1;
const productsPerPage = 10; // Количество товаров на странице

// Функция загрузки товаров с сервера
async function fetchProducts(page = 1, sortOrder = 'rating_desc') {
    try {
        const response = await fetch(
            `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=8cb5a687-99f7-46d2-a245-d766fd202f58&page=${page}&per_page=${productsPerPage}&sort_order=${sortOrder}`
        );
        if (!response.ok) throw new Error('Ошибка сети');
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error.message);
        return null;
    }
}

// Рендер товаров
function renderProducts(products) {
    const container = document.querySelector('.product-container');
    container.innerHTML = ''; // Очищаем контейнер перед рендером новой страницы

    products.forEach(product => {
        const card = createCard(product);
        container.appendChild(card);
    });
}

// Создание карточки товара
function createCard(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');

    const img = document.createElement('img');
    img.src = product.image_url;
    img.alt = product.name;
    card.appendChild(img);

    const title = document.createElement('h2');
    title.textContent = product.name;
    card.appendChild(title);

    const priceContainer = document.createElement('div');
    priceContainer.classList.add('price-container');

    if (product.discount_price !== null) {
        const discountPrice = document.createElement('p');
        discountPrice.classList.add('price');
        discountPrice.textContent = `${product.discount_price} ₽`;
        priceContainer.appendChild(discountPrice);

        const actualPrice = document.createElement('p');
        actualPrice.classList.add('discount-price');
        actualPrice.textContent = `${product.actual_price} ₽`;
        priceContainer.appendChild(actualPrice);

        const discountPercent = document.createElement('p');
        discountPercent.classList.add('discount-percent');
        const percent = Math.round((1 - product.discount_price / product.actual_price) * 100);
        discountPercent.textContent = `-${percent}%`;
        priceContainer.appendChild(discountPercent);
    } else {
        const price = document.createElement('p');
        price.classList.add('price');
        price.textContent = `${product.actual_price} ₽`;
        priceContainer.appendChild(price);
    }

    card.appendChild(priceContainer);

    const rating = document.createElement('p');
    rating.textContent = `Рейтинг: ${product.rating}`;
    card.appendChild(rating);

    const button = document.createElement('button');
    button.textContent = 'Добавить';
    button.addEventListener('click', () => addToCart(product));
    card.appendChild(button);

    return card;
}

// Рендер панели навигации
function renderPagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(pagination.total_count / pagination.per_page);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('page-button');
        if (i === pagination.current_page) {
            pageButton.classList.add('active');
        }

        pageButton.addEventListener('click', () => {
            currentPage = i;
            loadPage();
        });

        paginationContainer.appendChild(pageButton);
    }
}

// Загрузка страницы
async function loadPage() {
    try {
        const sortOrder = document.getElementById('sort_order').value || 'rating_desc';
        const data = await fetchProducts(currentPage, sortOrder);
        if (data) {
            renderProducts(data.goods);
            renderPagination(data._pagination);
        }
    } catch (error) {
        console.error('Ошибка загрузки страницы:', error.message);
    }
}

// Обработчик сортировки
function handleSortChange() {
    const sortOrder = document.getElementById('sort_order').value;
    currentPage = 1; // Сбрасываем на первую страницу при изменении сортировки
    loadPage();
}

// Отображение уведомлений
function displayNotification(message, type = 'success') {
    const notificationContainer = document.getElementById('notification-container');
    notificationContainer.style.display = 'block';

    const notification = document.createElement('div');
    notification.classList.add('alert', `alert-${type}`, 'alert-dismissible', 'fade', 'show');
    notification.role = 'alert';

    const notificationMessage = document.createElement('span');
    notificationMessage.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.classList.add('btn-close');
    closeButton.setAttribute('data-bs-dismiss', 'alert');
    closeButton.setAttribute('aria-label', 'Close');

    notification.appendChild(notificationMessage);
    notification.appendChild(closeButton);
    notificationContainer.appendChild(notification);

    // Автоматическое удаление уведомления через 5 секунд
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 200); // Удаление после завершения анимации
        if (!notificationContainer.hasChildNodes()) {
            notificationContainer.style.display = 'none';
        }
    }, 5000);
}

function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (!cart.includes(product.id)) {
        cart.push(product.id);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayNotification(`Товар "${product.name}" добавлен в корзину`, 'success');
    } else {
        displayNotification(`Товар "${product.name}" уже в корзине`, 'warning');
    }
}

async function fetchProducts(page = 1, sortOrder = 'rating_desc') {
    try {
        const response = await fetch(
            `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=8cb5a687-99f7-46d2-a245-d766fd202f58&page=${page}&per_page=${productsPerPage}&sort_order=${sortOrder}`
        );
        if (!response.ok) throw new Error('Ошибка сети');
        return await response.json();
    } catch (error) {
        displayNotification('Ошибка загрузки товаров: ' + error.message, 'danger');
        throw error;
    }
}

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sort_order').addEventListener('change', handleSortChange);
    loadPage();
});
