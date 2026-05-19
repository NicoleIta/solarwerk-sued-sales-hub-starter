import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold text-red-400 dark:text-red-700">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Seite nicht gefunden
      </h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Der gesuchte Eintrag existiert nicht oder wurde gelöscht.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Zurück zum Dashboard
      </Link>
    </div>
  );
}
