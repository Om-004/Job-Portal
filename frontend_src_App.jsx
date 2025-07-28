import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [jobs, setJobs] = useState([]);
  const [view, setView] = useState('jobs');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/jobs/')
      .then(response => setJobs(response.data))
      .catch(error => console.error('Error fetching jobs:', error));
  }, []);

  const handleSearch = () => {
    axios.get(`http://localhost:8000/api/jobs/search/?q=${searchQuery}`)
      .then(response => setJobs(response.data))
      .catch(error => console.error('Error searching jobs:', error));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Job Portal</h1>
      <nav className="mb-4 flex justify-between">
        <div>
          <button
            onClick={() => setView('jobs')}
            className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View Jobs
          </button>
          {token && (
            <button
              onClick={() => setView('post')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Post a Job
            </button>
          )}
        </div>
        <div>
          {token ? (
            <button
              onClick={() => {
                localStorage.removeItem('token');
                setToken('');
                setView('jobs');
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => setView('login')}
                className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Login
              </button>
              <button
                onClick={() => setView('register')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {view === 'jobs' && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search jobs by title or company"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleSearch}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Search
          </button>
          <JobList jobs={jobs} setView={setView} setSelectedJobId={setSelectedJobId} token={token} />
        </div>
      )}
      {view === 'post' && <PostJobForm setView={setView} setJobs={setJobs} token={token} />}
      {view === 'apply' && <ApplyJobForm jobId={selectedJobId} setView={setView} token={token} />}
      {view === 'login' && <LoginForm setToken={setToken} setView={setView} />}
      {view === 'register' && <RegisterForm setToken={setToken} setView={setView} />}
    </div>
  );
}

function JobList({ jobs, setView, setSelectedJobId, token }) {
  return (
    <div className="grid gap-4">
      {jobs.map(job => (
        <div key={job.id} className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold">{job.title}</h2>
          <p className="text-gray-600">{job.company} - {job.location}</p>
          <p className="mt-2">{job.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            Posted on: {new Date(job.posted_at).toLocaleDateString()}
          </p>
          {token && (
            <button
              onClick={() => {
                setSelectedJobId(job.id);
                setView('apply');
              }}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply Now
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function PostJobForm({ setView, setJobs, token }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/api/jobs/', formData, {
      headers: { Authorization: `Token ${token}` },
    })
      .then(response => {
        setJobs(prevJobs => [...prevJobs, response.data]);
        setView('jobs');
      })
      .catch(error => console.error('Error posting job:', error));
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Post a New Job</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Job Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <label className="block mb-2 mt-4">Company</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <label className="block mb-2 mt-4">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <label className="block mb-2 mt-4">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows="4"
          required
        ></textarea>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Post Job
        </button>
      </form>
    </div>
  );
}

function ApplyJobForm({ jobId, setView, token }) {
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    resume: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/api/applications/', { ...formData, job: jobId }, {
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        alert('Application submitted successfully!');
        setView('jobs');
      })
      .catch(error => console.error('Error submitting application:', error));
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Apply for Job</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Full Name</label>
        <input
          type="text"
          name="applicant_name"
          value={formData.applicant_name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <label className="block mb-2 mt-4">Email</label>
        <input
          type="email"
          name="applicant_email"
          value={formData.applicant_email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <label className="block mb-2 mt-4">Resume (Text or URL)</label>
        <textarea
          name="resume"
          value={formData.resume}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows="4"
          required
        ></textarea>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}

function LoginForm({ setToken, setView }) {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/api/login/', formData)
      .then(response => {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setView('jobs');
      })
      .catch(error => console.error('Error logging in:', error));
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <label className="block mb-2 mt-4">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}

function RegisterForm({ setToken, setView }) {
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/api/register/', formData)
      .then(response => {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setView('jobs');
      })
      .catch(error => console.error('Error registering:', error));
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <label className="block mb-2 mt-4">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <label className="block mb-2 mt-4">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default App;