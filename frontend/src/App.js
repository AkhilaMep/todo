import { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle2, Circle, Trash2, Plus, LogOut } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

// Helper function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/user/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          await fetchTodos();
          setPage('todos');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/todos/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    await fetchTodos();
    setPage('todos');
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        },
      });
      setUser(null);
      setTodos([]);
      setPage('home');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-indigo-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {page === 'home' && <HomePage onNavigate={setPage} />}
      {page === 'login' && <LoginPage onLogin={handleLogin} onBack={() => setPage('home')} />}
      {page === 'register' && <RegisterPage onRegister={handleLogin} onBack={() => setPage('home')} />}
      {page === 'todos' && <TodoPage user={user} todos={todos} setTodos={setTodos} onLogout={handleLogout} />}
    </div>
  );
}

function HomePage({ onNavigate }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-8">
          <div className="inline-block p-4 bg-indigo-600 rounded-full mb-6">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Task<span className="text-indigo-600">Flow</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Organize your life, one task at a time
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <CheckCircle2 className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Simple & Clean</h3>
            <p className="text-gray-600 text-sm">Intuitive interface designed for productivity</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Circle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
            <p className="text-gray-600 text-sm">See your accomplishments at a glance</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Plus className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Stay Organized</h3>
            <p className="text-gray-600 text-sm">Keep all your tasks in one place</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => onNavigate('login')}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Sign In
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl border-2 border-indigo-600"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ onRegister, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();

      if (response.ok) {
        onRegister(data.user);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="mb-6 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-indigo-600 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join TaskFlow today</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Create a password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="mb-6 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-indigo-600 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to manage your tasks</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TodoPage({ user, todos, setTodos, onLogout }) {
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/todos/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/todos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({ title: newTodo }),
      });

      if (response.ok) {
        const todo = await response.json();
        setTodos([todo, ...todos]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const handleToggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        setTodos(todos.map(todo =>
          todo.id === id ? { ...todo, completed: !completed } : todo
        ));
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
      });

      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">My Tasks</h1>
              <p className="text-gray-600">Welcome back, {user?.username}!</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Progress</span>
              <span className="text-indigo-600 font-bold">{completedCount} / {todos.length}</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${todos.length ? (completedCount / todos.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleAddTodo}
                disabled={loading || !newTodo.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {todos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tasks yet. Add your first task above!</p>
              </div>
            ) : (
              todos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <button
                    onClick={() => handleToggleTodo(todo.id, todo.completed)}
                    className="flex-shrink-0"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  <span
                    className={`flex-1 ${
                      todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    {todo.title}
                  </span>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="flex-shrink-0 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;