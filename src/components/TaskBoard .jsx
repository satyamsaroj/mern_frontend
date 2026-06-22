//eslint-disable-next-line
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { X, Edit, Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setTasks,
  addTask,
  updateTask,
  removeTask,
} from "../redux/features/task/taskSlice";
import { logout } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import Button from "./Button";
import Streak from "./Streak";

const API_URL =
  import.meta.env.VITE_BACKEND_BASE_URL || "https://taskmanagerbysatyamsaroj.onrender.com";

const TaskDetailModal = ({ task, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Task Details</h2>
      <p><strong>Title:</strong> {task.title}</p>
      <p><strong>Description:</strong> {task.description}</p>
      <p><strong>Status:</strong> {task.status}</p>
      <p><strong>Priority:</strong> {task.priority}</p>
      <p><strong>Due Date:</strong>{" "}
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
      </p>
      <button onClick={onClose} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
        Close
      </button>
    </div>
  </div>
);

const EditTaskModal = ({ task, onSave, onClose }) => {
  const [editedTask, setEditedTask] = useState(task);

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Task</h2>
        <input
          type="text"
          value={editedTask.title}
          onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        />
        <textarea
          value={editedTask.description}
          onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          rows="3"
        />
        <select
          value={editedTask.status}
          onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select
          value={editedTask.priority}
          onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input
          type="date"
          value={editedTask.dueDate ? editedTask.dueDate.split("T")[0] : ""}
          onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        />
        <div className="flex justify-end">
          <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
            Save
          </button>
          <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const TrelloBoard = () => {
  const [showStreak, setShowStreak] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tasks = useSelector((state) => state.tasks.tasks);
  const user = useSelector((state) => state.auth.userInfo);
  const token = useSelector((state) => state.auth.token); // ← get token

  // ✅ authAxios with Bearer token
  const authAxios = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let color = "#ffffff";
  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "#118e2a",
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // ✅ using authAxios not axios
        const response = await authAxios.get("/api/v1/tasks");
        dispatch(setTasks(response.data));
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          dispatch(logout());
          navigate("/login");
        } else {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    fetchTasks();
  }, [dispatch, navigate]);

  const columns = {
    todo: { id: "todo", title: "TODO", tasks: tasks.filter((t) => t.status === "To Do") },
    inProgress: { id: "inProgress", title: "IN PROGRESS", tasks: tasks.filter((t) => t.status === "In Progress") },
    done: { id: "done", title: "DONE", tasks: tasks.filter((t) => t.status === "Done") },
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const task = columns[source.droppableId].tasks[source.index];
    const updatedTask = {
      ...task,
      status:
        destination.droppableId === "inProgress" ? "In Progress"
        : destination.droppableId === "done" ? "Done"
        : "To Do",
    };

    try {
      // ✅ using authAxios
      const response = await authAxios.put(`/api/v1/tasks/${task._id}`, updatedTask);
      dispatch(updateTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const addNewTask = async () => {
    const newTask = {
      title: "New Task",
      description: "New Description",
      status: "To Do",
      priority: "Medium",
      dueDate: new Date().toISOString().split("T")[0],
    };
    try {
      // ✅ using authAxios
      const response = await authAxios.post("/api/v1/tasks", newTask);
      dispatch(addTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      // ✅ using authAxios
      await authAxios.delete(`/api/v1/tasks/${taskId}`);
      dispatch(removeTask(taskId));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      // ✅ using authAxios
      const response = await authAxios.put(`/api/v1/tasks/${updatedTask._id}`, updatedTask);
      dispatch(updateTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center text-2xl">
        <h1>
          Using Free Service for Hosting, So it will take upto 40-50 secs for Initial Loading...
          <ClipLoader color={color} loading={loading} cssOverride={override} size={150} />
        </h1>
      </div>
    );

  if (error) return <div>Error: {error}</div>;

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredColumns = {
    todo: { ...columns.todo, tasks: filteredTasks.filter((t) => t.status === "To Do") },
    inProgress: { ...columns.inProgress, tasks: filteredTasks.filter((t) => t.status === "In Progress") },
    done: { ...columns.done, tasks: filteredTasks.filter((t) => t.status === "Done") },
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-3">
          <Button bgColor="bg-green-600" textColor="text-white" onClick={addNewTask}>
            Add Task
          </Button>
          <Button bgColor="bg-green-600" textColor="text-white" onClick={() => setShowStreak(!showStreak)}>
            🔥 Streak
          </Button>
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="border p-2 rounded" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="recent">Recent</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row gap-4">
          {Object.values(filteredColumns).map((column) => (
            <div key={column.id} className="flex-1 min-w-[250px]">
              <h2 className="font-bold mb-2 bg-green-500 text-white p-2 rounded">{column.title}</h2>
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="bg-gray-100 p-2 rounded min-h-[100px]">
                    {column.tasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-2 mb-2 rounded shadow"
                          >
                            <h3 className="font-semibold">{task.title}</h3>
                            <p className="text-sm text-gray-600">{task.description}</p>
                            <p className="text-xs text-gray-400">
                              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
                            </p>
                            <div className="flex justify-end mt-2">
                              <button onClick={() => deleteTask(task._id)} className="text-red-500 mr-2">
                                <X size={18} />
                              </button>
                              <button onClick={() => setEditTask(task)} className="text-green-500 mr-2">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => setViewTask(task)} className="text-green-500">
                                <Eye size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {viewTask && <TaskDetailModal task={viewTask} onClose={() => setViewTask(null)} />}
      {editTask && <EditTaskModal task={editTask} onSave={handleEditTask} onClose={() => setEditTask(null)} />}
      {showStreak && user && <Streak userId={user._id} />}
    </div>
  );
};

export default TrelloBoard;