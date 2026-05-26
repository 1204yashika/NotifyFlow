import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <p className="text-6xl mb-4">🔍</p>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h1>
      <p className="text-sm text-gray-500 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="px-4 py-2 bg-[#534AB7] text-white text-sm rounded-lg hover:bg-[#4338a0]"
      >
        Back to dashboard
      </button>
    </div>
  );
}