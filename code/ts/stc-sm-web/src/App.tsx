import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from "./components/Layout";
import Login from "./components/Login";

// Se quiseres criar um ficheiro Dashboard.tsx à parte, importas aqui.
// Para já, podemos pôr o código direto na rota para veres como funciona!

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rota inicial atira o utilizador para o Login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* O Login fica SOZINHO, sem a barra lateral */}
                <Route path="/login" element={<Login />} />

                {/* O Dashboard fica DENTRO do teu Layout! */}
                <Route path="/dashboard" element={
                    <Layout>
                        <div className="p-8">
                            <h1 className="text-3xl font-bold text-white">Dashboard — visão geral</h1>
                            <p className="text-zinc-400 mt-2">Bem-vindo ao sistema STC-SM.</p>
                            {/* Os teus cards vão entrar aqui depois! */}
                        </div>
                    </Layout>
                } />
            </Routes>
        </BrowserRouter>
    );
}