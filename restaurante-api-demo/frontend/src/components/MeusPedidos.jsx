import { useEffect, useState } from "react";
import { getMinhasComandas, getCardapioItem } from "../services/api";
import "./MeusPedidos.css";

function agruparItens(itens) {
  const contagem = {};

  for (const id of itens) {
    contagem[id] = (contagem[id] || 0) + 1;
  }

  return contagem;
}

export function MeusPedidos({ refreshTrigger }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        setErro("");

        const response = await getMinhasComandas();
        const dados = response?.data?.dados ?? [];

        const pedidosComDetalhes = await Promise.all(
          dados.map(async (pedido) => {
            const itensIds = Array.isArray(pedido.itens) ? pedido.itens : [];
            const contagem = agruparItens(itensIds);

            const itensDetalhados = await Promise.all(
              Object.entries(contagem).map(async ([id, quantidade]) => {
                try {
                  const responseItem = await getCardapioItem(id);
                  const item = responseItem?.data?.dados;

                  return {
                    id: Number(id),
                    nome: item?.nome || `Item ${id}`,
                    quantidade,
                  };
                } catch {
                  return {
                    id: Number(id),
                    nome: `Item ${id}`,
                    quantidade,
                  };
                }
              })
            );

            return {
              ...pedido,
              itensDetalhados,
            };
          })
        );

        setPedidos(Array.isArray(pedidosComDetalhes) ? pedidosComDetalhes : []);
      } catch (error) {
        console.error("Erro ao buscar meus pedidos:", error);
        setErro("Não foi possível carregar seus pedidos.");
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [refreshTrigger]);

  const formatarStatus = (status) => {
    const mapa = {
      pendente: "Pendente",
      em_preparo: "Em preparo",
      pronto: "Pronto",
      saiu_entrega: "Saiu para entrega",
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

  const classeStatus = (status) => {
    return `meu-pedido-status status-${status}`;
  };

  return (
    <section className="meus-pedidos-secao">
      <div className="meus-pedidos-topo">
        <span className="meus-pedidos-badge">Acompanhe em tempo real</span>
        <h2>📦 Meus pedidos</h2>
        <p>Veja o andamento dos pedidos feitos na sua conta.</p>
      </div>

      {loading && (
        <div className="meus-pedidos-loading">
          Carregando seus pedidos...
        </div>
      )}

      {!loading && erro && (
        <div className="meus-pedidos-erro">
          {erro}
        </div>
      )}

      {!loading && !erro && pedidos.length === 0 && (
        <div className="meus-pedidos-vazio">
          Você ainda não fez nenhum pedido.
        </div>
      )}

      {!loading && !erro && pedidos.length > 0 && (
        <div className="meus-pedidos-lista">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="meu-pedido-card">
              <div className="meu-pedido-cabecalho">
                <div className="meu-pedido-cabecalho-esquerda">
                  <h3>Pedido #{pedido.id}</h3>
                  <p>{formatarTipoPedido(pedido.tipo_pedido)}</p>
                </div>

                <span className={classeStatus(pedido.status)}>
                  {formatarStatus(pedido.status)}
                </span>
              </div>

              <div className="meu-pedido-meta">
                {pedido.tipo_pedido === "local" && pedido.mesa && (
                  <span>Mesa {pedido.mesa}</span>
                )}

                <span className="meu-pedido-total">
                  R$ {Number(pedido.total).toFixed(2)}
                </span>
              </div>

              <div className="meu-pedido-info">
                <p>
                  <strong>Pagamento:</strong> {formatarPagamento(pedido.forma_pagamento)}
                </p>

                <p>
                  <strong>Recebido:</strong>{" "}
                  {pedido.criado_em
                    ? new Date(pedido.criado_em).toLocaleString("pt-BR")
                    : "Data indisponível"}
                </p>

                {pedido.tipo_pedido === "entrega" && pedido.endereco && (
                  <p>
                    <strong>Endereço:</strong> {pedido.endereco}
                  </p>
                )}
              </div>

              <div className="meu-pedido-itens">
                <strong className="titulo-itens">Itens do pedido</strong>

                {Array.isArray(pedido.itensDetalhados) &&
                pedido.itensDetalhados.length > 0 ? (
                  <div className="meu-pedido-itens-lista">
                    {pedido.itensDetalhados.map((item) => (
                      <div key={`${pedido.id}-${item.id}`} className="meu-item">
                        <span className="meu-item-nome">{item.nome}</span>
                        <span className="meu-item-qtd">x{item.quantidade}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="meu-pedido-sem-itens">Nenhum item encontrado.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}