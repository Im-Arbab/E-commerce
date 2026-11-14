import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-page py-32 text-center">
      <p className="font-mono text-circuit text-sm">404</p>
      <h1 className="text-2xl font-bold mt-2">Page not found</h1>
      <p className="text-ink/50 mt-2">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Back to Home</Link>
    </div>
  );
}
