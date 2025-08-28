// Simplified Logistic Regression Visualization using Canvas
class LogisticRegressionVisualizer {
    constructor() {
        this.width = 800;
        this.height = 400;
        this.data = [];
        this.weights = [0, 0, 0]; // w0 (bias), w1, w2
        this.learningRate = 0.01;
        this.iterations = 100;
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
            window.mlVisualizer.registerModel('logistic-regression', this);
        }
    }

    setupDOM() {
        const container = document.getElementById('logistic-visualization');
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
        // Learning rate slider
        const learningRateSlider = document.getElementById('learning-rate');
        const learningRateValue = document.getElementById('learning-rate-value');
        
        learningRateSlider.addEventListener('input', (e) => {
            this.learningRate = parseFloat(e.target.value);
            learningRateValue.textContent = this.learningRate.toFixed(3);
        });

        // Iterations slider
        const iterationsSlider = document.getElementById('iterations');
        const iterationsValue = document.getElementById('iterations-value');
        
        iterationsSlider.addEventListener('input', (e) => {
            this.iterations = parseInt(e.target.value);
            iterationsValue.textContent = this.iterations;
        });

        // Action buttons
        document.getElementById('train-logistic').addEventListener('click', () => {
            this.trainModel();
        });

        document.getElementById('animate-gradient').addEventListener('click', () => {
            this.animateGradientDescent();
        });
    }

    generateSampleData() {
        // Generate linearly separable data for demonstration
        this.data = [];
        
        // Class 0 (red) - bottom left cluster
        for (let i = 0; i < 30; i++) {
            this.data.push({
                x: Math.random() * 300 + 50,
                y: Math.random() * 150 + 200,
                class: 0,
                predicted: 0,
                probability: 0
            });
        }
        
        // Class 1 (blue) - top right cluster
        for (let i = 0; i < 30; i++) {
            this.data.push({
                x: Math.random() * 300 + 400,
                y: Math.random() * 150 + 50,
                class: 1,
                predicted: 1,
                probability: 0
            });
        }

        // Add some overlapping points for realism
        for (let i = 0; i < 10; i++) {
            this.data.push({
                x: Math.random() * 200 + 300,
                y: Math.random() * 200 + 100,
                class: Math.random() > 0.5 ? 1 : 0,
                predicted: 0,
                probability: 0
            });
        }

        // Initialize random weights
        this.weights = [
            Math.random() - 0.5,
            Math.random() * 0.01 - 0.005,
            Math.random() * 0.01 - 0.005
        ];
    }

    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw axes
        this.drawAxes();
        
        // Draw decision boundary
        this.drawDecisionBoundary();
        
        // Draw data points
        this.drawDataPoints();
        
        // Draw sigmoid function in corner
        this.drawSigmoidFunction();
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
        // Calculate decision boundary: w0 + w1*x1 + w2*x2 = 0
        if (Math.abs(this.weights[2]) < 0.001) return;

        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();

        let hasPoints = false;
        for (let x = 50; x < this.width - 50; x += 5) {
            const y = -(this.weights[0] + this.weights[1] * x) / this.weights[2];
            if (y >= 50 && y <= this.height - 50) {
                if (!hasPoints) {
                    this.ctx.moveTo(x, y);
                    hasPoints = true;
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
        }
        if (hasPoints) {
            this.ctx.stroke();
        }
    }

    drawDataPoints() {
        this.data.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
            this.ctx.fillStyle = point.class === 1 ? '#4ecdc4' : '#ff6b6b';
            this.ctx.fill();
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }

    drawSigmoidFunction() {
        // Draw sigmoid function in bottom right corner
        const sigmoidX = this.width - 200;
        const sigmoidY = this.height - 150;
        const sigmoidW = 180;
        const sigmoidH = 120;

        // Background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(sigmoidX, sigmoidY, sigmoidW, sigmoidH);
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(sigmoidX, sigmoidY, sigmoidW, sigmoidH);

        // Title
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Sigmoid Function', sigmoidX + sigmoidW/2, sigmoidY + 15);

        // Draw sigmoid curve
        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let i = 0; i <= sigmoidW - 20; i += 2) {
            const z = (i / (sigmoidW - 20)) * 10 - 5; // Map to [-5, 5]
            const sigmoid = this.sigmoid(z);
            const x = sigmoidX + 10 + i;
            const y = sigmoidY + 25 + (1 - sigmoid) * (sigmoidH - 50);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();

        // Add reference line at y = 0.5
        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 2]);
        const midY = sigmoidY + 25 + (sigmoidH - 50) / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(sigmoidX + 10, midY);
        this.ctx.lineTo(sigmoidX + sigmoidW - 10, midY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Label
        this.ctx.fillStyle = '#666';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('0.5', sigmoidX + sigmoidW - 25, midY - 3);
    }

    sigmoid(z) {
        return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
    }

    predict(x, y) {
        const z = this.weights[0] + this.weights[1] * x + this.weights[2] * y;
        const probability = this.sigmoid(z);
        return {
            probability: probability,
            prediction: probability >= 0.5 ? 1 : 0
        };
    }

    trainModel() {
        if (this.isTraining) return;
        
        this.isTraining = true;
        const button = document.getElementById('train-logistic');
        const originalText = button.textContent;
        button.textContent = 'Training...';
        button.disabled = true;

        // Show training progress
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Training Logistic Regression...', this.width / 2, this.height / 2);

        // Perform gradient descent
        this.performGradientDescent(() => {
            // Update predictions for all points
            this.data.forEach(point => {
                const result = this.predict(point.x, point.y);
                point.predicted = result.prediction;
                point.probability = result.probability;
            });

            this.render();
            
            button.textContent = originalText;
            button.disabled = false;
            this.isTraining = false;

            const accuracy = this.calculateAccuracy();
            this.updateExplanation([
                `Training completed after ${this.iterations} iterations`,
                `Final weights: w₀=${this.weights[0].toFixed(3)}, w₁=${this.weights[1].toFixed(3)}, w₂=${this.weights[2].toFixed(3)}`,
                `Decision boundary: ${this.weights[0].toFixed(3)} + ${this.weights[1].toFixed(3)}×x₁ + ${this.weights[2].toFixed(3)}×x₂ = 0`,
                `Training accuracy: ${(accuracy * 100).toFixed(1)}%`
            ]);
        });
    }

    performGradientDescent(callback) {
        let iteration = 0;
        const maxIterations = this.iterations;
        const lr = this.learningRate;

        const step = () => {
            if (iteration >= maxIterations) {
                callback();
                return;
            }

            // Compute gradients
            let dw0 = 0, dw1 = 0, dw2 = 0;
            
            for (const point of this.data) {
                const result = this.predict(point.x, point.y);
                const error = result.probability - point.class;
                
                dw0 += error;
                dw1 += error * point.x;
                dw2 += error * point.y;
            }

            // Update weights
            this.weights[0] -= lr * dw0 / this.data.length;
            this.weights[1] -= lr * dw1 / this.data.length;
            this.weights[2] -= lr * dw2 / this.data.length;

            iteration++;

            // Update visualization every 10 iterations
            if (iteration % Math.max(1, Math.floor(maxIterations / 20)) === 0) {
                this.data.forEach(point => {
                    const result = this.predict(point.x, point.y);
                    point.predicted = result.prediction;
                    point.probability = result.probability;
                });
                this.render();
            }

            setTimeout(step, 50); // Small delay for animation
        };

        step();
    }

    calculateAccuracy() {
        let correct = 0;
        this.data.forEach(point => {
            if (point.predicted === point.class) correct++;
        });
        return correct / this.data.length;
    }

    animateGradientDescent() {
        // Show step-by-step gradient descent process
        this.updateExplanation([
            'Step 1: Initialize random weights',
            'Step 2: Forward pass - calculate predictions using sigmoid',
            'Step 3: Calculate cost using cross-entropy loss',
            'Step 4: Backward pass - compute gradients ∂J/∂w',
            'Step 5: Update weights: w := w - α∇J',
            'Step 6: Repeat until convergence'
        ]);

        // Highlight the sigmoid function
        setTimeout(() => {
            this.ctx.strokeStyle = '#ff6b6b';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(this.width - 200, this.height - 150, 180, 120);
            
            // Add explanation text
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText('← Key: Sigmoid maps any real number to (0,1)', this.width - 400, this.height - 90);
        }, 1000);
    }

    updateExplanation(steps) {
        const stepsList = document.getElementById('logistic-steps');
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
            if (distance <= 8) {
                this.canvas.style.cursor = 'pointer';
                this.canvas.title = `Point ${index + 1}\nClass: ${point.class}\nPredicted: ${point.predicted}\nProbability: ${(point.probability * 100).toFixed(1)}%`;
                return;
            }
        });
        
        if (this.canvas.style.cursor === 'pointer') return;
        this.canvas.style.cursor = 'default';
        this.canvas.title = '';
    }

    resize() {
        // Handle window resize
        const container = document.getElementById('logistic-visualization');
        const newWidth = container.clientWidth;
        
        if (newWidth !== this.width && newWidth > 400) {
            this.width = newWidth;
            this.canvas.width = this.width;
            this.render();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LogisticRegressionVisualizer();
});