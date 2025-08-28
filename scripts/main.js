// Main JavaScript for ML/DL Model Visualizer

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeModals();
    initializeScrollEffects();
    initializeMobileMenu();
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Highlight active navigation link
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Modal functionality
function initializeModals() {
    const modelCards = document.querySelectorAll('.model-card');
    const modal = document.getElementById('model-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close');

    modelCards.forEach(card => {
        card.addEventListener('click', function() {
            const modelType = this.getAttribute('data-model');
            openModelModal(modelType);
        });
    });

    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    function openModelModal(modelType) {
        const content = getModelContent(modelType);
        modalBody.innerHTML = content;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Initialize visualizations if needed
        if (window.initializeVisualizations) {
            window.initializeVisualizations(modelType);
        }
    }
}

// Get model content for modals
function getModelContent(modelType) {
    const modelContents = {
        'linear-regression': {
            title: 'Linear Regression',
            description: 'Linear regression finds the best straight line through data points to make predictions.',
            visualization: '<div id="linear-regression-viz" class="regression-viz"></div>',
            explanation: `
                <h3>How Linear Regression Works:</h3>
                <ol>
                    <li><strong>Data Input:</strong> We have input features (x) and target values (y)</li>
                    <li><strong>Find the Line:</strong> Algorithm finds the line y = mx + b that best fits the data</li>
                    <li><strong>Minimize Error:</strong> Uses least squares method to minimize prediction errors</li>
                    <li><strong>Make Predictions:</strong> New predictions are made using the fitted line</li>
                </ol>
            `,
            code: `
# Linear Regression Example
from sklearn.linear_model import LinearRegression
import numpy as np

# Create sample data
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])

# Create and train model
model = LinearRegression()
model.fit(X, y)

# Make predictions
predictions = model.predict([[6]])
print(f"Prediction for x=6: {predictions[0]}")
            `
        },
        'decision-tree': {
            title: 'Decision Trees',
            description: 'Decision trees make predictions by learning simple decision rules inferred from data features.',
            visualization: '<div id="decision-tree-viz" class="tree-viz"></div>',
            explanation: `
                <h3>How Decision Trees Work:</h3>
                <ol>
                    <li><strong>Root Node:</strong> Starts with the entire dataset</li>
                    <li><strong>Feature Selection:</strong> Chooses the best feature to split on</li>
                    <li><strong>Branching:</strong> Creates branches for different feature values</li>
                    <li><strong>Recursive Splitting:</strong> Continues splitting until stopping criteria are met</li>
                    <li><strong>Leaf Nodes:</strong> Final nodes contain the prediction</li>
                </ol>
            `,
            code: `
# Decision Tree Example
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification

# Create sample data
X, y = make_classification(n_samples=100, n_features=4, 
                          n_classes=2, random_state=42)

# Create and train model
model = DecisionTreeClassifier(max_depth=3)
model.fit(X, y)

# Make predictions
predictions = model.predict(X[:5])
print(f"Predictions: {predictions}")
            `
        },
        'svm': {
            title: 'Support Vector Machine',
            description: 'SVM finds the optimal decision boundary that separates different classes with maximum margin.',
            visualization: '<div id="svm-viz" class="svm-viz"></div>',
            explanation: `
                <h3>How SVM Works:</h3>
                <ol>
                    <li><strong>Find Support Vectors:</strong> Identifies data points closest to the decision boundary</li>
                    <li><strong>Maximize Margin:</strong> Creates the widest possible gap between classes</li>
                    <li><strong>Kernel Trick:</strong> Can handle non-linear relationships using kernels</li>
                    <li><strong>Decision Boundary:</strong> Uses support vectors to define classification boundary</li>
                </ol>
            `,
            code: `
# SVM Example
from sklearn.svm import SVC
from sklearn.datasets import make_classification

# Create sample data
X, y = make_classification(n_samples=100, n_features=2, 
                          n_redundant=0, random_state=42)

# Create and train model
model = SVC(kernel='linear')
model.fit(X, y)

# Make predictions
predictions = model.predict(X[:5])
print(f"Predictions: {predictions}")
            `
        },
        'kmeans': {
            title: 'K-Means Clustering',
            description: 'K-Means groups data into k clusters by iteratively updating cluster centers.',
            visualization: '<div id="kmeans-viz" class="kmeans-viz"></div>',
            explanation: `
                <h3>How K-Means Works:</h3>
                <ol>
                    <li><strong>Initialize Centroids:</strong> Randomly place k cluster centers</li>
                    <li><strong>Assign Points:</strong> Assign each point to the nearest centroid</li>
                    <li><strong>Update Centroids:</strong> Move centroids to the center of assigned points</li>
                    <li><strong>Repeat:</strong> Continue until centroids stop moving significantly</li>
                </ol>
            `,
            code: `
# K-Means Example
from sklearn.cluster import KMeans
import numpy as np

# Create sample data
X = np.random.rand(100, 2) * 10

# Create and train model
model = KMeans(n_clusters=3, random_state=42)
model.fit(X)

# Get cluster assignments
labels = model.labels_
centroids = model.cluster_centers_
print(f"Centroids: {centroids}")
            `
        },
        'neural-network': {
            title: 'Neural Networks',
            description: 'Neural networks learn complex patterns through layers of interconnected artificial neurons.',
            visualization: '<div id="neural-network-viz" class="neural-network-viz"></div>',
            explanation: `
                <h3>How Neural Networks Work:</h3>
                <ol>
                    <li><strong>Input Layer:</strong> Receives the input data</li>
                    <li><strong>Hidden Layers:</strong> Process information through weighted connections</li>
                    <li><strong>Activation Functions:</strong> Add non-linearity to enable complex learning</li>
                    <li><strong>Backpropagation:</strong> Adjusts weights based on prediction errors</li>
                    <li><strong>Output Layer:</strong> Produces the final prediction</li>
                </ol>
            `,
            code: `
# Neural Network Example
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense

# Create model
model = Sequential([
    Dense(64, activation='relu', input_shape=(10,)),
    Dense(32, activation='relu'),
    Dense(1, activation='sigmoid')
])

# Compile model
model.compile(optimizer='adam', 
              loss='binary_crossentropy', 
              metrics=['accuracy'])
            `
        },
        'cnn': {
            title: 'Convolutional Neural Networks',
            description: 'CNNs use convolution layers to detect features in images through filters and pooling.',
            visualization: '<div id="cnn-viz" class="cnn-viz"></div>',
            explanation: `
                <h3>How CNNs Work:</h3>
                <ol>
                    <li><strong>Convolution:</strong> Filters scan the image to detect features</li>
                    <li><strong>Feature Maps:</strong> Create activation maps showing detected features</li>
                    <li><strong>Pooling:</strong> Reduces spatial dimensions while preserving important information</li>
                    <li><strong>Multiple Layers:</strong> Stack layers to detect increasingly complex features</li>
                    <li><strong>Classification:</strong> Final layers classify based on detected features</li>
                </ol>
            `,
            code: `
# CNN Example
import tensorflow as tf
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense

model = tf.keras.Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
    MaxPooling2D((2, 2)),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Flatten(),
    Dense(64, activation='relu'),
    Dense(10, activation='softmax')
])
            `
        },
        'rnn': {
            title: 'Recurrent Neural Networks',
            description: 'RNNs process sequential data by maintaining memory of previous inputs through recurrent connections.',
            visualization: '<div id="rnn-viz" class="rnn-viz"></div>',
            explanation: `
                <h3>How RNNs Work:</h3>
                <ol>
                    <li><strong>Sequential Processing:</strong> Processes input one step at a time</li>
                    <li><strong>Hidden State:</strong> Maintains memory of previous inputs</li>
                    <li><strong>Recurrent Connections:</strong> Output feeds back as input for next step</li>
                    <li><strong>Temporal Dependencies:</strong> Learns patterns across time</li>
                    <li><strong>Output Generation:</strong> Produces predictions based on sequence history</li>
                </ol>
            `,
            code: `
# RNN Example
import tensorflow as tf
from tensorflow.keras.layers import SimpleRNN, Dense

model = tf.keras.Sequential([
    SimpleRNN(50, return_sequences=True, input_shape=(10, 1)),
    SimpleRNN(50),
    Dense(1)
])

model.compile(optimizer='adam', loss='mse')
            `
        },
        'transformer': {
            title: 'Transformers',
            description: 'Transformers use attention mechanisms to process sequences in parallel, revolutionizing NLP.',
            visualization: '<div id="transformer-viz" class="neural-network-viz"></div>',
            explanation: `
                <h3>How Transformers Work:</h3>
                <ol>
                    <li><strong>Self-Attention:</strong> Allows each position to attend to all positions</li>
                    <li><strong>Multi-Head Attention:</strong> Multiple attention mechanisms run in parallel</li>
                    <li><strong>Position Encoding:</strong> Adds positional information to input embeddings</li>
                    <li><strong>Feed-Forward Networks:</strong> Process attended representations</li>
                    <li><strong>Layer Normalization:</strong> Stabilizes training of deep networks</li>
                </ol>
            `,
            code: `
# Transformer Example (simplified)
import tensorflow as tf
from tensorflow.keras.layers import MultiHeadAttention, Dense, LayerNormalization

class TransformerBlock(tf.keras.layers.Layer):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.attention = MultiHeadAttention(num_heads=num_heads, key_dim=d_model)
        self.ffn = Dense(d_model, activation="relu")
        self.layernorm1 = LayerNormalization(epsilon=1e-6)
        self.layernorm2 = LayerNormalization(epsilon=1e-6)
            `
        }
    };

    const model = modelContents[modelType];
    if (!model) return '<p>Model information not found.</p>';

    return `
        <div class="model-detail">
            <h2>${model.title}</h2>
            <p class="model-description">${model.description}</p>
            
            <div class="visualization-section">
                <h3>Interactive Visualization</h3>
                ${model.visualization}
                <div class="visualization-controls">
                    <button class="control-btn" onclick="startAnimation('${modelType}')">
                        <i class="fas fa-play"></i> Start Animation
                    </button>
                    <button class="control-btn" onclick="resetAnimation('${modelType}')">
                        <i class="fas fa-redo"></i> Reset
                    </button>
                </div>
            </div>
            
            <div class="explanation-section">
                ${model.explanation}
            </div>
            
            <div class="code-section">
                <h3>Code Example</h3>
                <div class="code-snippet">
                    <pre><code>${model.code.trim()}</code></pre>
                </div>
            </div>
        </div>
    `;
}

// Scroll effects
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe all model cards and sections
    document.querySelectorAll('.model-card, .feature, .section-title').forEach(el => {
        observer.observe(el);
    });
}

// Mobile menu functionality
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Animation control functions
window.startAnimation = function(modelType) {
    const viz = document.getElementById(`${modelType}-viz`);
    if (viz) {
        viz.classList.add('animation-active');
        // Trigger specific animations based on model type
        if (window.triggerAnimation) {
            window.triggerAnimation(modelType);
        }
    }
};

window.resetAnimation = function(modelType) {
    const viz = document.getElementById(`${modelType}-viz`);
    if (viz) {
        viz.classList.remove('animation-active');
        // Reset specific animations
        if (window.resetVisualization) {
            window.resetVisualization(modelType);
        }
    }
};

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS classes for animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideInUp 0.6s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .nav-menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: white;
        box-shadow: 0 5px 10px rgba(0,0,0,0.1);
        padding: 1rem 0;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`;
document.head.appendChild(style);