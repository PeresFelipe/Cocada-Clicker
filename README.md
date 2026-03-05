# Cocada Clicker

Fiz esse projeto como um idle/clicker de cocada com vibe retrô 8-bit, mas sem abrir mao da clareza de jogo.
A ideia e simples: comecar no clique manual e ir escalando para uma operacao automatizada com construcoes, upgrades e eventos.

## O que e o jogo

- Genero: idle/clicker incremental no navegador.
- Tema: cocada, praia brasileira e progressao constante.
- Objetivo: acumular cocadas e otimizar crescimento de producao.
- Fantasia: sair da producao artesanal e chegar numa maquina de cocada bem eficiente.

## O que ja tem hoje

- Loop principal de clique -> compra -> automacao -> upgrade.
- Construcoes com CPS e custo progressivo.
- Upgrades no formato de livro de receitas.
- Escolha de sabor que influencia progressao.
- Save manual em `localStorage`.
- Sistema de conquistas (painel + toast de desbloqueio).
- Sistema de lootbox com modal e recompensa por raridade.

## Visual atual

Estou mantendo uma linha pixel-art funcional:

- Fonte principal: `PublicPixel`.
- UI com icones utilitarios (pack `Icons_Essential`) nos botoes principais.
- Icones de conquistas integrados no painel e no toast.
- Curadoria manual de icones de buildings/upgrades.
- Fundo de praia em tilemap (`BeachTiledBackground`), com:
  - agua animada
  - areia/costa estaticas
  - faixa de areia molhada
  - microdetalhes raros na areia

## Como jogar rapido

1. Clique na cocada para ganhar recurso.
2. Compre construcoes para subir o CPS.
3. Compre upgrades para acelerar o ritmo.
4. Escolha um sabor quando estiver disponivel.
5. Abra lootbox/conquistas para acompanhar progresso.
6. Salve manualmente.

## Estrutura do projeto

- [index.html](index.html): entrada da aplicacao.
- [css/style.css](css/style.css): estilos e identidade visual.
- [js/](js): core do jogo (estado, acoes, economia, tempo e save).
- [src/ui-react/](src/ui-react): interface React.
- [src/ui-react/components/](src/ui-react/components): componentes de gameplay/UI.
- [assets/](assets): sprites principais.

## Arquitetura (resumo)

- Core (`js/`) concentra regra de gameplay.
- React (`src/ui-react/`) so renderiza e dispara acoes.
- Bridge por EventEmitter para sincronizar core e UI.
- Regra que eu sigo: nada de logica economica dentro de componente React.

## Rodando local

### Pre-requisitos

- Node.js 18+
- Navegador moderno

### Desenvolvimento

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

## Notas

- Creditos/licencas de assets estao em `licenses/third_party_assets.md`.
- O documento tecnico mais completo da base esta em `AI_CONTEXT.md`.
