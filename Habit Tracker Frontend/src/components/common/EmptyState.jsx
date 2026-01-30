const EmptyState = ({ title, message, action }) => {
  return (
    <div className="text-center py-5">
      <div className="mb-4" style={{ fontSize: '4rem', opacity: 0.3 }}>
        📋
      </div>
      <h4 className="mb-2">{title}</h4>
      <p className="text-muted mb-4">{message}</p>
      {action && action}
    </div>
  );
};

export default EmptyState;
