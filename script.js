// Guppy Gems - Main JavaScript File
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeMobileMenu();
    initializeScrollToTop();
    initializeSmoothScrolling();
    initializeAIGenerator();
    initializeContactForm();
    initializeImagePlaceholders();
    updateCurrentYear();
});

// Mobile Menu Functionality
function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            
            // Animate the hamburger icon
            const svg = mobileMenuButton.querySelector('svg');
            if (mobileMenu.classList.contains('hidden')) {
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
            } else {
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
            }
        });
        
        // Close mobile menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                const svg = mobileMenuButton.querySelector('svg');
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
            });
        });
    }
}

// Scroll to Top Functionality
function initializeScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    
    if (scrollToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.style.display = 'block';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });
        
        // Smooth scroll to top when button is clicked
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Smooth Scrolling for Navigation Links
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// AI Guppy Description Generator
function initializeAIGenerator() {
    const generateBtn = document.getElementById('generate-description-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const generatedDescription = document.getElementById('generated-guppy-description');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', async function() {
            // Get form values
            const strainName = document.getElementById('guppy-strain-name').value.trim();
            const primaryColor = document.getElementById('guppy-primary-color').value.trim();
            const finType = document.getElementById('guppy-fin-type').value.trim();
            const temperament = document.getElementById('guppy-temperament').value.trim();
            const rarity = document.getElementById('guppy-rarity').value.trim();
            
            // Validate required fields
            if (!strainName || !primaryColor || !finType || !temperament) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            // Show loading state
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
            loadingIndicator.classList.remove('hidden');
            
            try {
                // Call the backend API
                const response = await fetch('/api/generate-description', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        strainName,
                        primaryColor,
                        finType,
                        temperament,
                        rarity
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Display the generated description
                    generatedDescription.textContent = result.description;
                    generatedDescription.style.fontStyle = 'normal';
                    
                    showNotification('Description generated successfully!', 'success');
                } else {
                    throw new Error(result.message || 'Failed to generate description');
                }
                
            } catch (error) {
                console.error('Error generating description:', error);
                showNotification('Error generating description. Please try again.', 'error');
            } finally {
                // Reset button state
                generateBtn.disabled = false;
                generateBtn.textContent = 'Generate Description ✨';
                loadingIndicator.classList.add('hidden');
            }
        });
    }
}

// Contact Form Handling
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Validate form
            if (!name || !email || !message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            try {
                // Call the backend API
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, message })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification(result.message || 'Thank you for your message! We\'ll get back to you soon.', 'success');
                    contactForm.reset();
                } else {
                    // Show validation errors if present
                    if (result.errors && Array.isArray(result.errors)) {
                        const messages = result.errors.map(e => e.msg).join(' ');
                        showNotification(messages, 'error');
                    } else {
                        showNotification(result.message || 'Failed to send message', 'error');
                    }
                }
                
            } catch (error) {
                console.error('Error submitting form:', error);
                showNotification('Error sending message. Please try again.', 'error');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    } else {
        console.error('Contact form not found');
    }
}

// Image Placeholder Handling
function initializeImagePlaceholders() {
    const images = document.querySelectorAll('.image-placeholder');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Image failed to load, placeholder is already set via onerror attribute
            console.log('Image failed to load:', this.src);
        });
        
        img.addEventListener('load', function() {
            // Image loaded successfully
            console.log('Image loaded successfully:', this.src);
        });
    });
}

// Utility Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    // Set colors based on type
    switch (type) {
        case 'success':
            notification.className += ' bg-green-500 text-white';
            break;
        case 'error':
            notification.className += ' bg-red-500 text-white';
            break;
        case 'warning':
            notification.className += ' bg-yellow-500 text-black';
            break;
        default:
            notification.className += ' bg-blue-500 text-white';
    }
    
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function updateCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Add some interactive enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation to cards
    const cards = document.querySelectorAll('.card-hover');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
    
    // Add focus styles for better accessibility
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #00BCD4';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
});

// Performance optimization: Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
