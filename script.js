// ===== Task Manager Application =====
// A modern task management system with day-based organization

class TaskManager {
    constructor() {
        // DOM Elements
        this.taskForm = document.getElementById('taskForm');
        this.taskDaySelect = document.getElementById('taskDay');
        this.taskNameInput = document.getElementById('taskName');
        this.taskDescriptionInput = document.getElementById('taskDescription');
        this.tasksContainer = document.getElementById('tasksContainer');
        this.errorMessage = document.getElementById('errorMessage');
        this.totalTasksSpan = document.getElementById('totalTasks');
        this.completedTasksSpan = document.getElementById('completedTasks');

        // Days of the week in order
        this.daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        // Task storage key
        this.storageKey = 'tasks';

        // Initialize
        this.tasks = this.loadTasks();
        this.attachEventListeners();
        this.renderTasks();
    }

    /**
     * Attach event listeners to form and task container
     */
    attachEventListeners() {
        // Form submission
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Clear error message on input focus
        this.taskDaySelect.addEventListener('focus', () => {
            this.clearError();
        });

        this.taskNameInput.addEventListener('focus', () => {
            this.clearError();
        });

        this.taskDescriptionInput.addEventListener('focus', () => {
            this.clearError();
        });

        // Event delegation for task actions (delete and complete)
        this.tasksContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                const taskId = parseInt(e.target.dataset.taskId);
                this.toggleTaskComplete(taskId);
            }
        });

        this.tasksContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete')) {
                const taskId = parseInt(e.target.dataset.taskId);
                this.deleteTask(taskId);
            }
        });
    }

    /**
     * Add a new task
     */
    addTask() {
        const taskDay = this.taskDaySelect.value.trim();
        const taskName = this.taskNameInput.value.trim();
        const taskDescription = this.taskDescriptionInput.value.trim();

        // Validation - All required fields
        if (!taskDay) {
            this.showError('Please select a day');
            return;
        }

        if (!taskName) {
            this.showError('Please enter a task name');
            return;
        }

        if (taskName.length > 100) {
            this.showError('Task name must be less than 100 characters');
            return;
        }

        if (taskDescription.length > 500) {
            this.showError('Task description must be less than 500 characters');
            return;
        }

        // Create new task object
        const task = {
            id: Date.now(),
            day: taskDay,
            name: taskName,
            description: taskDescription,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Add to tasks array
        this.tasks.push(task);

        // Save and render
        this.saveTasks();
        this.renderTasks();

        // Clear input
        this.taskDaySelect.value = '';
        this.taskNameInput.value = '';
        this.taskDescriptionInput.value = '';
        this.taskDaySelect.focus();

        // Clear error
        this.clearError();
    }

    /**
     * Delete a task
     * @param {number} taskId - The ID of the task to delete
     */
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    /**
     * Toggle task completion status
     * @param {number} taskId - The ID of the task to toggle
     */
    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    /**
     * Get tasks grouped by day
     * @returns {Object} - Object with days as keys and task arrays as values
     */
    getTasksByDay() {
        const tasksByDay = {};
        
        // Initialize all days
        this.daysOfWeek.forEach(day => {
            tasksByDay[day] = [];
        });

        // Group tasks by day
        this.tasks.forEach(task => {
            if (tasksByDay[task.day]) {
                tasksByDay[task.day].push(task);
            }
        });

        return tasksByDay;
    }

    /**
     * Render all tasks grouped by day
     */
    renderTasks() {
        const tasksByDay = this.getTasksByDay();
        const hasAnyTasks = this.tasks.length > 0;

        if (!hasAnyTasks) {
            this.tasksContainer.innerHTML = `
                <div class="empty-state">
                    <p>No tasks yet. Add one to get started!</p>
                </div>
            `;
            this.updateStats();
            return;
        }

        // Clear container
        this.tasksContainer.innerHTML = '';

        // Render each day section
        this.daysOfWeek.forEach(day => {
            const dayTasks = tasksByDay[day];

            // Only show days that have tasks
            if (dayTasks.length > 0) {
                // Create day section
                const daySection = document.createElement('div');
                daySection.className = 'day-section';

                // Day heading
                const dayHeading = document.createElement('h3');
                dayHeading.className = 'day-heading';
                dayHeading.textContent = `${day} Tasks (${dayTasks.length})`;

                daySection.appendChild(dayHeading);

                // Task list for this day
                const taskList = document.createElement('ul');
                taskList.className = 'day-task-list';

                dayTasks.forEach(task => {
                    const taskElement = this.createTaskElement(task);
                    const listItem = document.createElement('li');
                    listItem.className = 'day-task-item';
                    listItem.appendChild(taskElement);
                    taskList.appendChild(listItem);
                });

                daySection.appendChild(taskList);
                this.tasksContainer.appendChild(daySection);
            }
        });

        this.updateStats();
    }

    /**
     * Create a task element
     * @param {Object} task - The task object
     * @returns {HTMLElement} - The task element
     */
    createTaskElement(task) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.setAttribute('data-task-id', task.id);

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('data-task-id', task.id);
        checkbox.setAttribute('aria-label', `Mark "${task.name}" as ${task.completed ? 'incomplete' : 'complete'}`);

        // Task content wrapper
        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';

        // Task name (main title)
        const nameSpan = document.createElement('span');
        nameSpan.className = 'task-name';
        nameSpan.textContent = task.name;

        // Task description (if exists)
        let descSpan = null;
        if (task.description) {
            descSpan = document.createElement('span');
            descSpan.className = 'task-description';
            descSpan.textContent = task.description;
        }

        // Append name and description to content
        contentDiv.appendChild(nameSpan);
        if (descSpan) {
            contentDiv.appendChild(descSpan);
        }

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger btn-small btn-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.setAttribute('data-task-id', task.id);
        deleteBtn.setAttribute('aria-label', `Delete task: ${task.name}`);

        // Actions container
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        actionsDiv.appendChild(deleteBtn);

        // Append all elements to task item
        taskItem.appendChild(checkbox);
        taskItem.appendChild(contentDiv);
        taskItem.appendChild(actionsDiv);

        return taskItem;
    }

    /**
     * Update task statistics
     */
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;

        this.totalTasksSpan.textContent = total;
        this.completedTasksSpan.textContent = completed;
    }

    /**
     * Save tasks to local storage
     */
    saveTasks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks to local storage:', error);
            this.showError('Failed to save tasks. Please try again.');
        }
    }

    /**
     * Load tasks from local storage
     * @returns {Array} - Array of task objects
     */
    loadTasks() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading tasks from local storage:', error);
            return [];
        }
    }

    /**
     * Show error message
     * @param {string} message - The error message to display
     */
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.setAttribute('aria-live', 'polite');
    }

    /**
     * Clear error message
     */
    clearError() {
        this.errorMessage.textContent = '';
    }
}

// ===== Initialize Application =====
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});

// ===== PWA Service Worker Registration =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
