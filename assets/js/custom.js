document.addEventListener("DOMContentLoaded", function () {
    // Load Header and Footer - FIXED PATHS
    fetch("assets/components/header.html")
        .then(res => res.text())
        .then(data => {
            document.getElementById("headerPlaceholder").innerHTML = data;
            console.log('Header loaded successfully');

            const navLinks = document.querySelectorAll(".headerNav li a");

            // Set Home active by default on index.html
            const currentPath = window.location.pathname;
            if (currentPath.endsWith("/") || currentPath.endsWith("index.html")) {
                navLinks.forEach(link => {
                    if (link.textContent.trim().toLowerCase() === "home") {
                        link.classList.add("active");
                    }
                });
            }

            // ✅ FIXED: Responsive Sub Navigation Tab Function (Vanilla JS ONLY)
            document.querySelectorAll('#responsiveNav .dropdown > span').forEach(span => {
                span.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    const parentDropdown = this.parentElement;
                    const submenu = this.nextElementSibling; // the UL.subNavigation

                    // Close all other open submenus first
                    document.querySelectorAll('#responsiveNav .dropdown').forEach(dropdown => {
                        if (dropdown !== parentDropdown) {
                            dropdown.classList.remove('open');
                            const otherSubmenu = dropdown.querySelector('.subNavigation');
                            if (otherSubmenu) {
                                otherSubmenu.style.maxHeight = null; // collapse
                            }
                        }
                    });

                    // Toggle current dropdown
                    const isCurrentlyOpen = parentDropdown.classList.contains('open');

                    if (isCurrentlyOpen) {
                        // Close current dropdown
                        parentDropdown.classList.remove('open');
                        submenu.style.maxHeight = null;
                    } else {
                        // Open current dropdown
                        parentDropdown.classList.add('open');
                        submenu.style.maxHeight = submenu.scrollHeight + "px";
                    }
                });
            });

            // ✅ Hamburger Function (inside header .then)
            const hamburger = document.getElementById("hamburger");
            const bars = hamburger.querySelectorAll(".bar");
            const navMenu = document.querySelector("#responsiveNav");

            hamburger.addEventListener("click", () => {
                bars.forEach(bar => bar.classList.toggle("active"));
                navMenu.classList.toggle("open");
                // ✅ NEW: Toggle 'open' class on body to prevent scrolling
                document.body.classList.toggle("open");
            });

        })
        .catch(err => console.error('Error loading header:', err));

    fetch("assets/components/footer.html")
        .then(res => res.text())
        .then(data => {
            document.getElementById("footerPlaceholder").innerHTML = data;
            const yearSpan = document.getElementById("year");
            if (yearSpan) yearSpan.textContent = new Date().getFullYear();
            console.log('Footer loaded successfully');

            // Scroll To Top Function 
            const scrollBtn = document.getElementById("scrollToTop");
            if (scrollBtn) {
                scrollBtn.style.opacity = "0";
                scrollBtn.style.pointerEvents = "none"; // avoid clicks when hidden

                window.addEventListener("scroll", function () {
                    if (window.scrollY > 300) {
                        scrollBtn.style.opacity = "1";
                        scrollBtn.style.pointerEvents = "auto";
                    } else {
                        scrollBtn.style.opacity = "0";
                        scrollBtn.style.pointerEvents = "none";
                    }
                });

                scrollBtn.addEventListener("click", function () {
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                });
            }
        })
        .catch(err => console.error('Error loading footer:', err));

    // Delay for slider & counter initialization
    setTimeout(() => {
        initializeMainSlider();
        initializeShowcaseSlider();
        initializeCounter();
        animateProgressBars();
    }, 100);

    // Main Slider Logic (Hero/Banner Slider)
    function initializeMainSlider() {
        const track = document.querySelector('.sliderTrack');
        const slides = document.querySelectorAll('.slider');
        const prevBtn = document.querySelector('.my-prev');
        const nextBtn = document.querySelector('.my-next');
        const pagination = document.querySelector('.sliderPagination');

        console.log('Main Slider elements found:', {
            track: !!track,
            slides: slides.length,
            prevBtn: !!prevBtn,
            nextBtn: !!nextBtn,
            pagination: !!pagination
        });

        if (!track || !slides.length || !prevBtn || !nextBtn || !pagination) {
            console.error('Main slider elements not found');
            return;
        }

        const totalSlides = slides.length;
        let currentIndex = 0;
        let startX = 0;
        let isDragging = false;

        // Clear any existing pagination dots
        pagination.innerHTML = '';

        // Create pagination dots
        slides.forEach((_, i) => {
            const dot = document.createElement('span');
            if (i === 0) dot.classList.add('active');
            pagination.appendChild(dot);
        });

        const mainSliderDots = document.querySelectorAll('.sliderPagination span');

        function updateMainSlider() {
            // Each slide moves by exactly 25%
            const translateX = -currentIndex * 25;
            track.style.transform = `translateX(${translateX}%)`;

            // Update pagination
            mainSliderDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        // Navigation buttons
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearInterval(mainAutoSlideInterval); // Stop auto slide
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateMainSlider();
            startMainAutoSlide(); // Restart it
        });

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearInterval(mainAutoSlideInterval); // Stop auto slide
            currentIndex = (currentIndex + 1) % totalSlides;
            updateMainSlider();
            startMainAutoSlide(); // Restart it
        });

        // Pagination dots
        mainSliderDots.forEach((dot, i) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                clearInterval(mainAutoSlideInterval); // Stop auto slide
                console.log('Main slider dot clicked:', i);
                currentIndex = i;
                updateMainSlider();
                startMainAutoSlide(); // Restart it
            });
        });

        // Touch support for main slider
        track.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            isDragging = true;
            // Clear auto-slide when user interacts
            clearInterval(mainAutoSlideInterval);
        });

        track.addEventListener('touchmove', e => {
            if (!isDragging) return;
            e.preventDefault();
        });

        track.addEventListener('touchend', e => {
            if (!isDragging) return;

            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    currentIndex = (currentIndex + 1) % totalSlides;
                } else {
                    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                }
                updateMainSlider();
            }

            isDragging = false;
            // Restart auto-slide after touch interaction
            startMainAutoSlide();
        });

        // Auto-slide function for main slider
        let mainAutoSlideInterval;

        function startMainAutoSlide() {
            clearInterval(mainAutoSlideInterval); // Clear any existing interval
            mainAutoSlideInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateMainSlider();
            }, 5000);
        }

        // Pause on hover for main slider
        track.addEventListener('mouseenter', () => {
            clearInterval(mainAutoSlideInterval);
        });

        // Resume on mouse leave for main slider
        track.addEventListener('mouseleave', () => {
            startMainAutoSlide();
        });

        // Initialize Main Slider
        updateMainSlider();
        startMainAutoSlide();

        console.log('Main slider initialized successfully');
    }

    // ✅ Showcase Slider Class (fixed last-slide jump + proper edge bounce)
    class ShowcaseSlider {
        constructor() {
            this.slider = document.getElementById('showcaseSlider');
            this.track = document.getElementById('showcaseTrack');
            this.dotsContainer = document.getElementById('showcaseDots');

            if (!this.slider || !this.track || !this.dotsContainer) {
                console.log('Showcase slider elements not found - skipping initialization');
                return;
            }

            this.slides = Array.from(this.track.children);
            this.currentIndex = 0;
            this.totalSlides = this.slides.length;

            // Drag state
            this.isDragging = false;
            this.hasMoved = false;
            this.startX = 0;
            this.startY = 0;
            this.currentX = 0;
            this.initialTransform = 0;

            // Layout metrics
            this.slideWidth = 0;
            this.gap = 0;
            this.visibleCount = 1;
            this.lastStartIndex = 0;
            this.maxScroll = 0;

            this.measure();
            this.buildDots();
            this.addEvents();
            this.goToSlide(0, false);
        }

        measure() {
            if (!this.slides.length) return;

            const s0 = this.slides[0];
            const slideStyle = window.getComputedStyle(s0);
            const marginLeft = parseFloat(slideStyle.marginLeft) || 0;
            const marginRight = parseFloat(slideStyle.marginRight) || 0;
            const trackStyle = window.getComputedStyle(this.track);

            this.gap = parseFloat(trackStyle.gap) || 0;
            this.slideWidth = s0.offsetWidth + marginLeft + marginRight;
            const totalCard = this.slideWidth + this.gap;

            this.visibleCount = Math.max(
                1,
                Math.floor((this.slider.clientWidth + this.gap) / totalCard)
            );

            this.lastStartIndex = Math.max(0, this.totalSlides - this.visibleCount);
            this.maxScroll = Math.max(0, this.track.scrollWidth - this.slider.clientWidth);
        }

        getCurrentTranslateX() {
            const t = getComputedStyle(this.track).transform;
            if (t && t !== 'none') {
                const m = new DOMMatrixReadOnly(t);
                return m.m41;
            }
            return 0;
        }

        buildDots() {
            this.dotsContainer.innerHTML = '';
            this.groupSize = 4;
            this.totalGroups = Math.ceil(this.totalSlides / this.groupSize);

            for (let i = 0; i < this.totalGroups; i++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                dot.addEventListener('click', () => this.goToSlide(i * this.groupSize, true));
                this.dotsContainer.appendChild(dot);
            }
            this.updateDots();
        }

        updateDots() {
            const dots = this.dotsContainer.children;
            const activeGroup = Math.floor(this.currentIndex / this.groupSize);
            for (let i = 0; i < dots.length; i++) {
                dots[i].classList.toggle('active', i === activeGroup);
            }
        }

        addEvents() {
            this.track.addEventListener('mousedown', this.onDragStart.bind(this));
            this.track.addEventListener('touchstart', this.onDragStart.bind(this), { passive: true });

            document.addEventListener('mousemove', this.onDragMove.bind(this), { passive: false });
            document.addEventListener('touchmove', this.onDragMove.bind(this), { passive: false });

            document.addEventListener('mouseup', this.onDragEnd.bind(this));
            document.addEventListener('touchend', this.onDragEnd.bind(this));

            this.track.addEventListener('dragstart', e => e.preventDefault());

            window.addEventListener('resize', () => {
                this.measure();
                this.goToSlide(this.currentIndex, false);
            });
        }

        onDragStart(e) {
            this.isDragging = true;
            this.hasMoved = false;

            this.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
            this.startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

            this.initialTransform = this.getCurrentTranslateX();

            this.maxOffset = 0;
            this.minOffset = -this.maxScroll;

            this.track.style.transition = 'none';
            this.track.style.cursor = 'grabbing';
        }

        onDragMove(e) {
            if (!this.isDragging) return;

            this.currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

            const diffX = this.currentX - this.startX;
            const diffY = currentY - this.startY;

            // ✅ Only block vertical scroll if horizontal drag is stronger
            if (Math.abs(diffX) > Math.abs(diffY)) {
                e.preventDefault();
            }

            if (Math.abs(diffX) > 5) this.hasMoved = true;

            let newOffset = this.initialTransform + diffX;

            if (newOffset > this.maxOffset) {
                newOffset = this.maxOffset + (newOffset - this.maxOffset) * 0.25;
            } else if (newOffset < this.minOffset) {
                newOffset = this.minOffset + (newOffset - this.minOffset) * 0.25;
            }

            this.track.style.transform = `translateX(${newOffset}px)`;
        }

        onDragEnd() {
            if (!this.isDragging) return;
            this.isDragging = false;

            this.track.style.cursor = 'grab';
            this.track.style.transition = 'transform 0.4s cubic-bezier(.25,.75,.5,1.25)';

            if (!this.hasMoved) {
                this.goToSlide(this.currentIndex, true);
                return;
            }

            const diff = (this.currentX || this.startX) - this.startX;
            const threshold = Math.max(80, this.slideWidth * 0.2);

            if (diff > threshold && this.currentIndex > 0) {
                this.prevSlide();
            } else if (diff < -threshold && this.currentIndex < this.lastStartIndex) {
                this.nextSlide();
            } else {
                this.goToSlide(this.currentIndex, true);
            }
        }

        translateTo(index, animate = true) {
            const totalCard = this.slideWidth + this.gap;
            const clampedIndex = Math.max(0, Math.min(index, this.lastStartIndex));
            const desired = clampedIndex * totalCard;
            const clampedPx = Math.min(desired, this.maxScroll);

            this.track.style.transition = animate ? 'transform 1.5s ease' : 'none';
            this.track.style.transform = `translateX(-${clampedPx}px)`;
        }

        goToSlide(index, animate = true) {
            this.currentIndex = Math.max(0, Math.min(index, this.lastStartIndex));
            this.translateTo(this.currentIndex, animate);
            this.updateDots();
        }

        nextSlide() {
            if (this.currentIndex < this.lastStartIndex) {
                this.currentIndex++;
                this.translateTo(this.currentIndex, true);
                this.updateDots();
            } else {
                this.goToSlide(this.currentIndex, true);
            }
        }

        prevSlide() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.translateTo(this.currentIndex, true);
            } else {
                this.currentIndex = 0;
                this.translateTo(this.currentIndex, true);
            }
            this.updateDots();
        }
    }


    function initializeShowcaseSlider() {
        const showcaseSliderElement = document.getElementById('showcaseSlider');
        if (showcaseSliderElement) {
            new ShowcaseSlider();
            console.log('Showcase slider initialized successfully');
        } else {
            console.log('Showcase slider not found on this page - skipping initialization');
        }
    }

    // Counter Logic
    class AnimatedCounter {
        constructor(element, targetNumber, duration = 2000) {
            this.element = element;
            this.targetNumber = targetNumber;
            this.duration = duration;
            this.hasAnimated = false;
            this.observer = null;

            this.init();
        }

        init() {
            // Reset counter to 0 on page load
            this.element.textContent = '0';

            // Set up intersection observer
            this.setupIntersectionObserver();
        }

        setupIntersectionObserver() {
            const options = {
                threshold: 0.5, // Trigger when 50% of element is visible
                rootMargin: '0px 0px -50px 0px' // Slight offset from bottom
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.startAnimation();
                        this.hasAnimated = true;
                    }
                });
            }, options);

            this.observer.observe(this.element.closest('.projectWrap'));
        }

        startAnimation() {
            const startTime = performance.now();
            const targetNumber = this.targetNumber;

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / this.duration, 1);

                // Easing function for smooth animation (ease-out)
                const easeOut = 1 - Math.pow(1 - progress, 3);

                const currentNumber = Math.floor(easeOut * targetNumber);
                this.element.textContent = this.formatNumber(currentNumber);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Ensure we end with the exact target number
                    this.element.textContent = this.formatNumber(targetNumber);
                }
            };

            requestAnimationFrame(animate);
        }

        formatNumber(num) {
            return num.toLocaleString();
        }

        // Method to reset the counter (useful for testing)
        reset() {
            this.hasAnimated = false;
            this.element.textContent = '0';
        }

        // Clean up observer
        destroy() {
            if (this.observer) {
                this.observer.disconnect();
            }
        }
    }

    // Initialize Counter Function
    function initializeCounter() {
        const counterElement = document.getElementById('counter');

        if (counterElement) {
            const counter = new AnimatedCounter(counterElement, 4890, 4000);
            console.log('AnimatedCounter initialized successfully');

            // Optional: Add a reset button for testing (remove in production)
            document.addEventListener('keydown', function (e) {
                if (e.key === 'r' && e.ctrlKey) {
                    e.preventDefault();
                    counter.reset();
                    console.log('Counter reset! Scroll to trigger again.');
                }
            });
        } else {
            console.warn('Counter element with ID "counter" not found');
        }
    }

    // Show/Hide Video Player
    const playIcon = document.querySelector("#playIcon");
    const videoPlayer = document.querySelector("#videoPlayer");
    const closeBtn = document.querySelector("#closeVideo");

    if (playIcon && videoPlayer) {
        playIcon.addEventListener("click", function (e) {
            e.preventDefault(); // Prevent default anchor action
            videoPlayer.style.display = "flex"; // Show video player
        });
    }

    if (closeBtn && videoPlayer) {
        closeBtn.addEventListener("click", function () {
            videoPlayer.style.display = "none"; // Hide video player
        });
    }

    // Progress Bar Animation with Scroll Trigger
    function animateProgressBars() {
        const percents = document.querySelectorAll("#growth .percent");

        function startAnimation() {
            percents.forEach(percent => {
                let target = +percent.getAttribute("data-target");
                let current = 0;
                let speed = 30;

                let interval = setInterval(() => {
                    current++;
                    if (current > target) {
                        clearInterval(interval);
                    } else {
                        percent.textContent = current + "%";
                        percent.style.background = `conic-gradient(var(--red-color) ${current * 3.6}deg, lightgrey 0deg)`;
                    }
                }, speed);
            });
        }

        // Intersection Observer
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAnimation();
                    observer.disconnect(); // run once
                }
            });
        }, { threshold: 0.5 });

        const growthSection = document.querySelector("#growth");
        if (growthSection) {
            observer.observe(growthSection);
        }
    }

    // Accordion Functionality
    const accordion = document.querySelectorAll("#accordion .box");

    accordion.forEach((box) => {
        const title = box.querySelector(".title");

        title.addEventListener("click", () => {
            const isAlreadyActive = box.classList.contains("active");

            // Close all boxes first
            accordion.forEach((b) => {
                b.classList.remove("active");
                b.querySelector(".title").classList.remove("active");
                b.querySelector("i").classList.remove("active");
                b.querySelector(".content").classList.remove("active");
            });

            // If the clicked one was not active before, open it after a short delay
            if (!isAlreadyActive) {
                setTimeout(() => {
                    box.classList.add("active");
                    title.classList.add("active");
                    title.querySelector("i").classList.add("active");
                    box.querySelector(".content").classList.add("active");
                }, 50); // delay lets close animation finish first
            }
        });
    });

    // Testimonial Auto Slider
    (function initTestimonialSlider() {
        const track = document.querySelector('.testimonial-track');
        const slides = document.querySelectorAll('#testimonial .box');
        if (!track || !slides.length) return;

        let currentIndex = 0;
        let startX = 0;
        let prevTranslate = 0;
        let isDragging = false;
        let testimonialAutoSlideInterval = null; // Renamed to avoid conflicts
        const slideTime = 4000; // ⬅ change this for speed

        function goToSlide(index) {
            currentIndex = (index + slides.length) % slides.length;
            prevTranslate = -currentIndex * track.parentElement.offsetWidth;
            track.style.transform = `translateX(${prevTranslate}px)`;
        }

        function startAutoSlide() {
            stopAutoSlide();
            testimonialAutoSlideInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % slides.length;
                goToSlide(currentIndex);
            }, slideTime);
        }

        function stopAutoSlide() {
            clearInterval(testimonialAutoSlideInterval);
        }

        function startDrag(e) {
            isDragging = true;
            startX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
            track.classList.remove("smooth-transition");
            stopAutoSlide(); // stop while dragging
        }

        function dragMove(e) {
            if (!isDragging) return;
            const x = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
            const deltaX = x - startX;
            track.style.transform = `translateX(${prevTranslate + deltaX}px)`;
        }

        function endDrag(e) {
            if (!isDragging) return;
            isDragging = false;
            track.classList.add("smooth-transition");

            const endX = e.type.includes("mouse") ? e.pageX : e.changedTouches[0].clientX;
            const movedBy = endX - startX;

            if (movedBy < -50 && currentIndex < slides.length - 1) currentIndex++;
            if (movedBy > 50 && currentIndex > 0) currentIndex--;

            goToSlide(currentIndex);
            startAutoSlide(); // restart after drag
        }

        // Mouse Events
        track.addEventListener("mousedown", startDrag);
        track.addEventListener("mousemove", dragMove);
        track.addEventListener("mouseup", endDrag);
        track.addEventListener("mouseleave", endDrag);

        // Touch Events
        track.addEventListener("touchstart", startDrag, { passive: true });
        track.addEventListener("touchmove", dragMove, { passive: true });
        track.addEventListener("touchend", endDrag);

        // Pause on hover
        track.addEventListener("mouseenter", stopAutoSlide);
        track.addEventListener("mouseleave", startAutoSlide);

        // Init
        goToSlide(currentIndex);
        startAutoSlide();
    })();

    // Milestone Number Counter
    const milestoneNumbers = document.querySelectorAll("#mileStone .number");
    let hasAnimated = false;

    // Step 1: Show 0 from the start
    milestoneNumbers.forEach(num => {
        num.dataset.target = num.textContent.replace(/,/g, ""); // save original target
        num.textContent = "0";
    });

    function animateNumber(element, target, duration) {
        let start = 0;
        const increment = target / (duration / 16); // assuming ~60fps

        function update() {
            start += increment;
            if (start >= target) {
                element.textContent = parseInt(target).toLocaleString();
            } else {
                element.textContent = Math.floor(start).toLocaleString();
                requestAnimationFrame(update);
            }
        }
        update();
    }

    // Step 2: Animate when #testimonials enters viewport
    const milestoneObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                milestoneNumbers.forEach(num => {
                    animateNumber(num, parseInt(num.dataset.target, 10), 4000);
                });
            }
        });
    }, { threshold: 0.5 });

    const testimonialsSection = document.querySelector("#testimonials");
    if (testimonialsSection) {
        milestoneObserver.observe(testimonialsSection);
    }

    // ✅ Initialize Owl Carousel
    if ($("#brands.owl-carousel").length) {
        $("#brands.owl-carousel").owlCarousel({
            loop: true,
            margin: 10,
            nav: false,
            dots: false,
            autoplay: true,
            autoplayHoverPause: true,
            autoplayTimeout: 3000,
            smartSpeed: 1000,
            responsiveClass: true,
            responsive: {
                0: { items: 1 },
                600: { items: 2 },
                1000: { items: 3 },
                1200: { items: 4 }
            }
        });
        console.log("Owl Carousel initialized");
    }

    // Article Slider
    $('#news .owl-carousel').owlCarousel({
        loop: true,
        margin: 10,
        nav: true,
        dots: false,
        responsiveClass: true,
        loop: true,
        smartSpeed: 1000,
        responsive: {
            0: {
                items: 1,
                nav: true
            },
            600: {
                items: 2,
                nav: true
            },
            1000: {
                items: 3,
                nav: true,
            },
            1200: {
                items: 4,
                nav: true,
            }
        }
    })

}); // ⬅ This is the end of DOMContentLoaded

// Reset progress bar on refresh
window.addEventListener('beforeunload', function () {
    document.querySelectorAll("#growth .percent").forEach(p => {
        p.textContent = "0%";
        p.style.background = `conic-gradient(var(--red-color) 0deg, lightgrey 0deg)`;
    });
});
