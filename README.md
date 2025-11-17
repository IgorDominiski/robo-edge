## Integrantes: 

Igor Dominiski – RM562055
Murillo Akira – RM561886
Murilo Canestri – RM564053

## Video explicação:

https://youtu.be/_ilVbilf_vA

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

