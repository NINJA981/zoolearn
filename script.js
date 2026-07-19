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
    // High-performance smooth custom cursor loop
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { x: mouse.x, y: mouse.y };
    
    const xSetter = gsap.quickSetter(cursor, "x", "px");
    const ySetter = gsap.quickSetter(cursor, "y", "px");
    
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    gsap.ticker.add(() => {
        // Linear interpolation for smooth trailing lag (adjust 0.2 to tune trail speed)
        const dt = 1.0 - Math.pow(1.0 - 0.2, gsap.ticker.deltaRatio());
        pos.x += (mouse.x - pos.x) * dt;
        pos.y += (mouse.y - pos.y) * dt;
        xSetter(pos.x);
        ySetter(pos.y);
    });

    document.addEventListener('mousedown', () => {
        cursor.classList.add('scale-75');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('scale-75');
    });

    // Add cursor hover effect on interactive elements (updated to include new interactive classes)
    const updateHoverables = () => {
        const hoverables = document.querySelectorAll('a, button, .flip-card, .cycle-nav-dot, .tab-btn, .research-tab-btn, .dig-block, [role="button"]');
        hoverables.forEach(el => {
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
let currentStageIndex = 0;
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
        if (stageIndex !== currentStageIndex) {
            currentStageIndex = stageIndex;
            goToStage(stageIndex);
        }
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

// =============================================================
// EQUINE RESEARCH CENTER INTERACTIVITY
// =============================================================

// 1. Research Tabs Switching
const researchTabBtns = document.querySelectorAll('.research-tab-btn');
const researchPanes = document.querySelectorAll('.research-pane');

researchTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Toggle Active Tab Style
        researchTabBtns.forEach(b => {
            b.classList.remove('active', 'text-primary', 'border-primary');
            b.classList.add('text-gray-500', 'border-transparent');
        });
        btn.classList.add('active', 'text-primary', 'border-primary');
        btn.classList.remove('text-gray-500', 'border-transparent');

        // Toggle Active Pane with smooth height and fade transition
        const targetId = btn.getAttribute('data-target');
        const activePane = document.getElementById(targetId);
        if (activePane) {
            const container = activePane.parentElement;
            const startHeight = container.offsetHeight;

            researchPanes.forEach(pane => {
                if (pane.id === targetId) {
                    pane.classList.remove('opacity-0', 'pointer-events-none', 'absolute', 'inset-0');
                    pane.classList.add('opacity-100', 'z-10', 'relative');
                    // Slide & fade in the new pane
                    gsap.fromTo(pane, 
                        { opacity: 0, y: 15 }, 
                        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
                    );
                } else {
                    pane.classList.add('opacity-0', 'pointer-events-none', 'absolute', 'inset-0');
                    pane.classList.remove('opacity-100', 'z-10', 'relative');
                }
            });

            const endHeight = container.offsetHeight;

            // Smoothly animate the container's height to prevent page jumps
            if (startHeight !== endHeight && container) {
                gsap.fromTo(container, 
                    { height: startHeight }, 
                    { height: endHeight, duration: 0.4, ease: "power2.out", clearProps: "height" }
                );
            }
        }
    });
});

// 2. GenEquus Sandbox (Evolution Simulator)
const inputHumidity = document.getElementById('input-humidity');
const inputGrassland = document.getElementById('input-grassland');
const inputPredators = document.getElementById('input-predators');

const valHumidity = document.getElementById('val-humidity');
const valGrassland = document.getElementById('val-grassland');
const valPredators = document.getElementById('val-predators');

const btnRunSim = document.getElementById('btn-run-simulation');
const simTimeline = document.getElementById('sim-stages-timeline');
const simPathwayContainer = document.getElementById('sim-pathway-container');
const simPathwayTitle = document.getElementById('sim-pathway-title');
const simPathwayDesc = document.getElementById('sim-pathway-desc');

