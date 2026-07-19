const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { runEvolutionSimulation } = require('./simulation-engine');

// Load environment variables (.env or fallback to .env.example)
const fs = require('fs');
if (fs.existsSync(path.join(__dirname, '.env'))) {
    dotenv.config({ path: path.join(__dirname, '.env') });
} else if (fs.existsSync(path.join(__dirname, '.env.example'))) {
    dotenv.config({ path: path.join(__dirname, '.env.example') });
    console.log("No .env file found. Loaded configuration from .env.example.");
} else {
    dotenv.config();
}

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
let isOfflineMode = true;

if (apiKey && apiKey.trim() !== "") {
    try {
        genAI = new GoogleGenerativeAI(apiKey);
        isOfflineMode = false;
        console.log("Gemini API initialized successfully.");
    } catch (e) {
        console.warn("Failed to initialize Gemini API client. Falling back to offline mode:", e);
    }
} else {
    console.log("No GEMINI_API_KEY provided in .env. Running in Offline Fallback Mode.");
}

// 0. Status API
app.get('/api/status', (req, res) => {
    res.json({ success: true, mode: isOfflineMode ? "offline" : "online" });
});

// 1. Evolution Simulation API
app.get('/api/simulate', (req, res) => {
    const { humidity, grassland, predators } = req.query;
    const result = runEvolutionSimulation(humidity, grassland, predators);
    res.json(result);
});

// 2. AI Paleontologist Chat Desk API (Gemini Free Tier)
app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required." });
    }

    if (isOfflineMode) {
        // Return simulated expert response
        const fallbackResponse = generateMockPaleoResponse(message);
        return res.json({ text: fallbackResponse, mode: "offline" });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1" });
        
        // Format history for Gemini SDK
        const formattedHistory = [
            {
                role: "user",
                parts: [{ text: "You are an expert Paleontologist specializing in the evolution of the family Equidae. You are acting as the AI Desk guide for the EQUUS exhibit. Please answer all questions in an educational, highly professional, yet accessible manner. Keep answers to 3-4 sentences max." }],
            },
            {
                role: "model",
                parts: [{ text: "Welcome to the EQUUS Exhibition. I am your AI Paleontologist guide. Ask me anything about equine evolutionary history, anatomy, or dental adaptations." }],
            }
        ];

        if (Array.isArray(history)) {
            history.forEach(h => {
                formattedHistory.push({
                    role: h.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: h.text }]
                });
            });
        }

        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(message);
        const text = result.response.text();
        res.json({ text, mode: "online" });
    } catch (err) {
        console.error("Gemini Chat API Error:", err);
        const fallbackResponse = generateMockPaleoResponse(message);
        res.json({ text: `[API Rate Limit/Error - Fallback Active] ${fallbackResponse}`, mode: "fallback" });
    }
});

// 3. Sketch/Image Analysis API (Gemini Vision)
app.post('/api/analyze-sketch', async (req, res) => {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
        return res.status(400).json({ error: "Base64 image data is required." });
    }

    if (isOfflineMode) {
        const fallbackAnalysis = generateMockVisionResponse();
        return res.json({ text: fallbackAnalysis, mode: "offline" });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1" });
        
        // Remove mime-type prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const promptParts = [
            { text: "Analyze this hand-drawn anatomical sketch or uploaded fossil photo of an equid ancestor. Classify it into one of the following epochs: Eohippus (55Mya), Mesohippus (37Mya), Merychippus (17Mya), Pliohippus (12Mya), or Equus (Present). Point out visual features like digits/hooves or skull structure and explain its functional adaptation in 3 sentences." },
            {
                inlineData: {
                    mimeType: "image/png",
                    data: base64Data
                }
            }
        ];

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        const text = response.text();
        res.json({ text, mode: "online" });
    } catch (err) {
        console.error("Gemini Vision API Error:", err);
        const fallbackAnalysis = generateMockVisionResponse();
        res.json({ text: `[API Error - Fallback Active] ${fallbackAnalysis}`, mode: "fallback" });
    }
});

// Helper for Mock Paleontologist responses
function generateMockPaleoResponse(message) {
    const msg = message.toLowerCase();
    if (msg.includes("toe") || msg.includes("hoof") || msg.includes("digit")) {
        return "Excellent question about horse digits! Equids transitioned from a 4-toed front foot (Eohippus) to a 3-toed structure (Mesohippus) and eventually to a single weight-bearing hoof (Pliohippus). This digit reduction lightened the lower limbs and acted like a pendulum, maximizing running energy efficiency on dry, open plains.";
    }
    if (msg.includes("teeth") || msg.includes("tooth") || msg.includes("diet") || msg.includes("grass")) {
        return "Fascinating query! As grasslands expanded during the Miocene, equids developed 'hypsodont' (high-crowned) teeth. These teeth had complex, folding enamel ridges that ground down the abrasive silica found in grasses without exposing the tooth's root, allowing transition from forest browsing to grassland grazing.";
    }
    if (msg.includes("eohippus") || msg.includes("hyracotherium") || msg.includes("dawn")) {
        return "Eohippus, the 'Dawn Horse', was a forest dweller from the Eocene epoch (55 MYA). It was only about 40 cm tall (size of a small dog/fox) and walked on soft forest mud, relying on multi-toed pads and browsing primarily on soft leaves and forest fruits.";
    }
    if (msg.includes("size") || msg.includes("height") || msg.includes("stature")) {
        return "The size progression of the horse is remarkable, starting at just 40cm with Eohippus and exceeding 150cm with Equus. Increased size allowed a longer stride to escape predators and a higher line of sight over tall savannah grasses, though it required stronger bones and a fused lower limb.";
    }
    return "Thank you for asking! Equine evolution is one of our best-preserved fossil records. It beautifully showcases how adaptation follows climate change—specifically, the transition of dense forest to open grasslands, forcing modifications in running gear (toes to hooves) and feeding gear (low crowns to high grinding crowns).";
}

