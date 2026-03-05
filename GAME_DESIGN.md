# GAME_DESIGN.md

## 1. Visão Geral do Jogo

- **Gênero:** idle/clicker incremental em navegador.
- **Tema:** cocadas, produção artesanal/industrial e clima praiano brasileiro.
- **Objetivo do jogador:** acumular cocadas e escalar produção via clique, construções e upgrades.
- **Fantasia central:** evoluir do trabalho manual para uma fábrica de cocadas autossustentável.
- **Direção estética:** retrô 8-bit (NES/SNES inicial), com foco em clareza e resposta rápida.
- **Direção visual atual:** praia pixel-art com identidade funcional (HUD legível, ícones utilitários e fundo tilemap).

## 2. Loop Principal do Jogo

1. Jogador clica na cocada e ganha recurso por clique.
2. Compra construções que geram CPS (cocadas por segundo).
3. Compra upgrades para melhorar clique, CPS, custos e sinergias.
4. Loop de tempo converte CPS em cocadas continuamente (tick de 100ms).
5. Escolha de sabor aplica bônus permanentes e influencia a estratégia.
6. Jogador alterna entre reinvestir, otimizar compra e manter progressão.

## 3. Mecânicas Principais

### 3.1 Recurso e Geração

- Recurso único: **cocadas**.
- Geração manual: baseada em `perClick`.
- Geração automática: CPS de construções acumulado no loop.

### 3.2 Construções

- Fontes automáticas atuais:
  - Vendedor Ambulante (0.1 CPS base)
  - Cozinha Caseira (0.2 CPS base)
  - Fábrica de Cocada (2.0 CPS base)
- Produção por unidade cresce linearmente.
- Custo por unidade cresce exponencialmente (`costGrowth`).

### 3.3 Upgrades

- Categorias existentes: clique, CPS global, bônus por construção, redução de custo e sinergia.
- Compra por clique direto no ícone da receita.
- Upgrades já comprados saem das páginas de disponíveis e ficam no histórico (`📜`).
- Visibilidade gradual por progressão (`maxCocadasSeen`) evita sobrecarga inicial de UI.

### 3.4 Lootbox e Eventos de Recompensa

- Sistema de lootbox ativo com modal de abertura em estágios.
- Recompensas variam por raridade e podem impactar progressão.
- Existem gatilhos de lootbox por progresso (ex.: level up e marcos de interação).

### 3.5 Conquistas

- Sistema de conquistas ativo e dirigido pelo core.
- Conquistas desbloqueiam por condições de estado e disparam feedback imediato.
- UI apresenta painel de conquistas e toast de desbloqueio.

## 4. Progressão e Upgrades

- **Curto prazo:** clique manual para primeira automação e escolha de sabor.
- **Médio prazo:** expansão de construções + upgrades para reduzir tempo entre compras.
- **Longo prazo (estado atual):** crescimento desacelera por custo exponencial sem meta-progressão.
- **Sensação desejada:** avanço constante com picos de poder em compras e desbloqueios.

## 5. Economia do Jogo

- Economia de uma moeda simplifica leitura e decisão.
- Relação base de balanceamento:
  - produção cresce de forma linear por unidade;
  - custo cresce de forma exponencial por unidade.
- Consequência de design: decisões de timing de compra importam mais que microgestão.
- Risco conhecido: sem expansão de upgrades de CPS, mid/late pode perder ritmo.

## 6. Interface e Experiência do Jogador

### 6.1 Regras de UI 8-bit

- Interface minimalista, pixelada e funcional.
- Tipografia retrô legível em telas pequenas.
- Botões grandes, contraste alto e estados visuais claros.
- Evitar estética moderna: blur, gradientes suaves e sombras realistas.
- Fonte pixel oficial: `PublicPixel`.
- Ícones funcionais de UI padronizados por pack (`Icons_Essential`) para ações principais.

### 6.2 Elementos-Chave da Interface

- Botão principal da cocada (ação primária).
- Contador de cocadas em destaque.
- Estatísticas: por clique, CPS e multiplicadores.
- Loja com construções e livro de receitas de upgrades.
- Status de save e ações de salvar/resetar.
- Modal de lootbox com feedback visual de raridade/recompensa.
- Botão e painel de conquistas com ícones dedicados.
- Fundo dinâmico de praia em tileset com ondas animadas.

### 6.3 Feedback e Interação

- Pop visual ao clicar.
- Partículas de clique (quando `#particleLayer` está presente).
- Tooltip de upgrade com custo, descrição e estado.
- Ajuda contextual (`?`) e fechamento por toggle, clique fora ou `Esc`.
- Ritmo de feedback curto: rápido, claro e sem poluição visual.
- Toast de conquista com ícone e título do desbloqueio.
- Ícones inline em botões críticos para reduzir ambiguidade de ação.

### 6.4 Direção de Background (Tilemap de Praia)

- O fundo principal usa canvas com spritesheet de praia (tilemap).
- Somente a água é animada; areia e detalhes permanecem estáticos.
- Camadas visuais atuais:
  - água animada
  - costa de transição
  - faixa de areia molhada
  - areia seca com microdetalhes raros
- O objetivo é manter atmosfera viva sem distrair da leitura econômica da HUD.

## 7. Sensação e Ritmo do Gameplay

- **Ritmo inicial:** foco em cliques rápidos e primeiras compras.
- **Ritmo intermediário:** decisões de investimento entre upgrades e CPS.
- **Ritmo tardio (atual):** tendência de desaceleração por falta de sistemas de escala longa.
- **Pilar de sensação:** progresso perceptível em sessões curtas, com leitura imediata de ganhos.

## 8. Estado Atual dos Sistemas

- Save manual em `localStorage` (chave fixa) com carregamento no bootstrap.
- Sem progresso offline no momento.
- Sistema de conquistas ativo (core + painel + toast).
- Sistema de lootbox ativo com modal e recompensas por raridade.
- Automação principal permanece no CPS das construções (sem prestígio no estado atual).

## 9. Lacunas e Evolução Recomendada

- Expandir trilhas de upgrade por eixo (clique, CPS, custo, multiplicador global).
- Implementar progresso offline usando timestamp salvo.
- Evoluir conquistas para incluir metas de sessão/evento e recompensas cosméticas.
- Considerar meta-progressão (prestígio) para sustain de longo prazo.
- Balancear sabores e tabelas de lootbox para manter escolhas competitivas.
- Ajustar densidade do fundo tilemap por presets visuais (suave/normal/detalhado).
