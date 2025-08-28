// Interactive Visualizations for ML/DL Models

// Initialize visualizations when modal opens
window.initializeVisualizations = function(modelType) {
    setTimeout(() => {
        switch (modelType) {
            case 'linear-regression':
                initLinearRegression();
                break;
            case 'decision-tree':
                initDecisionTree();
                break;
            case 'svm':
                initSVM();
                break;
            case 'kmeans':
                initKMeans();
                break;
            case 'neural-network':
                initNeuralNetwork();
                break;
            case 'cnn':
                initCNN();
                break;
            case 'rnn':
                initRNN();
                break;
            case 'transformer':
                initTransformer();
                break;
        }
    }, 100);
};

// Trigger animations
window.triggerAnimation = function(modelType) {
    switch (modelType) {
        case 'linear-regression':
            animateLinearRegression();
            break;
        case 'decision-tree':
            animateDecisionTree();
            break;
        case 'svm':
            animateSVM();
            break;
        case 'kmeans':
            animateKMeans();
            break;
        case 'neural-network':
            animateNeuralNetwork();
            break;
        case 'cnn':
            animateCNN();
            break;
        case 'rnn':
            animateRNN();
            break;
        case 'transformer':
            animateTransformer();
            break;
    }
};

// Reset visualizations
window.resetVisualization = function(modelType) {
    const viz = document.getElementById(`${modelType}-viz`);
    if (viz) {
        viz.innerHTML = '';
        window.initializeVisualizations(modelType);
    }
};

// Linear Regression Visualization
function initLinearRegression() {
    const container = document.getElementById('linear-regression-viz');
    if (!container) return;

    // Generate random data points
    const dataPoints = [];
    for (let i = 0; i < 15; i++) {
        dataPoints.push({
            x: Math.random() * 300 + 50,
            y: Math.random() * 200 + 50 + (Math.random() * 50 - 25)
        });
    }

    // Clear container
    container.innerHTML = '';
    
    // Add data points
    dataPoints.forEach((point, index) => {
        const pointEl = document.createElement('div');
        pointEl.className = 'data-point';
        pointEl.style.left = `${point.x}px`;
        pointEl.style.top = `${point.y}px`;
        pointEl.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(pointEl);
    });

    // Store data for animation
    container.dataPoints = dataPoints;
}