// Helper for Mock Vision response
function generateMockVisionResponse() {
    return "Analyzing your sketch... The outline shows an elongated skull profile and a distinct 3-toed forelimb weight distribution structure. This matches the anatomy of Mesohippus (Oligocene Epoch, 37 Mya). The padded side-toes provided stability on softening ground, while the expanding central toe shows the transition toward monodactyly (single hoof).";
}


// -------------------------------------------------------------
// WEBSOCKET SERVER - EXPEDITION DIG STATE
// -------------------------------------------------------------

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

// Setup a 10x10 Dig Grid
const GRID_SIZE = 10;
let digGrid = [];
const FOSSIL_TYPES = [
    { name: "Eohippus Skull", cells: [12, 13, 22, 23] }, // 2x2
    { name: "Mesohippus Jaw", cells: [45, 46] },       // 1x2
    { name: "Merychippus Hoof", cells: [78] },          // 1x1
    { name: "Pliohippus Splint Bone", cells: [5, 15, 25] }, // 3x1 vertical
    { name: "Equus Giant Molar", cells: [81, 82, 83] }  // 1x3 horizontal
];

// Re-seed grid
function initializeDigGrid() {
    digGrid = [];
    // Seed default soil blocks
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        // Random soil depth and type
        let blockType = "dirt";
        let depth = 1;
        
        if (Math.random() < 0.2) {
            blockType = "stone";
            depth = 3;
        } else if (Math.random() < 0.3) {
            blockType = "clay";
            depth = 2;
        }

        digGrid.push({
            id: i,
            type: blockType,
            maxDepth: depth,
            currentDepth: depth,
            excavated: false,
            fossil: null
        });
    }

    // Seed fossils
    FOSSIL_TYPES.forEach(f => {
        f.cells.forEach(c => {
            if (c >= 0 && c < GRID_SIZE * GRID_SIZE) {
                digGrid[c].fossil = f.name;
                digGrid[c].type = "stone"; // fossils are encased in hard stone
                digGrid[c].maxDepth = 3;
                digGrid[c].currentDepth = 3;
            }
        });
    });
}

initializeDigGrid();

// Track active connections
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    
    // Send initial grid state to client
    ws.send(JSON.stringify({
        type: 'INIT_GRID',
        grid: digGrid
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'DIG') {
                const cellIndex = parseInt(data.cellIndex);
                if (cellIndex >= 0 && cellIndex < digGrid.length) {
                    const cell = digGrid[cellIndex];
                    if (!cell.excavated) {
                        cell.currentDepth = Math.max(0, cell.currentDepth - 1);
                        if (cell.currentDepth === 0) {
                            cell.excavated = true;
                        }

                        // Check if a fossil was fully uncovered
                        let fossilDiscovered = null;
                        if (cell.excavated && cell.fossil) {
                            const fossilName = cell.fossil;
                            const fossilDef = FOSSIL_TYPES.find(f => f.name === fossilName);
                            if (fossilDef) {
                                const allUncovered = fossilDef.cells.every(idx => digGrid[idx].excavated);
                                if (allUncovered) {
                                    fossilDiscovered = fossilName;
                                }
                            }
                        }

                        // Broadcast to all clients
                        const updateMsg = JSON.stringify({
                            type: 'GRID_UPDATE',
                            cellIndex,
                            currentDepth: cell.currentDepth,
                            excavated: cell.excavated,
                            fossil: cell.fossil,
                            fossilDiscovered
                        });
                        
                        clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(updateMsg);
                            }
                        });
                    }
                }
            } else if (data.type === 'RESET') {
                initializeDigGrid();
                const resetMsg = JSON.stringify({
                    type: 'INIT_GRID',
                    grid: digGrid
                });
                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(resetMsg);
                    }
                });
            }
        } catch (e) {
            console.error("Error processing WS message:", e);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
    });
});

// Upgrade HTTP to WS
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`  EQUUS Server Running on http://localhost:${PORT}`);
    console.log(`  WebSocket Server Up & Upgraded`);
    console.log(`  Offline Fallback Mode: ${isOfflineMode}`);
    console.log(`===================================================`);
});