// Update value displays
if (inputHumidity) inputHumidity.addEventListener('input', (e) => valHumidity.textContent = `${e.target.value}%`);
if (inputGrassland) inputGrassland.addEventListener('input', (e) => valGrassland.textContent = `${e.target.value}%`);
if (inputPredators) inputPredators.addEventListener('input', (e) => valPredators.textContent = `${e.target.value}%`);

// Run Simulation
if (btnRunSim) {
    btnRunSim.addEventListener('click', async () => {
        btnRunSim.disabled = true;
        btnRunSim.textContent = "Processing Genetics...";
        
        const h = inputHumidity.value;
        const g = inputGrassland.value;
        const p = inputPredators.value;

        try {
            const response = await fetch(`/api/simulate?humidity=${h}&grassland=${g}&predators=${p}`);
            const data = await response.json();
            
            if (data.success) {
                // Show outcome pathway card
                simPathwayContainer.classList.remove('hidden');
                simPathwayTitle.textContent = data.outcomeType.replace(/-/g, ' ').toUpperCase();
                simPathwayDesc.textContent = data.summary;

                // Clear and render stages timeline
                simTimeline.innerHTML = "";
                data.stages.forEach(stage => {
                    // Match images to vertical stage assets
                    let imgPath = "1.Eohippus/Hyracotherium.png";
                    if (stage.name.includes("Mesohippus")) imgPath = "New folder/3.Mesohippus✝︎.png";
                    else if (stage.name.includes("Parahippus")) imgPath = "New folder/5.Parahippus✝︎.png";
                    else if (stage.name.includes("Merychippus")) imgPath = "New folder/6.Merychippus✝︎.png";
                    else if (stage.name.includes("Pliohippus")) imgPath = "New folder/8.Pliohippus✝︎.png";
                    else if (stage.name.includes("Equus")) imgPath = "New folder/10.Equus cabllus.png";

                    const stageEl = document.createElement('div');
                    stageEl.className = "bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 hover:border-primary/40 transition-colors";
                    stageEl.innerHTML = `
                        <div class="w-20 h-20 shrink-0 bg-black/40 rounded-lg flex items-center justify-center p-1 border border-white/5">
                            <img src="${imgPath}" class="max-h-full max-w-full object-contain" alt="${stage.name}">
                        </div>
                        <div class="flex-grow">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h5 class="text-lg font-bold text-white">${stage.name}</h5>
                                    <span class="text-xs text-primary font-mono font-bold">${stage.mya}</span>
                                </div>
                                <span class="text-xs text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono">${stage.heightCm} cm Height</span>
                            </div>
                            <p class="text-xs text-gray-400 mt-2">${stage.description}</p>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 text-[10px] font-mono text-gray-500">
                                <div><span class="text-gray-400">Toes (F/H):</span> ${stage.toesFront}/${stage.toesHind}</div>
                                <div><span class="text-gray-400">Teeth:</span> ${stage.toothType}</div>
                                <div><span class="text-gray-400">Diet:</span> ${stage.diet}</div>
                            </div>
                        </div>
                    `;
                    simTimeline.appendChild(stageEl);
                });
            }
        } catch (e) {
            console.error("Simulation API failed:", e);
            simTimeline.innerHTML = `<div class="text-red-400 text-center py-10 font-mono">Failed to fetch simulation data. Is the server running?</div>`;
        } finally {
            btnRunSim.disabled = false;
            btnRunSim.textContent = "Run Genetic Simulation";
        }
    });
}

