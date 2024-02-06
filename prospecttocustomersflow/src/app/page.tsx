import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
       <div className="text-center">
       <Link href="/addProspect" legacyBehavior>
        <a className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">
          Gérer les Prospects
        </a>
      </Link>
      </div>

    </main>
  );
}
