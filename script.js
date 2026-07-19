// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// 1. Interactive Custom Cursor
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (isTouchDevice) {
    if (cursor) cursor.style.display = 'none';
    document.body.classList.remove('cursor-none');
} else if (cursor) {
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: "power2.out"
        });
    });

    document.addEventListener('mousedown', () => {
        cursor.classList.add('scale-90');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('scale-90');
    });

    // Add cursor hover effect on interactive elements
    const updateHoverables = () => {
        const hoverables = document.querySelectorAll('a, button, .flip-card, .cycle-nav-dot, .tab-btn, [role="button"]');
        hoverables.forEach(el => {
            // Avoid duplicate listeners
            el.removeEventListener('mouseenter', onMouseEnterHoverable);
            el.removeEventListener('mouseleave', onMouseLeaveHoverable);
            el.addEventListener('mouseenter', onMouseEnterHoverable);
            el.addEventListener('mouseleave', onMouseLeaveHoverable);
        });
    };

    function onMouseEnterHoverable() {
        cursor.classList.add('scale-150', 'bg-primary/10');
        if (cursorDot) cursorDot.classList.remove('opacity-0');
    }

    function onMouseLeaveHoverable() {
        cursor.classList.remove('scale-150', 'bg-primary/10');
        if (cursorDot) cursorDot.classList.add('opacity-0');
    }

    updateHoverables();
    // Re-bind hoverables whenever DOM dynamically updates
    const observer = new MutationObserver(updateHoverables);
    observer.observe(document.body, { childList: true, subtree: true });
}

// 2. Global Scroll Progress Tracker
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) : 0;
    
    // Scale progress bar
    gsap.to('#topProgress', { scaleX: progress, duration: 0.1, ease: 'none' });
    
    // Update progress text
    const progressText = document.getElementById('progressText');
    if (progressText) {
        progressText.textContent = `${Math.round(progress * 100)}%`;
    }
});

// 3. GSAP ScrollReveal Triggers
document.querySelectorAll('.gs-reveal').forEach((el) => {
    gsap.from(el, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
        }
    });
});

// 4. Flip Card Click Handler
document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });
});

// 5. Developmental Cycle Scroll-Pinned Stage Transitions
const stages = document.querySelectorAll('.cycle-stage');
const dots = document.querySelectorAll('.cycle-nav-dot');
const progressFill = document.getElementById('cycle-progress-fill');

function goToStage(index) {
    stages.forEach((stage, i) => {
        if (i === index) {
            stage.classList.add('active');
            gsap.to(stage, { 
                opacity: 1, 
                y: 0, 
                duration: 0.5, 
                pointerEvents: 'auto',
                overwrite: 'auto'
            });
        } else {
            stage.classList.remove('active');
            gsap.to(stage, { 
                opacity: 0, 
                y: i < index ? -20 : 20, 
                duration: 0.5, 
                pointerEvents: 'none',
                overwrite: 'auto'
            });
        }
    });

    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active', 'bg-primary');
            dot.classList.remove('bg-white/30');
        } else {
            dot.classList.remove('active', 'bg-primary');
            dot.classList.add('bg-white/30');
        }
    });

    if (progressFill) {
        const percent = (index / (stages.length - 1)) * 100;
        progressFill.style.height = `${percent}%`;
    }
}

// Register ScrollTrigger to pin the cycle section
let cycleTrigger = ScrollTrigger.create({
    trigger: "#horse-cycle",
    start: "top top",
    end: "+=2000",
    pin: true,
    scrub: true,
    onUpdate: (self) => {
        const progress = self.progress;
        // Divide progress evenly across all stages
        const stageIndex = Math.min(
            Math.floor(progress * stages.length),
            stages.length - 1
        );
        goToStage(stageIndex);
    }
});

// Click navigation for developmental cycle dots
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        if (cycleTrigger) {
            const start = cycleTrigger.start;
            const end = cycleTrigger.end;
            // Scroll to the exact position representing this stage's midpoint progress
            const segmentSize = 1 / stages.length;
            const targetProgress = (index * segmentSize) + (segmentSize / 2);
            const scrollTarget = start + targetProgress * (end - start);
            
            gsap.to(window, {
                scrollTo: scrollTarget,
                duration: 0.8,
                ease: "power2.out"
            });
        }
    });
});

// 6. Horizontal Scroll Timeline (Desktop Only)
let mm = gsap.matchMedia();

mm.add("(min-width: 768px)", () => {
    const timelineScroll = document.getElementById('timeline-scroll');
    const timelineContainer = document.getElementById('timeline-container');
    
    if (timelineScroll && timelineContainer) {
        gsap.to(timelineScroll, {
            x: () => -(timelineScroll.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
                trigger: timelineContainer,
                pin: true,
                scrub: 1,
                start: "top top",
                end: () => "+=" + (timelineScroll.scrollWidth - window.innerWidth),
                invalidateOnRefresh: true
            }
        });
    }
});

// 7. Scientific Archive Tab Switcher
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Deactivate all buttons
        tabBtns.forEach(b => {
            b.classList.remove('active', 'text-primary', 'border-primary');
            b.classList.add('text-gray-500', 'border-transparent');
        });
        // Activate clicked button
        btn.classList.add('active', 'text-primary', 'border-primary');
        btn.classList.remove('text-gray-500', 'border-transparent');

        // Show matching pane and hide others
        const targetId = btn.getAttribute('data-target');
        tabPanes.forEach(pane => {
            if (pane.id === targetId) {
                pane.classList.remove('opacity-0', 'pointer-events-none');
                pane.classList.add('opacity-100', 'z-10');
            } else {
                pane.classList.add('opacity-0', 'pointer-events-none');
                pane.classList.remove('opacity-100', 'z-10');
            }
        });
        
        // Refresh ScrollTrigger as elements might have shifted layout
        ScrollTrigger.refresh();
    });
});