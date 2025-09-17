// Interactive World Map for WW3 Monitoring Dashboard

let worldMap;
let threatMarkers = {};
let isMapInitialized = false;

// Initialize the world map
function initializeMap() {
    try {
        // Create map centered on world view
        worldMap = L.map('worldMap', {
            center: [20, 0],
            zoom: 2,
            zoomControl: true,
            worldCopyJump: true,
            maxBounds: [[-90, -180], [90, 180]]
        });

        // Add dark theme tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(worldMap);

        // Add custom styling to map
        worldMap.getContainer().style.background = '#0a0a0a';
        
        isMapInitialized = true;
        
        // Initialize threat markers
        updateThreatMarkers();
        
        console.log('World map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Create custom threat level icons
function createThreatIcon(threatLevel) {
    const iconConfig = {
        critical: { color: '#ff0000', size: 20, pulse: true },
        high: { color: '#ff8800', size: 16, pulse: false },
        medium: { color: '#ffaa00', size: 14, pulse: false },
        low: { color: '#00ff00', size: 12, pulse: false }
    };
    
    const config = iconConfig[threatLevel] || iconConfig.low;
    
    const pulseClass = config.pulse ? 'threat-marker-critical' : '';
    
    return L.divIcon({
        className: `threat-marker ${pulseClass}`,
        html: `
            <div class="marker-circle" style="
                width: ${config.size}px;
                height: ${config.size}px;
                background: ${config.color};
                border: 2px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 0 10px ${config.color};
                animation: ${config.pulse ? 'markerPulse 2s infinite' : 'none'};
            "></div>
            <div class="marker-ring" style="
                width: ${config.size + 10}px;
                height: ${config.size + 10}px;
                border: 2px solid ${config.color};
                border-radius: 50%;
                position: absolute;
                top: -7px;
                left: -7px;
                opacity: 0.5;
                animation: ${config.pulse ? 'ringExpand 3s infinite' : 'none'};
            "></div>
        `,
        iconSize: [config.size + 10, config.size + 10],
        iconAnchor: [(config.size + 10) / 2, (config.size + 10) / 2]
    });
}

// Update threat markers on the map
function updateThreatMarkers() {
    if (!isMapInitialized) return;
    
    try {
        // Clear existing markers
        Object.values(threatMarkers).forEach(marker => {
            worldMap.removeLayer(marker);
        });
        threatMarkers = {};
        
        // Add markers for each hotspot
        GLOBAL_HOTSPOTS.forEach(hotspot => {
            const icon = createThreatIcon(hotspot.threatLevel);
            
            const marker = L.marker(hotspot.coordinates, { icon })
                .addTo(worldMap)
                .bindPopup(createThreatPopup(hotspot), {
                    className: 'threat-popup',
                    maxWidth: 300
                });
            
            // Add click event for detailed view
            marker.on('click', function() {
                showThreatDetails(hotspot);
                triggerThreatAlert(hotspot);
            });
            
            // Store marker reference
            threatMarkers[hotspot.id] = marker;
            
            // Add blinking effect for critical threats
            if (hotspot.threatLevel === 'critical') {
                setTimeout(() => {
                    marker.openPopup();
                }, Math.random() * 5000);
            }
        });
        
        console.log(`Updated ${GLOBAL_HOTSPOTS.length} threat markers`);
    } catch (error) {
        console.error('Error updating threat markers:', error);
    }
}

// Create popup content for threat markers
function createThreatPopup(hotspot) {
    const threatColors = {
        critical: '#ff0000',
        high: '#ff8800', 
        medium: '#ffaa00',
        low: '#00ff00'
    };
    
    return `
        <div class="threat-popup-content">
            <div class="threat-header">
                <h3>${hotspot.name}</h3>
                <span class="threat-badge" style="background: ${threatColors[hotspot.threatLevel]}">
                    ${hotspot.threatLevel.toUpperCase()}
                </span>
            </div>
            <div class="threat-details">
                <p><strong>Location:</strong> ${hotspot.country}</p>
                <p><strong>Active Incidents:</strong> ${hotspot.incidents}</p>
                <p><strong>Last Update:</strong> ${hotspot.lastUpdate}</p>
                <p><strong>Coordinates:</strong> ${hotspot.coordinates[0].toFixed(2)}, ${hotspot.coordinates[1].toFixed(2)}</p>
            </div>
            <div class="threat-actions">
                <button onclick="focusOnThreat(${hotspot.id})" class="action-btn">
                    <i class="fas fa-crosshairs"></i> Focus
                </button>
                <button onclick="trackThreat(${hotspot.id})" class="action-btn">
                    <i class="fas fa-eye"></i> Track
                </button>
            </div>
        </div>
    `;
}

// Show detailed threat information
function showThreatDetails(hotspot) {
    const detailsPanel = document.getElementById('regionList');
    if (detailsPanel) {
        // Highlight the threat in the analysis panel
        const threatItem = document.createElement('div');
        threatItem.className = `region-item ${hotspot.threatLevel}`;
        threatItem.innerHTML = `
            <div class="item-title">${hotspot.name} - ${hotspot.country}</div>
            <div class="item-description">
                Threat Level: ${hotspot.threatLevel.toUpperCase()}<br>
                Active Incidents: ${hotspot.incidents}<br>
                Last Updated: ${hotspot.lastUpdate}<br>
                Status: Monitoring active conflicts and military movements
            </div>
        `;
        
        // Add to top of list
        detailsPanel.insertBefore(threatItem, detailsPanel.firstChild);
        
        // Remove after 10 seconds
        setTimeout(() => {
            if (threatItem.parentNode) {
                threatItem.remove();
            }
        }, 10000);
    }
}

// Trigger alert effects for threats
function triggerThreatAlert(hotspot) {
    if (hotspot.threatLevel === 'critical') {
        // Flash the emergency banner
        const banner = document.getElementById('emergencyBanner');
        if (banner) {
            banner.style.animation = 'bannerFlash 0.5s ease 3';
            setTimeout(() => {
                banner.style.animation = 'bannerPulse 2s infinite';
            }, 1500);
        }
        
        // Play siren sound if enabled
        const sirenToggle = document.getElementById('sirenToggle');
        if (sirenToggle && sirenToggle.classList.contains('active')) {
            playAlertSound();
        }
        
        // Update threat level display
        updateThreatLevelDisplay('CRITICAL');
    }
}

// Focus map on specific threat
function focusOnThreat(threatId) {
    const hotspot = GLOBAL_HOTSPOTS.find(h => h.id === threatId);
    if (hotspot && isMapInitialized) {
        worldMap.setView(hotspot.coordinates, 8);
        
        // Highlight the marker
        const marker = threatMarkers[threatId];
        if (marker) {
            marker.openPopup();
            
            // Add temporary highlight effect
            setTimeout(() => {
                marker.closePopup();
            }, 5000);
        }
    }
}

// Track specific threat (add to monitoring list)
function trackThreat(threatId) {
    const hotspot = GLOBAL_HOTSPOTS.find(h => h.id === threatId);
    if (hotspot) {
        // Add to timeline
        addToTimeline(`Started tracking ${hotspot.name}`, 'medium');
        
        // Show notification
        showNotification(`Now tracking: ${hotspot.name}`, 'info');
    }
}

// Add CSS for map markers
function addMapStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes markerPulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes ringExpand {
            0% { transform: scale(1); opacity: 0.7; }
            100% { transform: scale(2); opacity: 0; }
        }
        
        @keyframes bannerFlash {
            0%, 100% { background: linear-gradient(90deg, #ff0000, #ff4444, #ff0000); }
            50% { background: linear-gradient(90deg, #ffffff, #ffaaaa, #ffffff); }
        }
        
        .threat-marker {
            position: relative;
        }
        
        .threat-popup {
            font-family: 'Roboto Mono', monospace;
        }
        
        .threat-popup-content {
            background: rgba(26, 26, 46, 0.95);
            color: #00ff00;
            border: 1px solid #00ff00;
            border-radius: 8px;
            padding: 15px;
        }
        
        .threat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .threat-header h3 {
            color: #00ff00;
            margin: 0;
            font-size: 16px;
        }
        
        .threat-badge {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            color: #000;
        }
        
        .threat-details p {
            margin: 5px 0;
            font-size: 12px;
        }
        
        .threat-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        
        .action-btn {
            background: rgba(0, 255, 0, 0.2);
            color: #00ff00;
            border: 1px solid #00ff00;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.3s ease;
        }
        
        .action-btn:hover {
            background: rgba(0, 255, 0, 0.4);
        }
    `;
    document.head.appendChild(style);
}

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    addMapStyles();
    // Wait a bit for Leaflet to fully load
    setTimeout(initializeMap, 100);
});

// Export functions for global use
window.focusOnThreat = focusOnThreat;
window.trackThreat = trackThreat;
window.updateThreatMarkers = updateThreatMarkers;