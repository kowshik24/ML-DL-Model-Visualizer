// Simple D3-like utilities for vanilla JavaScript implementation
class VizUtils {
    static select(selector) {
        const element = document.querySelector(selector);
        return new VizElement(element);
    }

    static selectAll(selector) {
        const elements = document.querySelectorAll(selector);
        return new VizElementCollection(elements);
    }

    static scaleLinear() {
        return new LinearScale();
    }

    static tree() {
        return new TreeLayout();
    }

    static hierarchy(data) {
        return new HierarchyNode(data);
    }

    static line() {
        return new LineGenerator();
    }
}

class VizElement {
    constructor(element) {
        this.element = element;
    }

    append(tagName) {
        if (!this.element) return new VizElement(null);
        const child = document.createElementNS('http://www.w3.org/2000/svg', tagName);
        this.element.appendChild(child);
        return new VizElement(child);
    }

    attr(name, value) {
        if (this.element) {
            this.element.setAttribute(name, value);
        }
        return this;
    }

    style(name, value) {
        if (this.element) {
            this.element.style[name] = value;
        }
        return this;
    }

    text(value) {
        if (this.element) {
            this.element.textContent = value;
        }
        return this;
    }

    on(event, handler) {
        if (this.element) {
            this.element.addEventListener(event, handler);
        }
        return this;
    }

    selectAll(selector) {
        if (!this.element) return new VizElementCollection([]);
        const elements = this.element.querySelectorAll(selector);
        return new VizElementCollection(elements);
    }

    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        return this;
    }

    datum(data) {
        if (this.element) {
            this.element.__data__ = data;
        }
        return this;
    }
}

class VizElementCollection {
    constructor(elements) {
        this.elements = Array.from(elements);
    }

    data(dataArray) {
        return new DataJoin(this.elements, dataArray);
    }

    style(name, value) {
        this.elements.forEach(el => {
            if (typeof value === 'function') {
                el.style[name] = value(el.__data__, this.elements.indexOf(el));
            } else {
                el.style[name] = value;
            }
        });
        return this;
    }

    attr(name, value) {
        this.elements.forEach(el => {
            if (typeof value === 'function') {
                el.setAttribute(name, value(el.__data__, this.elements.indexOf(el)));
            } else {
                el.setAttribute(name, value);
            }
        });
        return this;
    }

    on(event, handler) {
        this.elements.forEach(el => {
            el.addEventListener(event, (e) => handler(e, el.__data__));
        });
        return this;
    }

    transition() {
        return new Transition(this.elements);
    }

    remove() {
        this.elements.forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        return this;
    }
}

class DataJoin {
    constructor(elements, data) {
        this.elements = elements;
        this.data = data;
    }

    enter() {
        const enterElements = [];
        for (let i = this.elements.length; i < this.data.length; i++) {
            enterElements.push(null); // Placeholder for new elements
        }
        return new EnterSelection(enterElements, this.data.slice(this.elements.length));
    }

    exit() {
        const exitElements = this.elements.slice(this.data.length);
        return new VizElementCollection(exitElements);
    }
}

class EnterSelection {
    constructor(elements, data) {
        this.elements = elements;
        this.data = data;
    }

    append(tagName) {
        const newElements = this.data.map((d, i) => {
            const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
            element.__data__ = d;
            return element;
        });
        return new VizElementCollection(newElements);
    }
}

class LinearScale {
    constructor() {
        this._domain = [0, 1];
        this._range = [0, 1];
    }

    domain(values) {
        if (!values) return this._domain;
        this._domain = values;
        return this;
    }

    range(values) {
        if (!values) return this._range;
        this._range = values;
        return this;
    }

    __call__(value) {
        const domainSpan = this._domain[1] - this._domain[0];
        const rangeSpan = this._range[1] - this._range[0];
        const normalized = (value - this._domain[0]) / domainSpan;
        return this._range[0] + normalized * rangeSpan;
    }
}

class TreeLayout {
    constructor() {
        this._size = [100, 100];
    }

    size(values) {
        if (!values) return this._size;
        this._size = values;
        return this;
    }

    __call__(root) {
        // Simple tree layout algorithm
        const nodeHeight = this._size[1] / (root.height + 1);
        
        function position(node, depth = 0, index = 0, siblings = 1) {
            node.x = (index + 0.5) * (this._size[0] / siblings);
            node.y = depth * nodeHeight;
            
            if (node.children) {
                node.children.forEach((child, i) => {
                    position.call(this, child, depth + 1, i, node.children.length);
                });
            }
        }
        
        position.call(this, root);
        return root;
    }
}

class HierarchyNode {
    constructor(data, parent = null) {
        this.data = data;
        this.parent = parent;
        this.children = null;
        this.depth = parent ? parent.depth + 1 : 0;
        this.height = 0;

        if (data.children) {
            this.children = data.children.map(child => new HierarchyNode(child, this));
            this.height = Math.max(...this.children.map(c => c.height)) + 1;
        }
    }

    descendants() {
        const nodes = [this];
        if (this.children) {
            this.children.forEach(child => {
                nodes.push(...child.descendants());
            });
        }
        return nodes;
    }

    links() {
        const links = [];
        if (this.children) {
            this.children.forEach(child => {
                links.push({ source: this, target: child });
                links.push(...child.links());
            });
        }
        return links;
    }
}

class LineGenerator {
    constructor() {
        this._x = d => d[0];
        this._y = d => d[1];
    }

    x(accessor) {
        if (!accessor) return this._x;
        this._x = accessor;
        return this;
    }

    y(accessor) {
        if (!accessor) return this._y;
        this._y = accessor;
        return this;
    }

    __call__(data) {
        if (!data || data.length === 0) return '';
        
        const points = data.map(d => `${this._x(d)},${this._y(d)}`);
        return 'M' + points.join('L');
    }
}

class Transition {
    constructor(elements) {
        this.elements = elements;
        this._duration = 250;
        this._delay = 0;
    }

    duration(ms) {
        this._duration = ms;
        return this;
    }

    delay(ms) {
        this._delay = ms;
        return this;
    }

    style(name, value) {
        this.elements.forEach((el, i) => {
            setTimeout(() => {
                el.style.transition = `${name} ${this._duration}ms ease`;
                if (typeof value === 'function') {
                    el.style[name] = value(el.__data__, i);
                } else {
                    el.style[name] = value;
                }
            }, this._delay + i * 50);
        });
        return this;
    }

    attr(name, value) {
        this.elements.forEach((el, i) => {
            setTimeout(() => {
                if (typeof value === 'function') {
                    el.setAttribute(name, value(el.__data__, i));
                } else {
                    el.setAttribute(name, value);
                }
            }, this._delay + i * 50);
        });
        return this;
    }
}

// Create global d3-like object for compatibility
window.d3 = VizUtils;