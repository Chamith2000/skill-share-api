import React, { useState, useEffect } from 'react';
import './LearningPlanForm.css';

// Default values for the form
const defaultLearningPlanDTO = {
    userId: 1,
    topic: '',
    resources: [],
    tasks: []
};

const defaultTask = {
    description: '',
    status: 'NOT_STARTED' // Align with LearningStatus enum
};

const LearningPlanForm = ({ plan, onSubmit }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.userId || 1; // Fallback to 1 if userId is not in token

    const [formData, setFormData] = useState({ ...defaultLearningPlanDTO, userId });
    const [newTask, setNewTask] = useState(defaultTask);
    const [newResource, setNewResource] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (plan) {
            setFormData({
                userId,
                topic: plan.topic || '',
                resources: Array.isArray(plan.resources) ? plan.resources : [],
                tasks: Array.isArray(plan.tasks) ? plan.tasks.map(task => ({
                    description: task.description,
                    status: task.status || 'NOT_STARTED'
                })) : []
            });
        } else {
            setFormData({ ...defaultLearningPlanDTO, userId });
        }
    }, [plan, userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTaskChange = (e) => {
        setNewTask((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleResourceChange = (e) => {
        setNewResource(e.target.value);
    };

    const addResource = () => {
        if (newResource.trim()) {
            setFormData((prev) => ({
                ...prev,
                resources: [...prev.resources, newResource.trim()]
            }));
            setNewResource('');
        }
    };

    const removeResource = (index) => {
        setFormData((prev) => ({
            ...prev,
            resources: prev.resources.filter((_, i) => i !== index)
        }));
    };

    const addTask = () => {
        if (newTask.description.trim()) {
            setFormData((prev) => ({
                ...prev,
                tasks: [...prev.tasks, { ...newTask }]
            }));
            setNewTask(defaultTask);
        }
    };

    const removeTask = (index) => {
        setFormData((prev) => ({
            ...prev,
            tasks: prev.tasks.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                tasks: formData.tasks.map(task => ({
                    description: task.description,
                    status: task.status || 'NOT_STARTED'
                }))
            };
            const response = await fetch(
                plan && plan.id
                    ? `http://localhost:8080/api/learning-plans/${plan.id}`
                    : 'http://localhost:8080/api/learning-plans',
                {
                    method: plan && plan.id ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                }
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setError('');
            onSubmit();
            if (!plan) {
                setFormData({ ...defaultLearningPlanDTO, userId });
            }
        } catch (error) {
            setError('Failed to submit learning plan. Please try again.');
            console.error('Error submitting learning plan:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h2 className="form-title">{plan ? 'Update' : 'Create'} Learning Plan</h2>
            {error && <p className="error-message">{error}</p>}

            <div className="form-group">
                <label className="form-label">Topic</label>
                <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="form-input"
                    required
                />
            </div>

            <div className="form-group">
                <h3 className="form-subtitle">Resources</h3>
                <div className="resource-input-group">
                    <input
                        type="text"
                        value={newResource}
                        onChange={handleResourceChange}
                        placeholder="Add a resource (book, URL, etc.)"
                        className="form-input"
                    />
                    <button
                        type="button"
                        onClick={addResource}
                        className="add-resource-button"
                    >
                        Add Resource
                    </button>
                </div>

                <ul className="resource-list">
                    {formData.resources.map((resource, index) => (
                        <li key={index} className="resource-item">
                            {resource}
                            <button
                                type="button"
                                onClick={() => removeResource(index)}
                                className="remove-button"
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="form-group">
                <h3 className="form-subtitle">Tasks</h3>
                <div className="task-input-group">
                    <input
                        type="text"
                        name="description"
                        value={newTask.description}
                        onChange={handleTaskChange}
                        placeholder="Task description"
                        className="form-input1"
                    />
                    <select
                        name="status"
                        value={newTask.status}
                        onChange={handleTaskChange}
                        className="form-input"
                    >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                    <button
                        type="button"
                        onClick={addTask}
                        className="add-task-button"
                    >
                        Add Task
                    </button>
                </div>

                <ul className="task-list">
                    {formData.tasks.map((task, index) => (
                        <li key={index} className="task-item">
                            {task.description} (Status: {task.status})
                            <button
                                type="button"
                                onClick={() => removeTask(index)}
                                className="remove-button"
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                type="submit"
                className="submit-button"
            >
                {plan ? 'Update' : 'Create'} Plan
            </button>
        </form>
    );
};

export default LearningPlanForm;