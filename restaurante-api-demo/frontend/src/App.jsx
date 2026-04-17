import { useEffect, useMemo, useState } from "react";
import { getCardapio, createComanda, getMesas } from "./services/api";
import { PainelCozinha } from "./components/PainelCozinha";
import "./App.css";

function App() {
  const [cardapio, setCardapio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [comanda, setComanda] = useState([]);
  const [refreshPedidos, setRefreshPedidos] = useState(0);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  const [tipoPedido, setTipoPedido] = useState("local");
  const [mesas, setMesas] = useState([]);
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [enderecoEntrega, setEnderecoEntrega] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("pix");

  useEffect(() => {
    const fetchCardapio = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getCardapio();
        const dados = response?.data?.dados ?? response?.data ?? [];
        setCardapio(Array.isArray(dados) ? dados : []);
      } catch (err) {
        console.error("Erro ao buscar cardápio:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCardapio();
  }, []);

  useEffect(() => {
    const fetchMesas = async () => {
      if (tipoPedido !== "local") {
        setMesaSelecionada(null);
        return;
      }

      try {
        const response = await getMesas();
        const dados = response?.data?.dados ?? [];
        setMesas(Array.isArray(dados) ? dados : []);
      } catch (err) {
        console.error("Erro ao buscar mesas:", err);
      }
    };

    fetchMesas();
  }, [tipoPedido, refreshPedidos]);

  const handleAddItemComanda = (item) => {
    setComanda((prevComanda) => {
      const itemExistente = prevComanda.find((produto) => produto.id === item.id);

      if (itemExistente) {
        return prevComanda.map((produto) =>
          produto.id === item.id
            ? { ...produto, quantidade: produto.quantidade + 1 }
            : produto
        );
      }

      return [
        ...prevComanda,
        {
          ...item,
          preco: Number(item.preco),
          quantidade: 1,
        },
      ];
    });
  };

  const handleRemoverQuantidade = (itemId) => {
    setComanda((prevComanda) => {
      const itemExistente = prevComanda.find((produto) => produto.id === itemId);

      if (!itemExistente) {
        return prevComanda;
      }

      if (itemExistente.quantidade === 1) {
        return prevComanda.filter((produto) => produto.id !== itemId);
      }

      return prevComanda.map((produto) =>
        produto.id === itemId
          ? { ...produto, quantidade: produto.quantidade - 1 }
          : produto
      );
    });
  };

  const handleAdicionarQuantidade = (itemId) => {
    setComanda((prevComanda) =>
      prevComanda.map((produto) =>
        produto.id === itemId
          ? { ...produto, quantidade: produto.quantidade + 1 }
          : produto
      )
    );
  };

  const handleRemoverItemCarrinho = (itemId) => {
    setComanda((prevComanda) =>
      prevComanda.filter((produto) => produto.id !== itemId)
    );
  };

  const handleLimparCarrinho = () => {
    setComanda([]);
  };

  const calcularTotalComanda = useMemo(() => {
    return comanda.reduce((total, item) => {
      return total + Number(item.preco) * item.quantidade;
    }, 0);
  }, [comanda]);

  const totalItensPedido = useMemo(() => {
    return comanda.reduce((acc, item) => acc + item.quantidade, 0);
  }, [comanda]);

  const textoResumoPedido = () => {
    if (tipoPedido === "local") {
      const mesa = mesas.find((m) => m.id === Number(mesaSelecionada));
      return mesa ? `Mesa ${mesa.numero}` : "Selecione uma mesa";
    }

    if (tipoPedido === "retirada") {
      return "Retirada no balcão";
    }

    return enderecoEntrega?.trim()
      ? "Entrega com endereço"
      : "Informe o endereço";
  };

  const textoPagamento = () => {
    const mapa = {
      pix: "Pix",
      cartao: "Cartão",
      dinheiro: "Dinheiro",
    };

    return mapa[formaPagamento] || "Não informado";
  };

  const handleFazerPedido = async () => {
    if (comanda.length === 0) {
      alert("Sua comanda está vazia!");
      return;
    }

    if (tipoPedido === "local" && !mesaSelecionada) {
      alert("Selecione uma mesa.");
      return;
    }

    if (tipoPedido === "entrega" && !enderecoEntrega.trim()) {
      alert("Informe o endereço para entrega.");
      return;
    }

    if (!formaPagamento) {
      alert("Selecione uma forma de pagamento.");
      return;
    }

    const itensParaEnviar = comanda.flatMap((item) =>
      Array(item.quantidade).fill(item.id)
    );

    const dadosDoPedido = {
      tipo_pedido: tipoPedido,
      mesa_id: tipoPedido === "local" ? Number(mesaSelecionada) : null,
      endereco: tipoPedido === "entrega" ? enderecoEntrega.trim() : null,
      forma_pagamento: formaPagamento,
      itens: itensParaEnviar,
      total: Number(calcularTotalComanda.toFixed(2)),
    };

    try {
      const response = await createComanda(dadosDoPedido);

      alert(`✅ Pedido #${response.data?.dados?.id} enviado com sucesso!`);

      setComanda([]);
      setMesaSelecionada(null);
      setEnderecoEntrega("");
      setFormaPagamento("pix");
      setRefreshPedidos((count) => count + 1);
      setCarrinhoAberto(false);
    } catch (err) {
      console.error("Erro ao enviar pedido:", err);
      alert(
        err?.response?.data?.mensagem ||
          "❌ Erro ao enviar pedido. Tente novamente."
      );
    }
  };

  if (loading) {
    return (
      <div className="App">
        <h1>🍽️ Restaurante Sabor da Casa</h1>
        <div className="loading">Carregando o cardápio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <h1>🍽️ Restaurante Sabor da Casa</h1>
        <div className="error">
          <p>❌ Erro: o back-end não respondeu.</p>
          <p>Verifique se o servidor está rodando em http://localhost:4000</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="App">
        <div className="hero-topo">
          <span className="hero-badge">Atendimento rápido • Pedido digital</span>
          <h1>🍽️ Cardápio do Restaurante</h1>
          <p className="subtitle">
            Escolha seus pratos, defina o tipo do pedido e finalize em poucos passos.
          </p>
        </div>

        <div className="info-pedido">
          <div className="info-card">
            <span className="info-label">Tipo do pedido</span>
            <strong>
              {tipoPedido === "local"
                ? "Local"
                : tipoPedido === "retirada"
                ? "Retirada"
                : "Entrega"}
            </strong>
          </div>

          <div className="info-card">
            <span className="info-label">Seleção atual</span>
            <strong>{textoResumoPedido()}</strong>
          </div>

          <div className="info-card">
            <span className="info-label">Pagamento</span>
            <strong>{textoPagamento()}</strong>
          </div>

          <div className="info-card destaque-total">
            <span className="info-label">Total parcial</span>
            <strong>R$ {calcularTotalComanda.toFixed(2)}</strong>
          </div>
        </div>

        <div className="secao-titulo">
          <h2>Nosso cardápio</h2>
          <p>Monte seu pedido do seu jeito.</p>
        </div>

        <div className="cardapio-lista">
          {cardapio.map((item) => {
            const itemNaComanda = comanda.find((produto) => produto.id === item.id);
            const quantidadeAtual = itemNaComanda ? itemNaComanda.quantidade : 0;

            return (
              <div key={item.id} className="cardapio-item">
                {quantidadeAtual > 0 && (
                  <div className="badge-quantidade">{quantidadeAtual}</div>
                )}

                <h2>{item.nome}</h2>
                <p className="descricao">{item.descricao}</p>
                <p className="preco">R$ {Number(item.preco).toFixed(2)}</p>

                <div className="divAddQuantPedidos">
                  <button
                    type="button"
                    className="minus-btn"
                    onClick={() => handleRemoverQuantidade(item.id)}
                    disabled={quantidadeAtual === 0}
                  >
                    −
                  </button>

                  <p className="quantNumber">{quantidadeAtual}</p>

                  <button
                    type="button"
                    className="plus-btn"
                    onClick={() => handleAddItemComanda(item)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="adicionar-pedido"
                  onClick={() => handleAddItemComanda(item)}
                >
                  Adicionar ao pedido
                </button>
              </div>
            );
          })}
        </div>

        <PainelCozinha refreshTrigger={refreshPedidos} />
      </div>

      {comanda.length > 0 && (
        <button
          type="button"
          className="carrinho-flutuante"
          onClick={() => setCarrinhoAberto(true)}
        >
          🛒 {totalItensPedido} itens • R$ {calcularTotalComanda.toFixed(2)}
        </button>
      )}

      <div
        className={`overlay-carrinho ${carrinhoAberto ? "aberto" : ""}`}
        onClick={() => setCarrinhoAberto(false)}
      />

      <aside className={`carrinho-lateral ${carrinhoAberto ? "aberto" : ""}`}>
        <div className="carrinho-lateral-topo">
          <div>
            <span className="mini-etiqueta">Finalização do pedido</span>
            <h3>🛒 Sua Comanda</h3>
          </div>

          <button
            type="button"
            className="fechar-carrinho"
            onClick={() => setCarrinhoAberto(false)}
          >
            ×
          </button>
        </div>

        <div className="bloco-etapas">
          <div className="etapa-card">
            <span className="etapa-numero">1</span>
            <div className="etapa-conteudo">
              <h4>Onde vai consumir?</h4>
              <div className="tipo-pedido-lateral">
                <button
                  type="button"
                  className={`tipo-pedido-btn ${tipoPedido === "local" ? "ativo" : ""}`}
                  onClick={() => setTipoPedido("local")}
                >
                  🍽️ Local
                </button>

                <button
                  type="button"
                  className={`tipo-pedido-btn ${tipoPedido === "retirada" ? "ativo" : ""}`}
                  onClick={() => setTipoPedido("retirada")}
                >
                  🛍️ Retirada
                </button>

                <button
                  type="button"
                  className={`tipo-pedido-btn ${tipoPedido === "entrega" ? "ativo" : ""}`}
                  onClick={() => setTipoPedido("entrega")}
                >
                  🚚 Entrega
                </button>
              </div>
            </div>
          </div>

          <div className="etapa-card">
            <span className="etapa-numero">2</span>
            <div className="etapa-conteudo">
              <h4>
                {tipoPedido === "local"
                  ? "Escolha a mesa"
                  : tipoPedido === "entrega"
                  ? "Informe o endereço"
                  : "Modo de retirada"}
              </h4>

              {tipoPedido === "local" && (
                <div className="mesas-box lateral-box">
                  <div className="mesas-grid">
                    {mesas.length === 0 ? (
                      <p className="sem-mesas">Nenhuma mesa disponível.</p>
                    ) : (
                      mesas.map((mesa) => (
                        <button
                          key={mesa.id}
                          type="button"
                          className={`mesa-btn ${
                            Number(mesaSelecionada) === mesa.id ? "ativa" : ""
                          }`}
                          onClick={() => setMesaSelecionada(mesa.id)}
                        >
                          Mesa {mesa.numero}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {tipoPedido === "entrega" && (
                <div className="endereco-box lateral-box">
                  <input
                    type="text"
                    className="input-endereco"
                    placeholder="Rua, número, bairro..."
                    value={enderecoEntrega}
                    onChange={(e) => setEnderecoEntrega(e.target.value)}
                  />
                </div>
              )}

              {tipoPedido === "retirada" && (
                <div className="retirada-box">
                  Seu pedido ficará disponível no balcão para retirada.
                </div>
              )}
            </div>
          </div>

          <div className="etapa-card">
            <span className="etapa-numero">3</span>
            <div className="etapa-conteudo">
              <h4>Forma de pagamento</h4>

              <div className="pagamento-grid">
                <button
                  type="button"
                  className={`pagamento-btn ${formaPagamento === "pix" ? "ativo" : ""}`}
                  onClick={() => setFormaPagamento("pix")}
                >
                  <span className="pagamento-icone">📱</span>
                  <span>Pix</span>
                </button>

                <button
                  type="button"
                  className={`pagamento-btn ${formaPagamento === "cartao" ? "ativo" : ""}`}
                  onClick={() => setFormaPagamento("cartao")}
                >
                  <span className="pagamento-icone">💳</span>
                  <span>Cartão</span>
                </button>

                <button
                  type="button"
                  className={`pagamento-btn ${formaPagamento === "dinheiro" ? "ativo" : ""}`}
                  onClick={() => setFormaPagamento("dinheiro")}
                >
                  <span className="pagamento-icone">💵</span>
                  <span>Dinheiro</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="carrinho-info-lateral">
          <span>{textoResumoPedido()}</span>
          <span>{textoPagamento()}</span>
        </div>

        <div className="comanda-lista lateral">
          {comanda.length === 0 ? (
            <p className="comanda-vazia">
              Seu carrinho está vazio. Adicione itens do cardápio!
            </p>
          ) : (
            comanda.map((item) => (
              <div key={item.id} className="comanda-item">
                <div className="comanda-item-esquerda">
                  <span className="comanda-item-nome">{item.nome}</span>
                </div>

                <div className="comanda-item-direita">
                  <div className="controle-quantidade">
                    <button
                      type="button"
                      className="controle-btn minus"
                      onClick={() => handleRemoverQuantidade(item.id)}
                      title="Diminuir"
                    >
                      −
                    </button>

                    <span className="controle-numero">{item.quantidade}</span>

                    <button
                      type="button"
                      className="controle-btn plus"
                      onClick={() => handleAdicionarQuantidade(item.id)}
                      title="Aumentar"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      className="controle-btn excluir-btn"
                      onClick={() => handleRemoverItemCarrinho(item.id)}
                      title="Remover item"
                    >
                      🗑️
                    </button>
                  </div>

                  <span className="comanda-item-preco">
                    R$ {(Number(item.preco) * item.quantidade).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rodape-carrinho-lateral">
          {comanda.length > 0 && (
            <button
              type="button"
              className="btn-limpar-carrinho"
              onClick={handleLimparCarrinho}
            >
              Limpar
            </button>
          )}

          <div className="comanda-total lateral-total">
            <strong>Total: R$ {calcularTotalComanda.toFixed(2)}</strong>
          </div>

          <button
            type="button"
            className="btn-fazer-pedido"
            onClick={handleFazerPedido}
            disabled={comanda.length === 0}
          >
            ✅ Finalizar pedido
          </button>
        </div>
      </aside>
    </>
  );
}

export default App;