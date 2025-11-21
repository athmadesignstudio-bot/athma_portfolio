document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav a');

    mobileBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');

        // Animate hamburger icon
        const bars = mobileBtn.querySelectorAll('.bar');
        if (mobileNav.classList.contains('active')) {
            bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        }
    });

    // Close mobile menu when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            const bars = mobileBtn.querySelectorAll('.bar');
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        });
    });

    // Scroll Animations using Intersection Observer
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active-anim');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up, .reveal-up, .reveal-left, .reveal-right');
    animatedElements.forEach(el => observer.observe(el));

    // Smooth Scroll for Anchor Links (Polyfill-like behavior for older browsers if needed, but CSS scroll-behavior handles most)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Header Background on Scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
    });

    // Dynamic Portfolio Loading
    let portfolioData = [];
    let currentImageIndex = 0;

    const loadPortfolio = async () => {
        const grid = document.getElementById('portfolio-grid');
        if (!grid) return;

        try {
            const response = await fetch('data/portfolio.json');
            portfolioData = await response.json();

            portfolioData.forEach((item, index) => {
                const portfolioItem = document.createElement('div');
                portfolioItem.classList.add('portfolio-item', 'reveal-up');
                // Add delay based on index for staggered animation
                if (index > 0) {
                    portfolioItem.classList.add(`delay-${Math.min(index, 3)}`);
                }

                portfolioItem.innerHTML = `
                    <div class="portfolio-img" style="background-image: url('${item.image}'); background-size: cover; background-position: center;"></div>
                    <div class="portfolio-overlay">
                        <h3>${item.title}</h3>
                        <p>${item.category}</p>
                    </div>
                `;

                // Add click event to open lightbox
                portfolioItem.addEventListener('click', () => openLightbox(index));

                grid.appendChild(portfolioItem);

                // Observe the new element for animation
                observer.observe(portfolioItem);
            });
        } catch (error) {
            console.error('Error loading portfolio:', error);
            grid.innerHTML = '<p class="text-center">Failed to load portfolio items.</p>';
        }
    };

    loadPortfolio();

    // Lightbox Functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    function openLightbox(index) {
        currentImageIndex = index;
        showImage(currentImageIndex);
        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Disable scrolling
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable scrolling
    }

    function showImage(index) {
        if (index >= portfolioData.length) currentImageIndex = 0;
        if (index < 0) currentImageIndex = portfolioData.length - 1;

        lightboxImg.src = portfolioData[currentImageIndex].image;
    }

    function changeImage(n) {
        currentImageIndex += n;
        showImage(currentImageIndex);
    }

    // Event Listeners for Lightbox
    closeBtn.addEventListener('click', closeLightbox);

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        changeImage(-1);
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        changeImage(1);
    });

    // Close on outside click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'block') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') changeImage(-1);
            if (e.key === 'ArrowRight') changeImage(1);
        }
    });
});
