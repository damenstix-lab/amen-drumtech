document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('repair-modal');
    const closeBtn = document.getElementById('close-repair-modal');
    const submitBtn = document.getElementById('submit-repair');
    const doneBtn = document.getElementById('repair-done-btn');
    const trackBtn = document.getElementById('track-btn');

    let selectedService = '';
    let selectedPrice = 0;

    // Book service buttons
    document.querySelectorAll('.book-service').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedService = btn.dataset.service;
            selectedPrice = parseInt(btn.dataset.price);

            document.getElementById('modal-service-name').textContent = selectedService;
            document.getElementById('modal-service-price').textContent = 'From ₦' + selectedPrice.toLocaleString();

            // Set min date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('repair-date').min = today;

            resetRepairModal();
            modal.style.display = 'flex';
        });
    });

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    // Submit booking
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const name = document.getElementById('repair-name').value.trim();
            const phone = document.getElementById('repair-phone').value.trim();
            const email = document.getElementById('repair-email').value.trim();
            const equipment = document.getElementById('repair-equipment').value;
            const issue = document.getElementById('repair-issue').value.trim();
            const date = document.getElementById('repair-date').value;
            const option = document.getElementById('repair-option').value;

            if (!name || !phone || !email || !equipment || !issue || !date) {
                alert('Please fill in all fields');
                return;
            }

            // Show processing
            document.getElementById('repair-form').style.display = 'none';
            document.getElementById('repair-processing').style.display = 'block';

            // Simulate booking confirmation
            await new Promise(resolve => setTimeout(resolve, 2000));

            const ref = generateRepairRef();
            const totalPrice = option === 'pickup' ? selectedPrice + 3000 : selectedPrice;

            // Save booking
            const booking = {
                ref,
                service: selectedService,
                name,
                phone,
                email,
                equipment,
                issue,
                date,
                option,
                price: totalPrice,
                status: 'confirmed',
                createdAt: new Date().toISOString()
            };

            saveRepairBooking(booking);

            // Show success
            document.getElementById('repair-processing').style.display = 'none';
            document.getElementById('repair-success').style.display = 'block';
            document.getElementById('repair-ref').textContent = ref;
            document.getElementById('booking-summary').innerHTML = `
                <div class="summary-details">
                    <p><strong>Service:</strong> ${selectedService}</p>
                    <p><strong>Date:</strong> ${formatDate(date)}</p>
                    <p><strong>Option:</strong> ${option === 'pickup' ? 'Pickup (+₦3,000)' : 'Drop-off at workshop'}</p>
                    <p><strong>Est. Cost:</strong> From ₦${totalPrice.toLocaleString()}</p>
                </div>
            `;
        });
    }

    // Done button
    if (doneBtn) {
        doneBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Track repair
    if (trackBtn) {
        trackBtn.addEventListener('click', () => {
            const input = document.getElementById('tracking-input').value.trim().toUpperCase();
            const resultEl = document.getElementById('tracking-result');

            if (!input) {
                alert('Please enter a booking reference');
                return;
            }

            const bookings = JSON.parse(localStorage.getItem('amen_repairs')) || [];
            const booking = bookings.find(b => b.ref === input);

            if (booking) {
                resultEl.style.display = 'block';
                const statusText = getStatusText(booking.status);
                document.getElementById('track-status-text').textContent = statusText;
                document.getElementById('track-details').innerHTML = `
                    <p><strong>Service:</strong> ${booking.service}</p>
                    <p><strong>Equipment:</strong> ${getEquipmentLabel(booking.equipment)}</p>
                    <p><strong>Booked:</strong> ${formatDate(booking.date)}</p>
                    <p><strong>Status:</strong> ${statusText}</p>
                    <p><strong>Est. Cost:</strong> From ₦${booking.price.toLocaleString()}</p>
                `;
                resultEl.className = 'tracking-result status-' + booking.status;
            } else {
                resultEl.style.display = 'block';
                document.getElementById('track-status-text').textContent = 'Booking not found';
                document.getElementById('track-details').innerHTML = `
                    <p>No booking found with reference <strong>${input}</strong>. Please check the reference and try again.</p>
                `;
                resultEl.className = 'tracking-result status-not-found';
            }
        });
    }
});

function generateRepairRef() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let ref = 'REP-';
    for (let i = 0; i < 6; i++) {
        ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
}

function saveRepairBooking(booking) {
    const bookings = JSON.parse(localStorage.getItem('amen_repairs')) || [];
    bookings.unshift(booking);
    localStorage.setItem('amen_repairs', JSON.stringify(bookings));
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusText(status) {
    const statuses = {
        confirmed: 'Booking Confirmed - Awaiting Drop-off',
        received: 'Equipment Received - Diagnosis in Progress',
        in_progress: 'Repair In Progress',
        completed: 'Repair Completed - Ready for Pickup',
        collected: 'Collected'
    };
    return statuses[status] || status;
}

function getEquipmentLabel(val) {
    const labels = {
        'acoustic-kit': 'Acoustic Drum Kit',
        'electronic-kit': 'Electronic Drum Kit',
        'snare': 'Snare Drum',
        'bass': 'Bass Drum',
        'cymbals': 'Cymbals',
        'pedal': 'Pedal/Hardware',
        'other': 'Other'
    };
    return labels[val] || val;
}

function resetRepairModal() {
    document.getElementById('repair-form').style.display = 'block';
    document.getElementById('repair-processing').style.display = 'none';
    document.getElementById('repair-success').style.display = 'none';
    document.getElementById('repair-name').value = '';
    document.getElementById('repair-phone').value = '';
    document.getElementById('repair-email').value = '';
    document.getElementById('repair-equipment').value = '';
    document.getElementById('repair-issue').value = '';
    document.getElementById('repair-date').value = '';
    document.getElementById('repair-option').value = 'drop-off';
}
