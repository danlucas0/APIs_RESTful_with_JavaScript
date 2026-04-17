import { useState } from "react";
import "./Login.css";

export function Login({ onLoginSuccess }) {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const API_URL = "http://localhost:4000/api";

  const limparCampos = () => {
    setNome("");
    setEmail("");
    setSenha("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    if (modoCadastro && !nome.trim()) {
      setMensagem("Informe seu nome.");
      return;
    }

    if (!email.trim() || !senha.trim()) {
      setMensagem("Preencha email e senha.");
      return;
    }

    try {
      setLoading(true);

      const endpoint = modoCadastro ? "/auth/register" : "/auth/login";

      const body = modoCadastro
        ? { nome: nome.trim(), email: email.trim(), senha }
        : { email: email.trim(), senha };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data?.erro || data?.mensagem || "Erro na requisição.");
        return;
      }

      if (modoCadastro) {
        setMensagem("Cadastro realizado com sucesso! Agora faça login.");
        setModoCadastro(false);
        setSenha("");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.usuario));

      setMensagem("Login realizado com sucesso!");
      limparCampos();

      if (onLoginSuccess) {
        onLoginSuccess(data.usuario);
      }
    } catch (error) {
      setMensagem("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-topo">
          <span className="login-badge">
            {modoCadastro ? "Criar conta" : "Acesse sua conta"}
          </span>

          <h2>{modoCadastro ? "Cadastro" : "Login"}</h2>

          <p>
            {modoCadastro
              ? "Crie sua conta para fazer pedidos e acompanhar o status."
              : "Entre para fazer pedidos e acompanhar sua comanda em tempo real."}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {modoCadastro && (
            <div className="login-field">
              <label>Nome</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
          )}

          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="seuemail@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {mensagem && (
            <div className="login-mensagem">
              {mensagem}
            </div>
          )}

          <button type="submit" className="login-btn-principal" disabled={loading}>
            {loading
              ? "Carregando..."
              : modoCadastro
              ? "Criar conta"
              : "Entrar"}
          </button>
        </form>

        <div className="login-divisor">
          <span>ou</span>
        </div>

        <button
          type="button"
          className="login-btn-secundario"
          onClick={() => {
            setModoCadastro(!modoCadastro);
            setMensagem("");
            limparCampos();
          }}
        >
          {modoCadastro
            ? "Já tenho conta"
            : "Não tenho conta, quero cadastrar"}
        </button>
      </div>
    </div>
  );
}