import { Routes, Route, Link } from "react-router-dom";
import { ExampleView } from "./modules/example/components/ExampleView";

export function App() {
  return (
    <div className="min-h-screen p-8">
      <nav className="mb-8 flex gap-4 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <Link to="/examples" className="hover:text-foreground transition-colors">
          Examples
        </Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={<h1 className="text-2xl font-bold">Welcome to AI Boilerplate</h1>}
        />
        <Route path="/examples" element={<ExampleView />} />
      </Routes>
    </div>
  );
}
