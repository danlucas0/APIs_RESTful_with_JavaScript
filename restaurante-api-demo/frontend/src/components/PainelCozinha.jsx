import { useEffect, useState } from "react";
import {
  deleteComanda,
  getCardapioItem,
  getComandas,
  updateComandaStatus,
} from "../services/api";

function normalizarItens(itens) {
  let lista = [];

  if (Array.isArray(itens)) {
    lista = itens;
  } else if (typeof itens === "string") {
    try {
      const parseado = JSON.parse(itens);
      if (Array.isArray(parseado)) lista = parseado;
    } catch {
      lista = [];
    }
  }

  return lista
    .map((item) => {
      if (typeof item === "object" && item !== null) return Number(item.id);
      return Number(item);
    })
    .filter((id) => Number.isFinite(id) && id > 0);
}

export function PainelCozinha({ refreshTrigger }) {
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComandas = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getComandas();
        const listaPedidos = response?.data?.dados ?? [];

        const comandasComDetalhes = await Promise.all(
          listaPedidos.map(async (comanda) => {
            const itensIds = normalizarItens(comanda.itens);

            const contagem = itensIds.reduce((acc, id) => {
              acc[id] = (acc[id] || 0) + 1;
              return acc;
            }, {});

            const idsUnicos = Object.keys(contagem)
              .map((id) => Number(id))
              .filter((id) => Number.isFinite(id) && id > 0);

            const itensDetalhados = await Promise.all(
              idsUnicos.map(async (id) => {
                try {
                  const itemResponse = await getCardapioItem(id);
                  const item = itemResponse?.data?.dados;

                  return {
                    id,
                    nome: item?.nome || `Item ${id}`,
                    quantidade: contagem[id] || 0,
                  };
                } catch {
                  return {
                    id,
                    nome: `Item ${id}`,
                    quantidade: contagem[id] || 0,
                  };
                }
              })
            );

            return {
              ...comanda,
              itensDetalhados,
            };
          })
        );

        setComandas(comandasComDetalhes);
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComandas();
  }, [refreshTrigger]);

  const handleMudarStatus = async (id, novoStatus) => {
    try {
      const response = await updateComandaStatus(id, novoStatus);
      const comandaAtualizada = response?.data?.dados;

      setComandas((comandasAnteriores) =>
        comandasAnteriores.map((comanda) =>
          comanda.id === id
            ? {
                ...comanda,
                ...comandaAtualizada,
                itensDetalhados: comanda.itensDetalhados,
              }
            : comanda
        )
      );
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Falha ao atualizar o status do pedido.");
    }
  };

  const handleCancelarPedido = async (id) => {
    const confirmacao = window.confirm(
      "Tem certeza que deseja cancelar este pedido?"
    );

    if (!confirmacao) return;

    try {
      await deleteComanda(id);

      setComandas((comandasAnteriores) =>
        comandasAnteriores.filter((c) => c.id !== id)
      );
    } catch (err) {
      console.error("Erro ao cancelar pedido:", err);
      alert("Falha ao cancelar o pedido.");
    }
  };

  const formatarStatus = (status) => {
    const mapa = {
      pendente: "Pendente",
      em_preparo: "Em preparo",
      pronto: "Pronto",
      entregue: "Entregue",
      cancelado: "Cancelado",
    };

    return mapa[status] || status;
  };

  const formatarTipoPedido = (tipo) => {
    const mapa = {
      local: "Consumir no local",
      retirada: "Retirada",
      entrega: "Entrega",
    };

    return mapa[tipo] || tipo;
  };

  const formatarPagamento = (forma) => {
    const mapa = {
      pix: "Pix",
      cartao: "Cartão",
      dinheiro: "Dinheiro",
    };

    return mapa[forma] || forma;
  };

  if (loading && comandas.length === 0) {
    return (
      <div className="cozinha-secao">
        <h2>👨‍🍳 Painel da Cozinha</h2>
        <div className="loading-cozinha">Carregando pedidos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cozinha-secao">
        <h2>👨‍🍳 Painel da Cozinha</h2>
        <div className="error-cozinha">
          ❌ Erro ao buscar pedidos. Verifique se o back-end está rodando.
        </div>
      </div>
    );
  }

  return (
    <div className="cozinha-secao">
      <h3>👨‍🍳 Painel da Cozinha</h3>

      <p className="cozinha-info">
        {comandas.length === 0
          ? "Nenhum pedido feito ainda. Faça seu primeiro pedido!"
          : `Total de pedidos: ${comandas.length}`}
      </p>

      {comandas.length > 0 && (
        <div className="cozinha-lista">
          {comandas.map((comanda) => (
            <div key={comanda.id} className="cozinha-pedido">
              <h3>Pedido #{comanda.id}</h3>

              <p className="cozinha-tipo">
                <strong>Tipo:</strong> {formatarTipoPedido(comanda.tipo_pedido)}
              </p>

              {comanda.tipo_pedido === "local" && comanda.mesa && (
                <p className="cozinha-mesa">🪑 Mesa: {comanda.mesa}</p>
              )}

              {comanda.tipo_pedido === "entrega" && comanda.endereco && (
                <p className="cozinha-endereco">
                  <strong>📍 Endereço:</strong> {comanda.endereco}
                </p>
              )}

              {comanda.forma_pagamento && (
                <p className="cozinha-pagamento">
                  <strong>💳 Pagamento:</strong>{" "}
                  {formatarPagamento(comanda.forma_pagamento)}
                </p>
              )}

              <p className="cozinha-status">
                Status:{" "}
                <span className={`status status-${comanda.status}`}>
                  {formatarStatus(comanda.status)}
                </span>
              </p>

              <div className="cozinha-itens">
                <strong>📋 Itens:</strong>
                {comanda.itensDetalhados?.length > 0 ? (
                  <ul>
                    {comanda.itensDetalhados.map((item) => (
                      <li key={item.id}>
                        {item.nome} x{item.quantidade}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Nenhum item encontrado.</p>
                )}
              </div>

              <p className="cozinha-total">
                <strong>💰 Total: R$ {Number(comanda.total).toFixed(2)}</strong>
              </p>

              <p className="cozinha-data">
                <small>
                  🕐 Recebido:{" "}
                  {comanda.criado_em
                    ? new Date(comanda.criado_em).toLocaleString("pt-BR")
                    : "Data indisponível"}
                </small>
              </p>

              <div className="botoes-acao">
                {comanda.status === "pendente" && (
                  <button
                    className="btn-em-preparo"
                    onClick={() => handleMudarStatus(comanda.id, "em_preparo")}
                  >
                    Marcar em preparo
                  </button>
                )}

                {comanda.status === "em_preparo" && (
                  <button
                    className="btn-concluido"
                    onClick={() => handleMudarStatus(comanda.id, "pronto")}
                  >
                    Marcar pronto
                  </button>
                )}

                {comanda.status === "pronto" && (
                  <button
                    className="btn-concluido"
                    onClick={() => handleMudarStatus(comanda.id, "entregue")}
                  >
                    Marcar entregue
                  </button>
                )}

                {comanda.status !== "entregue" &&
                  comanda.status !== "cancelado" && (
                    <button
                      className="btn-cancelar"
                      onClick={() => handleCancelarPedido(comanda.id)}
                    >
                      🗑️ Cancelar Pedido
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}