// Main WW3 Monitoring Dashboard Controller

class WW3Dashboard {
    constructor() {
        this.sirenEnabled = true;
        this.autoRefreshEnabled = true;
        this.refreshInterval = 30;
        this.currentThreatLevel = 'MODERATE';
        this.notifications = [];
        this.timeline = [];
        
        this.initialize();
    }
    
    initialize() {
        this.setupEventListeners();
        this.startTimeDisplays();
        this.setupSirenSystem();
        this.initializeAnalysisPanel();
        this.startAutoRefresh();
        this.updateGlobalThreatLevel();
        
        console.log('WW3 Dashboard initialized successfully');
    }
    
    // Setup all event listeners
    setupEventListeners() {
        // Control panel buttons
        this.setupSirenToggle();
        this.setupAutoRefreshToggle();
        this.setupFilterButton();
        
        // Emergency banner click
        const banner = document.getElementById('emergencyBanner');
        if (banner) {
            banner.addEventListener('click', () => {
                this.showEmergencyProtocols();
            });
        }
        
        // Threat level indicator click
        const threatIndicator = document.getElementById('threatIndicator');
        if (threatIndicator) {
            threatIndicator.addEventListener('click', () => {
                this.showThreatLevelDetails();
            });
        }
    }
    
    // Setup siren toggle functionality
    setupSirenToggle() {
        const sirenToggle = document.getElementById('sirenToggle');
        if (sirenToggle) {
            sirenToggle.addEventListener('click', () => {
                this.toggleSiren();
            });
        }
    }
    
    // Setup auto-refresh toggle
    setupAutoRefreshToggle() {
        const autoRefresh = document.getElementById('autoRefresh');
        if (autoRefresh) {
            autoRefresh.addEventListener('click', () => {
                this.toggleAutoRefresh();
            });
        }
    }
    
