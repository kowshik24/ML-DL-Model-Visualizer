// Logistic Regression Visualization
class LogisticRegressionVisualizer {
    constructor() {
        this.width = 800;
        this.height = 500;
        this.margin = { top: 20, right: 20, bottom: 50, left: 60 };
        this.plotWidth = this.width - this.margin.left - this.margin.right;
        this.plotHeight = this.height - this.margin.top - this.margin.bottom;
        
        this.data = [];
        this.weights = [0, 0, 0]; // w0 (bias), w1, w2
        this.learningRate = 0.01;
        this.iterations = 100;
        this.svg = null;
        this.tooltip = null;
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
        const container = d3.select('#logistic-visualization');
        container.selectAll('*').remove();

        this.svg = container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        this.tooltip = utils.createTooltip();
    }

    setupEventListeners() {
        // Learning rate slider
        const learningRateSlider = document.getElementById('learning-rate');
        const learningRateValue = document.getElementById('learning-rate-value');
        
        learningRateSlider.addEventListener('input', utils.debounce((e) => {
            this.learningRate = parseFloat(e.target.value);
            learningRateValue.textContent = this.learningRate.toFixed(3);
        }, 300));

        // Iterations slider
        const iterationsSlider = document.getElementById('iterations');
        const iterationsValue = document.getElementById('iterations-value');
        
        iterationsSlider.addEventListener('input', utils.debounce((e) => {
            this.iterations = parseInt(e.target.value);
            iterationsValue.textContent = this.iterations;
        }, 300));

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
                x: Math.random() * 4 + 1,
                y: Math.random() * 4 + 1,
                class: 0,
                predicted: 0,
                probability: 0
            });
        }
        
        // Class 1 (blue) - top right cluster
        for (let i = 0; i < 30; i++) {
            this.data.push({
                x: Math.random() * 4 + 5,
                y: Math.random() * 4 + 5,
                class: 1,
                predicted: 1,
                probability: 0
            });
        }

        // Add some overlapping points for realism
        for (let i = 0; i < 10; i++) {
            this.data.push({
                x: Math.random() * 2 + 4,
                y: Math.random() * 2 + 4,
                class: Math.random() > 0.5 ? 1 : 0,
                predicted: 0,
                probability: 0
            });
        }

        // Initialize random weights
        this.weights = [
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ];
    }

    render() {
        this.g.selectAll('*').remove();

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain([0, 10])
            .range([0, this.plotWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, 10])
            .range([this.plotHeight, 0]);

        // Draw axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        this.g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.plotHeight})`)
            .call(xAxis);

        this.g.append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // Add axis labels
        this.g.append('text')
            .attr('class', 'axis-label')
            .attr('x', this.plotWidth / 2)
            .attr('y', this.plotHeight + 40)
            .style('text-anchor', 'middle')
            .text('Feature 1');

        this.g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -this.plotHeight / 2)
            .attr('y', -40)
            .style('text-anchor', 'middle')
            .text('Feature 2');

        // Draw decision boundary if weights are trained
        this.drawDecisionBoundary(xScale, yScale);

        // Draw data points
        const circles = this.g.selectAll('.data-point')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class', 'data-point')
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', 0)
            .style('fill', d => d.class === 1 ? '#4ecdc4' : '#ff6b6b')
            .style('opacity', 0.8)
            .style('stroke', '#333')
            .style('stroke-width', 1);

        // Animate points appearance
        circles
            .transition()
            .delay((d, i) => i * 20)
            .duration(500)
            .attr('r', 6);

        // Add tooltips
        circles
            .on('mouseover', (event, d) => {
                this.tooltip
                    .style('opacity', 1)
                    .html(`
                        <strong>Data Point</strong><br/>
                        Feature 1: ${d.x.toFixed(2)}<br/>
                        Feature 2: ${d.y.toFixed(2)}<br/>
                        True Class: ${d.class}<br/>
                        Predicted: ${d.predicted}<br/>
                        Probability: ${(d.probability * 100).toFixed(1)}%
                    `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', () => {
                this.tooltip.style('opacity', 0);
            });
    }

    drawDecisionBoundary(xScale, yScale) {
        // Calculate decision boundary: w0 + w1*x1 + w2*x2 = 0
        // Rearrange to: x2 = -(w0 + w1*x1) / w2
        
        if (Math.abs(this.weights[2]) < 0.001) return; // Avoid division by zero

        const boundaryData = [];
        for (let x = 0; x <= 10; x += 0.1) {
            const y = -(this.weights[0] + this.weights[1] * x) / this.weights[2];
            if (y >= 0 && y <= 10) {
                boundaryData.push({ x, y });
            }
        }

        if (boundaryData.length > 0) {
            const line = d3.line()
                .x(d => xScale(d.x))
                .y(d => yScale(d.y));

            this.g.append('path')
                .datum(boundaryData)
                .attr('class', 'decision-boundary')
                .attr('d', line)
                .style('stroke-dasharray', '0, ' + this.g.select('.decision-boundary').node()?.getTotalLength() || 100)
                .transition()
                .duration(1000)
                .style('stroke-dasharray', 'none');
        }
    }

    sigmoid(z) {
        return 1 / (1 + Math.exp(-z));
    }

    predict(x, y) {
        const z = this.weights[0] + this.weights[1] * x + this.weights[2] * y;
        const probability = this.sigmoid(z);
        return {
            probability: probability,
            prediction: probability >= 0.5 ? 1 : 0
        };
    }

    computeCost() {
        let cost = 0;
        for (const point of this.data) {
            const result = this.predict(point.x, point.y);
            const y = point.class;
            const p = result.probability;
            
            // Cross-entropy loss
            cost += -y * Math.log(p + 1e-15) - (1 - y) * Math.log(1 - p + 1e-15);
        }
        return cost / this.data.length;
    }

    trainModel() {
        if (this.isTraining) return;
        
        this.isTraining = true;
        const button = document.getElementById('train-logistic');
        const originalText = button.textContent;
        button.textContent = 'Training...';
        button.disabled = true;

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

            this.updateExplanation([
                `Training completed after ${this.iterations} iterations`,
                `Final weights: w₀=${this.weights[0].toFixed(3)}, w₁=${this.weights[1].toFixed(3)}, w₂=${this.weights[2].toFixed(3)}`,
                `Decision boundary equation: ${this.weights[0].toFixed(3)} + ${this.weights[1].toFixed(3)}×x₁ + ${this.weights[2].toFixed(3)}×x₂ = 0`,
                `Final cost: ${this.computeCost().toFixed(4)}`
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
            if (iteration % 10 === 0 || iteration === maxIterations) {
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

    animateGradientDescent() {
        // Show step-by-step gradient descent process
        this.updateExplanation([
            'Step 1: Initialize random weights',
            'Step 2: Forward pass - calculate predictions',
            'Step 3: Calculate cost (cross-entropy loss)',
            'Step 4: Backward pass - compute gradients',
            'Step 5: Update weights using gradients',
            'Step 6: Repeat until convergence'
        ]);

        // Create a side panel showing the sigmoid function
        this.showSigmoidFunction();
    }

    showSigmoidFunction() {
        // Create a small subplot showing the sigmoid function
        const sigmoidContainer = this.g.append('g')
            .attr('class', 'sigmoid-plot')
            .attr('transform', `translate(${this.plotWidth - 200}, 20)`);

        const sigmoidWidth = 180;
        const sigmoidHeight = 120;

        // Background
        sigmoidContainer.append('rect')
            .attr('width', sigmoidWidth)
            .attr('height', sigmoidHeight)
            .style('fill', 'white')
            .style('stroke', '#ddd')
            .style('stroke-width', 1);

        // Title
        sigmoidContainer.append('text')
            .attr('x', sigmoidWidth / 2)
            .attr('y', 15)
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text('Sigmoid Function');

        // Sigmoid curve
        const xSigmoid = d3.scaleLinear().domain([-5, 5]).range([10, sigmoidWidth - 10]);
        const ySigmoid = d3.scaleLinear().domain([0, 1]).range([sigmoidHeight - 20, 25]);

        const sigmoidData = [];
        for (let x = -5; x <= 5; x += 0.1) {
            sigmoidData.push({ x, y: this.sigmoid(x) });
        }

        const sigmoidLine = d3.line()
            .x(d => xSigmoid(d.x))
            .y(d => ySigmoid(d.y));

        sigmoidContainer.append('path')
            .datum(sigmoidData)
            .attr('class', 'sigmoid-curve')
            .attr('d', sigmoidLine);

        // Add reference lines
        sigmoidContainer.append('line')
            .attr('x1', 10)
            .attr('x2', sigmoidWidth - 10)
            .attr('y1', ySigmoid(0.5))
            .attr('y2', ySigmoid(0.5))
            .style('stroke', '#999')
            .style('stroke-dasharray', '2,2');

        sigmoidContainer.append('text')
            .attr('x', sigmoidWidth - 15)
            .attr('y', ySigmoid(0.5) - 5)
            .style('font-size', '10px')
            .text('0.5');
    }

    updateExplanation(steps) {
        const stepsList = document.getElementById('logistic-steps');
        stepsList.innerHTML = '';
        
        steps.forEach((step, index) => {
            const li = document.createElement('li');
            li.innerHTML = step; // Using innerHTML to support mathematical notation
            li.style.opacity = '0';
            stepsList.appendChild(li);
            
            // Animate step appearance
            setTimeout(() => {
                li.style.transition = 'opacity 0.5s ease';
                li.style.opacity = '1';
            }, index * 600);
        });
    }

    resize() {
        // Handle window resize
        const container = document.getElementById('logistic-visualization');
        const newWidth = container.clientWidth;
        
        if (newWidth !== this.width) {
            this.width = newWidth;
            this.plotWidth = this.width - this.margin.left - this.margin.right;
            this.svg.attr('width', this.width);
            this.render();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LogisticRegressionVisualizer();
});