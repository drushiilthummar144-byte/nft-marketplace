// Shared Components & Utilities

document.addEventListener('DOMContentLoaded', () => {
    // Initialize any global interactions
    initInputs();
    initScrollReveal();
});

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    // Fallback if browser doesn't support IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('active'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(reveal => observer.observe(reveal));
}

function initInputs() {
    const inputs = document.querySelectorAll('.glass-input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
}

// Simple Navigation Helper (if we were using a SPA approach, but we are using multi-page)
function navigateTo(url) {
    window.location.href = url;
}