    // Setup filter button
    setupFilterButton() {
        const filterBtn = document.getElementById('filterBtn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                this.showFilterOptions();
            });
        }
    }
    
    // Toggle siren on/off
    toggleSiren() {
        this.sirenEnabled = !this.sirenEnabled;
        const sirenToggle = document.getElementById('sirenToggle');
        
        if (sirenToggle) {
            const icon = sirenToggle.querySelector('i');
            if (this.sirenEnabled) {
                icon.className = 'fas fa-volume-up';
                sirenToggle.innerHTML = '<i class="fas fa-volume-up"></i> SIREN: ON';
                sirenToggle.classList.add('active');
            } else {
                icon.className = 'fas fa-volume-mute';
                sirenToggle.innerHTML = '<i class="fas fa-volume-mute"></i> SIREN: OFF';
                sirenToggle.classList.remove('active');
                this.stopSiren();
            }
        }
        
        this.addToTimeline(`Siren ${this.sirenEnabled ? 'enabled' : 'disabled'}`, 'low');
    }
    
    // Toggle auto-refresh
    toggleAutoRefresh() {
        this.autoRefreshEnabled = !this.autoRefreshEnabled;
        const autoRefresh = document.getElementById('autoRefresh');
        
        if (autoRefresh) {
            if (this.autoRefreshEnabled) {
                autoRefresh.classList.add('active');
                this.startAutoRefresh();
            } else {
                autoRefresh.classList.remove('active');
                this.stopAutoRefresh();
            }
        }
    }
    
    // Start time displays (UTC and Local)
    startTimeDisplays() {
        const updateTime = () => {
            const now = new Date();
            
            // UTC time
            const utcTime = document.getElementById('utcTime');
            if (utcTime) {
                utcTime.textContent = `UTC: ${now.toUTCString().substr(17, 8)}`;
            }
            
            // Local time
            const localTime = document.getElementById('localTime');
            if (localTime) {
                localTime.textContent = `LOCAL: ${now.toLocaleTimeString('en-US', { hour12: false })}`;
            }
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    // Setup siren system with Web Audio API
    setupSirenSystem() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.sirenOscillator = null;
            this.sirenGain = null;
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    // Play alert sound/siren
    playAlertSound() {
        if (!this.sirenEnabled || !this.audioContext) return;
        
        try {
            // Stop existing siren
            this.stopSiren();
            
            // Create oscillator for siren sound
            this.sirenOscillator = this.audioContext.createOscillator();
            this.sirenGain = this.audioContext.createGain();
            
            // Configure siren parameters
            this.sirenOscillator.connect(this.sirenGain);
            this.sirenGain.connect(this.audioContext.destination);
            
            this.sirenOscillator.type = 'sine';
            this.sirenOscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            this.sirenGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            
            // Create siren effect (alternating frequency)
            let time = this.audioContext.currentTime;
            for (let i = 0; i < 6; i++) {
                this.sirenOscillator.frequency.linearRampToValueAtTime(1200, time + 0.5);
                this.sirenOscillator.frequency.linearRampToValueAtTime(800, time + 1);
                time += 1;
            }
            
            this.sirenOscillator.start();
            this.sirenOscillator.stop(this.audioContext.currentTime + 6);
            
            // Clean up after siren ends
            this.sirenOscillator.onended = () => {
                this.sirenOscillator = null;
                this.sirenGain = null;
            };
            
        } catch (error) {
            console.warn('Error playing siren:', error);
        }
    }
    
    // Stop siren
    stopSiren() {
        if (this.sirenOscillator) {
            try {
                this.sirenOscillator.stop();
                this.sirenOscillator = null;
                this.sirenGain = null;
            } catch (error) {
                console.warn('Error stopping siren:', error);
            }
        }
    }
    
    // Initialize analysis panel
    initializeAnalysisPanel() {
        this.updateRiskRegions();
        this.populateSourceReliability();
        this.initializeTimeline();
    }
    
    // Update risk regions display
    updateRiskRegions() {
        const regionList = document.getElementById('regionList');
        if (!regionList) return;
        
        regionList.innerHTML = '';
        
        // Filter high-risk hotspots
        const highRiskRegions = GLOBAL_HOTSPOTS
            .filter(hotspot => hotspot.threatLevel === 'critical' || hotspot.threatLevel === 'high')
            .sort((a, b) => {
                const threatOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return threatOrder[a.threatLevel] - threatOrder[b.threatLevel];
            });
        
        highRiskRegions.forEach(region => {
            const regionItem = document.createElement('div');
            regionItem.className = `region-item ${region.threatLevel}`;
            regionItem.innerHTML = `
                <div class="item-title">${region.name}</div>
                <div class="item-description">
                    ${region.country}<br>
                    Active Incidents: ${region.incidents}<br>
                    Threat Level: ${region.threatLevel.toUpperCase()}<br>
                    Last Update: ${region.lastUpdate}
                </div>
            `;
            regionList.appendChild(regionItem);
        });
    }
    
    // Populate source reliability display
    populateSourceReliability() {
        const reliabilityList = document.getElementById('reliabilityList');
        if (!reliabilityList) return;
        
        reliabilityList.innerHTML = '';
        
        // Sort sources by reliability
        const sortedSources = [...NEWS_SOURCES].sort((a, b) => b.reliability - a.reliability);
        
        sortedSources.slice(0, 8).forEach(source => {
            const reliabilityItem = document.createElement('div');
            reliabilityItem.className = 'reliability-item';
            reliabilityItem.innerHTML = `
                <div class="item-title">
                    ${source.name}
                    <span class="reliability-score">${source.reliability}%</span>
                </div>
                <div class="item-description">
                    ${source.handle} - ${source.type} news source
                </div>
            `;
            reliabilityList.appendChild(reliabilityItem);
        });
    }
    
    // Initialize timeline
    initializeTimeline() {
        this.timeline = [
            { time: new Date(Date.now() - 300000), event: 'Dashboard systems online', level: 'low' },
            { time: new Date(Date.now() - 240000), event: 'Global monitoring network activated', level: 'medium' },
            { time: new Date(Date.now() - 180000), event: 'Intelligence feeds synchronized', level: 'low' },
            { time: new Date(Date.now() - 120000), event: 'Threat assessment protocols engaged', level: 'medium' }
        ];
        
        this.updateTimeline();
    }
    
    // Add item to timeline
    addToTimeline(event, level) {
        this.timeline.unshift({
            time: new Date(),
            event: event,
            level: level
        });
        
        // Keep only last 20 items
        this.timeline = this.timeline.slice(0, 20);
        
        this.updateTimeline();
    }
    
    // Update timeline display
    updateTimeline() {
        const timelineContainer = document.getElementById('timelineContainer');
        if (!timelineContainer) return;
        
        timelineContainer.innerHTML = '';
        
        this.timeline.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = `timeline-item ${item.level}`;
            
            const timeStr = item.time.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
            
            timelineItem.innerHTML = `
                <div class="item-title">${timeStr}</div>
                <div class="item-description">${item.event}</div>
            `;
            
            timelineContainer.appendChild(timelineItem);
        });
    }
    
    // Update global threat level
    updateGlobalThreatLevel() {
        const newLevel = calculateGlobalThreatLevel();
        
        if (newLevel !== this.currentThreatLevel) {
            this.currentThreatLevel = newLevel;
            this.updateThreatLevelDisplay(newLevel);
            this.addToTimeline(`Global threat level changed to ${newLevel}`, 
                newLevel === 'CRITICAL' ? 'critical' : 'high');
        }
        
        // Schedule next update
        setTimeout(() => {
            this.updateGlobalThreatLevel();
        }, 60000); // Update every minute
    }
    
    // Update threat level display
    updateThreatLevelDisplay(level) {
        const threatLevel = document.getElementById('threatLevel');
        const threatIndicator = document.getElementById('threatIndicator');
        
        if (threatLevel) {
            threatLevel.textContent = level;
        }
        
        if (threatIndicator) {
            // Update colors based on threat level
            threatIndicator.style.borderColor = this.getThreatColor(level);
            threatIndicator.style.backgroundColor = `${this.getThreatColor(level)}20`;
            
            if (level === 'CRITICAL') {
                threatIndicator.style.animation = 'criticalPulse 1s infinite';
                this.triggerCriticalAlert();
            } else {
                threatIndicator.style.animation = 'threatPulse 3s infinite';
            }
        }
    }
    
    // Get color for threat level
    getThreatColor(level) {
        const colors = {
            'CRITICAL': '#ff0000',
            'HIGH': '#ff8800',
            'MODERATE': '#ffaa00',
            'LOW': '#00ff00'
        };
        return colors[level] || '#00ff00';
    }
    
    // Trigger critical alert
    triggerCriticalAlert() {
        if (this.sirenEnabled) {
            this.playAlertSound();
        }
        
        // Flash emergency banner
        const banner = document.getElementById('emergencyBanner');
        if (banner) {
            banner.style.animation = 'bannerFlash 0.5s ease 5';
            setTimeout(() => {
                banner.style.animation = 'bannerPulse 2s infinite';
            }, 2500);
        }
        
        // Update banner text
        const bannerText = document.getElementById('bannerText');
        if (bannerText) {
            bannerText.textContent = 'CRITICAL THREAT LEVEL - IMMEDIATE ATTENTION REQUIRED';
            setTimeout(() => {
                bannerText.textContent = 'GLOBAL CONFLICT MONITORING SYSTEM ACTIVE';
            }, 10000);
        }
        
        this.addToTimeline('Critical threat level alert triggered', 'critical');
    }
    
    // Start auto-refresh
    startAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        if (this.autoRefreshEnabled) {
            this.autoRefreshInterval = setInterval(() => {
                this.performAutoRefresh();
            }, this.refreshInterval * 1000);
        }
    }
    
    // Stop auto-refresh
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }
    
    // Perform auto-refresh
    performAutoRefresh() {
        // Update risk regions
        this.updateRiskRegions();
        
        // Update threat markers on map
        if (typeof updateThreatMarkers === 'function') {
            updateThreatMarkers();
        }
        
        // Add refresh event to timeline
        this.addToTimeline('System refresh completed', 'low');
        
        console.log('Auto-refresh completed');
    }
    
    // Show emergency protocols
    showEmergencyProtocols() {
        this.showNotification('Emergency protocols: Shelter in place, monitor official channels, maintain communication', 'warning');
        this.addToTimeline('Emergency protocols accessed', 'medium');
    }
    
    // Show threat level details
    showThreatLevelDetails() {
        const criticalCount = GLOBAL_HOTSPOTS.filter(h => h.threatLevel === 'critical').length;
        const highCount = GLOBAL_HOTSPOTS.filter(h => h.threatLevel === 'high').length;
        
        this.showNotification(
            `Current Assessment: ${criticalCount} critical, ${highCount} high-risk regions monitored`, 
            'info'
        );
    }
    
    // Show filter options
    showFilterOptions() {
        this.showNotification('Filter options: All sources active. Click individual sources to toggle.', 'info');
    }
    
    // Show notification
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        console.log(`Notification: ${message}`);
    }
    
    // Get icon for notification type
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Global utility functions
window.playAlertSound = function() {
    if (window.dashboard && window.dashboard.sirenEnabled) {
        window.dashboard.playAlertSound();
    }
};

