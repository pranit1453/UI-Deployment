import { useState } from 'react';
import { Link } from 'react-router-dom';
import feedbackService from '../services/feedbackService';
import { getApiErrorMessage } from '../utils/apiError';

const MOTIVATIONAL_QUOTES = [
  'We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle',
  'The secret of getting ahead is getting started. — Mark Twain',
  'Small daily improvements over time lead to stunning results. — Robin Sharma',
  'Motivation is what gets you started. Habit is what keeps you going. — Jim Rohn',
  'Success is the sum of small efforts, repeated day in and day out. — Robert Collier',
  'You’ll never change your life until you change something you do daily. — John C. Maxwell',
  'Good habits are worth being fanatical about. — Ingrid Newkirk',
  'The chains of habit are too light to be felt until they are too heavy to be broken. — Warren Buffett',
  'First we make our habits, then our habits make us. — Charles C. Noble',
  'Excellence is not a destination; it is a continuous journey that never ends. — Brian Tracy',
];

const IMPORTANCE_OF_HABITS = [
  {
    title: 'Health & Well-being',
    description: 'Daily habits like exercise, sleep, and nutrition directly impact your physical and mental health. Consistent small actions compound into lasting vitality.',
    icon: '❤️',
  },
  {
    title: 'Productivity & Focus',
    description: 'Routines reduce decision fatigue and help you focus on what matters. Building habits around deep work and prioritization leads to higher output.',
    icon: '🎯',
  },
  {
    title: 'Personal Growth',
    description: 'Reading, learning, and reflecting daily accelerate growth. Good habits turn goals into automatic behaviors, making progress inevitable.',
    icon: '📈',
  },
  {
    title: 'Relationships & Balance',
    description: 'Habits like gratitude, communication, and presence strengthen relationships. Balancing work and life becomes easier with intentional routines.',
    icon: '🤝',
  },
];

const Home = () => {
  const [quoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    rating: 0,
    message: '',
  });
  const [validation, setValidation] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validate = () => {
    const err = {};
    if (!feedback.name?.trim()) err.name = 'Name is required';
    if (!feedback.email?.trim()) err.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedback.email)) err.email = 'Invalid email format';
    if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) err.rating = 'Please select a rating (1–5)';
    if (!feedback.message?.trim()) err.message = 'Message is required';
    setValidation(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback((prev) => ({ ...prev, [name]: name === 'rating' ? Number(value) : value }));
    setSubmitError('');
    if (validation[name]) setValidation((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    if (!validate()) return;

    setSubmitLoading(true);
    try {
      await feedbackService.submit({
        name: feedback.name.trim(),
        email: feedback.email.trim(),
        rating: feedback.rating,
        message: feedback.message.trim(),
      });
      setSubmitSuccess(true);
      setFeedback({ name: '', email: '', rating: 0, message: '' });
      setValidation({});
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary" to="/">
            📊 Habit Tracker
          </Link>
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-outline-primary">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Build Better Habits, One Day at a Time
              </h1>
              <p className="lead text-muted mb-4">
                Track your daily habits, monitor your progress, and achieve your goals with our intuitive habit tracking platform.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Tracking
                </Link>
                <Link to="/register" className="btn btn-outline-secondary btn-lg">
                  Build Better Habits
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="display-1">📈</div>
            </div>
          </div>
        </div>
      </section>

      {/* Motivational Quotes */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <h2 className="text-center fw-bold mb-4">💬 Motivational Quotes</h2>
          <blockquote className="blockquote text-center py-4 px-4 bg-light rounded-3 border-start border-4 border-primary">
            <p className="mb-0 fs-5 fst-italic">"{MOTIVATIONAL_QUOTES[quoteIndex]}"</p>
          </blockquote>
        </div>
      </section>

      {/* Importance of Good Habits */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <h2 className="text-center fw-bold mb-2">Why Good Habits Matter</h2>
          <p className="text-center text-muted mb-5">
            The importance of good habits in day-to-day life
          </p>
          <div className="row g-4">
            {IMPORTANCE_OF_HABITS.map((item) => (
              <div key={item.title} className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center">
                    <div className="display-4 mb-3">{item.icon}</div>
                    <h5 className="card-title fw-bold">{item.title}</h5>
                    <p className="card-text text-muted small">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="py-5 bg-primary text-white">
        <div className="container py-5 text-center">
          <h2 className="fw-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="lead mb-4">
            Join thousands of users building better habits today.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link to="/register" className="btn btn-light btn-lg">
              Start Tracking
            </Link>
            <Link to="/register" className="btn btn-outline-light btn-lg">
              Build Better Habits
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Feedback Form */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <h2 className="text-center fw-bold mb-2">Customer Feedback</h2>
          <p className="text-center text-muted mb-4">
            We'd love to hear from you. Share your experience.
          </p>
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  {submitSuccess && (
                    <div className="alert alert-success" role="alert">
                      Thank you! Your feedback has been submitted successfully.
                    </div>
                  )}
                  {submitError && (
                    <div className="alert alert-danger" role="alert">
                      {submitError}
                    </div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${validation.name ? 'is-invalid' : ''}`}
                        id="name"
                        name="name"
                        value={feedback.name}
                        onChange={handleChange}
                        placeholder="Your name"
                      />
                      {validation.name && (
                        <div className="invalid-feedback">{validation.name}</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className={`form-control ${validation.email ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        value={feedback.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                      />
                      {validation.email && (
                        <div className="invalid-feedback">{validation.email}</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Rating (1–5) <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex gap-2 flex-wrap">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <label
                            key={r}
                            className={`btn ${
                              feedback.rating === r ? 'btn-primary' : 'btn-outline-secondary'
                            }`}
                          >
                            <input
                              type="radio"
                              name="rating"
                              value={r}
                              checked={feedback.rating === r}
                              onChange={handleChange}
                              className="d-none"
                            />
                            {r}
                          </label>
                        ))}
                      </div>
                      {validation.rating && (
                        <div className="text-danger small mt-1">{validation.rating}</div>
                      )}
                    </div>
                    <div className="mb-4">
                      <label htmlFor="message" className="form-label">
                        Message <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className={`form-control ${validation.message ? 'is-invalid' : ''}`}
                        id="message"
                        name="message"
                        rows="4"
                        value={feedback.message}
                        onChange={handleChange}
                        placeholder="Your feedback..."
                      />
                      {validation.message && (
                        <div className="invalid-feedback">{validation.message}</div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Feedback'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-dark text-white py-4">
        <div className="container text-center">
          <p className="mb-0">&copy; 2026 Habit Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
