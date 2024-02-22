import Link from 'next/link';
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <>
      <nav className="bg-gray-800 text-white p-4">
        <ul className="flex space-x-4 justify-center">
          <li>
            <Link href="/" className="hover:text-blue-300 transition duration-300">
              Accueil
            </Link>
          </li>
          <li>
            <Link href="/addProspect" className="hover:text-blue-300 transition duration-300">
              Gérer les Prospects
            </Link>
          </li>
          <li>
            <Link href="/addClient" className="hover:text-blue-300 transition duration-300">
              Gérer les Clients
            </Link>
          </li>
          {/* Ajoutez d'autres liens de navigation selon les besoins */}
        </ul>
      </nav>
      <main>{children}</main>
    </>
  );
}


// import Link from 'next/link';
// import "./globals.css";

// export default function RootLayout({ children }: { children: React.ReactNode; }) {
//   return (
//     <>
//       <nav className="bg-gray-800 text-white p-4">
//         <div className="max-w-6xl mx-auto flex justify-center space-x-4">
//           <Link href="/">
//             <a className="hover:text-blue-400 transition duration-300">Accueil</a>
//           </Link>
//           <Link href="/addProspect">
//             <a className="hover:text-blue-400 transition duration-300">Gérer les Prospects</a>
//           </Link>
//           <Link href="/addClient">
//             <a className="hover:text-blue-400 transition duration-300">Gérer les Clients</a>
//           </Link>
//         </div>
//       </nav>
//       <main className="flex flex-col items-center justify-center min-h-screen py-2">
//         {children}
//       </main>
//     </>
//   );
// }

