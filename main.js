// Reveal Animations
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
revealElements.forEach(el => revealObserver.observe(el));

// Mouse Tracking Glow
document.querySelectorAll('.glow-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });
});

// Number Counter Animation
const animateCounters = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseFloat(counter.getAttribute('data-target'));
            if (isNaN(target)) return;
            
            const duration = 1500;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Number.isInteger(target) ? Math.ceil(current) : current.toFixed(1);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            };
            updateCounter();
            observer.unobserve(counter);
        }
    });
};
const counterObserver = new IntersectionObserver(animateCounters, { threshold: 0.5 });
document.querySelectorAll('.stat-counter').forEach(c => counterObserver.observe(c));

// Global Lead Capture Popup Logic (Safely checks if the form exists on the current page)
const popup = document.getElementById('automation-audit-popup');
if (popup) {
    let popupShown = false;
    function showPopup() {
        if (!popupShown) {
            popup.style.display = 'flex';
            popupShown = true;
        }
    }
    window.closePopup = function() {
        popup.style.display = 'none';
    }
    setTimeout(showPopup, 15000);
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 20) showPopup();
    });

    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const firstName = e.target[0].value;
            const email = e.target[1].value;
            try {
                const link = document.createElement('a');
                link.href = 'dubai-lead-blueprint.pdf';
                link.download = 'dubai-lead-blueprint.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                alert('Thank you! Your guide is downloading.');
                window.closePopup();
                fetch('https://hook.us2.make.com/8kec2dnxogj2pusai87ve7ecc5ba1d69', {
                    method: 'POST',
                    body: JSON.stringify({ name: firstName, email: email }),
                    headers: { 'Content-Type': 'application/json' }
                }).catch(error => console.error("Webhook failed silently:", error));
            } catch (error) {
                console.error("Form submission execution error:", error);
            }
        });
    }
}

// Formspree UI Bypass & Redirect with Data Passthrough
document.addEventListener("DOMContentLoaded", function() {
    const intakeForm = document.getElementById("intake-form");
    
    if (intakeForm) {
        intakeForm.addEventListener("submit", async function(event) {
            event.preventDefault(); 

            const data = new FormData(intakeForm);
            
            const submitBtn = intakeForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Routing Data...";
            submitBtn.disabled = true;

            fetch(intakeForm.action, {
                method: intakeForm.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    // Success! Pack name, email, AND the bottleneck text into the URL
                    const userName = data.get("name") || "";
                    const userEmail = data.get("email") || "";
                    const userBottleneck = data.get("bottleneck") || ""; // Grabs your exact textarea
                    
                    const params = new URLSearchParams({ 
                        name: userName, 
                        email: userEmail,
                        bottleneck: userBottleneck 
                    });
                    window.location.href = "thanks.html?" + params.toString();
                } else {
                    submitBtn.innerText = "Error. Try Again.";
                    submitBtn.disabled = false;
                    setTimeout(() => { submitBtn.innerText = originalText; }, 3000);
                }
            }).catch(error => {
                console.error("Routing Error:", error);
            });
        });
    }
});
