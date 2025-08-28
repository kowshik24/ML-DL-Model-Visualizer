// Decision Tree Visualization
class DecisionTreeVisualizer {
    constructor() {
        this.width = 800;
        this.height = 500;
        this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        this.treeData = null;
        this.svg = null;
        this.tooltip = null;
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
        const container = d3.select('#tree-visualization');
        container.selectAll('*').remove();

        this.svg = container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        this.tooltip = utils.createTooltip();
    }

    setupEventListeners() {
        // Max depth slider
        const maxDepthSlider = document.getElementById('max-depth');
        const maxDepthValue = document.getElementById('max-depth-value');
        
        maxDepthSlider.addEventListener('input', utils.debounce((e) => {
            maxDepthValue.textContent = e.target.value;
            this.generateSampleTree(parseInt(e.target.value));
            this.render();
        }, 300));

        // Min samples slider
        const minSamplesSlider = document.getElementById('min-samples');
        const minSamplesValue = document.getElementById('min-samples-value');
        
        minSamplesSlider.addEventListener('input', utils.debounce((e) => {
            minSamplesValue.textContent = e.target.value;
            this.generateSampleTree(parseInt(maxDepthSlider.value), parseInt(e.target.value));
            this.render();
        }, 300));

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
        // Generate a sample decision tree structure
        this.treeData = {
            name: 'Petal Length ≤ 2.45',
            condition: 'Petal Length ≤ 2.45',
            samples: 150,
            gini: 0.667,
            class: 'mixed',
            children: [
                {
                    name: 'Setosa',
                    condition: 'True',
                    samples: 50,
                    gini: 0.0,
                    class: 'setosa',
                    isLeaf: true
                },
                {
                    name: 'Petal Width ≤ 1.75',
                    condition: 'Petal Width ≤ 1.75',
                    samples: 100,
                    gini: 0.5,
                    class: 'mixed',
                    children: maxDepth > 1 ? [
                        {
                            name: 'Versicolor',
                            condition: 'True',
                            samples: 54,
                            gini: 0.168,
                            class: 'versicolor',
                            isLeaf: maxDepth <= 2 || minSamples >= 54
                        },
                        {
                            name: 'Virginica',
                            condition: 'False',
                            samples: 46,
                            gini: 0.043,
                            class: 'virginica',
                            isLeaf: maxDepth <= 2 || minSamples >= 46
                        }
                    ] : null,
                    isLeaf: maxDepth <= 1
                }
            ]
        };
    }

    render() {
        this.g.selectAll('*').remove();

        if (!this.treeData) return;

        // Create tree layout
        const treeLayout = d3.tree()
            .size([this.width - this.margin.left - this.margin.right, 
                   this.height - this.margin.top - this.margin.bottom]);

        const root = d3.hierarchy(this.treeData);
        treeLayout(root);

        // Draw links
        const links = this.g.selectAll('.tree-link')
            .data(root.links())
            .enter()
            .append('path')
            .attr('class', 'tree-link')
            .attr('d', d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y))
            .style('opacity', 0)
            .transition()
            .duration(this.animationSpeed)
            .style('opacity', 1);

        // Draw nodes
        const nodes = this.g.selectAll('.tree-node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', 'tree-node')
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .style('opacity', 0);

        // Add circles for nodes
        nodes.append('circle')
            .attr('class', 'node-circle')
            .attr('r', 0)
            .style('fill', d => this.getNodeColor(d.data))
            .transition()
            .duration(this.animationSpeed)
            .attr('r', d => d.data.isLeaf ? 20 : 25)
            .on('end', function() {
                d3.select(this.parentNode).style('opacity', 1);
            });

        // Add text labels
        nodes.append('text')
            .attr('class', 'node-text')
            .attr('dy', '.35em')
            .style('opacity', 0)
            .text(d => d.data.isLeaf ? d.data.class : 'Split')
            .transition()
            .delay(this.animationSpeed / 2)
            .duration(this.animationSpeed / 2)
            .style('opacity', 1);