window.showNotification = function(message, type = 'info') {
    if (window.dashboard) {
        window.dashboard.showNotification(message, type);
    }
};

window.addToTimeline = function(event, level = 'low') {
    if (window.dashboard) {
        window.dashboard.addToTimeline(event, level);
    }
};

window.updateThreatLevelDisplay = function(level) {
    if (window.dashboard) {
        window.dashboard.updateThreatLevelDisplay(level);
    }
};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for all components to load
    setTimeout(() => {
        window.dashboard = new WW3Dashboard();
    }, 1000);
});

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 70px;
        right: 20px;
        max-width: 400px;
        background: rgba(26, 26, 46, 0.95);
        border: 2px solid #00ff00;
        border-radius: 8px;
        padding: 15px;
        z-index: 1001;
        animation: slideInRight 0.3s ease;
    }
    
    .notification.success {
        border-color: #00ff00;
    }
    
    .notification.warning {
        border-color: #ffaa00;
    }
    
    .notification.error {
        border-color: #ff0000;
    }
    
    .notification.info {
        border-color: #00aaff;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #00ff00;
        font-family: 'Roboto Mono', monospace;
        font-size: 12px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: #888888;
        cursor: pointer;
        padding: 2px;
        margin-left: auto;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes criticalPulse {
        0%, 100% { 
            box-shadow: 0 0 5px #ff0000;
            transform: scale(1);
        }
        50% { 
            box-shadow: 0 0 25px #ff0000, 0 0 35px #ff0000;
            transform: scale(1.02);
        }
    }
`;

document.head.appendChild(notificationStyles);