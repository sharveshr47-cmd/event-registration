document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. DATA INITIALIZATION & STATE MANAGEMENT
    // ==========================================

    // Mock initial events data. In a real app, this would come from a backend DB.
    const initialEvents = [
        { id: 'tech-summit', name: 'Global Tech Summit 2026', totalSeats: 150, availableSeats: 150 },
        { id: 'design-masterclass', name: 'UI/UX Masterclass', totalSeats: 50, availableSeats: 8 },  // Low seats for testing warning
        { id: 'crypto-con', name: 'Web3 & Crypto Con', totalSeats: 200, availableSeats: 200 },
        { id: 'ai-workshop', name: 'AI Engineering Workshop', totalSeats: 30, availableSeats: 0 }    // Full for testing prevent booking
    ];

    // Initialize LocalStorage Database
    let events = JSON.parse(localStorage.getItem('nexEvent_events'));
    if (!events) {
        events = initialEvents;
        localStorage.setItem('nexEvent_events', JSON.stringify(events));
    }

    let registrations = JSON.parse(localStorage.getItem('nexEvent_registrations')) || [];

    // Global State
    let isFormValid = false;
    let selectedEvent = null;

    // ==========================================
    // 2. DOM ELEMENTS
    // ==========================================

    // Form Elements
    const form = document.getElementById('registration-form');
    const nameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const eventSelect = document.getElementById('eventSelect');
    const seatsInput = document.getElementById('seats');
    const submitBtn = document.getElementById('submit-btn');
    const seatBadge = document.getElementById('seat-badge');
    
    // Modal Elements
    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    // Navigation & Sections
    const navRegister = document.getElementById('nav-register');
    const navAdmin = document.getElementById('nav-admin');
    const sectionRegister = document.getElementById('registration-section');
    const sectionAdmin = document.getElementById('admin-section');

    // Admin Elements
    const registrationsTbody = document.getElementById('registrations-tbody');
    const statTotalReg = document.getElementById('stat-total-reg');
    const statTotalSeats = document.getElementById('stat-total-seats');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');

    // ==========================================
    // 3. UI INITIALIZATION
    // ==========================================

    function populateEventDropdown() {
        // Reset dropdown
        eventSelect.innerHTML = '<option value="" disabled selected>Choose an event...</option>';
        
        events.forEach(ev => {
            const option = document.createElement('option');
            option.value = ev.id;
            option.textContent = ev.name;
            
            // Prevent selection if sold out
            if (ev.availableSeats === 0) {
                option.disabled = true;
                option.textContent += ' (Sold Out)';
            }
            eventSelect.appendChild(option);
        });
    }

    populateEventDropdown();

    // ==========================================
    // 4. FORM VALIDATION LOGIC
    // ==========================================

    const validators = {
        fullName: (val) => {
            if (!val.trim()) return 'Name is required';
            if (val.trim().length < 3) return 'Name must be at least 3 characters';
            if (!/^[a-zA-Z\s]*$/.test(val)) return 'Name can only contain letters and spaces';
            return '';
        },
        email: (val) => {
            if (!val.trim()) return 'Email is required';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(val)) return 'Enter a valid email address';
            return '';
        },
        phone: (val) => {
            if (!val.trim()) return 'Phone number is required';
            const digitsOnly = val.replace(/\D/g, '');
            if (digitsOnly.length < 10 || digitsOnly.length > 15) return 'Enter a valid phone number (10-15 digits)';
            return '';
        },
        eventSelect: (val) => {
            if (!val) return 'Please select an event';
            return '';
        },
        seats: (val) => {
            const num = parseInt(val);
            if (isNaN(num) || num < 1) return 'Select at least 1 seat';
            if (selectedEvent) {
                if (num > selectedEvent.availableSeats) return `Only ${selectedEvent.availableSeats} seats available`;
            }
            return '';
        }
    };

    function showError(inputId, errorMsg) {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(`${inputId}-error`);
        
        if (errorMsg) {
            input.classList.add('input-error');
            errorSpan.textContent = errorMsg;
            return false;
        } else {
            input.classList.remove('input-error');
            errorSpan.textContent = '';
            return true;
        }
    }

    function checkFormValidity() {
        const isNameValid = validators.fullName(nameInput.value) === '';
        const isEmailValid = validators.email(emailInput.value) === '';
        const isPhoneValid = validators.phone(phoneInput.value) === '';
        const isEventValid = validators.eventSelect(eventSelect.value) === '';
        const isSeatsValid = validators.seats(seatsInput.value) === '';

        isFormValid = isNameValid && isEmailValid && isPhoneValid && isEventValid && isSeatsValid;
        submitBtn.disabled = !isFormValid;
    }

    // Attach real-time validation listeners
    [nameInput, emailInput, phoneInput].forEach(input => {
        input.addEventListener('input', (e) => {
            const error = validators[e.target.id](e.target.value);
            showError(e.target.id, error);
            checkFormValidity();
        });
        
        // Also validate on blur for better UX
        input.addEventListener('blur', (e) => {
            const error = validators[e.target.id](e.target.value);
            showError(e.target.id, error);
        });
    });

    // Event Selection Logic & Dynamic Seat Updates
    eventSelect.addEventListener('change', (e) => {
        selectedEvent = events.find(ev => ev.id === e.target.value);
        
        if (selectedEvent) {
            seatsInput.disabled = false;
            seatsInput.max = selectedEvent.availableSeats;
            
            // Dynamic badge updates
            if (selectedEvent.availableSeats > 15) {
                seatBadge.className = 'badge available';
                seatBadge.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${selectedEvent.availableSeats} Seats Available`;
            } else if (selectedEvent.availableSeats > 0) {
                seatBadge.className = 'badge low';
                seatBadge.innerHTML = `<i class="fa-solid fa-fire"></i> Hurry! Only ${selectedEvent.availableSeats} left`;
            } else {
                seatBadge.className = 'badge full';
                seatBadge.innerHTML = `<i class="fa-solid fa-times-circle"></i> Sold Out`;
                seatsInput.disabled = true;
            }

            showError('eventSelect', '');
            
            // Re-validate seats in case the previously entered number is now > available
            const seatError = validators.seats(seatsInput.value);
            showError('seats', seatError);
        }
        checkFormValidity();
    });

    seatsInput.addEventListener('input', (e) => {
        showError('seats', validators.seats(e.target.value));
        checkFormValidity();
    });

    // ==========================================
    // 5. FORM SUBMISSION
    // ==========================================

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        // UI Feedback: Show loading spinner
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = document.getElementById('loading-spinner');
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;

        // Simulate API network request
        setTimeout(() => {
            const seatsBooked = parseInt(seatsInput.value);
            
            // Generate unique booking ID
            const bookingId = 'NEX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            // Create registration object
            const registration = {
                id: bookingId,
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                eventId: selectedEvent.id,
                eventName: selectedEvent.name,
                seats: seatsBooked,
                date: new Date().toISOString()
            };

            // 1. Save to registrations DB
            registrations.push(registration);
            localStorage.setItem('nexEvent_registrations', JSON.stringify(registrations));

            // 2. Update Event Available Seats
            const eventIndex = events.findIndex(ev => ev.id === selectedEvent.id);
            events[eventIndex].availableSeats -= seatsBooked;
            localStorage.setItem('nexEvent_events', JSON.stringify(events));

            // Reset Button UI
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
            
            // Populate and Show Success Modal
            document.getElementById('booking-id-display').textContent = bookingId;
            document.getElementById('summary-name').textContent = registration.name;
            document.getElementById('summary-event').textContent = registration.eventName;
            document.getElementById('summary-seats').textContent = registration.seats;
            successModal.classList.remove('hidden');

            // Reset Form and State
            form.reset();
            seatsInput.disabled = true;
            seatBadge.className = 'badge';
            seatBadge.textContent = 'Select an event';
            selectedEvent = null;
            
            // Refresh Data to reflect new seat counts
            populateEventDropdown();
            checkFormValidity();
            
            // Background refresh of admin panel
            renderAdminDashboard();

        }, 1500); // 1.5s simulated delay
    });

    closeModalBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
    });

    // ==========================================
    // 6. NAVIGATION LOGIC
    // ==========================================

    navRegister.addEventListener('click', (e) => {
        e.preventDefault();
        // Update Nav
        navRegister.classList.add('active');
        navAdmin.classList.remove('active');
        // Update View
        sectionRegister.classList.add('active');
        sectionRegister.classList.remove('hidden');
        sectionAdmin.classList.remove('active');
        sectionAdmin.classList.add('hidden');
    });

    navAdmin.addEventListener('click', (e) => {
        e.preventDefault();
        // Update Nav
        navAdmin.classList.add('active');
        navRegister.classList.remove('active');
        // Update View
        sectionAdmin.classList.add('active');
        sectionAdmin.classList.remove('hidden');
        sectionRegister.classList.remove('active');
        sectionRegister.classList.add('hidden');
        
        // Ensure data is fresh when opening admin
        renderAdminDashboard();
    });

    // ==========================================
    // 7. ADMIN DASHBOARD & EXPORT
    // ==========================================

    function renderAdminDashboard() {
        registrationsTbody.innerHTML = '';
        let totalSeatsBooked = 0;

        // Sort by newest registration first
        const sortedRegs = [...registrations].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedRegs.forEach(reg => {
            totalSeatsBooked += reg.seats;
            const tr = document.createElement('tr');
            
            // Format date nicely
            const dateObj = new Date(reg.date);
            const dateStr = dateObj.toLocaleDateString();
            const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            tr.innerHTML = `
                <td><strong>${reg.id}</strong></td>
                <td>${reg.name}</td>
                <td>
                    <div>${reg.email}</div>
                    <div class="td-muted">${reg.phone}</div>
                </td>
                <td>${reg.eventName}</td>
                <td><span class="badge available" style="border:none;">${reg.seats}</span></td>
                <td>
                    <div>${dateStr}</div>
                    <div class="td-muted">${timeStr}</div>
                </td>
            `;
            registrationsTbody.appendChild(tr);
        });

        // Empty state
        if (sortedRegs.length === 0) {
            registrationsTbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        <i class="fa-regular fa-folder-open" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        No registrations found.
                    </td>
                </tr>
            `;
        }

        // Update statistics
        statTotalReg.textContent = registrations.length;
        statTotalSeats.textContent = totalSeatsBooked;
    }

    // CSV Export functionality
    exportCsvBtn.addEventListener('click', () => {
        if (registrations.length === 0) {
            alert("No registration data available to export.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add Headers
        csvContent += "Booking ID,Name,Email,Phone,Event Name,Seats Booked,Date Registered\n";
        
        // Add Rows
        registrations.forEach(reg => {
            const row = [
                reg.id,
                `"${reg.name}"`, // Wrap in quotes to safely handle commas in names
                reg.email,
                `'${reg.phone}'`, // Add quote to prevent Excel converting to scientific notation
                `"${reg.eventName}"`,
                reg.seats,
                `"${new Date(reg.date).toLocaleString()}"`
            ];
            csvContent += row.join(",") + "\n";
        });

        // Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `NexEvent_Registrations_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Reset Data (Useful for testing)
    clearDataBtn.addEventListener('click', () => {
        if (confirm("⚠️ WARNING: Are you sure you want to delete all registrations and reset event seats? This action cannot be undone.")) {
            // Clear LocalStorage
            localStorage.removeItem('nexEvent_registrations');
            localStorage.removeItem('nexEvent_events');
            
            // Reset state variables
            registrations = [];
            events = JSON.parse(JSON.stringify(initialEvents)); // Deep copy to prevent reference mutation
            
            // Re-save fresh events state
            localStorage.setItem('nexEvent_events', JSON.stringify(events));
            
            // Refresh UI
            populateEventDropdown();
            renderAdminDashboard();
            
            alert("✅ Data has been successfully reset to initial state.");
        }
    });
});
