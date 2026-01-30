const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => {
  const colorClass = {
    primary: 'stat-card',
    success: 'stat-card success',
    info: 'stat-card info',
    warning: 'stat-card warning',
  }[color] || 'stat-card';

  return (
    <div className={`card border-0 shadow-sm h-100 ${colorClass}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="mb-1 small opacity-75">{title}</p>
            <h3 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>{value}</h3>
            {subtitle && <small className="opacity-75">{subtitle}</small>}
          </div>
          {icon && (
            <div
              className="rounded-circle bg-white bg-opacity-20 p-3"
              style={{ fontSize: '2rem' }}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
