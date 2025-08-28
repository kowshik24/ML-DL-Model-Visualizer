// Main application controller
class MLVisualizer {
    constructor() {
        this.currentModel = 'decision-tree';
        this.models = {};
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.initializeModels();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.model-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Update active section
                const modelType = link.getAttribute('data-model');
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(modelType).classList.add('active');

                this.currentModel = modelType;
            });
        });
    }

    setupEventListeners() {
        // Add any global event listeners here
        window.addEventListener('resize', () => {
            if (this.models[this.currentModel] && this.models[this.currentModel].resize) {
                this.models[this.currentModel].resize();
            }
        });
    }

    initializeModels() {
        // Initialize each model when the page loads
        // Models will be created by their respective JS files
    }

    registerModel(name, model) {
        this.models[name] = model;
    }
}

// Utility functions
const utils = {
    // Generate random data for demonstrations
    generateRandomData: function(n = 100, classes = 2) {
        const data = [];
        for (let i = 0; i < n; i++) {
            data.push({
                x: Math.random() * 10,
                y: Math.random() * 10,
                class: Math.floor(Math.random() * classes)
            });
        }
        return data;
    },

    // Color schemes for different classes
    colorScheme: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'],

    // Animation helpers
    animateValue: function(element, start, end, duration, callback) {
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (end - start) * progress;
            element.textContent = Math.round(current * 100) / 100;
            
            if (callback) callback(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    },

    // Debounce function for input events
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Create tooltip
    createTooltip: function() {
        const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
        return tooltip;
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mlVisualizer = new MLVisualizer();
});