// 3. AI Paleontologist Lab & Canvas Sketchpad
const canvas = document.getElementById('sketch-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const btnCanvasClear = document.getElementById('btn-canvas-clear');
const fileSketchUpload = document.getElementById('file-sketch-upload');
const canvasHint = document.getElementById('canvas-hint');
const btnAnalyzeSketch = document.getElementById('btn-analyze-sketch');

let isDrawing = false;
let lastX = 0;
let lastY = 0;

if (canvas && ctx) {
    // Drawing context setup
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function getMousePos(canvasDom, touchOrMouseEvent) {
        const rect = canvasDom.getBoundingClientRect();
        const clientX = touchOrMouseEvent.touches ? touchOrMouseEvent.touches[0].clientX : touchOrMouseEvent.clientX;
        const clientY = touchOrMouseEvent.touches ? touchOrMouseEvent.touches[0].clientY : touchOrMouseEvent.clientY;
        return {
            x: ((clientX - rect.left) / rect.width) * canvasDom.width,
            y: ((clientY - rect.top) / rect.height) * canvasDom.height
        };
    }

    function startDraw(e) {
        isDrawing = true;
        const pos = getMousePos(canvas, e);
        [lastX, lastY] = [pos.x, pos.y];
        if (canvasHint) canvasHint.style.display = 'none';
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getMousePos(canvas, e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        [lastX, lastY] = [pos.x, pos.y];
    }

    function stopDraw() {
        isDrawing = false;
    }

    // Event Listeners for Drawing
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);

    canvas.addEventListener('touchstart', startDraw);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDraw);

    // Clear Canvas
    btnCanvasClear.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (canvasHint) canvasHint.style.display = 'flex';
    });

    // File Upload handling
    fileSketchUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Draw image scaled to canvas
                const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                if (canvasHint) canvasHint.style.display = 'none';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// AI Chat Integration
const chatInput = document.getElementById('chat-input');
const btnChatSend = document.getElementById('btn-chat-send');
const chatFeed = document.getElementById('chat-feed');
const apiStatusBadge = document.getElementById('api-status-badge');
let chatHistory = [];

function appendChatMessage(sender, text) {
    if (!chatFeed) return;
    const msgEl = document.createElement('div');
    msgEl.className = sender === 'user' ? 'flex items-start justify-end gap-3' : 'flex items-start gap-3';
    
    const iconHtml = sender === 'user' 
        ? `<div class="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold text-sm shrink-0">U</div>`
        : `<div class="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-bold text-sm shrink-0">P</div>`;
    
    const bubbleClass = sender === 'user'
        ? 'bg-primary text-black rounded-2xl p-3 text-sm max-w-[80%] font-medium'
        : 'bg-zinc-900 border border-white/10 rounded-2xl p-3 text-sm max-w-[80%] text-gray-200';

    msgEl.innerHTML = sender === 'user'
        ? `<div class="${bubbleClass}">${text}</div>${iconHtml}`
        : `${iconHtml}<div class="${bubbleClass}">${text}</div>`;
        
    chatFeed.appendChild(msgEl);
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

async function checkApiStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        if (apiStatusBadge) {
            if (data.mode === 'online') {
                apiStatusBadge.textContent = "Online (Gemini)";
                apiStatusBadge.className = "bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase";
            } else {
                apiStatusBadge.textContent = "Offline Fallback";
                apiStatusBadge.className = "bg-zinc-800 text-zinc-400 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase";
            }
        }
    } catch (e) {
        console.error("Failed to check API status:", e);
        if (apiStatusBadge) {
            apiStatusBadge.textContent = "Server Offline";
            apiStatusBadge.className = "bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase";
        }
    }
}
checkApiStatus();

async function sendChatQuery(message) {
    appendChatMessage('user', message);
    chatInput.value = "";
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history: chatHistory })
        });
        const data = await response.json();
        
        // Update API Status
        if (apiStatusBadge) {
            if (data.mode === 'online') {
                apiStatusBadge.textContent = "Online (Gemini)";
                apiStatusBadge.className = "bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase";
            } else {
                apiStatusBadge.textContent = "Offline Fallback";
                apiStatusBadge.className = "bg-zinc-800 text-zinc-400 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase";
            }
        }

        appendChatMessage('ai', data.text);
        chatHistory.push({ sender: 'user', text: message });
        chatHistory.push({ sender: 'ai', text: data.text });
    } catch (e) {
        console.error("Chat API failed:", e);
        appendChatMessage('ai', "[System Error] Could not connect to the paleontologist desk. Please make sure the backend server is running.");
    }
}

