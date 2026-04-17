import { useEffect, useMemo, useState } from "react";
import { getCardapio, createComanda } from "./services/api";
import { PainelCozinha } from "./components/PainelCozinha";
import "./App.css";

function App() {
  const [cardapio, setCardapio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [comanda, setComanda] = useState([]);
  const [refreshPedidos, setRefreshPedidos] = useState(0);
  const [numeroMesa, setNumeroMesa] = useState(1);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

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

  const handleFazerPedido = async () => {
    if (comanda.length === 0) {
      alert("Sua comanda está vazia!");
      return;
    }

    const itensParaEnviar = comanda.flatMap((item) =>
      Array(item.quantidade).fill(item.id)
    );

    const dadosDoPedido = {
      mesa: Number(numeroMesa),
      itens: itensParaEnviar,
      total: Number(calcularTotalComanda.toFixed(2)),
    };

    try {
      const response = await createComanda(dadosDoPedido);

      alert(`✅ Pedido #${response.data?.dados?.id} enviado para a cozinha!`);

      setComanda([]);
      setNumeroMesa((mesaAtual) => mesaAtual + 1);
      setRefreshPedidos((count) => count + 1);
      setCarrinhoAberto(false);
    } catch (err) {
      console.error("Erro ao enviar pedido:", err);
      alert("❌ Erro ao enviar pedido para a cozinha. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="App">
        <h1>🍽️ Restaurante 🍽️</h1>
        <div className="loading">Carregando o cardápio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <h1>🍽️ Restaurante 🍽️</h1>
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
        <h1>🍽️ Cardápio do Restaurante 🍽️</h1>
        <p className="subtitle">Bem-vindo! Confira nossos deliciosos pratos:</p>

        <div className="info-pedido">
          <div className="info-card">
            <span className="info-label">Mesa atual</span>
            <strong>{numeroMesa}</strong>
          </div>

          <div className="info-card">
            <span className="info-label">Itens no carrinho</span>
            <strong>{totalItensPedido}</strong>
          </div>

          <div className="info-card">
            <span className="info-label">Total parcial</span>
            <strong>R$ {calcularTotalComanda.toFixed(2)}</strong>
          </div>
        </div>

        <div className="cardapio-lista">
          {cardapio.map((item) => {
            const itemNaComanda = comanda.find((produto) => produto.id === item.id);
            const quantidadeAtual = itemNaComanda ? itemNaComanda.quantidade : 0;

            return (
              <div key={item.id} className="cardapio-item">
                {/*quantidadeAtual > 0 && (
                  <span className="badge-quantidade">{quantidadeAtual}</span>
                )*/}

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
                    ➖
                  </button>

                  <p className="quantNumber">{quantidadeAtual}</p>

                  <button
                    type="button"
                    className="plus-btn"
                    onClick={() => handleAddItemComanda(item)}
                  >
                    ➕
                  </button>
                </div>

                <button
                  type="button"
                  className="adicionar-pedido"
                  onClick={() => handleAddItemComanda(item)}
                >
                  Adicionar ao Pedido
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
          <h3>🛒 Sua Comanda</h3>
          <button
            type="button"
            className="fechar-carrinho"
            onClick={() => setCarrinhoAberto(false)}
          >
            ✕
          </button>
        </div>

        <div className="carrinho-info-lateral">
          <span>Mesa {numeroMesa}</span>
          <span>{totalItensPedido} itens</span>
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
                      ➖
                    </button>

                    <span className="controle-numero">{item.quantidade}</span>

                    <button
                      type="button"
                      className="controle-btn plus"
                      onClick={() => handleAdicionarQuantidade(item.id)}
                      title="Aumentar"
                    >
                      ➕
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
            🍽️ Fazer Pedido
          </button>
        </div>
      </aside>
    </>
  );
}

export default App;