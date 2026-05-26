export default function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
      {message}
    </div>
  );
}