function animateLinearRegression() {
    const container = document.getElementById('linear-regression-viz');
    if (!container || !container.dataPoints) return;

    // Calculate regression line (simplified)
    const points = container.dataPoints;
    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    points.forEach(point => {
        sumX += point.x;
        sumY += point.y;
        sumXY += point.x * point.y;
        sumX2 += point.x * point.x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Create regression line
    const line = document.createElement('div');
    line.className = 'regression-line';
    line.style.left = '50px';
    line.style.top = `${intercept}px`;
    line.style.width = '300px';
    line.style.transform = `rotate(${Math.atan(slope) * (180 / Math.PI)}deg)`;
    
    container.appendChild(line);

    // Animate line appearance
    setTimeout(() => {
        line.style.opacity = '1';
    }, 500);
}

// Neural Network Visualization
function initNeuralNetwork() {
    const container = document.getElementById('neural-network-viz');
    if (!container) return;

    container.innerHTML = '';

    const layers = [4, 6, 6, 3]; // neurons per layer
    const layerSpacing = 200;
    const neuronSpacing = 40;

    layers.forEach((neuronCount, layerIndex) => {
        const startY = (300 - (neuronCount - 1) * neuronSpacing) / 2;
        
        for (let neuronIndex = 0; neuronIndex < neuronCount; neuronIndex++) {
            const neuron = document.createElement('div');
            neuron.className = 'neuron';
            neuron.style.left = `${layerIndex * layerSpacing + 50}px`;
            neuron.style.top = `${startY + neuronIndex * neuronSpacing}px`;
            neuron.textContent = layerIndex === 0 ? 'x' : (layerIndex === layers.length - 1 ? 'y' : '');
            container.appendChild(neuron);

            // Add connections to next layer
            if (layerIndex < layers.length - 1) {
                const nextLayerCount = layers[layerIndex + 1];
                const nextStartY = (300 - (nextLayerCount - 1) * neuronSpacing) / 2;

                for (let nextNeuronIndex = 0; nextNeuronIndex < nextLayerCount; nextNeuronIndex++) {
                    const connection = document.createElement('div');
                    connection.className = 'connection';
                    
                    const x1 = layerIndex * layerSpacing + 90;
                    const y1 = startY + neuronIndex * neuronSpacing + 20;
                    const x2 = (layerIndex + 1) * layerSpacing + 50;
                    const y2 = nextStartY + nextNeuronIndex * neuronSpacing + 20;
                    
                    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
                    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                    
                    connection.style.left = `${x1}px`;
                    connection.style.top = `${y1}px`;
                    connection.style.width = `${length}px`;
                    connection.style.transform = `rotate(${angle}deg)`;
                    
                    container.appendChild(connection);
                }
            }
        }
    });
}

function animateNeuralNetwork() {
    const neurons = document.querySelectorAll('#neural-network-viz .neuron');
    const connections = document.querySelectorAll('#neural-network-viz .connection');
    
    // Reset all elements
    neurons.forEach(n => n.classList.remove('active'));
    connections.forEach(c => c.classList.remove('active'));
    
    // Animate forward propagation
    const layers = [4, 6, 6, 3];
    let delay = 0;
    
    layers.forEach((count, layerIndex) => {
        setTimeout(() => {
            // Activate neurons in current layer
            for (let i = 0; i < count; i++) {
                const neuronIndex = layers.slice(0, layerIndex).reduce((sum, c) => sum + c, 0) + i;
                if (neurons[neuronIndex]) {
                    neurons[neuronIndex].classList.add('active');
                }
            }
            
            // Activate connections to next layer
            if (layerIndex < layers.length - 1) {
                const connectionStartIndex = layers.slice(0, layerIndex).reduce((sum, curr, idx) => {
                    return sum + curr * (idx < layers.length - 1 ? layers[idx + 1] : 0);
                }, 0);
                
                const connectionCount = count * layers[layerIndex + 1];
                for (let i = 0; i < connectionCount; i++) {
                    if (connections[connectionStartIndex + i]) {
                        setTimeout(() => {
                            connections[connectionStartIndex + i].classList.add('active');
                        }, i * 20);
                    }
                }
            }
        }, delay);
        
        delay += 1000;
    });
}

// K-Means Visualization
function initKMeans() {
    const container = document.getElementById('kmeans-viz');
    if (!container) return;

    container.innerHTML = '';

    // Generate clustered data points
    const clusters = [
        { center: { x: 100, y: 100 }, color: '#3b82f6' },
        { center: { x: 250, y: 150 }, color: '#ef4444' },
        { center: { x: 180, y: 280 }, color: '#10b981' }
    ];

    const dataPoints = [];
    clusters.forEach(cluster => {
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * 40 + 10;
            const point = {
                x: cluster.center.x + Math.cos(angle) * radius,
                y: cluster.center.y + Math.sin(angle) * radius,
                cluster: -1
            };
            dataPoints.push(point);
        }
    });

    // Add data points
    dataPoints.forEach((point, index) => {
        const pointEl = document.createElement('div');
        pointEl.className = 'cluster-point';
        pointEl.style.left = `${point.x}px`;
        pointEl.style.top = `${point.y}px`;
        pointEl.style.background = '#6b7280';
        container.appendChild(pointEl);
    });

    // Add initial centroids
    const centroids = [
        { x: Math.random() * 300 + 50, y: Math.random() * 250 + 50 },
        { x: Math.random() * 300 + 50, y: Math.random() * 250 + 50 },
        { x: Math.random() * 300 + 50, y: Math.random() * 250 + 50 }
    ];

    centroids.forEach((centroid, index) => {
        const centroidEl = document.createElement('div');
        centroidEl.className = 'centroid';
        centroidEl.style.left = `${centroid.x - 10}px`;
        centroidEl.style.top = `${centroid.y - 10}px`;
        centroidEl.style.borderColor = clusters[index].color;
        container.appendChild(centroidEl);
    });

    container.dataPoints = dataPoints;
    container.centroids = centroids;
    container.clusters = clusters;
}

function animateKMeans() {
    const container = document.getElementById('kmeans-viz');
    if (!container) return;

    const points = container.querySelector('.cluster-point');
    const centroids = container.querySelectorAll('.centroid');
    const pointElements = container.querySelectorAll('.cluster-point');

    let iteration = 0;
    const maxIterations = 5;

    function runIteration() {
        if (iteration >= maxIterations) return;

        setTimeout(() => {
            // Assign points to nearest centroids
            pointElements.forEach((pointEl, index) => {
                const point = container.dataPoints[index];
                let nearestCentroid = 0;
                let minDistance = Infinity;

                container.centroids.forEach((centroid, cIndex) => {
                    const distance = Math.sqrt(
                        (point.x - centroid.x) ** 2 + (point.y - centroid.y) ** 2
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestCentroid = cIndex;
                    }
                });

                pointEl.style.background = container.clusters[nearestCentroid].color;
                point.cluster = nearestCentroid;
            });

            // Update centroids
            setTimeout(() => {
                container.clusters.forEach((cluster, cIndex) => {
                    const clusterPoints = container.dataPoints.filter(p => p.cluster === cIndex);
                    if (clusterPoints.length > 0) {
                        const newX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
                        const newY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
                        
                        container.centroids[cIndex] = { x: newX, y: newY };
                        centroids[cIndex].style.left = `${newX - 10}px`;
                        centroids[cIndex].style.top = `${newY - 10}px`;
                    }
                });

                iteration++;
                runIteration();
            }, 1000);
        }, 1500);
    }

    runIteration();
}

// Decision Tree Visualization
function initDecisionTree() {
    const container = document.getElementById('decision-tree-viz');
    if (!container) return;

    container.innerHTML = '';

    // Create tree structure
    const treeData = [
        { id: 'root', x: 200, y: 50, text: 'Age > 30?', type: 'decision' },
        { id: 'left1', x: 100, y: 150, text: 'Income > 50k?', type: 'decision' },
        { id: 'right1', x: 300, y: 150, text: 'Approved', type: 'leaf' },
        { id: 'left2', x: 50, y: 250, text: 'Denied', type: 'leaf' },
        { id: 'right2', x: 150, y: 250, text: 'Approved', type: 'leaf' }
    ];

    const connections = [
        { from: 'root', to: 'left1', label: 'No' },
        { from: 'root', to: 'right1', label: 'Yes' },
        { from: 'left1', to: 'left2', label: 'No' },
        { from: 'left1', to: 'right2', label: 'Yes' }
    ];

    // Add connections first
    connections.forEach(conn => {
        const fromNode = treeData.find(n => n.id === conn.from);
        const toNode = treeData.find(n => n.id === conn.to);
        
        const branch = document.createElement('div');
        branch.className = 'tree-branch';
        
        const length = Math.sqrt((toNode.x - fromNode.x) ** 2 + (toNode.y - fromNode.y) ** 2);
        const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x) * 180 / Math.PI;
        
        branch.style.left = `${fromNode.x}px`;
        branch.style.top = `${fromNode.y + 20}px`;
        branch.style.width = `${length}px`;
        branch.style.transform = `rotate(${angle}deg)`;
        
        container.appendChild(branch);
    });

    // Add nodes
    treeData.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = `tree-node ${node.type}`;
        nodeEl.style.left = `${node.x - 40}px`;
        nodeEl.style.top = `${node.y}px`;
        nodeEl.textContent = node.text;
        container.appendChild(nodeEl);
    });
}

