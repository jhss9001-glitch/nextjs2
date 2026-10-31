export default function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <div id="toast" className={`toast${show ? ' show' : ''}`} role="status">
      {message}
    </div>
  );
}
