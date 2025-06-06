import Link from "next/link";

import '../../auth-styles.css';

export default function PageRegister() {

    return (
        <div className="flex flex-col items-center justify-center px-6 pt-10 mx-auto text-center">
            <div className="w-full max-w-xl p-6 space-y-12 sm:p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold custom-text-color dark:text-white">
                    Conta criada com sucesso!
                </h1>
                <div className="container text-base text-justify space-y-3">
                    <p><strong>Sua conta foi criada com sucesso! Siga os próximos passos:</strong></p>
                    <p><strong>1. Confirme seu e-mail:</strong> Acesse sua caixa de entrada e clique no link de confirmação que enviamos para você.</p>
                    <p><strong>2. Acesso Inicial:</strong> Após a confirmação, você terá acesso ao sistema como <strong>visitante</strong>.</p>
                    <p><strong>3. Solicite seu perfil correto (se necessário):</strong> Se você for estudante, professor, técnico ou gestor, faça o login e solicite a alteração do seu nível de acesso dentro da plataforma.</p>
                    <p>Clique no botão abaixo para ser redirecionado à página de login.</p>

                </div>
                <div className="flex justify-center">
                    <button className="py-3 px-4 text-sm tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                        <Link href="/login" className="text-white text-sm">Ir para a tela de login</Link>
                    </button>
                </div>
            </div>
        </div>
    );
}
