const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClass =
    size === 'sm'
      ? 'spinner-border-sm'
      : size === 'lg'
      ? 'spinner-border-lg'
      : '';

  return (
    <div className="text-center py-5">
      <div className={`spinner-border text-primary ${sizeClass}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="mt-3 text-muted">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
