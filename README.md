# Robô Monitor de Manutenção Preditiva

Este repositório reúne o protótipo completo do robô autônomo de inspeção industrial:
- **Hardware simulado** no [Wokwi (ESP32 + sensores + servo + LED + buzzer)](https://wokwi.com/projects/447880409471328257)
- **Dashboard web** (Vite + React + TypeScript) que ilustra, em tempo real, como a manutenção preditiva atua antes da falha

A proposta demonstra o futuro da automação industrial: prever falhas, priorizar segurança e reduzir custos com uma visualização clara do fluxo sensores → ESP32 → dashboard.

## Conceito

| Desafio | Solução |
| --- | --- |
| Falhas inesperadas param a produção e elevam custos | Robô ronda a fábrica, monitora vibração/ruído/temperatura e antecipa a falha |
| Equipes sobrecarregadas com manutenção corretiva | Alertas automáticos destacam apenas os ativos críticos |
| Projetos acadêmicos sem visualização prática | Dashboard mostra mapa da planta, telemetria e fluxo do circuito em sincronia com o Wokwi |

## Componentes Principais

1. **Sensoriamento**: vibração (acelerômetro), ruído (microfone MEMS) e temperatura (termistor) alimentam o ESP32.
2. **Processamento**: firmware aplica filtros e lógica preditiva; no Wokwi a comunicação é simulada.
3. **Atuação**: servo reposiciona o robô, LED sinaliza níveis (verde/amarelo/vermelho) e buzzer emite alerta.
4. **Dashboard**: painel web que exibe telemetria, mapa da fábrica, timeline de eventos e iframe do circuito.

## Estrutura do Repositório

```
robo_edge/
├─ README.md            ← este guia
└─ dashboard/           ← Vite + React + TS (pasta criada via `npm create vite@latest`)
   ├─ src/App.tsx       ← lógica do painel e simulação
   ├─ src/App.css       ← estilos do dashboard
   ├─ src/index.css     ← estilos globais/tema industrial
   └─ ...               ← arquivos padrão do Vite
```

## Como Rodar o Dashboard

1. **Instale dependências** (somente na primeira vez):
   ```bash
   cd /Users/igordominiski/robo_edge/dashboard
   npm install
   ```
2. **Execute em modo desenvolvimento** (hot reload):
   ```bash
   npm run dev
   ```
   Abra o endereço mostrado no terminal (geralmente `http://localhost:5173`).
3. **Build de produção**:
   ```bash
   npm run build
   npm run preview   # opcional para validar o build
   ```

## Experiência no Dashboard

- **Hero**: contextualiza o projeto e possui botão “⚠️ Simular falha agora”.
- **Telemetria ao vivo**: cartões mostram valores atuais, faixa segura e status (operando/atenção/crítico).
- **Mapa da fábrica**: layout com posição das máquinas, estado por cor e ícone do robô que se move durante a simulação.
- **Fluxo do circuito**: destaca a jornada sensores → ESP32 → atuadores; iframe incorpora o Wokwi para visualização do hardware.
- **Timeline de alertas**: representa o backlog MQTT/WebSocket com severidade e timestamp.

### Simular uma falha
1. Clique em **“⚠️ Simular falha agora”**.
2. O painel força limites de temperatura/vibração/ruído além do seguro, muda o status da máquina `MX-03` para crítico e reposiciona o robô para a Linha C.
3. Após 9 s o sistema retorna ao estado normal, registrando “Falha contida”.

## Próximos Passos Sugeridos

- Conectar dados reais via MQTT ou WebSocket quando o ESP32 estiver fora do Wokwi.
- Persistir os logs em banco/arquivo para análise histórica.
- Adicionar autenticação e múltiplos robôs/máquinas para estudos maiores.

## Créditos

Projeto idealizado para apresentações acadêmicas de Indústria 4.0 e manutenção preditiva, combinando simulação Wokwi e visualização web moderna.
# robo-edge
