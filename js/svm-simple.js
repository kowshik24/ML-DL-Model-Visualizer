// Simplified Support Vector Machine Visualization using Canvas
class SVMVisualizer {
    constructor() {
        this.width = 800;
        this.height = 400;
        this.data = [];
        this.supportVectors = [];
        this.weights = [0, 0];
        this.bias = 0;
        this.C = 1.0;
        this.kernel = 'linear';
        this.canvas = null;
        this.ctx = null;
        this.isTraining = false;
        
        this.init();
    }

    init() {
        this.setupDOM();
        this.setupEventListeners();
        this.generateSampleData();
        this.render();
        
        // Register with main application
        if (window.mlVisualizer) {
            window.mlVisualizer.registerModel('svm', this);
        }
    }

    setupDOM() {
        const container = document.getElementById('svm-visualization');
        container.innerHTML = '';

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.border = '1px solid #ddd';
        this.canvas.style.borderRadius = '10px';
        this.canvas.style.background = '#fafafa';
        
        container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Add mouse interaction
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    setupEventListeners() {
        // C parameter slider
        const cSlider = document.getElementById('c-parameter');
        const cValue = document.getElementById('c-parameter-value');
        
        cSlider.addEventListener('input', (e) => {
            this.C = parseFloat(e.target.value);
            cValue.textContent = this.C.toFixed(1);
        });

        // Kernel selector
        const kernelSelect = document.getElementById('kernel-select');
        kernelSelect.addEventListener('change', (e) => {
            this.kernel = e.target.value;
            this.render();
        });

        // Action buttons
        document.getElementById('train-svm').addEventListener('click', () => {
            this.trainSVM();
        });

        document.getElementById('show-support-vectors').addEventListener('click', () => {
            this.highlightSupportVectors();
        });
    }

    generateSampleData() {
        // Generate linearly separable data with some noise
        this.data = [];
        
        // Class -1 (red) - left side
        for (let i = 0; i < 25; i++) {
            this.data.push({
                x: Math.random() * 250 + 50,
                y: Math.random() * 300 + 50,
                class: -1,
                predicted: -1,
                alpha: 0,
                isSupportVector: false
            });
        }
        
        // Class +1 (blue) - right side
        for (let i = 0; i < 25; i++) {
            this.data.push({
                x: Math.random() * 250 + 450,
                y: Math.random() * 300 + 50,
                class: 1,
                predicted: 1,
                alpha: 0,
                isSupportVector: false
            });
        }

        // Add some challenging points near the boundary
        for (let i = 0; i < 10; i++) {
            this.data.push({
                x: Math.random() * 150 + 300,
                y: Math.random() * 300 + 50,
                class: Math.random() > 0.6 ? 1 : -1,
                predicted: 0,
                alpha: 0,
                isSupportVector: false
            });
        }

        // Initialize simple linear separator
        this.weights = [0.01, 0];
        this.bias = -350; // Separates left and right sides
    }

    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw axes
        this.drawAxes();
        
        // Draw decision boundary and margins
        this.drawDecisionBoundary();
        this.drawMargins();
        
        // Draw data points
        this.drawDataPoints();
        
        // Draw info panel
        this.drawInfoPanel();
    }

