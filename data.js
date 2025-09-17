// Mock data for WW3 Monitoring Dashboard

// News sources and reporters to simulate
const NEWS_SOURCES = [
    { name: "CNN Breaking", handle: "@cnnbrk", reliability: 95, type: "major" },
    { name: "BBC Breaking", handle: "@bbcbreaking", reliability: 98, type: "major" },
    { name: "Reuters", handle: "@reuters", reliability: 97, type: "major" },
    { name: "AP News", handle: "@ap", reliability: 96, type: "major" },
    { name: "Sky News", handle: "@skynews", reliability: 92, type: "major" },
    { name: "Al Jazeera", handle: "@ajenglish", reliability: 88, type: "major" },
    { name: "Washington Post", handle: "@washingtonpost", reliability: 91, type: "major" },
    { name: "Guardian News", handle: "@guardian", reliability: 89, type: "major" },
    { name: "Defense Reporter", handle: "@defenseone", reliability: 85, type: "specialist" },
    { name: "Conflict Monitor", handle: "@conflictwatch", reliability: 82, type: "specialist" },
    { name: "Military Times", handle: "@militarytimes", reliability: 87, type: "specialist" },
    { name: "Jane's Defence", handle: "@janesdefence", reliability: 90, type: "specialist" }
];

// Global conflict hotspots and their current threat levels
const GLOBAL_HOTSPOTS = [
    {
        id: 1,
        name: "Eastern Europe",
        coordinates: [50.4501, 30.5234],
        threatLevel: "critical",
        country: "Ukraine",
        incidents: 45,
        lastUpdate: "2 minutes ago"
    },
    {
        id: 2,
        name: "South China Sea",
        coordinates: [16.0, 113.0],
        threatLevel: "high",
        country: "Disputed Waters",
        incidents: 12,
        lastUpdate: "15 minutes ago"
    },
    {
        id: 3,
        name: "Middle East",
        coordinates: [33.3152, 44.3661],
        threatLevel: "high",
        country: "Iraq/Syria Border",
        incidents: 28,
        lastUpdate: "8 minutes ago"
    },
    {
        id: 4,
        name: "Korean Peninsula",
        coordinates: [38.5, 127.5],
        threatLevel: "medium",
        country: "DMZ",
        incidents: 3,
        lastUpdate: "1 hour ago"
    },
    {
        id: 5,
        name: "Kashmir Region",
        coordinates: [34.0837, 74.7973],
        threatLevel: "medium",
        country: "India/Pakistan Border",
        incidents: 7,
        lastUpdate: "45 minutes ago"
    },
    {
        id: 6,
        name: "Gaza Strip",
        coordinates: [31.3547, 34.3088],
        threatLevel: "high",
        country: "Palestine/Israel",
        incidents: 23,
        lastUpdate: "5 minutes ago"
    },
    {
        id: 7,
        name: "Taiwan Strait",
        coordinates: [24.0, 120.0],
        threatLevel: "medium",
        country: "Taiwan",
        incidents: 8,
        lastUpdate: "30 minutes ago"
    },
    {
        id: 8,
        name: "Baltic States",
        coordinates: [56.9496, 24.1052],
        threatLevel: "medium",
        country: "Estonia/Latvia/Lithuania",
        incidents: 5,
        lastUpdate: "2 hours ago"
    }
];

// Sample news templates for different threat levels and types
const NEWS_TEMPLATES = {
    critical: [
        "🚨 BREAKING: Military mobilization reported in {location}. Multiple sources confirm significant troop movements.",
        "🔴 ALERT: Air defense systems activated in {location}. Civilian evacuation orders issued.",
        "⚡ URGENT: Cyber attacks targeting critical infrastructure in {location}. Government response underway.",
        "🚨 CRITICAL: Naval forces deployment confirmed in {location}. International waters disputed.",
        "🔴 BREAKING: Emergency session called by {location} leadership. Military readiness level raised."
    ],
    high: [
        "⚠️ Military exercises begin near {location}. Tensions escalating with neighboring regions.",
        "📡 Intelligence reports unusual activity in {location}. Diplomatic channels activated.",
        "🛡️ Defense systems on high alert in {location}. Border security increased.",
        "⚡ Sanctions announced against {location}. Economic warfare intensifies.",
        "🎯 Strategic assets moved to {location}. Regional stability concerns grow."
    ],
    medium: [
        "📢 Diplomatic talks scheduled for {location} crisis. Peace negotiations ongoing.",
        "🔍 Monitoring increased military communications from {location} region.",
        "📊 Economic indicators show strain in {location}. Market volatility observed.",
        "🛰️ Satellite imagery reveals infrastructure changes in {location}.",
        "📰 Official statement expected from {location} government regarding recent tensions."
    ],
    low: [
        "📋 Routine military patrol reported near {location}. Standard operations continue.",
        "🤝 Humanitarian aid delivery to {location}. International cooperation maintained.",
        "📈 Stability index shows improvement in {location} region.",
        "🔄 Regular diplomatic exchange with {location}. Channels remain open.",
        "📝 Policy review announced for {location} relations. Standard procedure."
    ]
};

// Generate realistic timestamps
function generateTimestamp() {
    const now = new Date();
    const minutesAgo = Math.floor(Math.random() * 180); // 0-3 hours ago
    const timestamp = new Date(now.getTime() - minutesAgo * 60000);
    return timestamp;
}

// Generate location from hotspots
function getRandomLocation() {
    const hotspot = GLOBAL_HOTSPOTS[Math.floor(Math.random() * GLOBAL_HOTSPOTS.length)];
    return {
        name: hotspot.name,
        coordinates: hotspot.coordinates,
        country: hotspot.country
    };
}

// Generate realistic news content
function generateNewsItem() {
    const source = NEWS_SOURCES[Math.floor(Math.random() * NEWS_SOURCES.length)];
    const location = getRandomLocation();
    
    // Determine threat level based on current hotspot status
    const hotspot = GLOBAL_HOTSPOTS.find(h => h.name === location.name);
    const threatLevel = hotspot ? hotspot.threatLevel : 'low';
    
    const templates = NEWS_TEMPLATES[threatLevel];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const content = template.replace('{location}', location.name);
    
    // Generate a simulated tweet URL based on the source handle and content
    const tweetId = Math.floor(Math.random() * 9999999999999999); // Random tweet ID
    const tweetUrl = `https://twitter.com/${source.handle.replace('@', '')}/status/${tweetId}`;

    return {
        id: Date.now() + Math.random(),
        source: source,
        content: content,
        location: location,
        threatLevel: threatLevel,
        timestamp: generateTimestamp(),
        coordinates: location.coordinates,
        tweetUrl: tweetUrl
    };
}

// Calculate overall threat level based on current incidents
function calculateGlobalThreatLevel() {
    const criticalCount = GLOBAL_HOTSPOTS.filter(h => h.threatLevel === 'critical').length;
    const highCount = GLOBAL_HOTSPOTS.filter(h => h.threatLevel === 'high').length;
    
    if (criticalCount >= 2) return 'CRITICAL';
    if (criticalCount >= 1 || highCount >= 3) return 'HIGH';
    if (highCount >= 1) return 'MODERATE';
    return 'LOW';
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NEWS_SOURCES,
        GLOBAL_HOTSPOTS,
        NEWS_TEMPLATES,
        generateNewsItem,
        calculateGlobalThreatLevel,
        getRandomLocation
    };
}