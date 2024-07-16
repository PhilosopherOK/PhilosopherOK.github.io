let tg = window.Telegram.WebApp;

tg.expand();

tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#2cab37';

let selectedItems = [];

// Функция для загрузки продуктов из API
function loadProducts() {
    fetch('http://localhost:8080/api/products')
        .then(response => response.json())
        .then(products => {
            const productsContainer = document.getElementById('productsContainer');
            products.forEach(product => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';

                const img = document.createElement('img');
                img.src = product.pathOfPhoto;
                img.alt = product.nameOfPosition;
                img.className = 'img';

                const btn = document.createElement('button');
                btn.className = 'btn';
                btn.innerText = `Add ${product.nameOfPosition}`;
                btn.addEventListener('click', function() {
                    toggleItemSelection(product.productId, product.nameOfPosition);
                });

                itemDiv.appendChild(img);
                itemDiv.appendChild(btn);
                productsContainer.appendChild(itemDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

// Функция для обработки выбора продукта
function toggleItemSelection(productId, productName) {
    const index = selectedItems.indexOf(productId);
    if (index > -1) {
        selectedItems.splice(index, 1);
        tg.MainButton.setText(`Removed ${productName}`);
    } else {
        selectedItems.push(productId);
        tg.MainButton.setText(`Selected ${productName}`);
    }

    if (selectedItems.length > 0) {
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

// Функция для отправки выбранных продуктов
function sendSelectedItems() {
    const chatId = tg.initDataUnsafe.user.id; // Телеграм ID пользователя
    const data = {
        chatId: chatId,
        productsId: selectedItems,
        localDateTime: new Date().toISOString() // Текущая дата и время
    };

    fetch('http://localhost:8080/api/addOrder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}

tg.onEvent('mainButtonClicked', function() {
    sendSelectedItems();
});

// Загружаем продукты при загрузке страницы
window.onload = loadProducts;

// Показ информации о пользователе
let usercard = document.getElementById("usercard");
let p = document.createElement("p");

p.innerText = `${tg.initDataUnsafe.user.first_name} ${tg.initDataUnsafe.user.last_name}`;
usercard.appendChild(p);