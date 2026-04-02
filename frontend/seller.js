// --- ROLE BASED ACCESS CONTROL ---
const role = localStorage.getItem('role');
if (role !== 'seller') {
    window.location.href = 'login.html';
}

window.logout = function() {
    localStorage.removeItem('role');
    window.location.href = 'login.html';
};

const API_BASE = 'http://localhost:5000/api';

// --- UI Navigation ---
function switchView(viewId, element) {
    document.querySelectorAll('.admin-view').forEach(v => v.style.display = 'none');
    document.getElementById('view-' + viewId).style.display = 'block';

    if (element) {
        document.querySelectorAll('#adminNav li').forEach(li => li.classList.remove('active'));
        element.classList.add('active');
    }

    if (viewId === 'products') loadProducts();
    if (viewId === 'orders') loadOrders();
    if (viewId === 'payments') loadPayments();
}

// --- Modals ---
const productModal = document.getElementById('productModalOverlay');
function openProductModal(product = null) {
    document.getElementById('productForm').reset();
    document.getElementById('formProductId').value = '';
    document.getElementById('modalTitle').innerText = 'Add New Product';

    if (product) {
        document.getElementById('modalTitle').innerText = 'Edit Product';
        document.getElementById('formProductId').value = product.product_id || product.id;
        document.getElementById('formName').value = product.product_name || product.name || '';
        document.getElementById('formPrice').value = product.price || 0;
        document.getElementById('formStock').value = product.stock || 0;
        
        // Ensure date maps to valid input
        if (product.expiry_date) {
            document.getElementById('formExpiry').value = new Date(product.expiry_date).toISOString().split('T')[0];
        }
        document.getElementById('formImage').value = product.image_url || '';
    }

    productModal.classList.add('active');
}

function closeProductModal() {
    productModal.classList.remove('active');
}

// --- Form Submit (Add / Edit) API ---
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('formProductId').value;
    const isEdit = id !== '';

    const payload = {
        product_name: document.getElementById('formName').value,
        price: parseFloat(document.getElementById('formPrice').value),
        stock: parseInt(document.getElementById('formStock').value, 10),
        expiry_date: document.getElementById('formExpiry').value,
        image_url: document.getElementById('formImage').value || '',
        category_id: 1 // hardcoded to default category for basic addition
    };

    try {
        const url = isEdit ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        
        if(result.success) {
            closeProductModal();
            loadProducts();
            alert(isEdit ? 'Product updated successfully' : 'Product inserted into database');
        } else {
            alert('Database restriction: ' + result.message);
        }
    } catch(err) {
        alert('Server Error connecting to backend');
    }
});

// --- Data Fetchers ---
async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE}/products/admin`);
        const result = await res.json();
        const tbody = document.getElementById('adminProductsBody');
        tbody.innerHTML = '';

        if(result.success && result.data) {
            result.data.forEach(p => {
                const id = p.product_id || p.id;
                const name = p.product_name || p.name;
                const price = Number(p.price).toFixed(2);
                const stockStr = p.stock > 0 ? `<span class="text-success">${p.stock} Units</span>` : `<span class="text-danger">Out of Stock</span>`;
                
                let expiryStr = 'N/A';
                if (p.expiry_date) {
                    const dateObj = new Date(p.expiry_date);
                    const isExpired = dateObj < new Date();
                    expiryStr = `<span class="${isExpired ? 'text-danger' : 'text-success'}">${dateObj.toISOString().split('T')[0]}</span>`;
                }

                const productJson = JSON.stringify(p).replace(/'/g, "&#39;").replace(/"/g, "&quot;");

                tbody.innerHTML += `
                    <tr>
                        <td>#${id}</td>
                        <td><strong>${name}</strong></td>
                        <td>$${price}</td>
                        <td>${stockStr}</td>
                        <td>${expiryStr}</td>
                        <td>
                            <button class="edit-btn" onclick="openProductModal(${productJson})">Edit Details</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) { console.error(err); }
}

async function loadOrders() {
    try {
        const res = await fetch(`${API_BASE}/orders`);
        const result = await res.json();
        const tbody = document.getElementById('adminOrdersBody');
        tbody.innerHTML = '';

        if(result.success && result.data) {
            result.data.forEach(o => {
                const id = o.order_id || o.id;
                const status = o.status || 'Pending';
                
                tbody.innerHTML += `
                    <tr>
                        <td>#${id}</td>
                        <td>$${Number(o.total_amount).toFixed(2)}</td>
                        <td>${new Date(o.order_date || o.created_at || Date.now()).toLocaleDateString()}</td>
                        <td>
                            <select class="status-select" id="status-${id}">
                                <option value="Pending" ${status==='Pending'?'selected':''}>Pending</option>
                                <option value="Dispatched" ${status==='Dispatched'?'selected':''}>Dispatched</option>
                                <option value="Delivered" ${status==='Delivered'?'selected':''}>Delivered</option>
                            </select>
                        </td>
                        <td>
                            <button class="update-btn" onclick="updateOrderStatus(${id})">Save Status</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) { console.error(err); }
}

window.updateOrderStatus = async function(orderId) {
    const newStatus = document.getElementById(`status-${orderId}`).value;
    try {
        const res = await fetch(`${API_BASE}/delivery/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await res.json();
        if(result.success) alert(result.message);
    } catch (err) {
        alert('Failed to update status');
    }
}

async function loadPayments() {
    try {
        const res = await fetch(`${API_BASE}/payments`);
        const result = await res.json();
        const tbody = document.getElementById('adminPaymentsBody');
        tbody.innerHTML = '';

        if(result.success && result.data) {
            result.data.forEach(p => {
                const pId = p.payment_id || p.order_id;
                const payStatus = p.payment_status || 'Pending';
                
                tbody.innerHTML += `
                    <tr>
                        <td>#${pId}</td>
                        <td>$${Number(p.amount || p.total_amount || 0).toFixed(2)}</td>
                        <td>
                            <select class="status-select" id="pay-status-${pId}">
                                <option value="Pending" ${payStatus==='Pending'?'selected':''}>Pending</option>
                                <option value="Paid" ${payStatus==='Paid'?'selected':''}>Paid</option>
                            </select>
                        </td>
                        <td>
                            <button class="update-btn" onclick="updatePaymentMode(${pId})">Save</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) { console.error(err); }
}

window.updatePaymentMode = async function(paymentId) {
    const newStatus = document.getElementById(`pay-status-${paymentId}`).value;
    try {
        const res = await fetch(`${API_BASE}/payments/${paymentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await res.json();
        if(result.success) alert(result.message);
        else alert(result.message || 'Failed to update payment');
    } catch (err) {
        alert('Failed to update status');
    }
}

// Ensure load triggers properly
document.addEventListener('DOMContentLoaded', loadProducts);