// Chat input listeners
if (btnChatSend && chatInput) {
    btnChatSend.addEventListener('click', () => {
        const text = chatInput.value.trim();
        if (text) sendChatQuery(text);
    });
    chatInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const text = chatInput.value.trim();
            if (text) sendChatQuery(text);
        }
    });
}

// Analyze Sketch/Photo Trigger
if (btnAnalyzeSketch && canvas) {
    btnAnalyzeSketch.addEventListener('click', async () => {
        btnAnalyzeSketch.disabled = true;
        btnAnalyzeSketch.textContent = "AI Scanning Sketch...";
        
        const imageBase64 = canvas.toDataURL('image/png');
        appendChatMessage('user', "[Uploaded anatomical drawing for fossil identification]");

        try {
            const response = await fetch('/api/analyze-sketch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64 })
            });
            const data = await response.json();
            appendChatMessage('ai', data.text);
        } catch (e) {
            console.error("Sketch API failed:", e);
            appendChatMessage('ai', "[System Error] Sketch analysis failed. Please verify the server is running.");
        } finally {
            btnAnalyzeSketch.disabled = false;
            btnAnalyzeSketch.textContent = "Analyze Sketch / Photo";
        }
    });
}


// 4. Deep-Time Expedition WebSocket client
const digBoard = document.getElementById('dig-board');
const wsStatusBadge = document.getElementById('ws-status-badge');
const btnResetDig = document.getElementById('btn-reset-dig');
const museumScore = document.getElementById('museum-score');
let socket = null;

const fossilsChecklistState = {
    "Eohippus Skull": false,
    "Mesohippus Jaw": false,
    "Merychippus Hoof": false,
    "Pliohippus Splint Bone": false,
    "Equus Giant Molar": false
};

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        if (wsStatusBadge) {
            wsStatusBadge.textContent = "Expedition Connected";
            wsStatusBadge.className = "bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase";
        }
    };

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'INIT_GRID') {
            renderDigGrid(msg.grid);
        } else if (msg.type === 'GRID_UPDATE') {
            updateGridCell(msg.cellIndex, msg.currentDepth, msg.excavated, msg.fossil);
            if (msg.fossilDiscovered) {
                handleFossilDiscovery(msg.fossilDiscovered);
            }
        }
    };

    socket.onclose = () => {
        if (wsStatusBadge) {
            wsStatusBadge.textContent = "Disconnected (Retrying)";
            wsStatusBadge.className = "bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase";
        }
        setTimeout(connectWebSocket, 3000); // Auto reconnect in 3s
    };

    socket.onerror = (e) => {
        console.error("WebSocket encountered error:", e);
    };
}

function renderDigGrid(grid) {
    if (!digBoard) return;
    digBoard.innerHTML = "";
    
    // Reset Checklist UI states
    Object.keys(fossilsChecklistState).forEach(k => fossilsChecklistState[k] = false);
    updateMuseumChecklistUI();

    grid.forEach((cell, idx) => {
        const cellEl = document.createElement('div');
        cellEl.className = `dig-block ${cell.type} rounded flex items-center justify-center font-mono text-[10px] font-bold`;
        cellEl.id = `dig-cell-${idx}`;
        
        if (cell.excavated) {
            cellEl.classList.add('excavated');
            if (cell.fossil) {
                cellEl.classList.add('has-fossil');
                cellEl.innerHTML = "🦴";
                cellEl.title = cell.fossil;
            }
        } else {
            cellEl.innerHTML = cell.currentDepth > 1 ? cell.currentDepth : "";
            cellEl.style.opacity = 0.5 + (cell.currentDepth / cell.maxDepth) * 0.5;
        }

        cellEl.addEventListener('click', () => {
            if (!cellEl.classList.contains('excavated') && socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'DIG',
                    cellIndex: idx
                }));
            }
        });

        digBoard.appendChild(cellEl);
    });
}

