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
// Form submission → Envoi au webhook Discord
const handleFormSubmit = async (event) => {
    event.preventDefault();

    const webhookURL = "https://discord.com/api/webhooks/1514344770317713428/WlkYxyvqe4Q7bJDX2MXgM2RCaPrJxhNak_iTEEZ04NY_5b6zUcI88eQZHSjduno6mwEr"; // Mets ton webhook ici

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;

    const payload = {
        username: "Omega Contact",
        embeds: [
            {
                title: "📩 Nouveau message du formulaire",
                color: 5814783,
                fields: [
                    { name: "👤 Nom", value: name, inline: true },
                    { name: "📧 Email", value: email, inline: true },
                    { name: "🎯 Sujet", value: subject },
                    { name: "💬 Message", value: message }
                ],
                timestamp: new Date().toISOString()
            }
        ]
    };

    try {
        const response = await fetch(webhookURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Erreur HTTP");
        }

        alert("Message envoyé avec succès !");
        event.target.reset();
    } catch (error) {
        console.error("Erreur lors de l’envoi du message :", error);
        alert("Erreur lors de l’envoi du message.");
    }
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

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

document.addEventListener('DOMContentLoaded', async () => {
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

        localStorage.setItem('userEmail', email);
        loginResult.textContent = `Bienvenue ! Redirection…`;
        setTimeout(() => {
            window.location.href = 'espace-utilisateur.html';
        }, 1100);
    };

    const initializeGoogleClient = () => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.initialize({
                client_id: '388955794215-jsh1ip7578kt53bagihestg7plf5lml6.apps.googleusercontent.com',
                callback: handleCredentialResponse,
                ux_mode: 'popup',
                auto_select: false,
                context: 'signin'
            });
            window.google.accounts.id.disableAutoSelect();
            
            // Render button with Google - this ensures popup displays correctly
            if (googleLoginButton) {
                window.google.accounts.id.renderButton(googleLoginButton, {
                    theme: 'dark',
                    size: 'large',
                    text: 'continue_with'
                });
                googleLoginButton.disabled = false;
            }
            
            return true;
        }
        return false;
    };

    let googleInitAttempts = 0;
    const tryInitializeGoogle = () => {
        const initialized = initializeGoogleClient();
        if (initialized) {
            return;
        }

        googleInitAttempts += 1;
        if (googleInitAttempts < 10) {
            setTimeout(tryInitializeGoogle, 300);
        } else if (loginResult) {
            loginResult.textContent = 'Erreur de chargement. Vérifiez votre connexion.';
        }
    };

    tryInitializeGoogle();


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
