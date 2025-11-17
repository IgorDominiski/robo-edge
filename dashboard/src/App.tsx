import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import './App.css'

type Sensor = {
  id: string
  label: string
  unit: string
  value: number
  icon: string
  safeRange: [number, number]
}

type MachineStatus = 'operational' | 'attention' | 'critical'

type Machine = {
  id: string
  name: string
  zone: string
  type: string
  x: number
  y: number
  status: MachineStatus
}

type LogEntry = {
  id: string
  message: string
  detail: string
  timestamp: string
  severity: MachineStatus
}

type RobotState = {
  position: string
  nextStop: string
  battery: number
  servoAngle: number
  led: 'off' | 'warning' | 'alarm'
  buzzer: 'off' | 'ping'
}

const SENSOR_BLUEPRINT: Sensor[] = [
  {
    id: 'temperature',
    label: 'Temperatura',
    unit: '°C',
    value: 54,
    icon: '🌡️',
    safeRange: [40, 70],
  },
  {
    id: 'vibration',
    label: 'Vibração RMS',
    unit: 'mm/s',
    value: 5.2,
    icon: '🛰️',
    safeRange: [0, 7.5],
  },
  {
    id: 'noise',
    label: 'Ruído',
    unit: 'dB',
    value: 62,
    icon: '🎧',
    safeRange: [30, 75],
  },
  {
    id: 'humidity',
    label: 'Umidade',
    unit: '%',
    value: 46,
    icon: '💧',
    safeRange: [20, 70],
  },
]

const MACHINE_LAYOUT: Machine[] = [
  {
    id: 'MX-01',
    name: 'Prensa Hidráulica',
    zone: 'Linha A',
    type: 'Prensagem',
    x: 16,
    y: 55,
    status: 'operational',
  },
  {
    id: 'MX-02',
    name: 'Compressor Gamma',
    zone: 'Linha B',
    type: 'Ar comprimido',
    x: 48,
    y: 35,
    status: 'operational',
  },
  {
    id: 'MX-03',
    name: 'Torno CNC',
    zone: 'Linha C',
    type: 'Usinagem',
    x: 78,
    y: 60,
    status: 'attention',
  },
  {
    id: 'MX-04',
    name: 'Esteira Embalagem',
    zone: 'Expedição',
    type: 'Movimentação',
    x: 65,
    y: 25,
    status: 'operational',
  },
]

const INITIAL_LOG: LogEntry[] = [
  {
    id: crypto.randomUUID(),
    message: 'Partida suave concluída',
    detail: 'Servo alinhado e sensores calibrados no ESP32',
    timestamp: '07:42',
    severity: 'operational',
  },
  {
    id: crypto.randomUUID(),
    message: 'Ronda automatizada',
    detail: 'Robô monitorando Linha B – vibração dentro do limite',
    timestamp: '07:48',
    severity: 'attention',
  },
]

const CIRCUIT_FLOW = [
  {
    title: 'Sensores',
    items: ['Acelerômetro', 'Microfone MEMS', 'Termistor NTC'],
  },
  {
    title: 'Núcleo ESP32',
    items: ['Filtragem DSP', 'Modelo preditivo', 'MQTT/WebSocket'],
  },
  {
    title: 'Ação',
    items: ['Servo direciona', 'LED industrial', 'Buzzer safety'],
  },
]

const formatClock = () =>
  new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())

const statusLabel: Record<MachineStatus, string> = {
  operational: 'Operando',
  attention: 'Atenção',
  critical: 'Crítico',
}

