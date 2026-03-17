import { BrowserRouter } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { AuthProvider } from "alex-evo-sh-auth";
import { authConfig } from "./config/config";

export default function App() {
  return (
    <AuthProvider authConfig={authConfig}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
