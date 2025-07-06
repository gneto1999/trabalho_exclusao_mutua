# Sistema de Exclusão Mútua com UDP

Este projeto implementa um sistema distribuído para gerenciar **exclusão mútua** entre processos usando comunicação UDP. Ele é dividido em dois módulos principais:

- **Coordenador**: responsável por gerenciar pedidos de acesso à região crítica.
- **Processos**: múltiplas instâncias simulando processos que solicitam acesso ao coordenador.

---

## Estrutura do Projeto

```
TRABALHO_EXCLUSAO_MUTUA/
├── coordenador/
│   ├── main.ts
│   ├── coordenador.ts
│   ├── terminal.ts
│   └── tipos.ts
├── processo/
│   ├── main.ts
│   ├── processo.ts
│   
└── utils.ts   
```

---

## Requisitos

- Node.js >= 18
- npm >= 9
- TypeScript e ts-node instalados globalmente (opcional para dev)
  ```
  npm install -g typescript ts-node
  ```

---

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/gneto1999/trabalho_exclusao_mutua.git
   cd trabalho_exclusao_mutua
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

---

## Como Executar

### 1. Iniciar o Coordenador

Abra um terminal e execute:

```bash
node dist/coordenador/main.js
```

O coordenador ficará escutando na porta **8080** e mostrará um menu interativo com comandos:

```
Comandos disponíveis:
1 - Mostrar fila de pedidos
2 - Mostrar atendimentos por processo
3 - Encerrar execução
```

---

### 2. Iniciar os Processos

Em outro terminal, execute:

```bash
node dist/processo/main.js <NumProcessos> <Repeticoes>
```

- `<NumProcessos>`: número de processos concorrentes.
- `<Repeticoes>`: quantas vezes cada processo solicita a região crítica.

**Exemplo:**

```bash
node dist/processo/main.js 3 5
```

Executa 3 processos, cada um acessando a região crítica 5 vezes.

---

## Saídas

### Logs do Coordenador

- Gerados em `log.txt`
- Exemplo:
  ```
  2025-07-05T19:12:30.123Z -- REQUEST -- Processo 1
  2025-07-05T19:12:32.456Z -- GRANT   -- Processo 1
  2025-07-05T19:12:35.789Z -- RELEASE -- Processo 1
  ```

### Resultados dos Processos

- Gerados em `resultado.txt`
- Exemplo:
  ```
  2025-07-05T19:12:33.000Z -- Processo 1
  2025-07-05T19:12:36.500Z -- Processo 2
  ```

---

## Observando a Execução

- **No terminal do coordenador:**

  - Digite `1` para ver a fila atual de pedidos.
  - Digite `2` para ver quantas vezes cada processo foi atendido.
  - Digite `3` para encerrar o coordenador.

- **Nos arquivos gerados:**
  - `log.txt`: histórico completo das ações do coordenador.
  - `resultado.txt`: registro das entradas dos processos na região crítica.

---

## Atenção

- O coordenador precisa estar rodando antes de iniciar os processos.
- Processos simulam atrasos aleatórios entre 1 a 4 segundos para representar uso da região crítica.
