class NeonTodoApp {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('neonTodos')) || [];
    this.todoIdCounter = this.todos.length > 0 ? Math.max(...this.todos.map(t => t.id)) + 1 : 1;
    
    this.initializeElements();
    this.bindEvents();
    this.renderTodos();
    this.updateStats();
    this.initializeParticleSystem();
  }

  initializeElements() {
    this.todoInput = document.getElementById('todoInput');
    this.addBtn = document.getElementById('addBtn');
    this.todoList = document.getElementById('todoList');
    this.totalTasks = document.getElementById('totalTasks');
    this.completedTasks = document.getElementById('completedTasks');
    this.pendingTasks = document.getElementById('pendingTasks');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addTodo());
    this.todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });

    this.todoInput.addEventListener('focus', this.createInputParticles.bind(this));
  }

  addTodo() {
    const text = this.todoInput.value.trim();
    if (!text) return;

    const newTodo = {
      id: this.todoIdCounter++,
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.push(newTodo);
    this.saveTodos();
    this.renderTodos();
    this.updateStats();
    this.todoInput.value = '';

    this.createCelebrationParticles();
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.renderTodos();
      this.updateStats();
      
      if (todo.completed) {
        this.createCompletionEffect();
      }
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveTodos();
    this.renderTodos();
    this.updateStats();
    this.createDeleteEffect();
  }

  editTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;

    const newText = prompt('Edit your task:', todo.text);
    if (newText !== null && newText.trim() !== '') {
      todo.text = newText.trim();
      this.saveTodos();
      this.renderTodos();
    }
  }

  renderTodos() {
    this.todoList.innerHTML = '';
    
    if (this.todos.length === 0) {
      this.todoList.innerHTML = `
        <div class="empty-state" style="
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
          font-size: 1.2rem;
        ">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
          <div>No missions assigned yet!</div>
          <div style="font-size: 0.9rem; margin-top: 0.5rem;">Add your first task to get started</div>
        </div>
      `;
      return;
    }

    this.todos.forEach(todo => {
      const todoElement = this.createTodoElement(todo);
      this.todoList.appendChild(todoElement);
    });
  }

  createTodoElement(todo) {
    const todoDiv = document.createElement('div');
    todoDiv.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    todoDiv.innerHTML = `
      <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}"></div>
      <div class="todo-text">${this.escapeHtml(todo.text)}</div>
      <div class="todo-actions">
        <button class="action-btn edit-btn" data-id="${todo.id}" title="Edit">
          ✏️
        </button>
        <button class="action-btn delete-btn" data-id="${todo.id}" title="Delete">
          🗑️
        </button>
      </div>
    `;

    const checkbox = todoDiv.querySelector('.todo-checkbox');
    const editBtn = todoDiv.querySelector('.edit-btn');
    const deleteBtn = todoDiv.querySelector('.delete-btn');

    checkbox.addEventListener('click', () => this.toggleTodo(todo.id));
    editBtn.addEventListener('click', () => this.editTodo(todo.id));
    deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

    return todoDiv;
  }

  updateStats() {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const pending = total - completed;

    this.animateCounterToValue(this.totalTasks, total);
    this.animateCounterToValue(this.completedTasks, completed);
    this.animateCounterToValue(this.pendingTasks, pending);
  }

  animateCounterToValue(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const duration = 300;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentDisplayValue = Math.round(currentValue + (targetValue - currentValue) * easeOut);

      element.textContent = currentDisplayValue.toString().padStart(4, '0');
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = targetValue.toString().padStart(4, '0');
      }
    };
    
    requestAnimationFrame(animate);
  }

  saveTodos() {
    localStorage.setItem('neonTodos', JSON.stringify(this.todos));
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }


  initializeParticleSystem() {
    this.canvas = document.getElementById('particleCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    this.createBackgroundParticles();
    this.animateParticles();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createBackgroundParticles() {
    const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        color: this.getRandomNeonColor(),
        alpha: Math.random() * 0.5 + 0.2,
        life: 1
      });
    }
  }

  createCelebrationParticles() {
    const colors = ['#00ff88', '#ff0088', '#0088ff', '#ffff00', '#ff8800'];
    
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1,
        decay: 0.02,
        type: 'celebration'
      });
    }
  }

  createCompletionEffect() {
    const colors = ['#00ff88', '#00ffaa'];
    
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: this.canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 8 - 2,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1,
        decay: 0.015,
        type: 'completion'
      });
    }
  }

  createDeleteEffect() {
    const colors = ['#ff0088', '#ff4444'];
    
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1,
        decay: 0.025,
        type: 'delete'
      });
    }
  }

  createInputParticles() {
    const colors = ['#00ff88', '#0088ff'];
    
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: this.canvas.height / 3,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.8,
        life: 1,
        decay: 0.02,
        type: 'input'
      });
    }
  }

  getRandomNeonColor() {
    const colors = ['#00ff88', '#ff0088', '#0088ff', '#ffff00', '#ff8800', '#8800ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  animateParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
  
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.type === 'celebration' || particle.type === 'completion') {
        particle.vy += 0.1;
      }

      if (particle.decay) {
        particle.life -= particle.decay;
        particle.alpha = particle.life;
      }
    
      if (particle.life <= 0 || particle.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (!particle.type) {
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;
      }
      
      // Draw particle
      this.ctx.save();
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
    
    requestAnimationFrame(() => this.animateParticles());
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new NeonTodoApp();
  
  // Add some extra visual flair
  setTimeout(() => {
    document.body.style.animation = 'fadeIn 1s ease-in';
  }, 100);
});

// Add CSS for fade in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(style);

// Easter egg: Konami code for extra effects
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.keyCode);
  if (konamiCode.length > konamiSequence.length) {
    konamiCode.shift();
  }
  
  if (konamiCode.length === konamiSequence.length && 
      konamiCode.every((code, index) => code === konamiSequence[index])) {
    // Activate crazy mode!
    document.body.style.animation = 'rainbow 2s infinite';
    const style = document.createElement('style');
    style.textContent = `
      @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    // Show secret message
    setTimeout(() => {
      alert('🎉 CYBERPUNK MODE ACTIVATED! 🎉');
    }, 1000);
  }
});
