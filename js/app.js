// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (toggle) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Load featured products on homepage
    const featuredGrid = document.getElementById('featured-products');
    if (featuredGrid) {
        const featured = PRODUCTS.filter(p => p.badge).slice(0, 4);
        renderProducts(featured, featuredGrid);
    }

    // Load all products on products page
    const allGrid = document.getElementById('all-products');
    if (allGrid) {
        renderProducts(PRODUCTS, allGrid);
        setupFilters();
    }

    // Cart page
    if (document.getElementById('cart-items')) {
        renderCart();
        setupCheckout();
    }
});

function renderProducts(products, container) {
    container.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                ${product.emoji}
            </div>
            <div class="product-info">
                <p class="category">${getCategoryLabel(product.category)}</p>
                <h3>${product.name}</h3>
                <div class="product-price">
                    <span class="price">${cart.formatPrice(product.price)}</span>
                    <button class="btn-add-cart" onclick="cart.addItem(${product.id})">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

function getCategoryLabel(cat) {
    const labels = {
        kits: 'Drum Kits',
        electronic: 'Electronic',
        accessories: 'Accessories',
        sticks: 'Sticks & Mallets'
    };
    return labels[cat] || cat;
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const allGrid = document.getElementById('all-products');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.category;
            const filtered = category === 'all'
                ? PRODUCTS
                : PRODUCTS.filter(p => p.category === category);

            renderProducts(filtered, allGrid);
        });
    });
}

function renderCart() {
    const cartItemsEl = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCart = document.getElementById('empty-cart');

    if (cart.items.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';

    const itemsHTML = cart.items.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.emoji}</div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span class="item-price">${cart.formatPrice(item.price)}</span>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="updateCartItem(${item.id}, -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="updateCartItem(${item.id}, 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeCartItem(${item.id})">&#10005;</button>
        </div>
    `).join('');

    cartItemsEl.innerHTML = itemsHTML;

    document.getElementById('subtotal').textContent = cart.formatPrice(cart.getSubtotal());
    document.getElementById('delivery').textContent = cart.formatPrice(cart.deliveryFee);
    document.getElementById('total').textContent = cart.formatPrice(cart.getTotal());
}

function updateCartItem(id, delta) {
    cart.updateQty(id, delta);
    renderCart();
}

function removeCartItem(id) {
    cart.removeItem(id);
    renderCart();
}

function setupCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    const paymentModal = document.getElementById('payment-modal');
    const closeModal = document.getElementById('close-modal');
    const processBtn = document.getElementById('process-payment');

    if (!checkoutBtn) return;

    checkoutBtn.addEventListener('click', () => {
        if (cart.items.length === 0) return;
        document.getElementById('modal-total').textContent = cart.formatPrice(cart.getTotal());
        paymentModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        paymentModal.style.display = 'none';
    });

    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });

    processBtn.addEventListener('click', async () => {
        const name = document.getElementById('pay-name').value.trim();
        const email = document.getElementById('pay-email').value.trim();
        const phone = document.getElementById('pay-phone').value.trim();
        const address = document.getElementById('pay-address').value.trim();

        if (!name || !email || !phone || !address) {
            alert('Please fill in all fields');
            return;
        }

        // Show processing
        document.querySelector('.payment-form').style.display = 'none';
        document.getElementById('payment-processing').style.display = 'block';

        try {
            // Initialize OPay payment
            const initResult = await opay.initializePayment({
                name,
                email,
                phone,
                address,
                amount: cart.getTotal(),
                items: cart.items
            });

            if (initResult.success) {
                // Process payment
                const result = await opay.processPayment(initResult.reference);

                if (result.success) {
                    document.getElementById('payment-processing').style.display = 'none';
                    document.getElementById('payment-success').style.display = 'block';
                    document.getElementById('order-ref').textContent = result.transactionId;

                    // Save order
                    saveOrder({
                        ref: result.transactionId,
                        customer: { name, email, phone, address },
                        items: cart.items,
                        total: cart.getTotal(),
                        status: 'paid',
                        date: new Date().toISOString()
                    });

                    cart.clear();
                }
            }
        } catch (error) {
            alert('Payment failed. Please try again.');
            document.getElementById('payment-processing').style.display = 'none';
            document.querySelector('.payment-form').style.display = 'block';
        }
    });
}

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('amen_orders')) || [];
    orders.unshift(order);
    localStorage.setItem('amen_orders', JSON.stringify(orders));
}

// Add notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
