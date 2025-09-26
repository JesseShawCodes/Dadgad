export default function WarningMessage({message, type="warning"}) {
  return (
    <div className={`alert alert-${type} border-0`} role="alert">
      {message || "We are actively working to improve this experience, but some features may not work as expected. Thank you for your patience!"}
    </div>
  );
}
