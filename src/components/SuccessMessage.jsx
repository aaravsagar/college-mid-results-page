function SuccessMessage({ message }) {
  if (!message) return null;

  return (
    <div className="success-message">
      <strong>Success:</strong> {message}
    </div>
  );
}

export default SuccessMessage;