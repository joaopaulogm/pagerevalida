/* global React, Card, MetricCard, Tag, Button, Icon, Sparkline */

const HEATMAP_ROWS = [
  { label: 'Cardiologia',     cells: [0.85,0.70,1.00,0.82,0.55,0.90,0.72,0.45,0.88,0.78] },
  { label: 'Pediatria',       cells: [0.22,0.10,0.08,0.30,0.05,0.12,0.28,0.20,0.06,0.10] },
  { label: 'Saúde pública',   cells: [0.65,0.90,0.50,0.35,0.80,0.70,0.95,0.88,0.60,0.85] },
  { label: 'G. Obstetrícia',  cells: [0.30,0.45,0.20,0.55,0.72,0.30,0.22,0.78,0.18,0.28] },
  { label: 'Cirurgia',        cells: [0.50,0.42,0.65,0.90,0.68,0.48,0.78,0.62,0.72,0.88] },
  { label: 'Clínica médica',  cells: [0.72,0.82,0.60,0.75,0.88,0.70,0.65,0.90,0.78,0.80] },
];

function heatColor(v) {
  if (v < 0.20) return '#9a1f2b';
  if (v < 0.35) return '#d0323f';
  if (v < 0.50) return '#d98912';
  if (v < 0.65) return '#7ed5d8';
  if (v < 0.80) return '#14a5ab';
  return '#0f8a90';
}

const Heatmap = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '130px repeat(10, 1fr)', gap: 4 }}>
    {HEATMAP_ROWS.map(r => (
      <React.Fragment key={r.label}>
        <div style={{ fontSize: 12.5, color: 'var(--fg-2)', display: 'flex', alignItems: 'center' }}>{r.label}</div>
        {r.cells.map((v, i) => (
          <div key={i} title={`${Math.round(v*100)}%`} style={{
            height: 26, borderRadius: 4, background: heatColor(v),
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
          }}/>
        ))}
      </React.Fragment>
    ))}
  </div>
);

const ProgressChart = () => {
  const pts = [52,55,53,58,61,60,63,66,64,68,67,70,69,72];
  const width = 600, height = 160, pad = 24;
  const max = 100, min = 40;
  const path = pts.map((p, i) => {
    const x = pad + (i/(pts.length-1))*(width - pad*2);
    const y = height - pad - ((p - min)/(max - min))*(height - pad*2);
    return `${i===0?'M':'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  const area = `${path} L ${width-pad} ${height-pad} L ${pad} ${height-pad} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 180 }}>
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14a5ab" stopOpacity="0.28"/>
          <stop offset="100%" stopColor="#14a5ab" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(t => (
        <line key={t} x1={pad} x2={width-pad} y1={pad + t*(height-pad*2)} y2={pad + t*(height-pad*2)}
          stroke="var(--slate-200)" strokeDasharray="3 4" />
      ))}
      <path d={area} fill="url(#area)" />
      <path d={path} fill="none" stroke="var(--teal-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => {
        const x = pad + (i/(pts.length-1))*(width - pad*2);
        const y = height - pad - ((p - min)/(max - min))*(height - pad*2);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#fff" stroke="var(--teal-500)" strokeWidth="1.5"/>;
      })}
      {[40,60,80,100].map(v => (
        <text key={v} x={4} y={height - pad - ((v-min)/(max-min))*(height - pad*2) + 3}
          fontSize="10" fill="var(--fg-4)" fontFamily="var(--font-mono)">{v}%</text>
      ))}
    </svg>
  );
};

const Dashboard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200 }}>
    {/* Greeting */}
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--fg-3)',
          letterSpacing: '0.08em', textTransform: 'uppercase' }}>Central de inteligência</div>
        <h1 style={{ margin: '6px 0 0' }}>Bom dia, Marina.</h1>
        <p style={{ margin: '6px 0 0', color: 'var(--fg-3)', fontSize: 14 }}>
          Você está a <b style={{ color: 'var(--navy-800)' }}>14 dias</b> do próximo simulado INEP. Sua acurácia subiu 4 pontos nesta semana.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="secondary" iconLeft="fileDown">Relatório</Button>
        <Button variant="primary" iconRight="arrowRight">Continuar estudando</Button>
      </div>
    </div>

    {/* Metric row */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
      <MetricCard label="Questões respondidas" value="1.284" delta="+128" footer="últimos 7 dias" />
      <MetricCard label="Taxa de acerto" value="68%" spark={[52,55,53,58,61,60,63,66,64,68,67,70,69,72]} footer="30 dias" />
      <MetricCard label="Convicção média" value="74%" delta="+3pp" footer="vs. semana anterior" />
      <MetricCard label="Pontos cegos" value="7" tone="blind" footer="falsas certezas · Pediatria" />
    </div>

    {/* Chart + Heatmap */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14 }}>
      <Card padding={22}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <h3 style={{ margin: 0 }}>Evolução de acurácia</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--fg-3)', fontSize: 12.5 }}>Semanal · todas as áreas</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Tag color="slate">4s</Tag><Tag color="navy">14s</Tag><Tag color="slate">6m</Tag>
          </div>
        </div>
        <ProgressChart />
      </Card>

      <Card padding={22}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0 }}>Domínio por área</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--fg-3)', fontSize: 12.5 }}>Últimos 10 blocos de 50 questões</p>
          </div>
        </div>
        <Heatmap />
      </Card>
    </div>

    {/* Blind spot + activity */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
      <Card padding={0} style={{
        background: 'linear-gradient(180deg, var(--danger-50), #fff 60%)',
        borderColor: 'var(--danger-200)', overflow: 'hidden'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr auto', gap: 16, padding: 22, alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--danger-100, #fde4e6)',
            color: 'var(--danger-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="eyeOff" size={22}/>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--danger-700)',
              letterSpacing: '0.08em', textTransform: 'uppercase' }}>Ponto cego detectado</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22,
              color: 'var(--navy-900)', marginTop: 6, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
              Você marcou <span style={{ fontFamily: 'var(--font-mono)' }}>EC</span> em 7 questões de Pediatria — e estava certo nas 7.
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-2)', marginTop: 8, lineHeight: 1.5 }}>
              Padrão recorrente no capítulo de <b style={{ color: 'var(--navy-800)' }}>Imunização</b>. Sua convicção está inversa à acurácia.
            </div>
          </div>
          <Button variant="secondary" iconRight="arrowRight">Revisar</Button>
        </div>
      </Card>

      <Card padding={22}>
        <h3 style={{ margin: 0, marginBottom: 12 }}>Revisão espaçada</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { t: 'Hipertensão · classes farmacológicas', d: 'hoje', c: 'teal' },
            { t: 'Pediatria · calendário vacinal',        d: 'em 3 dias', c: 'navy' },
            { t: 'SUS · atenção primária',                d: 'em 7 dias', c: 'slate' },
            { t: 'Obstetrícia · pré-natal de baixo risco',d: 'em 21 dias', c: 'slate' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 9, background: 'var(--slate-50)',
              border: '1px solid var(--border-1)' }}>
              <Icon name="refresh" size={15} style={{ color: 'var(--fg-3)' }}/>
              <div style={{ flex: 1, fontSize: 13, color: 'var(--fg-1)' }}>{r.t}</div>
              <Tag color={r.c}>{r.d}</Tag>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

window.Dashboard = Dashboard;
