document.addEventListener('DOMContentLoaded', async () => {
    const date = document.getElementById('delivery_date');
    date.valueAsDate = new Date();  
    document.getElementById('order-form').addEventListener('submit', submitOrder);
    document.getElementById('order-form').addEventListener('reset', resetOrder);
    document.getElementById('order-form').addEventListener('change', updatePrice);

    const products = await fetchProducts();
    await populateCards(products); 
});

async function fetchProducts() {
    const response = await fetch('https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=8cb5a687-99f7-46d2-a245-d766fd202f58');
    return await response.json();
}

async function populateCards(products) {
    const container = document.querySelector('.product-container');
    const productIds = await getCartItems();
    
    let totalPrice = 0;

    // Проверяем, есть ли товары в корзине
    if (productIds.length === 0) {
        container.textContent = "В корзине нет товаров.";
        return;
    }

    // Добавляем карточки для каждого товара
    for (const product of products) {
        if (productIds.includes(product.id)) {
            const card = await createCard(product);
            container.appendChild(card);
            
            totalPrice += product.discount_price ? product.discount_price : product.actual_price;
        }
    }
    await updatePrice();
}


async function createCard(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');

    const img = document.createElement('img');
    img.src = product.image_url;
    card.appendChild(img);

    const infoDiv = document.createElement('div');
    card.appendChild(infoDiv);

    const title = document.createElement('h2');
    title.textContent = product.name;
    infoDiv.appendChild(title);

    const priceDiv = document.createElement('div');
    infoDiv.appendChild(priceDiv);
    if (product.discount_price !== null) {
        const price = document.createElement('p');
        price.textContent = `${product.discount_price} ₽`;
        priceDiv.appendChild(price);

        const discountPrice = document.createElement('p');
        discountPrice.textContent = `${product.actual_price} ₽`;
        priceDiv.appendChild(discountPrice);

        const discountPercent = document.createElement('p');
        discountPercent.textContent = `${-Math.round((1 - product.discount_price / product.actual_price) * 100)}%`;
        priceDiv.appendChild(discountPercent);
    } else {
        const price = document.createElement('p');
        price.textContent = `${product.actual_price} ₽`;
        priceDiv.appendChild(price);
    }

    const rating = document.createElement('p');
    rating.textContent = `Рейтинг: ${product.rating}`;
    infoDiv.appendChild(rating);

    const button = document.createElement('button');
    const handleProductClick = () => removeFromCart(product.id);
    button.addEventListener(`click`, handleProductClick);
    button.textContent = 'Удалить';
    infoDiv.appendChild(button);

    return card;
}

async function getCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

async function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.indexOf(id) !== -1) {
        cart.splice(cart.indexOf(id), 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        location.reload();
    } else {
        console.log(`Товар с ID ${id} не найден в корзине.`);
    }
}

async function updatePrice() {
    const products = await fetchProducts();
    const productIds = await getCartItems();
    let orderPrice = 0;
    let deliveryPrice = 200;

    products.forEach(async (product) => {
        if (productIds.includes(product.id)) {    
            orderPrice += product.discount_price ? product.discount_price : product.actual_price;
        }
    });

    const date = new Date(document.getElementById('delivery_date').value);
    const interval = document.getElementById('delivery_interval').value;

    if (orderPrice === 0) {
        deliveryPrice = 0;
    } else if (date.getDay() === 0 || date.getDay() === 6) {
        deliveryPrice += 300;
    } else if (interval === '18:00-22:00') {
        deliveryPrice += 200;
    }

    const totalPriceElement = document.getElementById('total-price');
    const deliveryPriceElement = document.getElementById('delivery-price');

    totalPriceElement.textContent = `Итоговая стоимость: ${orderPrice + deliveryPrice} ₽`;
    deliveryPriceElement.textContent = `(стоимость доставки ${deliveryPrice} ₽)`;
}

async function submitOrder(e) {
    e.preventDefault();
    const form = document.getElementById('order-form');
    const formData = new FormData(form);
    const productIds = await getCartItems();
    productIds.forEach(async (id) => {
        formData.append('good_ids', id);
    });
    formData.set('delivery_date', formatDate(document.getElementById('delivery_date').value));
    formData.set('subscribe', document.getElementById('subscribe').value === 'on');

    const response = await fetch('https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=8cb5a687-99f7-46d2-a245-d766fd202f58', {
        method: 'POST',
        body: formData
    });
    if (response.status === 200) {
        await displayNotification('Заказ успешно оформлен');
        setTimeout(onOrderAccess, 3000);
    } else {
        await displayNotification('Ошибка оформления заказа');
    }
}

async function onOrderAccess() {
    window.localStorage.removeItem('cart');
    location.replace('index.html');
}

async function resetOrder() {
    window.localStorage.removeItem('cart');
    location.reload();
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
}

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

