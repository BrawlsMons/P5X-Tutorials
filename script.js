document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Mobile menu toggle (if needed for future mobile optimization)
    const navToggle = document.querySelector('.nav-toggle');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Add active class to current page navigation
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Table search functionality
    const searchInput = document.querySelector('.table-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('tbody tr');
            
            tableRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Weekly reset timer
    function updateTimer() {
        const now = new Date();
        
        // Get next Sunday at 5:00 AM JST
        const nextSunday = new Date(now);
        nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
        nextSunday.setHours(5, 0, 0, 0);
        
        // Convert to JST (UTC+9)
        const jstOffset = 9 * 60 * 60 * 1000;
        const nowUTC = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
        const nowJST = new Date(nowUTC + jstOffset);
        
        const nextSundayJST = new Date(nextSunday.getTime() + jstOffset);
        
        // If it's already past Sunday 5:00 AM JST this week, get next week
        if (nowJST > nextSundayJST) {
            nextSundayJST.setDate(nextSundayJST.getDate() + 7);
        }
        
        // Calculate time difference
        const timeDiff = nextSundayJST.getTime() - nowJST.getTime();
        
        if (timeDiff > 0) {
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            // Update timer display
            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            
            if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
        }
    }

    // Daily reset timer
    function updateDailyTimer() {
        const now = new Date();
        
        // Convert to JST (UTC+9)
        const jstOffset = 9 * 60 * 60 * 1000;
        const nowUTC = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
        const nowJST = new Date(nowUTC + jstOffset);
        
        // Get next 5:00 AM JST
        const nextReset = new Date(nowJST);
        nextReset.setHours(5, 0, 0, 0);
        
        // If it's already past 5:00 AM today, get tomorrow's reset
        if (nowJST.getHours() >= 5) {
            nextReset.setDate(nextReset.getDate() + 1);
        }
        
        // Calculate time difference
        const timeDiff = nextReset.getTime() - nowJST.getTime();
        
        if (timeDiff > 0) {
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            // Update daily timer display
            const dailyHoursEl = document.getElementById('daily-hours');
            const dailyMinutesEl = document.getElementById('daily-minutes');
            const dailySecondsEl = document.getElementById('daily-seconds');
            
            if (dailyHoursEl) dailyHoursEl.textContent = hours.toString().padStart(2, '0');
            if (dailyMinutesEl) dailyMinutesEl.textContent = minutes.toString().padStart(2, '0');
            if (dailySecondsEl) dailySecondsEl.textContent = seconds.toString().padStart(2, '0');
        }
    }

    // Update timers every second if timer elements exist
    if (document.getElementById('days')) {
        updateTimer();
        setInterval(updateTimer, 1000);
    }
    
    if (document.getElementById('daily-hours')) {
        updateDailyTimer();
        setInterval(updateDailyTimer, 1000);
    }

    // Mobile hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Handle dropdown clicks on mobile
        dropdowns.forEach(dropdown => {
            const dropdownToggle = dropdown.querySelector('.nav-link');
            dropdownToggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
});
