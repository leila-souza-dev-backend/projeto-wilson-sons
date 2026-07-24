# Análise de Materiais - Wilson Sons

<div align="center">
  <img src="navebar.jpg" alt="Logo Wilson Sons" width="120" style="border-radius: 4px; background: white; padding: 4px;" />
  <p><strong>Ferramenta Web para Extração de Listas de Materiais em Projetos Navais e Industriais</strong></p>
</div>

---

## 📋 Sobre o Projeto

Aplicação web corporativa desenvolvida para otimizar a extração e estruturação de dados de **Listas de Materiais** a partir de documentos PDF técnicos. O sistema conta com uma interface moderna integrada a fluxos de automação para processar e estruturar informações críticas de engenharia e logística.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias e ferramentas modernas:

* **TanStack Start** — Framework full-stack baseado em React para construção da aplicação.
* **TypeScript** — Superset do JavaScript que adiciona tipagem estática ao código, garantindo maior robustez e segurança.
* **React** — Biblioteca JavaScript para construção da interface de usuário baseada em componentes.
* **Tailwind CSS** — Framework CSS utilitário para estilização rápida e responsiva.

---

---

## ⚙️ Funcionalidades

* **Interface Responsiva & Corporativa:** Design limpo alinhado à identidade visual da Wilson Sons.
* **Upload por Arrastar e Soltar (Drag & Drop):** Envio simplificado de arquivos PDF diretamente pelo navegador.
* **Processamento Automatizado:** Envio dos documentos via Webhook para motores de IA e automação.
* **Retorno Estruturado em JSON:** Visualização e facilidade de cópia dos dados extraídos prontos para integração.

---

## 📊 Estrutura de Dados de Retorno (JSON)

O sistema processa o documento com base nas diretrizes de um especialista em desenhos técnicos industriais e navais, estruturando o JSON de saída com as seguintes colunas obrigatórias:

* `ProjectID` — Identificador do Projeto
* `FunctionCode` — Código da Função / Sistema
* `FunctionDescription` — Descrição da Função
* `PartID` — Identificador da Peça
* `Código Sap` — Código SAP do Material
* `PartDescription` — Descrição da Peça
* `QtyDemand` — Quantidade Demandada

---

## 🚀 Como Usar

1. Clone este repositório.
2. Instale as dependências e configure o ambiente de desenvolvimento.
3. Insira a URL do seu Webhook  Make - Integromat (https://hook.us2.make.com/fq7ki30wrioaxs579l67ifhqr2c2dd5q) no código correspondente.
4. Execute o projeto para iniciar a aplicação localmente.
