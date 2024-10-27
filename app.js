let tg = window.Telegram.WebApp;

tg.expand();
tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#2cab37';

let products = [];
let cart = new Map();

function loadProducts() {
    fetch('http://13.49.67.24:8080/api/products') 
        .then(response => response.json())
        .then(data => {
            products = data;
            displayProducts();
        })
        .catch(error => console.error('Error fetching products:', error));
}

function displayProducts() {
    const productContainer = document.getElementById('productContainer');
    productContainer.innerHTML = '';

    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.classList.add('item');

        const productImage = document.createElement('img');
        productImage.src = product.pathOfPhoto;
        productImage.classList.add('img');

        const productName = document.createElement('p');
        productName.innerText = product.name;

        const productPrice = document.createElement('p');
        productPrice.innerText = `${product.price} UAH`;

        const quantityContainer = document.createElement('div');
        quantityContainer.id = `quantity-container-${product.productId}`;
        quantityContainer.classList.add('quantity-container');

        if (cart.has(product.productId)) {
            createQuantityControls(quantityContainer, product.productId);
        } else {
            const addButton = document.createElement('button');
            addButton.classList.add('btn');
            addButton.innerText = 'ADD';
            addButton.onclick = () => addProduct(product.productId);
            quantityContainer.appendChild(addButton);
        }

        productItem.appendChild(productImage);
        productItem.appendChild(productName);
        productItem.appendChild(productPrice);
        productItem.appendChild(quantityContainer);
        productContainer.appendChild(productItem);
    });
}

function addProduct(productId) {
    cart.set(productId, 1);
    updateDisplay(productId);
    updateMainButton();
}

function createQuantityControls(container, productId) {
    const minusButton = document.createElement('button');
    minusButton.classList.add('btn');
    minusButton.innerText = '-';
    minusButton.onclick = () => updateQuantity(productId, -1);

    const quantityDisplay = document.createElement('span');
    quantityDisplay.id = `quantity-${productId}`;
    quantityDisplay.innerText = cart.get(productId) || 1;

    const plusButton = document.createElement('button');
    plusButton.classList.add('btn');
    plusButton.innerText = '+';
    plusButton.onclick = () => updateQuantity(productId, 1);

    container.appendChild(minusButton);
    container.appendChild(quantityDisplay);
    container.appendChild(plusButton);
}

function updateQuantity(productId, change) {
    if (cart.has(productId)) {
        let quantity = cart.get(productId) + change;
        if (quantity <= 0) {
            cart.delete(productId);
        } else {
            cart.set(productId, quantity);
        }
    } else if (change > 0) {
        cart.set(productId, change);
    }
    updateDisplay(productId);
    updateMainButton();
}

function updateDisplay(productId) {
    const quantityContainer = document.getElementById(`quantity-container-${productId}`);
    quantityContainer.innerHTML = '';
    if (cart.has(productId)) {
        createQuantityControls(quantityContainer, productId);
    } else {
        const addButton = document.createElement('button');
        addButton.classList.add('btn');
        addButton.innerText = 'ADD';
        addButton.onclick = () => addProduct(productId);
        quantityContainer.appendChild(addButton);
    }
}

function updateMainButton() {
    if (cart.size > 0) {
        tg.MainButton.setText('Next');
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

tg.MainButton.onClick(function() {
    // Show the date and time selection modal
    document.getElementById('dateTimeModal').style.display = 'block';
    tg.MainButton.setText('Submit Order');
});

// Close the modal when the user clicks on <span> (x)
document.querySelector('.close').onclick = function() {
    document.getElementById('dateTimeModal').style.display = 'none';
    tg.MainButton.setText('Next');
};

// Close the modal when the user clicks anywhere outside of the modal
window.onclick = function(event) {
    if (event.target == document.getElementById('dateTimeModal')) {
        document.getElementById('dateTimeModal').style.display = 'none';
        tg.MainButton.setText('Next');
    }
};

document.getElementById('submitOrderBtn').addEventListener('click', function() {
    const orderDate = document.getElementById('orderDate').value;
    const orderTime = document.getElementById('orderTime').value;
    if (!orderDate || !orderTime) {
        alert('Please select both date and time.');
        return;
    }

    const now = new Date();
    const selectedDateTime = new Date(`${orderDate}T${orderTime}:00`);
    if (selectedDateTime < now) {
        alert('Please select a future date and time.');
        return;
    }

    const localDateTime = `${orderDate}T${orderTime}:00`;
    const order = {
        chatId: tg.initDataUnsafe.user.id,
        productsId: Array.from(cart.entries()).map(([productId, quantity]) => {
            let obj = {};
            obj[productId] = quantity;
            return obj;
        }),
        localDateTime: localDateTime
    };

    fetch('http://13.49.67.24:8080/api/addOrder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    });
    showMessage('Order submitted successfully!', 'success');

});

function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.getElementById('message');

    messageElement.innerText = message;
    messageContainer.classList.remove('success', 'error');
    messageContainer.classList.add(type);
    messageContainer.style.display = 'block';

    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 3000);
}

document.addEventListener('DOMContentLoaded', loadProducts);

let usercard = document.getElementById('usercard');
let p = document.createElement('p');
p.innerText = `${tg.initDataUnsafe.user.first_name} ${tg.initDataUnsafe.user.last_name}`;
usercard.appendChild(p);
