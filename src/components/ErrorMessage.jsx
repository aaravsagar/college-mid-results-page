function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="error-message">
      <strong>Error:</strong> {message}
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="btn btn-small btn-secondary"
          style={{ marginLeft: "12px" }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;