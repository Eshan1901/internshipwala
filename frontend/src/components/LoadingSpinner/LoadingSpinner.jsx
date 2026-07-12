import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  return (
    <div className="loading-container">
      <div className={`spinner spinner-${size}`} />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}
