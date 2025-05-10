import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';
import LearningPlanForm from './LearningPlanForm';
import './LearningPlanList.css';
import Navbar from './Navbar';

const LearningPlanList = () => {
    const [plans, setPlans] = useState([]);
    const [editingPlan, setEditingPlan] = useState(null);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.userId || 1;

    const fetchPlans = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/learning-plans');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setPlans(data || []);
            setError('');
        } catch (error) {
            setError('Failed to fetch learning plans. Please try again later.');
            console.error('Error fetching learning plans:', error);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/learning-plans/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setPlans(plans.filter((plan) => plan.id !== id));
            setError('');
        } catch (error) {
            setError('Failed to delete learning plan. Please try again.');
            console.error('Error deleting learning plan:', error);
        }
    };

    const handleTaskCompleted = async (taskId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/learning-plans/tasks/${taskId}/complete`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const updatedTask = await response.json();
            setPlans((prevPlans) =>
                prevPlans.map((plan) => ({
                    ...plan,
                    tasks: plan.tasks.map((task) =>
                        task.id === taskId ? updatedTask : task
                    ),
                }))
            );
            setError('');
        } catch (error) {
            setError('Failed to update task status. Please try again.');
            console.error('Error updating task status:', error);
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan({
            id: plan.id,
            userId,
            topic: plan.topic,
            resources: plan.resources || [],
            tasks: plan.tasks || [],
        });
        setShowForm(true);
    };

    const handleFormSubmit = () => {
        setEditingPlan(null);
        setShowForm(false);
        fetchPlans();
    };

    const handleCreateNew = () => {
        setEditingPlan(null);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setEditingPlan(null);
        setShowForm(false);
    };

    // Calculate progress percentage for a plan
    const calculateProgress = (tasks) => {
        if (!tasks || tasks.length === 0) return 0;
        const completedTasks = tasks.filter((task) => task.status === 'COMPLETED').length;
        return Math.round((completedTasks / tasks.length) * 100);
    };

    return (
        <div>
            <Navbar />
            <div className="container1">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="page-title"
                >
                    Learning Plans
                </motion.h1>

                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="error-message"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                <div className="create-button-container">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCreateNew}
                        className="create-button"
                    >
                        Create New Learning Plan
                    </motion.button>
                </div>

                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <LearningPlanForm 
                                onSubmit={handleFormSubmit} 
                                plan={editingPlan} 
                                onCancel={handleCancelForm}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="plans-grid">
                    <AnimatePresence>
                        {plans.length === 0 ? (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="no-plans"
                            >
                                No learning plans available.
                            </motion.p>
                        ) : (
                            plans.map((plan, index) => {
                                const progress = calculateProgress(plan.tasks);
                                const circumference = 2 * Math.PI * 40; // Radius = 40
                                const offset = circumference - (progress / 100) * circumference;

                                return (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="plan-card"
                                    >
                                        <h2 className="plan-title">{plan.topic}</h2>

                                        <div className="progress-container">
                                            <svg className="progress-circle" width="100" height="100">
                                                <circle
                                                    className="progress-circle-bg"
                                                    cx="50"
                                                    cy="50"
                                                    r="40"
                                                    strokeWidth="8"
                                                />
                                                <motion.circle
                                                    className="progress-circle-fill"
                                                    cx="50"
                                                    cy="50"
                                                    r="40"
                                                    strokeWidth="8"
                                                    strokeDasharray={circumference}
                                                    strokeDashoffset={offset}
                                                    initial={{ strokeDashoffset: circumference }}
                                                    animate={{ strokeDashoffset: offset }}
                                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                                />
                                            </svg>
                                            <span className="progress-label">{progress}%</span>
                                        </div>

                                        <div className="plan-resources">
                                            <h3>Resources</h3>
                                            {plan.resources && plan.resources.length > 0 ? (
                                                <ul>
                                                    {plan.resources.map((resource, index) => (
                                                        <li key={index}>{resource}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>No resources available</p>
                                            )}
                                        </div>

                                        <div className="plan-tasks">
                                            <h3>Tasks</h3>
                                            {plan.tasks && plan.tasks.length > 0 ? (
                                                <ul>
                                                    {plan.tasks.map((task) => (
                                                        <li key={task.id} className="task-item">
                                                            <div className="task-details">
                                                                <span>{task.description}</span>
                                                            </div>
                                                            {task.status === 'COMPLETED' ? (
                                                                <CheckCircle 
                                                                    size={24} 
                                                                    className="check-icon completed" 
                                                                    color="#4CAF50"
                                                                    strokeWidth={2}
                                                                />
                                                            ) : (
                                                                <motion.div
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleTaskCompleted(task.id)}
                                                                    className="complete-icon"
                                                                >
                                                                    <CheckCircle size={24} className="check-icon" />
                                                                </motion.div>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>No tasks available</p>
                                            )}
                                        </div>

                                        <div className="plan-actions">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleEdit(plan)}
                                                className="edit-button"
                                            >
                                                Edit
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDelete(plan.id)}
                                                className="delete-button"
                                            >
                                                Delete
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default LearningPlanList;