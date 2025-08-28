// Simplified Decision Tree Visualization using Canvas
class DecisionTreeVisualizer {
    constructor() {
        this.width = 800;
        this.height = 500;
        this.treeData = null;
        this.canvas = null;
        this.ctx = null;
        this.animationSpeed = 1000;
        
        this.init();
    }

    init() {
        this.setupDOM();
        this.setupEventListeners();
        this.generateSampleTree();
        this.render();
        
        // Register with main application
        if (window.mlVisualizer) {
            window.mlVisualizer.registerModel('decision-tree', this);
        }
    }

    setupDOM() {
        const container = document.getElementById('tree-visualization');
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
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    setupEventListeners() {
        // Max depth slider
        const maxDepthSlider = document.getElementById('max-depth');
        const maxDepthValue = document.getElementById('max-depth-value');
        
        maxDepthSlider.addEventListener('input', (e) => {
            maxDepthValue.textContent = e.target.value;
            this.generateSampleTree(parseInt(e.target.value));
            this.render();
        });

        // Min samples slider
        const minSamplesSlider = document.getElementById('min-samples');
        const minSamplesValue = document.getElementById('min-samples-value');
        
        minSamplesSlider.addEventListener('input', (e) => {
            minSamplesValue.textContent = e.target.value;
            const maxDepth = parseInt(maxDepthSlider.value);
            this.generateSampleTree(maxDepth, parseInt(e.target.value));
            this.render();
        });

        // Dataset selector
        const datasetSelect = document.getElementById('dataset-select');
        datasetSelect.addEventListener('change', (e) => {
            this.loadDataset(e.target.value);
        });

        // Action buttons
        document.getElementById('train-tree').addEventListener('click', () => {
            this.trainTree();
        });

        document.getElementById('animate-prediction').addEventListener('click', () => {
            this.animatePrediction();
        });
    }

    generateSampleTree(maxDepth = 3, minSamples = 2) {
        // Generate a sample decision tree structure with positioning
        this.treeData = {
            name: 'Petal Length ≤ 2.45',
            condition: 'Petal Length ≤ 2.45',
            samples: 150,
            gini: 0.667,
            class: 'mixed',
            x: this.width / 2,
            y: 80,
            children: [
                {
                    name: 'Setosa',
                    condition: 'True',
                    samples: 50,
                    gini: 0.0,
                    class: 'setosa',
                    isLeaf: true,
                    x: this.width * 0.25,
                    y: 200
                },
                {
                    name: maxDepth > 1 ? 'Petal Width ≤ 1.75' : 'Mixed',
                    condition: 'Petal Width ≤ 1.75',
                    samples: 100,
                    gini: 0.5,
                    class: 'mixed',
                    x: this.width * 0.75,
                    y: 200,
                    children: maxDepth > 1 ? [
                        {
                            name: 'Versicolor',
                            condition: 'True',
                            samples: 54,
                            gini: 0.168,
                            class: 'versicolor',
                            isLeaf: maxDepth <= 2 || minSamples >= 54,
                            x: this.width * 0.6,
                            y: 320
                        },
                        {
                            name: 'Virginica',
                            condition: 'False',
                            samples: 46,
                            gini: 0.043,
                            class: 'virginica',
                            isLeaf: maxDepth <= 2 || minSamples >= 46,
                            x: this.width * 0.9,
                            y: 320
                        }
                    ] : null,
                    isLeaf: maxDepth <= 1
                }
            ]
        };
    }

    render() {
        if (!this.ctx || !this.treeData) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw tree
        this.drawNode(this.treeData);
    }

    drawNode(node, parentX = null, parentY = null, level = 0) {
        if (!node) return;

        const { x, y } = node;

        // Draw connection to parent
        if (parentX !== null && parentY !== null) {
            this.ctx.strokeStyle = '#6c757d';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(parentX, parentY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }

        // Draw node circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, node.isLeaf ? 25 : 30, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.getNodeColor(node);
        this.ctx.fill();
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw node text
        this.ctx.fillStyle = '#333';
        this.ctx.font = node.isLeaf ? '12px Arial' : '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        if (node.isLeaf) {
            this.ctx.fillText(node.class, x, y);
        } else {
            // Split condition text
            const words = node.name.split(' ');
            this.ctx.fillText(words[0], x, y - 6);
            if (words.length > 1) {
                this.ctx.fillText(words.slice(1).join(' '), x, y + 6);
            }
        }

        // Draw additional info below node
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText(`Samples: ${node.samples}`, x, y + 45);
        this.ctx.fillText(`Gini: ${node.gini}`, x, y + 58);

        // Draw children
        if (node.children) {
            node.children.forEach(child => {
                this.drawNode(child, x, y, level + 1);
            });
        }
    }

    getNodeColor(nodeData) {
        if (nodeData.isLeaf) {
            switch(nodeData.class) {
                case 'setosa': return '#ff6b6b';
                case 'versicolor': return '#4ecdc4';
                case 'virginica': return '#45b7d1';
                default: return '#f9ca24';
            }
        }
        return '#e9ecef';
    }

    trainTree() {
        // Simulate training process
        const button = document.getElementById('train-tree');
        const originalText = button.textContent;
        button.textContent = 'Training...';
        button.disabled = true;

        // Add loading animation
        this.ctx.save();
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Building Decision Tree...', this.width / 2, this.height / 2);
        this.ctx.restore();

        setTimeout(() => {
            this.render();
            button.textContent = originalText;
            button.disabled = false;
            
            this.updateExplanation([
                'Decision tree successfully trained!',
                'Root node splits on Petal Length ≤ 2.45',
                'Left branch leads to Setosa classification',
                'Right branch requires further splitting on Petal Width',
                'Final tree achieves high accuracy on training data'
            ]);
        }, 2000);
    }

    animatePrediction() {
        // Animate a sample prediction path through the tree
        this.updateExplanation([
            'Starting prediction at root node...',
            'Sample: Petal Length = 1.8, Petal Width = 0.4',
            'Check: Petal Length ≤ 2.45? Yes → Go left',
            'Reached leaf node: Prediction is Setosa!',
            'Confidence: 100% (pure leaf node)'
        ]);

        // Highlight prediction path
        this.highlightPredictionPath();
    }

    highlightPredictionPath() {
        // Clear and redraw with highlighted path
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw normal tree
        this.drawNode(this.treeData);
        
        // Highlight prediction path (root -> left child)
        const root = this.treeData;
        const leftChild = root.children[0];
        
        // Highlight connection
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(root.x, root.y);
        this.ctx.lineTo(leftChild.x, leftChild.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Highlight nodes
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 4;
        
        // Root node
        this.ctx.beginPath();
        this.ctx.arc(root.x, root.y, 35, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // Target leaf node
        this.ctx.beginPath();
        this.ctx.arc(leftChild.x, leftChild.y, 30, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    updateExplanation(steps) {
        const stepsList = document.getElementById('tree-steps');
        stepsList.innerHTML = '';
        
        steps.forEach((step, index) => {
            const li = document.createElement('li');
            li.textContent = step;
            li.style.opacity = '0';
            li.style.transition = 'opacity 0.5s ease';
            stepsList.appendChild(li);
            
            // Animate step appearance
            setTimeout(() => {
                li.style.opacity = '1';
            }, index * 800);
        });
    }

    loadDataset(datasetName) {
        // Simulate loading different datasets
        switch(datasetName) {
            case 'iris':
                this.generateSampleTree();
                break;
            case 'wine':
                this.generateWineTree();
                break;
            case 'custom':
                this.generateCustomTree();
                break;
        }
        this.render();
    }

    generateWineTree() {
        this.treeData = {
            name: 'Alcohol ≤ 12.5',
            condition: 'Alcohol ≤ 12.5',
            samples: 178,
            gini: 0.659,
            class: 'mixed',
            x: this.width / 2,
            y: 80,
            children: [
                {
                    name: 'Class 1',
                    condition: 'True',
                    samples: 65,
                    gini: 0.168,
                    class: 'class1',
                    isLeaf: true,
                    x: this.width * 0.25,
                    y: 200
                },
                {
                    name: 'Flavonoids ≤ 2.5',
                    condition: 'Flavonoids ≤ 2.5',
                    samples: 113,
                    gini: 0.486,
                    class: 'mixed',
                    x: this.width * 0.75,
                    y: 200,
                    children: [
                        {
                            name: 'Class 2',
                            condition: 'True',
                            samples: 67,
                            gini: 0.0,
                            class: 'class2',
                            isLeaf: true,
                            x: this.width * 0.6,
                            y: 320
                        },
                        {
                            name: 'Class 3',
                            condition: 'False',
                            samples: 46,
                            gini: 0.0,
                            class: 'class3',
                            isLeaf: true,
                            x: this.width * 0.9,
                            y: 320
                        }
                    ]
                }
            ]
        };
    }

    generateCustomTree() {
        this.treeData = {
            name: 'Feature A ≤ 5.0',
            condition: 'Feature A ≤ 5.0',
            samples: 100,
            gini: 0.5,
            class: 'mixed',
            x: this.width / 2,
            y: 80,
            children: [
                {
                    name: 'Positive',
                    condition: 'True',
                    samples: 60,
                    gini: 0.0,
                    class: 'positive',
                    isLeaf: true,
                    x: this.width * 0.25,
                    y: 200
                },
                {
                    name: 'Negative',
                    condition: 'False',
                    samples: 40,
                    gini: 0.0,
                    class: 'negative',
                    isLeaf: true,
                    x: this.width * 0.75,
                    y: 200
                }
            ]
        };
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if mouse is over a node and show tooltip
        this.checkNodeHover(x, y, this.treeData);
    }

    checkNodeHover(mouseX, mouseY, node) {
        if (!node) return;

        const distance = Math.sqrt(Math.pow(mouseX - node.x, 2) + Math.pow(mouseY - node.y, 2));
        const radius = node.isLeaf ? 25 : 30;

        if (distance <= radius) {
            this.canvas.style.cursor = 'pointer';
            this.canvas.title = `${node.name}\nSamples: ${node.samples}\nGini: ${node.gini}\n${node.condition || ''}`;
        } else {
            this.canvas.style.cursor = 'default';
            this.canvas.title = '';
        }

        // Check children
        if (node.children) {
            node.children.forEach(child => {
                this.checkNodeHover(mouseX, mouseY, child);
            });
        }
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if click is on a node
        this.checkNodeClick(x, y, this.treeData);
    }

    checkNodeClick(mouseX, mouseY, node) {
        if (!node) return;

        const distance = Math.sqrt(Math.pow(mouseX - node.x, 2) + Math.pow(mouseY - node.y, 2));
        const radius = node.isLeaf ? 25 : 30;

        if (distance <= radius) {
            this.updateExplanation([
                `Clicked on: ${node.name}`,
                `Node Type: ${node.isLeaf ? 'Leaf Node' : 'Decision Node'}`,
                `Samples: ${node.samples}`,
                `Gini Impurity: ${node.gini}`,
                `${node.condition ? `Condition: ${node.condition}` : ''}`,
                `${node.isLeaf ? `Final Prediction: ${node.class}` : 'This node splits the data further'}`
            ]);
            return true;
        }

        // Check children
        if (node.children) {
            for (const child of node.children) {
                if (this.checkNodeClick(mouseX, mouseY, child)) {
                    return true;
                }
            }
        }
        return false;
    }

    resize() {
        // Handle window resize
        const container = document.getElementById('tree-visualization');
        const newWidth = container.clientWidth;
        
        if (newWidth !== this.width && newWidth > 400) {
            this.width = newWidth;
            this.canvas.width = this.width;
            
            // Regenerate tree with new positions
            const maxDepth = parseInt(document.getElementById('max-depth').value);
            const minSamples = parseInt(document.getElementById('min-samples').value);
            this.generateSampleTree(maxDepth, minSamples);
            this.render();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DecisionTreeVisualizer();
});