    drawAxes() {
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;
        
        // X axis
        this.ctx.beginPath();
        this.ctx.moveTo(50, this.height - 50);
        this.ctx.lineTo(this.width - 50, this.height - 50);
        this.ctx.stroke();
        
        // Y axis
        this.ctx.beginPath();
        this.ctx.moveTo(50, this.height - 50);
        this.ctx.lineTo(50, 50);
        this.ctx.stroke();
        
        // Labels
        this.ctx.fillStyle = '#666';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Feature 1', this.width / 2, this.height - 20);
        
        this.ctx.save();
        this.ctx.translate(20, this.height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Feature 2', 0, 0);
        this.ctx.restore();
    }

    drawDecisionBoundary() {
        // For linear SVM: w1*x1 + w2*x2 + b = 0
        const norm = Math.sqrt(this.weights[0]**2 + this.weights[1]**2);
        if (norm < 0.001) return;

        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();

        if (Math.abs(this.weights[1]) < 0.001) {
            // Vertical line case
            const x = -this.bias / this.weights[0];
            if (x >= 50 && x <= this.width - 50) {
                this.ctx.moveTo(x, 50);
                this.ctx.lineTo(x, this.height - 50);
            }
        } else {
            // General case
            let hasPoints = false;
            for (let x = 50; x < this.width - 50; x += 5) {
                const y = -(this.weights[0] * x + this.bias) / this.weights[1];
                if (y >= 50 && y <= this.height - 50) {
                    if (!hasPoints) {
                        this.ctx.moveTo(x, y);
                        hasPoints = true;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
            }
        }
        this.ctx.stroke();
    }

    drawMargins() {
        // Calculate margin boundaries: w1*x1 + w2*x2 + b = ±1
        const norm = Math.sqrt(this.weights[0]**2 + this.weights[1]**2);
        if (norm < 0.001 || Math.abs(this.weights[1]) < 0.001) return;

        this.ctx.strokeStyle = '#6c757d';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);

        // Positive margin: w1*x1 + w2*x2 + b = +1
        this.ctx.beginPath();
        let hasPoints = false;
        for (let x = 50; x < this.width - 50; x += 5) {
            const y = -(this.weights[0] * x + this.bias - 1) / this.weights[1];
            if (y >= 50 && y <= this.height - 50) {
                if (!hasPoints) {
                    this.ctx.moveTo(x, y);
                    hasPoints = true;
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
        }
        if (hasPoints) this.ctx.stroke();

        // Negative margin: w1*x1 + w2*x2 + b = -1
        this.ctx.beginPath();
        hasPoints = false;
        for (let x = 50; x < this.width - 50; x += 5) {
            const y = -(this.weights[0] * x + this.bias + 1) / this.weights[1];
            if (y >= 50 && y <= this.height - 50) {
                if (!hasPoints) {
                    this.ctx.moveTo(x, y);
                    hasPoints = true;
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
        }
        if (hasPoints) this.ctx.stroke();

        this.ctx.setLineDash([]);
    }

    drawDataPoints() {
        this.data.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.isSupportVector ? 10 : 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = point.class === 1 ? '#4ecdc4' : '#ff6b6b';
            this.ctx.fill();
            
            // Highlight support vectors
            if (point.isSupportVector) {
                this.ctx.strokeStyle = '#ff6b6b';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            } else {
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        });
    }

    drawInfoPanel() {
        // Draw info panel in top right
        const panelX = this.width - 220;
        const panelY = 10;
        const panelW = 200;
        const panelH = 120;

        // Background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fillRect(panelX, panelY, panelW, panelH);
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(panelX, panelY, panelW, panelH);

        // Title
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SVM Information', panelX + panelW/2, panelY + 20);

        // Information
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        
        const svCount = this.supportVectors.length;
        const marginWidth = Math.sqrt(this.weights[0]**2 + this.weights[1]**2) > 0 
            ? 2 / Math.sqrt(this.weights[0]**2 + this.weights[1]**2) : 0;

        this.ctx.fillText(`Support Vectors: ${svCount}`, panelX + 10, panelY + 40);
        this.ctx.fillText(`Margin Width: ${marginWidth.toFixed(3)}`, panelX + 10, panelY + 55);
        this.ctx.fillText(`C Parameter: ${this.C}`, panelX + 10, panelY + 70);
        this.ctx.fillText(`Kernel: ${this.kernel}`, panelX + 10, panelY + 85);
        this.ctx.fillText(`Total Points: ${this.data.length}`, panelX + 10, panelY + 100);
    }

    predict(x, y) {
        const score = this.weights[0] * x + this.weights[1] * y + this.bias;
        return score >= 0 ? 1 : -1;
    }

    trainSVM() {
        if (this.isTraining) return;
        
        this.isTraining = true;
        const button = document.getElementById('train-svm');
        const originalText = button.textContent;
        button.textContent = 'Training...';
        button.disabled = true;

        // Show training progress
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Training SVM...', this.width / 2, this.height / 2);

        // Simulate SVM training (simplified SMO algorithm)
        this.performSMOAlgorithm(() => {
            // Update predictions for all points
            this.data.forEach(point => {
                point.predicted = this.predict(point.x, point.y);
            });

            this.identifySupportVectors();
            this.render();
            
            button.textContent = originalText;
            button.disabled = false;
            this.isTraining = false;

            const accuracy = this.calculateAccuracy();
            const supportVectorCount = this.data.filter(d => d.isSupportVector).length;
            this.updateExplanation([
                `SVM training completed using SMO algorithm`,
                `Found ${supportVectorCount} support vectors`,
                `Decision boundary: ${this.weights[0].toFixed(3)}×x₁ + ${this.weights[1].toFixed(3)}×x₂ + ${this.bias.toFixed(3)} = 0`,
                `Margin width: ${(2 / Math.sqrt(this.weights[0]**2 + this.weights[1]**2)).toFixed(3)}`,
                `Training accuracy: ${(accuracy * 100).toFixed(1)}%`
            ]);
        });
    }

    performSMOAlgorithm(callback) {
        // Simplified Sequential Minimal Optimization
        let iteration = 0;
        const maxIterations = 50;
        
        const step = () => {
            if (iteration >= maxIterations) {
                callback();
                return;
            }

            // Simple gradient descent for demonstration
            let changed = false;
            
            for (let i = 0; i < this.data.length; i++) {
                const point = this.data[i];
                const prediction = this.weights[0] * point.x + this.weights[1] * point.y + this.bias;
                const margin = point.class * prediction;
                
                if (margin < 1) {
                    // Update weights and bias
                    const lr = 0.001;
                    this.weights[0] += lr * point.class * point.x;
                    this.weights[1] += lr * point.class * point.y;
                    this.bias += lr * point.class;
                    
                    point.alpha = Math.min(this.C, point.alpha + 0.1);
                    changed = true;
                }
            }

            // Regularization
            this.weights[0] *= 0.999;
            this.weights[1] *= 0.999;

            iteration++;

            if (iteration % 5 === 0) {
                this.data.forEach(point => {
                    point.predicted = this.predict(point.x, point.y);
                });
                this.identifySupportVectors();
                this.render();
            }

            setTimeout(step, 100);
        };

        step();
    }

    identifySupportVectors() {
        // Identify support vectors (points on the margin)
        this.data.forEach(point => {
            const score = this.weights[0] * point.x + this.weights[1] * point.y + this.bias;
            const margin = Math.abs(score);
            
            // Points close to the decision boundary are support vectors
            point.isSupportVector = margin < 1.2 && margin > 0.8;
        });

        this.supportVectors = this.data.filter(d => d.isSupportVector);
    }

    calculateAccuracy() {
        let correct = 0;
        this.data.forEach(point => {
            if (point.predicted === point.class) correct++;
        });
        return correct / this.data.length;
    }

    highlightSupportVectors() {
        // First identify support vectors
        this.identifySupportVectors();
        
        // Re-render with highlights
        this.render();

        // Add support vector explanation
        const svCount = this.supportVectors.length;
        this.updateExplanation([
            `${svCount} support vectors highlighted with red borders`,
            'These are the critical points that define the decision boundary',
            'Only support vectors affect the position of the hyperplane',
            'Other points can be moved without changing the decision boundary',
            'The margin is maximized between support vectors of different classes',
            `Support vector percentage: ${((svCount / this.data.length) * 100).toFixed(1)}%`
        ]);

        // Animate support vector highlighting
        setTimeout(() => {
            this.animateSupportVectors();
        }, 500);
    }

    animateSupportVectors() {
        let flash = 0;
        const maxFlash = 6;
        
        const flashInterval = setInterval(() => {
            // Toggle support vector visibility
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.drawAxes();
            this.drawDecisionBoundary();
            this.drawMargins();
            
            // Draw regular points
            this.data.forEach(point => {
                if (!point.isSupportVector || flash % 2 === 0) {
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, point.isSupportVector ? 12 : 8, 0, 2 * Math.PI);
                    this.ctx.fillStyle = point.class === 1 ? '#4ecdc4' : '#ff6b6b';
                    this.ctx.fill();
                    
                    if (point.isSupportVector) {
                        this.ctx.strokeStyle = '#ff6b6b';
                        this.ctx.lineWidth = 4;
                        this.ctx.stroke();
                    } else {
                        this.ctx.strokeStyle = '#333';
                        this.ctx.lineWidth = 1;
                        this.ctx.stroke();
                    }
                }
            });
            
            this.drawInfoPanel();
            
            flash++;
            if (flash >= maxFlash) {
                clearInterval(flashInterval);
                this.render(); // Final render
            }
        }, 300);
    }

    updateExplanation(steps) {
        const stepsList = document.getElementById('svm-steps');
        stepsList.innerHTML = '';
        
        steps.forEach((step, index) => {
            const li = document.createElement('li');
            li.innerHTML = step; // Using innerHTML to support mathematical notation
            li.style.opacity = '0';
            li.style.transition = 'opacity 0.5s ease';
            stepsList.appendChild(li);
            
            // Animate step appearance
            setTimeout(() => {
                li.style.opacity = '1';
            }, index * 600);
        });
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if mouse is over a data point
        this.data.forEach((point, index) => {
            const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
            if (distance <= (point.isSupportVector ? 12 : 8)) {
                this.canvas.style.cursor = 'pointer';
                this.canvas.title = `Point ${index + 1}\nClass: ${point.class === 1 ? '+1' : '-1'}\nPredicted: ${point.predicted === 1 ? '+1' : '-1'}\n${point.isSupportVector ? 'Support Vector' : 'Regular Point'}\nα = ${point.alpha.toFixed(3)}`;
                return;
            }
        });
        
        if (this.canvas.style.cursor === 'pointer') return;
        this.canvas.style.cursor = 'default';
        this.canvas.title = '';
    }

    resize() {
        // Handle window resize
        const container = document.getElementById('svm-visualization');
        const newWidth = container.clientWidth;
        
        if (newWidth !== this.width && newWidth > 400) {
            const scaleX = newWidth / this.width;
            this.width = newWidth;
            this.canvas.width = this.width;
            
            // Scale data points
            this.data.forEach(point => {
                point.x *= scaleX;
            });
            
            this.render();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SVMVisualizer();
});