const App = () => {
  const [sensors, setSensors] = useState(SENSOR_BLUEPRINT)
  const [machines, setMachines] = useState(MACHINE_LAYOUT)
  const [log, setLog] = useState(INITIAL_LOG)
  const [selectedMachine, setSelectedMachine] = useState(MACHINE_LAYOUT[2])
  const [failureActive, setFailureActive] = useState(false)
  const [robotState, setRobotState] = useState<RobotState>({
    position: 'Base de carga',
    nextStop: 'Linha B',
    battery: 82,
    servoAngle: 12,
    led: 'off',
    buzzer: 'off',
  })

  useEffect(() => {
    const tick = setInterval(() => {
      setSensors((current) =>
        current.map((sensor) => {
          const drift = failureActive ? 1.5 : 0.6
          const variance = (Math.random() - 0.5) * drift
          return {
            ...sensor,
            value: Number(
              Math.max(sensor.safeRange[0] - 2, sensor.value + variance).toFixed(1)
            ),
          }
        })
      )

      setMachines((current) =>
        current.map((machine) => {
          if (failureActive && machine.id === 'MX-03') {
            return { ...machine, status: 'critical' }
          }
          if (!failureActive && machine.id === 'MX-03') {
            return { ...machine, status: Math.random() > 0.6 ? 'attention' : 'operational' }
          }
          return machine
        })
      )

      setRobotState((prev) => {
        const newBattery = Math.max(35, prev.battery - (failureActive ? 0.7 : 0.3))
        const newAngle = failureActive ? 65 : (prev.servoAngle + 5) % 90
        const newPosition =
          failureActive || prev.position === 'Base de carga' ? 'Linha B' : 'Base de carga'
        const newNextStop = failureActive ? 'Inspeção MX-03' : 'Linha C'

        return {
          ...prev,
          battery: Number(newBattery.toFixed(1)),
          servoAngle: Number(newAngle.toFixed(0)),
          position: failureActive ? 'Linha C' : newPosition,
          nextStop: newNextStop,
        }
      })
    }, 2500)

    return () => clearInterval(tick)
  }, [failureActive])

  const handleSimulateFailure = () => {
    if (failureActive) return

    setFailureActive(true)
    setSensors((current) =>
      current.map((sensor) => {
        if (sensor.id === 'temperature') return { ...sensor, value: sensor.safeRange[1] + 9 }
        if (sensor.id === 'vibration') return { ...sensor, value: sensor.safeRange[1] + 2 }
        if (sensor.id === 'noise') return { ...sensor, value: sensor.safeRange[1] + 6 }
        return sensor
      })
    )
    setMachines((current) =>
      current.map((machine) =>
        machine.id === 'MX-03' ? { ...machine, status: 'critical' } : machine
      )
    )
    setSelectedMachine((prev) => ({ ...prev, status: 'critical' }))
    setRobotState((prev) => ({
      ...prev,
      position: 'Linha C',
      nextStop: 'Ponto de inspeção',
      led: 'alarm',
      buzzer: 'ping',
      servoAngle: 72,
    }))
    setLog((current) => [
      {
        id: crypto.randomUUID(),
        message: 'Falha simulada na MX-03',
        detail: 'Temperatura e vibração ultrapassaram limites seguros',
        timestamp: formatClock(),
        severity: 'critical',
      },
      ...current,
    ])

    setTimeout(() => {
      setFailureActive(false)
      setSensors(SENSOR_BLUEPRINT)
      setMachines(MACHINE_LAYOUT)
      setRobotState((prev) => ({
        ...prev,
        position: 'Base de carga',
        nextStop: 'Linha A',
        led: 'warning',
        buzzer: 'off',
      }))
      setLog((current) => [
        {
          id: crypto.randomUUID(),
          message: 'Falha contida',
          detail: 'Equipe recebeu alerta e robô retornou à base',
          timestamp: formatClock(),
          severity: 'attention',
        },
        ...current,
      ])
    }, 9000)
  }

  const activeAlerts = useMemo(
    () => machines.filter((machine) => machine.status !== 'operational'),
    [machines]
  )

  const selectedStatus = selectedMachine?.status ?? 'operational'

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="tag">Robô Monitor de Manutenção Preditiva</p>
          <h1>Inspeção industrial autônoma com ESP32 + sensores inteligentes</h1>
          <p className="lead">
            Dash em tempo real que replica o projeto publicado no Wokwi e demonstra como o robô
            identifica anomalias de vibração, ruído e temperatura antes da falha acontecer.
          </p>
          <div className="hero-actions">
            <button className="cta" onClick={handleSimulateFailure}>
              ⚠️ Simular falha agora
            </button>
            <a
              className="secondary"
              href="https://wokwi.com/projects/447880409471328257"
              target="_blank"
              rel="noreferrer"
            >
              Ver circuito no Wokwi ↗
            </a>
          </div>
          <div className="hero-meta">
            <span>3 sensores ativos</span>
            <span>Servo + LED + buzzer prontos</span>
            <span>{activeAlerts.length} alertas ao vivo</span>
          </div>
        </div>
        <div className="hero-panel">
          <div className="robot-pose">
            <div className="robot-head" data-led={robotState.led}></div>
            <div className="robot-body">
              <div
                className="robot-arm"
                style={{ '--angle': `${robotState.servoAngle}deg` } as CSSProperties}
              >
                <span>Servo {robotState.servoAngle}°</span>
              </div>
              <div className="robot-eye" data-buzzer={robotState.buzzer}></div>
            </div>
          </div>
          <dl>
            <div>
              <dt>Posição atual</dt>
              <dd>{robotState.position}</dd>
            </div>
            <div>
              <dt>Próximo alvo</dt>
              <dd>{robotState.nextStop}</dd>
            </div>
            <div>
              <dt>Bateria</dt>
              <dd>{robotState.battery}%</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="section">
        <div className="section-head">
          <h2>Telemetria ao vivo</h2>
          <p>Valores vindos dos sensores simulados no ESP32 (projeto Wokwi).</p>
        </div>
        <div className="sensor-grid">
          {sensors.map((sensor) => {
            const [min, max] = sensor.safeRange
            const ratio = Math.min(1, Math.max(0, (sensor.value - min) / (max - min)))
            const status: MachineStatus =
              sensor.value > max ? 'critical' : sensor.value > max - 3 ? 'attention' : 'operational'

            return (
              <article key={sensor.id} className={`sensor-card sensor-${status}`}>
                <header>
                  <span>{sensor.icon}</span>
                  <div>
                    <p>{sensor.label}</p>
                    <strong>
                      {sensor.value}
                      <small>{sensor.unit}</small>
                    </strong>
                  </div>
                </header>
                <div className="meter">
                  <div className="meter-fill" style={{ width: `${ratio * 100}%` }} />
                </div>
                <footer>
                  Faixa segura: {min} – {max} {sensor.unit}
                </footer>
              </article>
            )
          })}
        </div>
      </section>

      <section className="section plant">
        <div>
          <div className="section-head">
            <h2>Mapa da fábrica</h2>
            <p>Robô percorre rotas pré-programadas e intercepta máquinas críticas.</p>
          </div>
          <div className="factory-grid">
            {machines.map((machine) => (
              <button
                key={machine.id}
                className={`machine ${machine.status}`}
                style={{ left: `${machine.x}%`, top: `${machine.y}%` }}
                onClick={() => setSelectedMachine(machine)}
              >
                <span>{machine.name}</span>
              </button>
            ))}
            <div
              className="robot"
              data-alert={failureActive}
              style={{ left: failureActive ? '76%' : '25%', top: failureActive ? '62%' : '48%' }}
            >
              🤖
            </div>
          </div>
        </div>
        <aside className="machine-detail">
          <h3>{selectedMachine?.name}</h3>
          <p>{selectedMachine?.type}</p>
          <span className={`chip ${selectedStatus}`}>{statusLabel[selectedStatus]}</span>
          <ul>
            <li>Zona: {selectedMachine?.zone}</li>
            <li>Última inspeção: há 4 min</li>
            <li>
              Risco estimado:{' '}
              {selectedStatus === 'critical' ? 'Alto' : selectedStatus === 'attention' ? 'Médio' : 'Baixo'}
            </li>
          </ul>
        </aside>
      </section>

      <section className="section circuit">
        <div className="circuit-flow">
          <div className="section-head">
            <h2>Fluxo do circuito</h2>
            <p>Sequência completa: sensores → ESP32 → atuadores e dashboard.</p>
          </div>
          <div className="flow">
            {CIRCUIT_FLOW.map((step, index) => (
              <div key={step.title} className="flow-step">
                <h4>
                  {index + 1}. {step.title}
                </h4>
                <ul>
                  {step.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="wokwi">
          <iframe
            title="Projeto Wokwi"
            src="https://wokwi.com/projects/447880409471328257"
            loading="lazy"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      <section className="section logs">
        <div>
          <div className="section-head">
            <h2>Timeline de alertas</h2>
            <p>Registros simulados do fluxo MQTT/WebSocket.</p>
          </div>
          <ul className="log-list">
            {log.map((entry) => (
              <li key={entry.id} className={entry.severity}>
                <div>
                  <strong>{entry.message}</strong>
                  <p>{entry.detail}</p>
                </div>
                <span>{entry.timestamp}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="insights">
          <article>
            <p>Tempo sem falha</p>
            <strong>482 h</strong>
            <small>40% mais disponibilidade</small>
          </article>
          <article>
            <p>Visitas evitadas</p>
            <strong>+18</strong>
            <small>Equipe atua só quando necessário</small>
          </article>
          <article>
            <p>Economia estimada</p>
            <strong>R$ 126k</strong>
            <small>Comparado à manutenção corretiva</small>
          </article>
        </div>
      </section>

      <footer>
        <p>
          Robô monitor integrado ao ESP32 (simulado no Wokwi). Pronto para enviar dados por
          MQTT/WebSocket para um dashboard real em produção.
        </p>
      </footer>
    </div>
  )
}

export default App
