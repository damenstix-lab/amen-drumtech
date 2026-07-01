class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('amen_cart')) || [];
        this.deliveryFee = 2500;
        this.updateCartCount();
    }

    addItem(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        const existing = this.items.find(item => item.id === productId);
        if (existing) {
            existing.qty += 1;
        } else {
            this.items.push({ ...product, qty: 1 });
        }

        this.save();
        this.updateCartCount();
        this.showNotification(`${product.name} added to cart!`);
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.updateCartCount();
    }

    updateQty(productId, delta) {
        const item = this.items.find(i => i.id === productId);
        if (!item) return;

        item.qty += delta;
        if (item.qty <= 0) {
            this.removeItem(productId);
            return;
        }

        this.save();
        this.updateCartCount();
    }

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }

    getTotal() {
        if (this.items.length === 0) return 0;
        return this.getSubtotal() + this.deliveryFee;
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.qty, 0);
    }

    clear() {
        this.items = [];
        this.save();
        this.updateCartCount();
    }

    save() {
        localStorage.setItem('amen_cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const countEl = document.getElementById('cart-count');
        if (countEl) {
            countEl.textContent = this.getItemCount();
        }
    }

    showNotification(message) {
        const existing = document.querySelector('.cart-notification');
        if (existing) existing.remove();

        const notif = document.createElement('div');
        notif.className = 'cart-notification';
        notif.innerHTML = `<span>&#10004;</span> ${message}`;
        notif.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #28a745;
            color: white;
            padding: 14px 24px;
            border-radius: 10px;
            font-weight: 500;
            z-index: 9999;
            animation: slideUp 0.3s ease;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    formatPrice(amount) {
        return '₦' + amount.toLocaleString();
    }
}

const cart = new Cart();
