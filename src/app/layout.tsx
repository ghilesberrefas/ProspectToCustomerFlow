import Link from 'next/link';
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <>
      <nav className="bg-gray-800 text-white p-4">
        <ul className="flex space-x-4 justify-center">
          <li>
            <Link href="/ReadmeDisplay" className="hover:text-blue-300 transition duration-300">
              Accueil
            </Link>
          </li>
          <li>
            <Link href="/addProspect" className="hover:text-blue-300 transition duration-300">
              Gérer les Prospects
            </Link>
          </li>
          <li>
            <Link href="/clients" className="hover:text-blue-300 transition duration-300">
              Gérer les Clients
            </Link>
          </li>
          <li>
            <Link href="/interactions" className="hover:text-blue-300 transition duration-300">
             Interactions
            </Link>
          </li>
          <li>
            <Link href="/statisticsChart" className="hover:text-blue-300 transition duration-300">
             Tableau de Bord 
            </Link>
          </li>
        </ul>
      </nav>
      <main>{children}</main>
    </>
  );
}


