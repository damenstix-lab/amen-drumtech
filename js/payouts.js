document.addEventListener('DOMContentLoaded', () => {
    const newPayoutBtn = document.getElementById('new-payout-btn');
    const payoutModal = document.getElementById('payout-modal');
    const closePayoutModal = document.getElementById('close-payout-modal');
    const sendPayoutBtn = document.getElementById('send-payout-btn');
    const payoutDoneBtn = document.getElementById('payout-done-btn');
    const vendorSelect = document.getElementById('payout-vendor');
    const accountInput = document.getElementById('payout-account');

    const vendorAccounts = {
        v1: '8012345678',
        v2: '9023456789',
        v3: '7034567890',
        v4: '8145678901'
    };

    const vendorNames = {
        v1: 'DrumWorks Nigeria',
        v2: 'BeatMaker Supplies',
        v3: 'Stick & Stone Ltd',
        v4: 'Lagos Percussion Co'
    };

    // Open modal
    if (newPayoutBtn) {
        newPayoutBtn.addEventListener('click', () => {
            resetPayoutModal();
            payoutModal.style.display = 'flex';
        });
    }

    // Pay Now buttons in vendor table
    document.querySelectorAll('.payout-vendor').forEach(btn => {
        btn.addEventListener('click', () => {
            const vendorId = btn.dataset.vendor;
            resetPayoutModal();
            vendorSelect.value = vendorId;
            accountInput.value = vendorAccounts[vendorId] || '';
            payoutModal.style.display = 'flex';
        });
    });

    // Close modal
    if (closePayoutModal) {
        closePayoutModal.addEventListener('click', () => {
            payoutModal.style.display = 'none';
        });
    }

    if (payoutModal) {
        payoutModal.addEventListener('click', (e) => {
            if (e.target === payoutModal) payoutModal.style.display = 'none';
        });
    }

    // Auto-fill account on vendor select
    if (vendorSelect) {
        vendorSelect.addEventListener('change', () => {
            accountInput.value = vendorAccounts[vendorSelect.value] || '';
        });
    }

    // Send payout
    if (sendPayoutBtn) {
        sendPayoutBtn.addEventListener('click', async () => {
            const vendor = vendorSelect.value;
            const amount = document.getElementById('payout-amount').value;
            const desc = document.getElementById('payout-desc').value;
            const pin = document.getElementById('payout-pin').value;

            if (!vendor || !amount || !pin) {
                alert('Please fill in all required fields');
                return;
            }

            if (pin !== '1234') {
                alert('Invalid admin PIN. Use 1234 for demo.');
                return;
            }

            // Show processing
            document.getElementById('payout-form').style.display = 'none';
            document.getElementById('payout-processing').style.display = 'block';

            try {
                const result = await opay.initiateTransfer({
                    vendorName: vendorNames[vendor],
                    accountNumber: vendorAccounts[vendor],
                    amount: parseInt(amount),
                    description: desc || 'Vendor payout from Amen Drumtech'
                });

                if (result.success) {
                    document.getElementById('payout-processing').style.display = 'none';
                    document.getElementById('payout-success').style.display = 'block';
                    document.getElementById('payout-ref').textContent = result.orderNo;

                    // Save to history
                    addPayoutToHistory({
                        date: new Date().toISOString().split('T')[0],
                        vendor: vendorNames[vendor],
                        amount: parseInt(amount),
                        ref: result.orderNo,
                        status: 'completed'
                    });
                }
            } catch (error) {
                alert('Payout failed. Please try again.');
                document.getElementById('payout-processing').style.display = 'none';
                document.getElementById('payout-form').style.display = 'block';
            }
        });
    }

    // Done button
    if (payoutDoneBtn) {
        payoutDoneBtn.addEventListener('click', () => {
            payoutModal.style.display = 'none';
            location.reload();
        });
    }
});

function resetPayoutModal() {
    const form = document.getElementById('payout-form');
    const processing = document.getElementById('payout-processing');
    const success = document.getElementById('payout-success');

    if (form) form.style.display = 'block';
    if (processing) processing.style.display = 'none';
    if (success) success.style.display = 'none';

    const vendorSelect = document.getElementById('payout-vendor');
    const accountInput = document.getElementById('payout-account');
    const amountInput = document.getElementById('payout-amount');
    const descInput = document.getElementById('payout-desc');
    const pinInput = document.getElementById('payout-pin');

    if (vendorSelect) vendorSelect.value = '';
    if (accountInput) accountInput.value = '';
    if (amountInput) amountInput.value = '';
    if (descInput) descInput.value = '';
    if (pinInput) pinInput.value = '';
}

function addPayoutToHistory(payout) {
    const tbody = document.getElementById('payout-history');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${payout.date}</td>
        <td>${payout.vendor}</td>
        <td>₦${payout.amount.toLocaleString()}</td>
        <td>${payout.ref}</td>
        <td><span class="status paid">Completed</span></td>
    `;
    tbody.insertBefore(row, tbody.firstChild);

    // Also save to localStorage
    const payouts = JSON.parse(localStorage.getItem('amen_payouts')) || [];
    payouts.unshift(payout);
    localStorage.setItem('amen_payouts', JSON.stringify(payouts));
}