function animateDecisionTree() {
    const nodes = document.querySelectorAll('#decision-tree-viz .tree-node');
    const branches = document.querySelectorAll('#decision-tree-viz .tree-branch');
    
    // Reset animation
    nodes.forEach(n => n.style.opacity = '0');
    branches.forEach(b => b.style.width = '0');
    
    // Animate tree building
    let delay = 0;
    nodes.forEach((node, index) => {
        setTimeout(() => {
            node.style.opacity = '1';
            node.style.animation = 'nodeAppear 0.8s ease forwards';
        }, delay);
        delay += 500;
    });
    
    // Animate branches
    setTimeout(() => {
        branches.forEach((branch, index) => {
            setTimeout(() => {
                branch.style.animation = 'branchGrow 1s ease forwards';
            }, index * 300);
        });
    }, 1000);
}

// SVM Visualization
function initSVM() {
    const container = document.getElementById('svm-viz');
    if (!container) return;

    container.innerHTML = '';

    // Create two classes of data
    const class1Points = [];
    const class2Points = [];

    // Class 1 (left side)
    for (let i = 0; i < 15; i++) {
        class1Points.push({
            x: Math.random() * 120 + 30,
            y: Math.random() * 200 + 75
        });
    }

    // Class 2 (right side)
    for (let i = 0; i < 15; i++) {
        class2Points.push({
            x: Math.random() * 120 + 230,
            y: Math.random() * 200 + 75
        });
    }

    // Add data points
    class1Points.forEach(point => {
        const pointEl = document.createElement('div');
        pointEl.className = 'data-point';
        pointEl.style.left = `${point.x}px`;
        pointEl.style.top = `${point.y}px`;
        pointEl.style.background = '#3b82f6';
        container.appendChild(pointEl);
    });

    class2Points.forEach(point => {
        const pointEl = document.createElement('div');
        pointEl.className = 'data-point';
        pointEl.style.left = `${point.x}px`;
        pointEl.style.top = `${point.y}px`;
        pointEl.style.background = '#ef4444';
        container.appendChild(pointEl);
    });

    // Add support vectors (closest points to boundary)
    const supportVectors = [
        { x: 145, y: 100 },
        { x: 155, y: 200 },
        { x: 135, y: 150 }
    ];

    supportVectors.forEach(sv => {
        const svEl = document.createElement('div');
        svEl.className = 'support-vector';
        svEl.style.left = `${sv.x - 6}px`;
        svEl.style.top = `${sv.y - 6}px`;
        container.appendChild(svEl);
    });
}

