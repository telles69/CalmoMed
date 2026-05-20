import { Provider } from "@/components/ui/provider";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata = {
  title: "CalmoMed - Sistema de Saúde",
  description: "Plataforma de gerenciamento de postos de saúde",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Provider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
