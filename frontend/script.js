// --- ROLE BASED ACCESS CONTROL ---
const role = localStorage.getItem('role');
if (role !== 'user') {
    window.location.href = 'login.html';
}

window.logout = function() {
    localStorage.removeItem('role');
    window.location.href = 'login.html';
};

// --- Global State ---
let allProducts = [];
let cart = []; // Real Cart Array: { product_id, product_name, price, quantity }
const currentUserId = 1; // Assuming a logged in user ID 1
const storeId = 1; // Assuming a default store

// --- DOM References ---
const categoryListEl = document.getElementById('categoryList');
const productGridEl = document.getElementById('productGrid');
const searchInputEl = document.getElementById('searchInput');
const cartCountDisplay = document.getElementById('cartCount');

// Overlays & UI
const cartOverlay = document.getElementById('cartOverlay');
const ordersOverlay = document.getElementById('ordersOverlay');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalPriceEl = document.getElementById('cartTotalPrice');
const ordersListContainer = document.getElementById('ordersListContainer');

// Buttons
const cartButton = document.getElementById('cartButton');
const closeCartBtn = document.getElementById('closeCartBtn');
const myOrdersBtn = document.getElementById('myOrdersBtn');
const closeOrdersBtn = document.getElementById('closeOrdersBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const placeOrderBtn = document.getElementById('placeOrderBtn');

const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchMainProducts();
});

// --- 1. Fetch Categories (With DB Column Mapping) ---
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const result = await response.json();
        if (result.success && result.data) renderCategories(result.data);
        else categoryListEl.innerHTML = '<li>Error loading categories</li>';
    } catch (err) {
        categoryListEl.innerHTML = '<li>Cannot connect to backend server</li>';
    }
}

function renderCategories(categories) {
    categoryListEl.innerHTML = '<li onclick="fetchMainProducts()">All Items</li>';
    categories.forEach(category => {
        const li = document.createElement('li');
        // Part 1: Fix - use category_name and category_id
        li.textContent = category.category_name || category.name || `Category ${category.category_id}`;
        const catId = category.category_id || category.id;
        li.onclick = () => filterByCategoryAPI(catId);
        categoryListEl.appendChild(li);
    });
}

// --- 2. Fetch Products (With DB Column Mapping) ---
async function fetchMainProducts() {
    try {
        productGridEl.innerHTML = '<p>Loading products...</p>';
        const response = await fetch(`${API_BASE_URL}/products`);
        const result = await response.json();
        if (result.success && result.data) {
            allProducts = result.data;
            renderProducts(allProducts);
        } else productGridEl.innerHTML = '<p>No products found in database.</p>';
    } catch (err) {
        productGridEl.innerHTML = '<p>Could not fetch items. Make sure backend is running.</p>';
        console.error(err);
    }
}

