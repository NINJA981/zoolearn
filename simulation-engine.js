/**
 * EQUUS - Evolution Simulation Engine
 * 
 * Computes deterministic evolutionary steps for Equidae based on environmental inputs:
 * - humidity (0-100): High values maintain marshy forests (browsers); low values create dry grasslands (grazers).
 * - grassland (0-100): High values expand abrasive, silica-rich grasses requiring hypsodont teeth.
 * - predators (0-100): High pressure accelerates digit reduction (hooves) and leg elongation for survival speed.
 */

function runEvolutionSimulation(humidity = 50, grassland = 50, predators = 50) {
    // Standardize input values to ranges [0, 100]
    humidity = Math.max(0, Math.min(100, parseFloat(humidity) || 50));
    grassland = Math.max(0, Math.min(100, parseFloat(grassland) || 50));
    predators = Math.max(0, Math.min(100, parseFloat(predators) || 50));

    // Determine the evolutionary pathway/outcome
    let outcomeType = "canonical"; // default path
    let summary = "";
    
    if (predators > 85 && grassland < 25) {
        outcomeType = "extinction";
        summary = "An evolutionary dead end. Extreme predator pressure combined with a lack of open grasslands did not allow sufficient time for digit reduction. The multi-toed forest dweller was unable to escape swift pack predators on open ground and went extinct.";
    } else if (humidity > 70 && grassland < 30 && predators < 40) {
        outcomeType = "forest-refugium";
        summary = "Forest Refugium Specimen. With high humidity preserving dense jungle foliage and minimal predator pressure, your equids remained small, multi-toed forest browsers. They evolved into a specialized jungle lineage resembling modern tapirs, retaining padded feet for soft mud.";
    } else if (grassland > 80 && predators > 75) {
        outcomeType = "grassland-hyper-runner";
        summary = "Grassland Hyper-Runner. Under extreme cursorial demands and dry, open plains, your equid lineage evolved faster and taller than standard history, developing reinforced single-hoofed running gear and exceptionally high-crowned teeth to grind the toughest grasses.";
    } else {
        outcomeType = "canonical";
        summary = "Canonical Equus Path. The environment transitioned gradually from moist Eocene forests to dry Miocene grasslands. Your lineage followed the exact historical path: body size increased, digits reduced to a single hoof, and teeth transitioned to high-crowned grinders.";
    }

    const stages = [];
    
    // Stage 1: Eocene (55 MYA) - Dawn Horse
    stages.push({
        mya: "55 MYA",
        name: "Eohippus (Hyracotherium)",
        heightCm: 40,
        toesFront: 4,
        toesHind: 3,
        toothType: "Brachydont (Low-crowned, Browser)",
        diet: "Soft leaves, fruit",
        brainCc: 50,
        status: "Vulnerable to early carnivores",
        description: "A small, fox-sized browser occupying dense, tropical forests. Its multiple toes distribute weight evenly on soft mud."
    });

    // Stage 2: Oligocene (37 MYA) - Middle Horse
    // Height and digits are slightly modulated by inputs
    let stage2Height = 60;
    let stage2Toes = 3;
    if (outcomeType === "forest-refugium") {
        stage2Height = 50;
    } else if (outcomeType === "grassland-hyper-runner") {
        stage2Height = 70;
    }
    stages.push({
        mya: "37 MYA",
        name: "Mesohippus",
        heightCm: stage2Height,
        toesFront: stage2Toes,
        toesHind: stage2Toes,
        toothType: "Brachydont (Increasing size)",
        diet: "Leaves, soft shrubs",
        brainCc: 90,
        status: "Expanding range",
        description: "Sheep-sized with a slightly elongated snout. The central toe begins supporting more weight as forest floors dry out."
    });

    // Stage 3: Early Miocene (24 MYA) - Transition Link
    let stage3Height = 85;
    let stage3Toes = 3;
    let stage3Tooth = "Sub-hypsodont (Cementum coating begins)";
    if (outcomeType === "forest-refugium") {
        stage3Height = 60;
        stage3Tooth = "Brachydont";
    } else if (outcomeType === "grassland-hyper-runner") {
        stage3Height = 100;
        stage3Tooth = "Hypsodont (High-crowned)";
    }
    stages.push({
        mya: "24 MYA",
        name: "Parahippus",
        heightCm: stage3Height,
        toesFront: stage3Toes,
        toesHind: stage3Toes,
        toothType: stage3Tooth,
        diet: "Mixed browser/grazer",
        brainCc: 140,
        status: "Adapting to savannahs",
        description: "An evolutionary bridge. High silica in grass forces the evolution of protective cementum over the tooth crowns."
    });

    // Stage 4: Late Miocene (17 MYA) - First True Grazer
    let stage4Height = 100;
    let stage4Toes = 3; // (side toes vestigial)
    let stage4Tooth = "Hypsodont (Grinder)";
    if (outcomeType === "forest-refugium") {
        stage4Height = 70;
        stage4Toes = 3; // functional side toes
        stage4Tooth = "Brachydont (Low-crowned)";
    } else if (outcomeType === "grassland-hyper-runner") {
        stage4Height = 120;
        stage4Toes = 1; // already fully monodactyl due to pressure
        stage4Tooth = "Advanced Hypsodont";
    }
    stages.push({
        mya: "17 MYA",
        name: "Merychippus",
        heightCm: stage4Height,
        toesFront: stage4Toes,
        toesHind: stage4Toes,
        toothType: stage4Tooth,
        diet: "Grasses and leaves",
        brainCc: 250,
        status: "Highly successful on open plains",
        description: "Lives in large herds on expanding savannahs. Side toes are vestigial and do not touch the ground during stride."
    });

    // Stage 5: Pliocene (12 MYA) - Monodactyl Pioneer
    let stage5Height = 125;
    let stage5Toes = 1;
    let stage5Tooth = "Hypsodont (Highly specialized)";
    if (outcomeType === "forest-refugium") {
        stage5Height = 75;
        stage5Toes = 3;
        stage5Tooth = "Brachydont";
    } else if (outcomeType === "extinction") {
        stages.push({
            mya: "12 MYA",
            name: "Pliohippus (Extinct Branch)",
            heightCm: 110,
            toesFront: 3,
            toesHind: 3,
            toothType: "Worn brachydont",
            diet: "Sparse abrasive grasses",
            brainCc: 220,
            status: "EXTINCTION WAVE",
            description: "Unable to outrun specialized Miocene predators on open ground. The population collapses."
        });
        return { success: true, outcomeType, summary, stages };
    }
    stages.push({
        mya: "12 MYA",
        name: "Pliohippus",
        heightCm: stage5Height,
        toesFront: stage5Toes,
        toesHind: stage5Toes,
        toothType: stage5Tooth,
        diet: "Abrasive steppe grasses",
        brainCc: 400,
        status: "Dominant grazer",
        description: "The first single-hoofed horse. Side toes are fully reduced to internal splint bones, creating a rigid running limb."
    });

    // Stage 6: Present Day - Modern Horse
    let stage6Height = 155;
    let stage6Toes = 1;
    let stage6Name = "Equus Caballus";
    let stage6Desc = "The modern horse, an elite cursorial athlete. Rigid spine, strong single hoof, and complex high-crowned teeth.";
    if (outcomeType === "forest-refugium") {
        stage6Height = 85;
        stage6Toes = 3;
        stage6Name = "Jungle Equus (Nothohippus)";
        stage6Desc = "A modern hypothetical forest cousin. It has retained three functional toes for swampy ground, low-crowned teeth, and a flexible body.";
    } else if (outcomeType === "grassland-hyper-runner") {
        stage6Height = 175;
        stage6Name = "Equus Giganteus (Hyper-Runner)";
        stage6Desc = "A majestic, heavily built giant runner. Adapted for extreme sprint velocities and dry desert prairies.";
    }

    stages.push({
        mya: "Present",
        name: stage6Name,
        heightCm: stage6Height,
        toesFront: stage6Toes,
        toesHind: stage6Toes,
        toothType: "Advanced Grinding Molars",
        diet: "Tough abrasive grasses",
        brainCc: 650,
        status: "Global distribution",
        description: stage6Desc
    });

    return {
        success: true,
        outcomeType,
        summary,
        stages
    };
}

module.exports = { runEvolutionSimulation };
