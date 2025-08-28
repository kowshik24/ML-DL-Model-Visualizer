// Support Vector Machine Visualization
class SVMVisualizer {
    constructor() {
        this.width = 800;
        this.height = 500;
        this.margin = { top: 20, right: 20, bottom: 50, left: 60 };
        this.plotWidth = this.width - this.margin.left - this.margin.right;
        this.plotHeight = this.height - this.margin.top - this.margin.bottom;
        
        this.data = [];
        this.supportVectors = [];
        this.weights = [0, 0];
        this.bias = 0;
        this.C = 1.0;
        this.kernel = 'linear';
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
            window.mlVisualizer.registerModel('svm', this);
        }
    }

    setupDOM() {
        const container = d3.select('#svm-visualization');
        container.selectAll('*').remove();

        this.svg = container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        this.tooltip = utils.createTooltip();
    }

    setupEventListeners() {
        // C parameter slider
        const cSlider = document.getElementById('c-parameter');
        const cValue = document.getElementById('c-parameter-value');
        
        cSlider.addEventListener('input', utils.debounce((e) => {
            this.C = parseFloat(e.target.value);
            cValue.textContent = this.C.toFixed(1);
        }, 300));

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
                x: Math.random() * 3 + 1,
                y: Math.random() * 8 + 1,
                class: -1,
                predicted: -1,
                alpha: 0, // Lagrange multiplier
                isSupportVector: false
            });
        }
        
        // Class +1 (blue) - right side
        for (let i = 0; i < 25; i++) {
            this.data.push({
                x: Math.random() * 3 + 6,
                y: Math.random() * 8 + 1,
                class: 1,
                predicted: 1,
                alpha: 0,
                isSupportVector: false
            });
        }

        // Add some challenging points near the boundary
        for (let i = 0; i < 10; i++) {
            this.data.push({
                x: Math.random() * 2 + 4,
                y: Math.random() * 8 + 1,
                class: Math.random() > 0.6 ? 1 : -1,
                predicted: 0,
                alpha: 0,
                isSupportVector: false
            });
        }

        // Initialize simple linear separator
        this.weights = [0.5, 0];
        this.bias = -2.5;
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

        // Draw decision boundary and margins
        this.drawDecisionBoundary(xScale, yScale);
        this.drawMargins(xScale, yScale);

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
            .style('stroke', d => d.isSupportVector ? '#333' : 'none')
            .style('stroke-width', d => d.isSupportVector ? 3 : 0);

        // Animate points appearance
        circles
            .transition()
            .delay((d, i) => i * 20)
            .duration(500)
            .attr('r', 8);

        // Add tooltips
        circles
            .on('mouseover', (event, d) => {
                this.tooltip
                    .style('opacity', 1)
                    .html(`
                        <strong>Data Point</strong><br/>
                        Feature 1: ${d.x.toFixed(2)}<br/>
                        Feature 2: ${d.y.toFixed(2)}<br/>
                        True Class: ${d.class === 1 ? '+1' : '-1'}<br/>
                        Predicted: ${d.predicted === 1 ? '+1' : '-1'}<br/>
                        ${d.isSupportVector ? '<strong>Support Vector</strong>' : ''}
                        ${d.alpha > 0 ? `<br/>α = ${d.alpha.toFixed(3)}` : ''}
                    `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', () => {
                this.tooltip.style('opacity', 0);
            });
    }

    drawDecisionBoundary(xScale, yScale) {
        // For linear SVM: w1*x1 + w2*x2 + b = 0
        // Rearrange to: x2 = -(w1*x1 + b) / w2
        
        if (Math.abs(this.weights[1]) < 0.001) {
            // Vertical line case
            const x = -this.bias / this.weights[0];
            if (x >= 0 && x <= 10) {
                this.g.append('line')
                    .attr('class', 'decision-boundary')
                    .attr('x1', xScale(x))
                    .attr('x2', xScale(x))
                    .attr('y1', yScale(0))
                    .attr('y2', yScale(10))
                    .style('stroke', '#2c3e50')
                    .style('stroke-width', 3);
            }
        } else {
            const boundaryData = [];
            for (let x = 0; x <= 10; x += 0.1) {
                const y = -(this.weights[0] * x + this.bias) / this.weights[1];
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
                    .style('stroke', '#2c3e50')
                    .style('stroke-width', 3)
                    .style('fill', 'none');
            }
        }
    }

    drawMargins(xScale, yScale) {
        // Calculate margin boundaries: w1*x1 + w2*x2 + b = ±1
        const norm = Math.sqrt(this.weights[0]**2 + this.weights[1]**2);
        
        if (norm < 0.001 || Math.abs(this.weights[1]) < 0.001) return;

        // Positive margin: w1*x1 + w2*x2 + b = +1
        const posMarginData = [];
        for (let x = 0; x <= 10; x += 0.1) {
            const y = -(this.weights[0] * x + this.bias - 1) / this.weights[1];
            if (y >= 0 && y <= 10) {
                posMarginData.push({ x, y });
            }
        }

        // Negative margin: w1*x1 + w2*x2 + b = -1
        const negMarginData = [];
        for (let x = 0; x <= 10; x += 0.1) {
            const y = -(this.weights[0] * x + this.bias + 1) / this.weights[1];
            if (y >= 0 && y <= 10) {
                negMarginData.push({ x, y });
            }
        }

        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));

        // Draw margin lines
        if (posMarginData.length > 0) {
            this.g.append('path')
                .datum(posMarginData)
                .attr('class', 'margin-line')
                .attr('d', line);
        }

        if (negMarginData.length > 0) {
            this.g.append('path')
                .datum(negMarginData)
                .attr('class', 'margin-line')
                .attr('d', line);
        }

        // Add margin width annotation
        const marginWidth = 2 / norm;
        this.g.append('text')
            .attr('x', this.plotWidth - 10)
            .attr('y', 15)
            .style('text-anchor', 'end')
            .style('font-size', '12px')
            .style('fill', '#666')
            .text(`Margin Width: ${marginWidth.toFixed(3)}`);
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

            const supportVectorCount = this.data.filter(d => d.isSupportVector).length;
            this.updateExplanation([
                `SVM training completed using SMO algorithm`,
                `Found ${supportVectorCount} support vectors`,
                `Decision boundary: ${this.weights[0].toFixed(3)}×x₁ + ${this.weights[1].toFixed(3)}×x₂ + ${this.bias.toFixed(3)} = 0`,
                `Margin width: ${(2 / Math.sqrt(this.weights[0]**2 + this.weights[1]**2)).toFixed(3)}`,
                `C parameter: ${this.C} (regularization strength)`
            ]);
        });
    }

    performSMOAlgorithm(callback) {
        // Simplified Sequential Minimal Optimization
        let iteration = 0;
        const maxIterations = 100;
        
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
                    const lr = 0.01;
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

            if (iteration % 10 === 0) {
                this.data.forEach(point => {
                    point.predicted = this.predict(point.x, point.y);
                });
                this.render();
            }

            if (changed) {
                setTimeout(step, 100);
            } else {
                callback();
            }
        };

        step();
    }

    identifySupportVectors() {
        // Identify support vectors (points on the margin)
        this.data.forEach(point => {
            const score = this.weights[0] * point.x + this.weights[1] * point.y + this.bias;
            const margin = Math.abs(score);
            
            // Points close to the decision boundary are support vectors
            point.isSupportVector = margin < 1.1 && margin > 0.9;
        });

        this.supportVectors = this.data.filter(d => d.isSupportVector);
    }

    highlightSupportVectors() {
        // Animate highlighting of support vectors
        this.g.selectAll('.data-point')
            .transition()
            .duration(500)
            .style('stroke', d => d.isSupportVector ? '#ff6b6b' : 'none')
            .style('stroke-width', d => d.isSupportVector ? 4 : 0)
            .attr('r', d => d.isSupportVector ? 10 : 8);

        // Add support vector explanation
        this.updateExplanation([
            'Support vectors highlighted in red border',
            'These are the critical points that define the decision boundary',
            'Only support vectors affect the position of the hyperplane',
            'Other points can be moved without changing the decision boundary',
            'The margin is maximized between support vectors of different classes'
        ]);

        // Show support vector details
        setTimeout(() => {
            this.showSupportVectorDetails();
        }, 1000);
    }

    showSupportVectorDetails() {
        // Create a small info panel showing support vector statistics
        const infoPanel = this.g.append('g')
            .attr('class', 'support-vector-info')
            .attr('transform', `translate(10, 10)`);

        const panelWidth = 200;
        const panelHeight = 100;

        // Background
        infoPanel.append('rect')
            .attr('width', panelWidth)
            .attr('height', panelHeight)
            .style('fill', 'rgba(255, 255, 255, 0.95)')
            .style('stroke', '#ddd')
            .style('stroke-width', 1)
            .style('rx', 5);

        // Title
        infoPanel.append('text')
            .attr('x', panelWidth / 2)
            .attr('y', 20)
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text('Support Vector Info');

        // Statistics
        const svCount = this.supportVectors.length;
        const totalCount = this.data.length;
        
        infoPanel.append('text')
            .attr('x', 10)
            .attr('y', 40)
            .style('font-size', '12px')
            .text(`Support Vectors: ${svCount}`);

        infoPanel.append('text')
            .attr('x', 10)
            .attr('y', 55)
            .style('font-size', '12px')
            .text(`Total Points: ${totalCount}`);

        infoPanel.append('text')
            .attr('x', 10)
            .attr('y', 70)
            .style('font-size', '12px')
            .text(`Percentage: ${((svCount / totalCount) * 100).toFixed(1)}%`);

        infoPanel.append('text')
            .attr('x', 10)
            .attr('y', 85)
            .style('font-size', '12px')
            .text(`Kernel: ${this.kernel}`);
    }

    updateExplanation(steps) {
        const stepsList = document.getElementById('svm-steps');
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
        const container = document.getElementById('svm-visualization');
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
    new SVMVisualizer();
});