# EQUUS: The Evolution of the Horse 🐴

EQUUS is an interactive, high-fidelity educational web application showcasing 55 million years of horse evolution. Evolve prehistoric specimens, ask questions to an AI Paleontologist, and dig up fossil bones in a real-time collaborative sandbox.

---

## 🌟 Key Features

### 1. GenEquus Sandbox (Evolution Simulator)
- **Concept**: A genetic simulation sandbox that models natural selection.
- **Controls**: Adjust environmental parameters using range sliders:
  - **Humidity / Precipitation**: Simulates transition from dense forests to dry savannahs.
  - **Grassland Coverage**: Regulates the expansion of silica-rich, abrasive grasses.
  - **Predator Density**: Simulates predatory survival pressure.
- **Output**: Calculates the evolutionary pathway outcome (e.g. *Canonical Equus*, *Forest Refugium Branch*, or *Extinction dead-end*) and renders a dynamic stage timeline with anatomical measurements (body height, digit counts, tooth crowns, and diet).

### 2. AI Paleontologist Desk (Vision & Chat)
- **Model**: Powered by the state-of-the-art **Google Gemini 2.5 Flash** model (using stable `v1` endpoints).
- **Anatomy Sketchpad**: Draw a fossil or bone layout on the HTML5 canvas (or upload a photo). The AI's multimodal vision will analyze the sketch and match it to its closest historical epoch (e.g. *Mesohippus* or *Pliohippus*).
- **Q&A Terminal**: A chat terminal to converse with an expert virtual paleontologist regarding equine morphology, geological timescales, and biological mechanics.
- **Offline Fallback**: Runs automatically in mock-responder mode if no API key is set, keeping the interface fully functional.

### 3. Deep-Time Expedition (Excavation Dig Grid)
- **Mechanics**: A real-time 10x10 excavation grid representing geological stratum layers.
- **Dig Site**: Click tiles to break through dirt (1 hit), clay (2 hits), or stone (3 hits) to uncover hidden fossil bones.
- **Real-Time Sync**: Synchronized via WebSockets—open the app in two side-by-side browser tabs and witness excavation blocks breaking in real time for both sessions.
- **Fossil Catalog**: Recover all parts of 5 hidden specimens (*Eohippus Skull*, *Mesohippus Jaw*, *Merychippus Hoof*, *Pliohippus Splint Bone*, and *Equus Giant Molar*) to complete your museum hall.

---

## 🛠️ Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- A web browser (Chrome, Edge, Firefox, or Safari)

### 1. Clone & Navigate
Navigate into the horse evolution project directory:
```bash
cd "horse evolution-20260719T120700Z-1-001/horse evolution"
```

### 2. Install Dependencies
Install the required Express and Google Generative AI packages:
```bash
npm install
```

### 3. Configure Gemini API Key
Create a `.env` file in the project folder and paste your Google AI Studio API key:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note**: If left blank, the app will run in offline fallback mode.

### 4. Start the Application
Start the server using Node:
```bash
npm run dev
```

### 5. Access the App
Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ Workspace Root Execution Shortcut
To make development easier, you can also launch the app from the parent workspace root folder by running:
```bash
npm run dev
```
*(This uses the prefix script in the root package configuration to automatically locate and boot the subfolder server.)*
