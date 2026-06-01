// Navigation toggle for mobile
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    if (!burger || !nav) {
        return;
    }

    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 10 + 0.15}s`;
            }
        });
        burger.classList.toggle('toggle');
    });
};

// Form submission
const handleFormSubmit = (event) => {
    event.preventDefault();
    alert('Merci pour votre message ! Nous vous contacterons bientôt.');
    event.target.reset();
};

// Scroll reveal animations
const scrollAnimations = () => {
    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature, .content, .game-card, .entity, .contact-info, .hero-content').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        observer.observe(el);
    });
};

const staffEmails = [
    'admin@omega.dev',
    'staff@omega.dev',
    'support@omega.dev',
    'team@omega.dev'
];

const isStaffEmail = (email) => {
    return staffEmails.includes(email.toLowerCase());
};

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

document.addEventListener('DOMContentLoaded', () => {
    navSlide();
    scrollAnimations();

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    const loginResult = document.getElementById('login-result');
    const googleLoginButton = document.getElementById('google-login');

    const handleCredentialResponse = (response) => {
        if (!response || !response.credential) {
            loginResult.textContent = 'Erreur de connexion Google. Réessayez.';
            return;
        }

        const parseJwt = (token) => {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        };

        const payload = parseJwt(response.credential);
        const email = payload.email?.toLowerCase() || '';

        if (!email) {
            loginResult.textContent = 'Impossible de récupérer l’email Google. Vérifiez votre compte et réessayez.';
            return;
        }

        if (isStaffEmail(email)) {
            loginResult.textContent = `Bienvenue Staff (${email}) ! Accès au Panel Staff activé.`;
        } else {
            loginResult.textContent = `Bienvenue Utilisateur (${email}) ! Espace Utilisateur disponible.`;
        }
    };

    if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
            client_id: '388955794215-jsh1ip7578kt53bagihestg7plf5lml6.apps.googleusercontent.com',
            callback: handleCredentialResponse,
            ux_mode: 'popup'
        });
        window.google.accounts.id.disableAutoSelect();
    }

    if (googleLoginButton && loginResult) {
        googleLoginButton.addEventListener('click', () => {
            if (window.google && window.google.accounts && window.google.accounts.id) {
                window.google.accounts.id.prompt();
            } else {
                loginResult.textContent = 'Le client Google n’est pas encore chargé. Rechargez la page et réessayez.';
            }
        });
    }
});

const style = document.createElement('style');
style.textContent = `
@keyframes navLinkFade {
    from {
        opacity: 0;
        transform: translateX(30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
`;
document.head.appendChild(style);
