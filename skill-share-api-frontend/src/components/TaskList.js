import React, { useState } from 'react';
import { completeTask } from '../services/api';
import './TaskList.css'

const TaskList = ({ tasks, onTaskCompleted }) => {
    const [error, setError] = useState('');

    const handleComplete = async (taskId) => {
        try {
            await completeTask(taskId);
            onTaskCompleted(taskId);
            setError('');
        } catch (error) {
            setError('Failed to complete task. Please try again.');
            console.error('Error completing task:', error);
        }
    };

    return (
        <div>
            {error && <p className="error-message">{error}</p>}
            <ul className="task-list">
                {tasks.map((task) => (
                    <li key={task.id} className="task-item">
                        <span className={task.completed ? 'task-completed' : ''}>
                            {task.description} )
                        </span>
                        {!task.completed && (
                            <button
                                onClick={() => handleComplete(task.id)}
                                className="complete-button"
                            >
                                Complete
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList;