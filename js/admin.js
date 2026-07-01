document.addEventListener('DOMContentLoaded', () => {
    // Quick payout from dashboard
    const quickPayoutBtn = document.getElementById('quick-payout-btn');
    if (quickPayoutBtn) {
        quickPayoutBtn.addEventListener('click', async () => {
            const vendor = document.getElementById('quick-vendor').value;
            const amount = document.getElementById('quick-amount').value;
            const note = document.getElementById('quick-note').value;

            if (!vendor || !amount) {
                alert('Please select a vendor and enter an amount');
                return;
            }

            const vendorData = getVendorData(vendor);
            quickPayoutBtn.textContent = 'Processing...';
            quickPayoutBtn.disabled = true;

            try {
                const result = await opay.initiateTransfer({
                    vendorName: vendorData.name,
                    accountNumber: vendorData.account,
                    amount: parseInt(amount),
                    description: note || 'Vendor payout'
                });

                if (result.success) {
                    alert(`Payout successful!\n\n${result.message}\nRef: ${result.orderNo}`);
                    document.getElementById('quick-amount').value = '';
                    document.getElementById('quick-note').value = '';
                    document.getElementById('quick-vendor').value = '';

                    savePayout({
                        ref: result.orderNo,
                        vendor: vendorData.name,
                        amount: parseInt(amount),
                        date: new Date().toISOString(),
                        status: 'completed'
                    });
                }
            } catch (error) {
                alert('Payout failed. Please try again.');
            }

            quickPayoutBtn.textContent = 'Send via OPay';
            quickPayoutBtn.disabled = false;
        });
    }

    // Load dynamic order count from localStorage
    loadDashboardStats();
});

function getVendorData(vendorId) {
    const vendors = {
        v1: { name: 'DrumWorks Nigeria', account: '8012345678' },
        v2: { name: 'BeatMaker Supplies', account: '9023456789' },
        v3: { name: 'Stick & Stone Ltd', account: '7034567890' },
        v4: { name: 'Lagos Percussion Co', account: '8145678901' }
    };
    return vendors[vendorId] || {};
}

function savePayout(payout) {
    const payouts = JSON.parse(localStorage.getItem('amen_payouts')) || [];
    payouts.unshift(payout);
    localStorage.setItem('amen_payouts', JSON.stringify(payouts));
}

function loadDashboardStats() {
    const orders = JSON.parse(localStorage.getItem('amen_orders')) || [];
    const payouts = JSON.parse(localStorage.getItem('amen_payouts')) || [];

    // Update order count if element exists
    const totalOrdersEl = document.getElementById('total-orders');
    if (totalOrdersEl && orders.length > 0) {
        totalOrdersEl.textContent = 156 + orders.length;
    }

    // Update revenue from new orders
    const revenueEl = document.getElementById('total-revenue');
    if (revenueEl && orders.length > 0) {
        const newRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const total = 2450000 + newRevenue;
        revenueEl.textContent = '₦' + total.toLocaleString();
    }
}
