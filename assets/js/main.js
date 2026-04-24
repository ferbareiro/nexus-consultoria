const body = document.body;
const header = document.querySelector(".site-header");
const hero = document.getElementById("hero");
const heroCard = document.querySelector(".hero-card");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const navLinks = document.querySelectorAll('a[href^="#"]');
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.getElementById("contact-form");
const submitButton = document.getElementById("submit-button");
const formStatus = document.getElementById("form-status");
const currentYear = document.getElementById("current-year");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

const updateHeaderState = () => {
    if (!header) {
        return;
    }

    header.classList.toggle("scrolled", window.scrollY > 16);
};

const closeMobileMenu = () => {
    if (!menuToggle || !mobileMenu) {
        return;
    }

    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    body.classList.remove("menu-open");
};

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isExpanded));
        mobileMenu.classList.toggle("is-open", !isExpanded);
        body.classList.toggle("menu-open", !isExpanded);
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        closeMobileMenu();
    });
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.16
});

revealItems.forEach((item) => {
    if (!item.classList.contains("is-visible")) {
        revealObserver.observe(item);
    }
});

const updateHeroSpotlight = (event) => {
    if (!hero) {
        return;
    }

    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    hero.style.setProperty("--hero-pointer-x", `${x}%`);
    hero.style.setProperty("--hero-pointer-y", `${y}%`);

    if (heroCard) {
        heroCard.style.setProperty("--spotlight-x", `${x}%`);
        heroCard.style.setProperty("--spotlight-y", `${Math.max(y - 8, 0)}%`);
    }
};

if (hero && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    hero.addEventListener("pointermove", updateHeroSpotlight);
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

const fields = contactForm ? [...contactForm.querySelectorAll("input, select, textarea")] : [];

const setStatus = (message, type) => {
    if (!formStatus) {
        return;
    }

    formStatus.textContent = message;
    formStatus.classList.remove("is-success", "is-error");

    if (type) {
        formStatus.classList.add(type === "success" ? "is-success" : "is-error");
    }
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validateField = (field) => {
    const value = field.value.trim();
    let valid = value !== "";

    if (valid && field.type === "email") {
        valid = isValidEmail(value);
    }

    field.setAttribute("aria-invalid", String(!valid));
    return valid;
};

fields.forEach((field) => {
    field.addEventListener("input", () => validateField(field));
    field.addEventListener("blur", () => validateField(field));
});

if (contactForm && submitButton) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const allValid = fields.every((field) => validateField(field));

        if (!allValid) {
            setStatus("Preencha todos os campos corretamente antes de enviar.", "error");
            const firstInvalid = fields.find((field) => field.getAttribute("aria-invalid") === "true");
            firstInvalid?.focus();
            return;
        }

        const formData = new FormData(contactForm);
        const name = String(formData.get("name")).trim();
        const email = String(formData.get("email")).trim();
        const service = String(formData.get("service")).trim();
        const message = String(formData.get("message")).trim();

        const whatsappMessage = [
            "Olá, Nexus Consultoria!",
            "",
            "Recebi interesse pelo site e gostaria de conversar.",
            "",
            `Nome: ${name}`,
            `E-mail: ${email}`,
            `Serviço: ${service}`,
            `Mensagem: ${message}`
        ].join("\n");

        submitButton.disabled = true;
        submitButton.textContent = "Preparando atendimento...";
        setStatus("Abrindo o WhatsApp com sua solicitação preenchida.", "success");

        window.setTimeout(() => {
            const targetUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(whatsappMessage)}`;
            window.open(targetUrl, "_blank", "noopener");

            submitButton.disabled = false;
            submitButton.textContent = "Enviar solicitação";
            contactForm.reset();
            fields.forEach((field) => field.setAttribute("aria-invalid", "false"));
            setStatus("Solicitação pronta. Se o WhatsApp não abrir, use o botão de contato direto.", "success");
        }, 450);
    });
}