function updateGridCell(idx, currentDepth, excavated, fossil) {
    const cellEl = document.getElementById(`dig-cell-${idx}`);
    if (!cellEl) return;

    if (excavated) {
        cellEl.className = "dig-block excavated rounded flex items-center justify-center font-mono text-[10px] font-bold";
        cellEl.innerHTML = "";
        cellEl.style.opacity = 1;
        if (fossil) {
            cellEl.classList.add('has-fossil');
            cellEl.innerHTML = "🦴";
            cellEl.title = fossil;
        }
    } else {
        cellEl.innerHTML = currentDepth > 1 ? currentDepth : "";
        // adjust opacity representing soil depth density
        const max = cellEl.classList.contains('stone') ? 3 : (cellEl.classList.contains('clay') ? 2 : 1);
        cellEl.style.opacity = 0.5 + (currentDepth / max) * 0.5;
    }
}

function handleFossilDiscovery(fossilName) {
    fossilsChecklistState[fossilName] = true;
    updateMuseumChecklistUI();
    
    // Visual alerts/notifications
    const alertBox = document.createElement('div');
    alertBox.className = "fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-900 border-2 border-primary text-white py-4 px-8 rounded-full shadow-[0_0_30px_#FFC107] font-display text-sm tracking-widest z-[15000] animate-bounce";
    alertBox.innerHTML = `🎉 SPECIMEN RECOVERED: <span class="text-primary">${fossilName.toUpperCase()}</span>`;
    document.body.appendChild(alertBox);
    
    setTimeout(() => {
        alertBox.remove();
    }, 4000);
}

function updateMuseumChecklistUI() {
    let completedCount = 0;
    const totalCount = Object.keys(fossilsChecklistState).length;

    Object.entries(fossilsChecklistState).forEach(([fossilName, isCompleted], idx) => {
        // Map names to ids in DOM
        const idMap = {
            "Eohippus Skull": { item: "chk-Eohippus-Skull", icon: "check-icon-1", status: "status-text-1" },
            "Mesohippus Jaw": { item: "chk-Mesohippus-Jaw", icon: "check-icon-2", status: "status-text-2" },
            "Merychippus Hoof": { item: "chk-Merychippus-Hoof", icon: "check-icon-3", status: "status-text-3" },
            "Pliohippus Splint Bone": { item: "chk-Pliohippus-Splint-Bone", icon: "check-icon-4", status: "status-text-4" },
            "Equus Giant Molar": { item: "chk-Equus-Giant-Molar", icon: "check-icon-5", status: "status-text-5" }
        };

        const def = idMap[fossilName];
        if (!def) return;

        const rowEl = document.getElementById(def.item);
        const iconEl = document.getElementById(def.icon);
        const statusEl = document.getElementById(def.status);

        if (!rowEl || !iconEl || !statusEl) return;

        if (isCompleted) {
            completedCount++;
            rowEl.className = "bg-primary/5 border border-primary/40 p-4 rounded-xl flex items-center justify-between transition-colors duration-300";
            iconEl.className = "w-5 h-5 rounded-full border border-primary flex items-center justify-center text-xs text-primary font-mono font-bold bg-primary/10";
            iconEl.innerHTML = "✓";
            statusEl.className = "text-xs text-primary font-mono font-bold uppercase tracking-wider";
            statusEl.textContent = "Uncovered";
        } else {
            rowEl.className = "bg-black/30 border border-white/10 p-4 rounded-xl flex items-center justify-between transition-colors duration-300";
            iconEl.className = "w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center text-xs text-gray-500 font-mono";
            iconEl.innerHTML = "";
            statusEl.className = "text-xs text-gray-600 font-mono";
            statusEl.textContent = "Locked";
        }
    });

    if (museumScore) {
        const score = Math.round((completedCount / totalCount) * 100);
        museumScore.textContent = `${score}% COMPLETE`;
        if (score === 100) {
            museumScore.className = "text-primary animate-pulse font-bold";
        } else {
            museumScore.className = "";
        }
    }
}

// Reset Dig site trigger
if (btnResetDig) {
    btnResetDig.addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'RESET' }));
        }
    });
}

// Connect automatically on page load
connectWebSocket();