import React, { useState } from "react";
import "./CreateLearningPathPage.css";

function CreateLearningPathPage() {
  const [plan, setPlan] = useState({
    topic: "",
    resources: "",
    startDate: "",
    endDate: "",
    timeLine: "",
    extended: false,
    tasks: []
  });
  const [newTask, setNewTask] = useState({
    description: "",
    dueDate: "",
    completed: false,
    completedAt: null
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlan((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTask = () => {
    if (!newTask.description || !newTask.dueDate) return;

    setPlan(prev => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          // Generate a temporary ID for UI purposes
          id: Date.now(),
          description: newTask.description,
          dueDate: newTask.dueDate,
          completed: false,
          completedAt: null
        }
      ]
    }));

    // Reset task form
    setNewTask({
      description: "",
      dueDate: "",
      completed: false,
      completedAt: null
    });
  };

  const removeTask = (taskId) => {
    setPlan(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const storedUser = localStorage.getItem("user");
    let userId = null;

    try {
      const parsedUser = JSON.parse(storedUser);
      userId = parsedUser?.id;
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
    }

    if (!userId) {
      setMessage("User not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    // Format tasks to match the expected backend structure
    const formattedTasks = plan.tasks.map(task => ({
      description: task.description,
      dueDate: task.dueDate,
      completed: task.completed || false,
      completedAt: task.completedAt || null
    }));

    const planWithUser = {
      userId: userId, // Changed from user_id to userId to match Spring naming convention
      topic: plan.topic,
      resources: plan.resources,
      startDate: plan.startDate,
      endDate: plan.endDate,
      timeLine: plan.timeLine,
      extended: plan.extended,
      tasks: formattedTasks
    };

    console.log("Sending data:", planWithUser);

    try {
      const res = await fetch("http://localhost:8080/api/learning-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planWithUser),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server response:", res.status, errorText);
        setMessage(`Failed to create learning plan. Status: ${res.status}`);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      console.log("Success response:", data);

      setMessage("Learning plan created successfully!");
      setPlan({
        topic: "",
        resources: "",
        startDate: "",
        endDate: "",
        timeLine: "",
        extended: false,
        tasks: []
      });
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong. Please check your connection to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-plan-container">
      <div className="plan-form-card">
        <h2 className="form-title">Create Learning Plan</h2>

        {message && (
          <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="plan-form">
          <div className="form-group">
            <label htmlFor="topic">Topic</label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={plan.topic}
              onChange={handleChange}
              placeholder="What do you want to learn?"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="resources">Resources</label>
            <textarea
              id="resources"
              name="resources"
              value={plan.resources}
              onChange={handleChange}
              placeholder="Books, websites, courses, etc."
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={plan.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={plan.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="timeLine">Timeline</label>
            <input
              type="datetime-local"
              id="timeLine"
              name="timeLine"
              value={plan.timeLine}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="extended"
              name="extended"
              checked={plan.extended}
              onChange={handleChange}
            />
            <label htmlFor="extended">Extended learning plan</label>
          </div>

          <div className="tasks-section">
            <h3 className="section-title">Tasks</h3>

            <div className="task-list">
              {plan.tasks.length > 0 ? (
                plan.tasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-content">
                      <p className="task-description">{task.description}</p>
                      <p className="task-due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                    <button
                      type="button"
                      className="remove-task-btn"
                      onClick={() => removeTask(task.id)}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-tasks">No tasks added yet</p>
              )}
            </div>

            <div className="add-task-form">
              <div className="form-row">
                <div className="form-group task-description-group">
                  <input
                    type="text"
                    name="description"
                    value={newTask.description}
                    onChange={handleTaskChange}
                    placeholder="Task description"
                    className="task-input"
                  />
                </div>
                <div className="form-group task-date-group">
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={newTask.dueDate}
                    onChange={handleTaskChange}
                    className="task-date-input"
                  />
                </div>
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={addTask}
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Plan"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateLearningPathPage;