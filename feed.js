// Live Twitter Feed Simulation for WW3 Monitoring Dashboard

class TwitterFeedManager {
    constructor() {
        this.feedContainer = document.getElementById('feedContainer');
        this.isPaused = false;
        this.feedItems = [];
        this.maxItems = 50;
        this.updateInterval = null;
        this.feedSpeed = 15000; // 15 seconds between new items
        
        this.initialize();
    }
    
    initialize() {
        this.startFeed();
        this.setupControls();
        this.generateInitialFeed();
    }
    
    // Generate initial feed items
    generateInitialFeed() {
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.addFeedItem(generateNewsItem());
            }, i * 2000);
        }
    }
    
    // Start the live feed updates
    startFeed() {
        this.updateInterval = setInterval(() => {
            if (!this.isPaused) {
                this.addFeedItem(generateNewsItem());
                this.updateStats();
            }
        }, this.feedSpeed);
    }
    
    // Stop the feed updates
    stopFeed() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
    
    // Add new feed item to the top
    addFeedItem(newsItem) {
        if (!this.feedContainer) return;
        
        const feedElement = this.createFeedElement(newsItem);
        
        // Add to top of feed
        this.feedContainer.insertBefore(feedElement, this.feedContainer.firstChild);
        
        // Add to items array
        this.feedItems.unshift(newsItem);
        
        // Remove excess items
        this.maintainFeedSize();
        
        // Trigger map update if coordinates available
        if (newsItem.coordinates) {
            this.highlightLocationOnMap(newsItem);
        }
        
        // Play alert sound for critical items
        if (newsItem.threatLevel === 'critical') {
            this.triggerCriticalAlert(newsItem);
        }
        
        // Update last update time
        this.updateLastUpdateTime();
    }
    
    // Create HTML element for feed item
    createFeedElement(newsItem) {
        const feedItem = document.createElement('div');
        feedItem.className = `feed-item ${newsItem.threatLevel}`;
        feedItem.setAttribute('data-id', newsItem.id);
        
        const timestamp = this.formatTimestamp(newsItem.timestamp);
        const timeAgo = this.getTimeAgo(newsItem.timestamp);
        
        feedItem.innerHTML = `
            <div class="feed-header">
                <div class="source-info">
                    <span class="source-name">${newsItem.source.name}</span>
                    <span class="source-handle">${newsItem.source.handle}</span>
                </div>
                <div class="time-info">
                    <span class="timestamp">${timeAgo}</span>
                    <span class="threat-indicator ${newsItem.threatLevel}">
                        ${newsItem.threatLevel.toUpperCase()}
                    </span>
                </div>
            </div>
            <div class="feed-content">
                ${this.processContent(newsItem.content)}
            </div>
            <div class="feed-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${newsItem.location.name}, ${newsItem.location.country}</span>
                <div class="coordinates">
                    ${newsItem.coordinates[0].toFixed(4)}, ${newsItem.coordinates[1].toFixed(4)}
                </div>
            </div>
            <div class="feed-actions">
                <button class="feed-action-btn" onclick="locateOnMap(${newsItem.coordinates[0]}, ${newsItem.coordinates[1]})">
                    <i class="fas fa-crosshairs"></i> Locate
                </button>
                <button class="feed-action-btn" onclick="shareNews('${newsItem.id}', '${newsItem.tweetUrl}')">
                    <i class="fas fa-share"></i> Share News
                </button>
                <button class="feed-action-btn reliability-btn">
                    <i class="fas fa-shield-alt"></i> ${newsItem.source.reliability}%
                </button>
            </div>
        `;
        
        return feedItem;
    }
    
    // Process content for special formatting
    processContent(content) {
        // Highlight important keywords
        const keywords = {
            'BREAKING': '<span class="keyword critical">BREAKING</span>',
            'URGENT': '<span class="keyword critical">URGENT</span>',
            'ALERT': '<span class="keyword critical">ALERT</span>',
            'CRITICAL': '<span class="keyword critical">CRITICAL</span>',
            'military': '<span class="keyword high">military</span>',
            'attack': '<span class="keyword critical">attack</span>',
            'missile': '<span class="keyword critical">missile</span>',
            'nuclear': '<span class="keyword critical">nuclear</span>',
            'evacuation': '<span class="keyword high">evacuation</span>',
            'deployment': '<span class="keyword medium">deployment</span>',
            'sanctions': '<span class="keyword medium">sanctions</span>'
        };
        
        let processedContent = content;
        Object.keys(keywords).forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            processedContent = processedContent.replace(regex, keywords[keyword]);
        });
        
        return processedContent;
    }
    
    // Format timestamp for display
    formatTimestamp(timestamp) {
        return timestamp.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    // Get relative time (time ago)
    getTimeAgo(timestamp) {
        const now = new Date();
        const diffMs = now - timestamp;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }
    
    // Maintain feed size limit
    maintainFeedSize() {
        while (this.feedContainer.children.length > this.maxItems) {
            this.feedContainer.removeChild(this.feedContainer.lastChild);
        }
        
        while (this.feedItems.length > this.maxItems) {
            this.feedItems.pop();
        }
    }
    
    // Highlight location on map
    highlightLocationOnMap(newsItem) {
        if (typeof focusOnThreat === 'function') {
            // Find matching hotspot
            const hotspot = GLOBAL_HOTSPOTS.find(h => 
                Math.abs(h.coordinates[0] - newsItem.coordinates[0]) < 5 &&
                Math.abs(h.coordinates[1] - newsItem.coordinates[1]) < 5
            );
            
            if (hotspot) {
                // Briefly highlight the hotspot
                setTimeout(() => {
                    focusOnThreat(hotspot.id);
                }, 1000);
            }
        }
    }
    
    // Trigger critical alert
    triggerCriticalAlert(newsItem) {
        // Flash the feed item
        const feedElement = this.feedContainer.querySelector(`[data-id="${newsItem.id}"]`);
        if (feedElement) {
            feedElement.style.animation = 'criticalFlash 1s ease 3';
        }
        
        // Update active incidents count
        this.updateActiveIncidents();
        
        // Trigger siren if enabled
        if (window.playAlertSound) {
            window.playAlertSound();
        }
    }
    
    // Setup feed controls
    setupControls() {
        const pauseBtn = document.getElementById('pauseBtn');
        const clearBtn = document.getElementById('clearBtn');
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearFeed();
            });
        }
    }
    
    // Toggle feed pause
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (pauseBtn) {
            const icon = pauseBtn.querySelector('i');
            if (this.isPaused) {
                icon.className = 'fas fa-play';
                pauseBtn.title = 'Resume Feed';
            } else {
                icon.className = 'fas fa-pause';
                pauseBtn.title = 'Pause Feed';
            }
        }
    }
    
    // Clear all feed items
    clearFeed() {
        if (this.feedContainer) {
            this.feedContainer.innerHTML = '';
        }
        this.feedItems = [];
        this.updateStats();
    }
    
    // Update statistics
    updateStats() {
        this.updateActiveIncidents();
        this.updateSourcesCount();
        this.updateLastUpdateTime();
    }
    
    // Update active incidents count
    updateActiveIncidents() {
        const criticalItems = this.feedItems.filter(item => item.threatLevel === 'critical').length;
        const highItems = this.feedItems.filter(item => item.threatLevel === 'high').length;
        const activeIncidents = criticalItems * 2 + highItems;
        
        const incidentsElement = document.getElementById('activeIncidents');
        if (incidentsElement) {
            incidentsElement.textContent = activeIncidents;
            incidentsElement.className = activeIncidents > 10 ? 'critical-count' : '';
        }
    }
    
    // Update sources count
    updateSourcesCount() {
        const uniqueSources = new Set(this.feedItems.map(item => item.source.handle));
        const sourcesElement = document.getElementById('sourcesCount');
        if (sourcesElement) {
            sourcesElement.textContent = uniqueSources.size;
        }
    }
    
    // Update last update time
    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
    
    // Get feed items by threat level
    getItemsByThreatLevel(level) {
        return this.feedItems.filter(item => item.threatLevel === level);
    }
    
    // Search feed items
    searchFeed(query) {
        const lowerQuery = query.toLowerCase();
        return this.feedItems.filter(item =>
            item.content.toLowerCase().includes(lowerQuery) ||
            item.source.name.toLowerCase().includes(lowerQuery) ||
            item.location.name.toLowerCase().includes(lowerQuery)
        );
    }
}

// Global functions for feed interactions
function locateOnMap(lat, lng) {
    if (typeof worldMap !== 'undefined' && worldMap) {
        worldMap.setView([lat, lng], 8);
        
        // Add temporary marker
        const tempMarker = L.marker([lat, lng])
            .addTo(worldMap)
            .bindPopup(`Incident Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            .openPopup();
        
        // Remove marker after 5 seconds
        setTimeout(() => {
            worldMap.removeLayer(tempMarker);
        }, 5000);
    }
}

function shareIntel(itemId) {
    // Simulate sharing intelligence
    showNotification('Intelligence shared with allied forces', 'success');
    
    // Add to timeline
    if (typeof addToTimeline === 'function') {
        addToTimeline('Intelligence package transmitted', 'low');
    }
}

// Initialize feed manager when DOM is loaded
let twitterFeed;

document.addEventListener('DOMContentLoaded', function() {
    // Wait for other components to load
    setTimeout(() => {
        twitterFeed = new TwitterFeedManager();
    }, 500);
});

// Add CSS for feed styling
const feedStyles = document.createElement('style');
feedStyles.textContent = `
    @keyframes criticalFlash {
        0%, 100% { background: rgba(0, 0, 0, 0.3); }
        50% { background: rgba(255, 0, 0, 0.3); }
    }
    
    .keyword {
        font-weight: bold;
        padding: 1px 3px;
        border-radius: 2px;
    }
    
    .keyword.critical {
        background: #ff0000;
        color: #ffffff;
    }
    
    .keyword.high {
        background: #ff8800;
        color: #ffffff;
    }
    
    .keyword.medium {
        background: #ffaa00;
        color: #000000;
    }
    
    .source-info {
        display: flex;
        flex-direction: column;
    }
    
    .source-handle {
        font-size: 10px;
        color: #888888;
        margin-top: 2px;
    }
    
    .time-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }
    
    .threat-indicator {
        font-size: 8px;
        padding: 2px 6px;
        border-radius: 8px;
        margin-top: 3px;
    }
    
    .threat-indicator.critical {
        background: #ff0000;
        color: #ffffff;
    }
    
    .threat-indicator.high {
        background: #ff8800;
        color: #ffffff;
    }
    
    .threat-indicator.medium {
        background: #ffaa00;
        color: #000000;
    }
    
    .threat-indicator.low {
        background: #00ff00;
        color: #000000;
    }
    
    .coordinates {
        font-size: 10px;
        color: #666666;
        margin-top: 2px;
    }
    
    .feed-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px solid rgba(0, 255, 0, 0.2);
    }
    
    .feed-action-btn {
        background: rgba(0, 255, 0, 0.1);
        color: #00ff00;
        border: 1px solid rgba(0, 255, 0, 0.3);
        padding: 4px 8px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 10px;
        transition: all 0.3s ease;
    }
    
    .feed-action-btn:hover {
        background: rgba(0, 255, 0, 0.2);
    }
    
    .reliability-btn {
        background: rgba(0, 170, 0, 0.2);
        cursor: default;
    }
    
    .critical-count {
        color: #ff0000 !important;
        animation: countPulse 2s infinite;
    }
    
    @keyframes countPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;

document.head.appendChild(feedStyles);