function animateSVM() {
    const container = document.getElementById('svm-viz');
    if (!container) return;

    // Add decision boundary
    const boundary = document.createElement('div');
    boundary.className = 'decision-boundary';
    container.appendChild(boundary);

    // Add margin lines
    setTimeout(() => {
        const leftMargin = document.createElement('div');
        leftMargin.className = 'margin-line';
        leftMargin.style.left = '40%';
        container.appendChild(leftMargin);

        const rightMargin = document.createElement('div');
        rightMargin.className = 'margin-line';
        rightMargin.style.left = '60%';
        container.appendChild(rightMargin);
    }, 1000);
}

// CNN Visualization
function initCNN() {
    const container = document.getElementById('cnn-viz');
    if (!container) return;

    container.innerHTML = '';

    // Create CNN layers
    const layers = ['Input', 'Conv1', 'Pool1', 'Conv2', 'Pool2', 'FC'];
    
    layers.forEach((layer, index) => {
        const layerEl = document.createElement('div');
        layerEl.className = 'feature-map';
        layerEl.textContent = layer;
        layerEl.style.animationDelay = `${index * 0.5}s`;
        
        // Vary sizes to show dimension reduction
        const size = Math.max(40, 80 - index * 8);
        layerEl.style.width = `${size}px`;
        layerEl.style.height = `${size}px`;
        layerEl.style.fontSize = '0.7rem';
        
        container.appendChild(layerEl);

        // Add convolution filter between conv layers
        if (layer.startsWith('Conv') && index < layers.length - 1) {
            const filter = document.createElement('div');
            filter.className = 'convolution-filter';
            filter.style.animationDelay = `${index * 0.5 + 0.25}s`;
            container.appendChild(filter);
        }
    });
}

function animateCNN() {
    const featureMaps = document.querySelectorAll('#cnn-viz .feature-map');
    const filters = document.querySelectorAll('#cnn-viz .convolution-filter');
    
    // Reset and start animation
    featureMaps.forEach((fm, index) => {
        setTimeout(() => {
            fm.style.animation = 'featureMapPulse 2s infinite';
        }, index * 500);
    });

    filters.forEach((filter, index) => {
        setTimeout(() => {
            filter.style.animation = 'filterMove 4s infinite';
        }, index * 500 + 250);
    });
}

// RNN Visualization
function initRNN() {
    const container = document.getElementById('rnn-viz');
    if (!container) return;

    container.innerHTML = '';

    // Create RNN cells
    const timeSteps = 4;
    for (let i = 0; i < timeSteps; i++) {
        const cell = document.createElement('div');
        cell.className = 'rnn-cell';
        cell.textContent = `t${i + 1}`;
        container.appendChild(cell);

        // Add memory flow between cells
        if (i < timeSteps - 1) {
            const memoryFlow = document.createElement('div');
            memoryFlow.className = 'memory-flow';
            cell.appendChild(memoryFlow);
        }
    }
}

function animateRNN() {
    const cells = document.querySelectorAll('#rnn-viz .rnn-cell');
    const memoryFlows = document.querySelectorAll('#rnn-viz .memory-flow');
    
    // Animate sequential processing
    cells.forEach((cell, index) => {
        setTimeout(() => {
            cell.style.animation = 'cellProcess 3s infinite';
        }, index * 800);
    });

    // Animate memory flow
    memoryFlows.forEach((flow, index) => {
        setTimeout(() => {
            flow.style.animation = 'memoryFlow 2s infinite';
        }, index * 800 + 400);
    });
}

// Transformer Visualization (reuse neural network structure)
function initTransformer() {
    initNeuralNetwork();
}

function animateTransformer() {
    animateNeuralNetwork();
}

// Utility function to create SVG elements
function createSVG(width, height) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    return svg;
}

function createSVGLine(x1, y1, x2, y2, className = '') {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    if (className) line.setAttribute('class', className);
    return line;
}

// Export functions for global access
window.visualizations = {
    initializeVisualizations,
    triggerAnimation,
    resetVisualization
};