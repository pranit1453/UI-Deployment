import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar />
      <main className="flex-grow-1 bg-light">
        <div className="container-fluid py-4">{children}</div>
      </main>
      <footer className="bg-white border-top py-3 text-center text-muted">
        <small>&copy; 2026 Habit Tracker. All rights reserved.</small>
      </footer>
    </div>
  );
};

export default Layout;
