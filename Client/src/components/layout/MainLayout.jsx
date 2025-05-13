import { Navbar } from "./Navbar";

export function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-100 py-5">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;