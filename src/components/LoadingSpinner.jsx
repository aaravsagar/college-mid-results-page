function LoadingSpinner({ size = "normal", text = "Loading..." }) {
  return (
    <div className="page-loading">
      <div className={`loading-spinner ${size === "large" ? "large" : ""}`}></div>
      {text && <p>{text}</p>}
    </div>
  );
}

export default LoadingSpinner;