async function filterByCategoryAPI(categoryId) {
    try {
        productGridEl.innerHTML = '<p>Loading products...</p>';
        const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}`);
        const result = await response.json();
        if (result.success && result.data) {
            allProducts = result.data;
            renderProducts(allProducts);
        } else productGridEl.innerHTML = '<p>No products exist in this category.</p>';
    } catch (err) {
        productGridEl.innerHTML = '<p>Error loading category.</p>';
    }
}

function renderProducts(productArray) {
    productGridEl.innerHTML = '';
    if (productArray.length === 0) {
        productGridEl.innerHTML = '<p>No items matched your search.</p>';
        return;
    }

    productArray.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Part 1: Fix - Handle exact column names mapped to fallback
        const pPrice = Number(product.price || 0);
        const pName = product.product_name || product.name || 'Unnamed Product';
        const pId = product.product_id || product.id;
        const pImage = product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
        
        // --- Stock Logic Update ---
        const pStock = product.stock !== undefined ? product.stock : 1; 
        const isExpired = product.expiry_date ? (new Date(product.expiry_date) < new Date()) : false;

        let stockHtml = `<span style="color:#27ae60; font-size:12px; font-weight:700;">${pStock} in stock</span>`;
        let btnHtml = `<button class="add-to-cart-btn" onclick="addToCart('${pId}', decodeURIComponent('${encodeURIComponent(pName)}'), ${pPrice})">Add to Cart +</button>`;
        
        if (pStock <= 0 || isExpired) {
            stockHtml = `<span style="color:#ef4444; font-size:12px; font-weight:700;">${isExpired ? 'Expired Item' : 'Out of Stock'}</span>`;
            btnHtml = `<button class="add-to-cart-btn" style="background:#f1f5f9; color:#94a3b8; border-color:#e2e8f0; cursor:not-allowed;" disabled>${isExpired ? 'Expired' : 'Out of Stock'}</button>`;
        }
        // --------------------------

        // Escape quotes aggressively just in case product names have apostrophes
        const cleanName = encodeURIComponent(pName);

        card.innerHTML = `
            <img class="product-image" src="${pImage}?v=${pId}" alt="${pName}" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'">
            <div class="product-name">${pName}</div>
            <div class="product-price">$${pPrice.toFixed(2)} <br/> ${stockHtml}</div>
            ${btnHtml}
        `;
        productGridEl.appendChild(card);
    });
}

// --- 3. Full Cart Array System ---
window.addToCart = function (productId, productName, price) {
    // Check if item exists in cart array
    const existingItem = cart.find(item => item.product_id == productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            product_id: parseInt(productId),
            product_name: productName,
            price: Number(price),
            quantity: 1
        });
    }

    updateCartUI(); // Part 2 complete

    // Optional: open the cart automatically on add to give feedback
    cartOverlay.classList.add('active');
};

window.changeCartQty = function (productId, delta) {
    const item = cart.find(i => i.product_id == productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        window.removeFromCart(productId);
    } else {
        updateCartUI();
    }
};

window.removeFromCart = function (productId) {
    cart = cart.filter(item => item.product_id != productId); // Part 5 features
    updateCartUI();
};

function updateCartUI() {
    // 1. Calculate and update badge count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountDisplay.textContent = `(${totalItems})`;

    // 2. Calculate and update total cost
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPriceEl.textContent = totalPrice.toFixed(2);

    // 3. Render items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is totally empty. Add items to visualize them here.</p>';
        placeOrderBtn.disabled = true;
        placeOrderBtn.style.opacity = '0.5';
        return;
    }

    placeOrderBtn.disabled = false;
    placeOrderBtn.style.opacity = '1';

    let html = '';
    cart.forEach(item => {
        html += `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>${item.product_name}</h4>
                    <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="changeCartQty(${item.product_id}, -1)">-</button>
                        <span style="font-weight:700; margin:0 5px;">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeCartQty(${item.product_id}, 1)">+</button>
                    </div>
                    <button class="remove-item-btn" onclick="removeFromCart(${item.product_id})">Remove Item</button>
                </div>
            </div>
        `;
    });
    cartItemsContainer.innerHTML = html;
}

// --- 4. Connect Cart to Orders API (POST) ---
placeOrderBtn.addEventListener('click', async () => {
    if (cart.length === 0) return alert('Your cart is empty!');

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const paymentMethod = document.getElementById('paymentMethod').value;

    // Body formatted precisely as requested (Part 3)
    const requestBody = {
        user_id: currentUserId,
        store_id: storeId,
        total_amount: parseFloat(totalAmount.toFixed(2)),
        items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
        }))
    };

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        const result = await response.json();

        if (result.success) {
            // After success (Part 3 completion)
            alert(`Order placed successfully!\nYour Payment Method: ${paymentMethod}\nOrder ID Tracking: ${result.orderId}\nDelivery Partner Assigned.`);
            cart = [];
            updateCartUI(); // Reset visual
            cartOverlay.classList.remove('active'); // Close panel
        } else {
            alert('Failed to place order: ' + result.message);
        }
    } catch (err) {
        alert('Server error connecting to backend API. Ensure node is running backend server.');
        console.error(err);
    }
});

// Part 5: "Clear Cart" Feature
clearCartBtn.addEventListener('click', () => {
    cart = [];
    updateCartUI();
});

// --- 5. User Orders Feature (GET API /api/orders/user/:id) ---
myOrdersBtn.addEventListener('click', async () => {
    ordersOverlay.classList.add('active');
    ordersOverlay.classList.add('modal-container'); // Centers it gracefully

    try {
        ordersListContainer.innerHTML = '<p>Locating your orders safely in the database...</p>';
        const response = await fetch(`${API_BASE_URL}/orders/user/${currentUserId}`); // Fetch from our new backend routing
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            let html = '';
            result.data.forEach(order => {
                // Formatting delivery and metadata (Part 6 Bonus included)
                const dateString = new Date((order.created_at || Date.now())).toLocaleString();
                const statusStr = order.status || 'Packed & Dispatched';
                let badgeColor = statusStr.includes('Pending') ? '#fff3cd' : '#e8f5e9';
                let badgeTextColor = statusStr.includes('Pending') ? '#856404' : '#2e7d32';

                html += `
                    <div class="order-card">
                        <div class="order-card-header">
                            <span>Order #${order.order_id || order.id}</span>
                            <span class="badge" style="background:${badgeColor}; color:${badgeTextColor}">${statusStr}</span>
                        </div>
                        <p style="margin-top:5px; font-weight:700;">Total Paid: $${Number(order.total_amount).toFixed(2)}</p>
                        <p style="font-size:13px; color:#777; margin-top:5px;">Ordered On: ${dateString}</p>
                        <p style="font-size:13px; color:#555; margin-top:5px;">📦 Delivery Partner: <b>Assigning Rider...</b></p>
                    </div>
                `;
            });
            ordersListContainer.innerHTML = html;
        } else {
            ordersListContainer.innerHTML = '<p>You have not placed any orders yet. Go shop!</p>';
        }
    } catch (err) {
        ordersListContainer.innerHTML = '<p>Could not load order history connecting to backend node server.</p>';
        console.error(err);
    }
});

// --- UI Toggles ---
cartButton.addEventListener('click', () => {
    updateCartUI(); // Re-render state to be safe
    cartOverlay.classList.add('active');
});

closeCartBtn.addEventListener('click', () => cartOverlay.classList.remove('active'));
closeOrdersBtn.addEventListener('click', () => ordersOverlay.classList.remove('active'));

// Overlay click to close
cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) cartOverlay.classList.remove('active');
});
ordersOverlay.addEventListener('click', (e) => {
    if (e.target === ordersOverlay) ordersOverlay.classList.remove('active');
});

// Search Filtering (Local/Client-Side)
searchInputEl.addEventListener('input', (e) => {
    const rawSearch = e.target.value.toLowerCase().trim();
    const resultingSearchHits = allProducts.filter(item => {
        const nameDisplay = item.product_name || item.name || '';
        return nameDisplay.toLowerCase().includes(rawSearch);
    });
    renderProducts(resultingSearchHits);
});
