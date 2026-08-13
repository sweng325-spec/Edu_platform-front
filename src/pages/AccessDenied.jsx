import { Link, useLocation } from 'react-router-dom';

export default function AccessDenied() {
  const { state } = useLocation();
  const home = state?.home || '/dashboard';

  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-amber-950">Access denied</h1>
      <p className="mt-3 text-amber-900">Your account does not have permission to open this page.</p>
      <Link to={home} className="mt-6 inline-flex rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">
        Return to dashboard
      </Link>
    </section>
  );
}
