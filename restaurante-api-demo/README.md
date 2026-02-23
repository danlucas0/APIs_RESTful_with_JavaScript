# 🍽️ API RESTful Didática - Restaurante (Full-Stack)

Projeto didático completo que simula operações de um restaurante através de uma API RESTful, demonstrando a conexão entre Back-end e Front-end.

## 📁 Estrutura do Projeto

```
/restaurante-api-demo
  /backend          ← API RESTful com Node.js + Express (Porta 4000)
  /frontend         ← Interface React + Vite (Porta 5173)
```

## 🎯 Objetivos Didáticos

Este projeto demonstra:
- ✅ Criação de API RESTful com Node.js e Express
- ✅ Testes automatizados com Jest e Supertest (TDD)
- ✅ Front-end React consumindo a API
- ✅ Comunicação HTTP (GET, POST)
- ✅ Estados de Loading e Error Handling
- ✅ Padrão de projeto (Services, Controllers, Routes)

## 🚀 Como Rodar o Projeto Completo

### Pré-requisitos
- Node.js instalado (versão 16+)

### 1️⃣ Iniciar o Back-end (Terminal 1)

```bash
cd backend
npm install
npm run dev
```

O servidor estará rodando em: `http://localhost:4000`

### 2️⃣ Iniciar o Front-end (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

O front-end estará disponível em: `http://localhost:5173`

### 3️⃣ Acessar a Aplicação

Abra o navegador em `http://localhost:5173` e você verá o cardápio sendo exibido!

## 📡 Endpoints da API (Back-end)

| Método | Endpoint | Descrição |
|--------|----------|--------|
| GET | `/api/cardapio` | Retorna todo o cardápio |
| GET | `/api/cardapio/:id` | Retorna um item específico |
| GET | `/api/comandas` | Lista todas as comandas |
| POST | `/api/comandas` | Cria uma nova comanda |
| PATCH | `/api/comandas/:id` | Atualiza o status de uma comanda |
| DELETE | `/api/comandas/:id` | Deleta uma comanda |

## 🧪 Testando a API

O back-end possui testes automatizados com Jest:

```bash
cd backend
npm test
```

**Resultado esperado:** 13 testes passando ✅

## 🛠️ Tecnologias

### Back-end
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **CORS** - Habilita comunicação entre portas diferentes
- **Jest** - Framework de testes
- **Supertest** - Testes de API HTTP

### Front-end
- **React** - Biblioteca UI
- **Vite** - Build tool moderna
- **Axios** - Cliente HTTP
- **CSS3** - Estilização moderna

### 🎉 Projeto Completo!
- CRUD full-stack implementado
- Testes automatizados (13 no back-end)
- Interface completa e funcional
- Pronto para demonstração e extensões futuras

## 🔗 Fluxo de Comunicação

```
┌─────────────┐                    ┌─────────────┐
│  Front-end  │    HTTP Request    │  Back-end   │
│  (React)    │ ──────────────────>│  (Express)  │
│  :5173      │                    │  :4000      │
│             │<────────────────── │             │
└─────────────┘    JSON Response   └─────────────┘
```

1. **Front-end** faz requisição GET para `http://localhost:4000/api/cardapio`
2. **Back-end** recebe, processa e retorna JSON
3. **Front-end** atualiza a interface com os dados

## 🎓 Conceitos Aprendidos

- **API RESTful**: Princípios REST, verbos HTTP, status codes
- **Async/Await**: Programação assíncrona em JavaScript
- **React Hooks**: useState, useEffect
- **TDD**: Test-Driven Development (Red → Green → Refactor)
- **Separation of Concerns**: Organização em camadas
- **CORS**: Cross-Origin Resource Sharing
- **Error Handling**: Tratamento de erros no front e back

## 🐛 Troubleshooting

### Front-end não conecta ao back-end

1. Verifique se o back-end está rodando em `http://localhost:4000`
2. Abra o console do navegador (F12) para ver erros
3. Confirme que o CORS está habilitado no back-end

### Testes falhando

1. Certifique-se de estar na pasta `backend`
2. Execute `npm install` novamente
3. Verifique se não há outro processo usando a porta 4000

## 📖 Documentação Detalhada

- [Back-end README](./backend/README.md)
- [Front-end README](./frontend/README.md)