        // Add hover effects and tooltips
        nodes
            .on('mouseover', (event, d) => {
                this.tooltip
                    .style('opacity', 1)
                    .html(`
                        <strong>${d.data.name}</strong><br/>
                        Samples: ${d.data.samples}<br/>
                        Gini: ${d.data.gini}<br/>
                        ${d.data.condition ? `Condition: ${d.data.condition}` : ''}
                    `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', () => {
                this.tooltip.style('opacity', 0);
            });

        // Show nodes with staggered animation
        nodes
            .transition()
            .delay((d, i) => i * 100)
            .duration(this.animationSpeed)
            .style('opacity', 1);
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
        this.g.append('text')
            .attr('class', 'loading-text')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2)
            .text('Building Decision Tree...')
            .style('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('fill', '#667eea')
            .style('opacity', 0)
            .transition()
            .duration(500)
            .style('opacity', 1);

        setTimeout(() => {
            this.g.select('.loading-text').remove();
            this.render();
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);
    }

    animatePrediction() {
        // Animate a sample prediction path through the tree
        const nodes = this.g.selectAll('.tree-node');
        const links = this.g.selectAll('.tree-link');

        // Reset previous animations
        nodes.selectAll('.node-circle').classed('node-highlight', false);
        links.classed('path-highlight', false);

        // Sample prediction path: Root -> Left -> Leaf
        const predictionPath = [0, 1]; // Node indices in the tree
        
        this.animatePath(predictionPath, 0);
        this.updateExplanation([
            'Starting at root node: Check petal length',
            'Petal length ≤ 2.45? Yes → Go left',
            'Reached leaf node: Prediction is Setosa!'
        ]);
    }

    animatePath(path, index) {
        if (index >= path.length) return;

        const nodes = this.g.selectAll('.tree-node');
        const currentNode = d3.select(nodes.nodes()[path[index]]);

        // Highlight current node
        currentNode.select('.node-circle')
            .classed('node-highlight', true);

        // Continue animation
        setTimeout(() => {
            if (index < path.length - 1) {
                this.animatePath(path, index + 1);
            }
        }, 1500);
    }

    updateExplanation(steps) {
        const stepsList = document.getElementById('tree-steps');
        stepsList.innerHTML = '';
        
        steps.forEach((step, index) => {
            const li = document.createElement('li');
            li.textContent = step;
            li.style.opacity = '0';
            stepsList.appendChild(li);
            
            // Animate step appearance
            setTimeout(() => {
                li.style.transition = 'opacity 0.5s ease';
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
            children: [
                {
                    name: 'Class 1',
                    condition: 'True',
                    samples: 65,
                    gini: 0.168,
                    class: 'class1',
                    isLeaf: true
                },
                {
                    name: 'Flavonoids ≤ 2.5',
                    condition: 'Flavonoids ≤ 2.5',
                    samples: 113,
                    gini: 0.486,
                    class: 'mixed',
                    children: [
                        {
                            name: 'Class 2',
                            condition: 'True',
                            samples: 67,
                            gini: 0.0,
                            class: 'class2',
                            isLeaf: true
                        },
                        {
                            name: 'Class 3',
                            condition: 'False',
                            samples: 46,
                            gini: 0.0,
                            class: 'class3',
                            isLeaf: true
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
            children: [
                {
                    name: 'Positive',
                    condition: 'True',
                    samples: 60,
                    gini: 0.0,
                    class: 'positive',
                    isLeaf: true
                },
                {
                    name: 'Negative',
                    condition: 'False',
                    samples: 40,
                    gini: 0.0,
                    class: 'negative',
                    isLeaf: true
                }
            ]
        };
    }

    resize() {
        // Handle window resize
        const container = document.getElementById('tree-visualization');
        const newWidth = container.clientWidth;
        
        if (newWidth !== this.width) {
            this.width = newWidth;
            this.svg.attr('width', this.width);
            this.render();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DecisionTreeVisualizer();
});