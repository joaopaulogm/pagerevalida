/* global React, Card, Tag, Button, Icon */
const { useState: useStateXR } = React;

const ALTS = [
  { letter: 'A', text: 'Iniciar hidroclorotiazida 25 mg/dia em monoterapia e reavaliar em 90 dias.' },
  { letter: 'B', text: 'Associar losartana 50 mg + anlodipino 5 mg, solicitar fundoscopia, ECG e creatinina para estratificação de risco cardiovascular.' },
  { letter: 'C', text: 'Encaminhar ao cardiologista antes de qualquer terapia medicamentosa.' },
  { letter: 'D', text: 'Adotar mudança de estilo de vida isolada por 6 meses; medicar apenas se houver lesão em órgão-alvo.' },
];

const RX_STATES = [
  { code: 'CC', color: 'var(--success-500)', label: 'Certo · convicção' },
  { code: 'CD', color: 'var(--teal-500)',    label: 'Certo · dúvida' },
  { code: 'EC', color: 'var(--danger-500)',  label: 'Errado · convicção' },
  { code: 'ED', color: 'var(--warn-500)',    label: 'Errado · dúvida' },
];

const XRayButton = ({ code, color, active, onClick }) => (
  <button onClick={onClick}
    style={{
      fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em',
      padding: '7px 11px', borderRadius: 7,
      border: '1px solid ' + (active ? color : 'transparent'),
      background: active ? color : 'var(--slate-100)',
      color: active ? '#fff' : 'var(--slate-600)',
      cursor: 'pointer', transition: 'all 140ms',
    }}>{code}</button>
);

const XRay = () => {
  const [picks, setPicks] = useStateXR({ A: 'EC', B: 'CC', C: 'ED', D: null });
  const set = (letter, code) => setPicks(p => ({ ...p, [letter]: p[letter] === code ? null : code }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 20, maxWidth: 1200 }}>
      {/* Left: case + alternatives */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top bar */}
        <Card padding={16} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Tag color="navy">Pediatria · INEP</Tag>
          <Tag color="slate" mono>Q-2024-042</Tag>
          <div style={{ flex: 1 }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--navy-900)', fontWeight: 600 }}>
            <Icon name="timer" size={16} style={{ color: 'var(--fg-3)' }}/>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>02:48</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--fg-3)' }}>
            Questão <b style={{ color: 'var(--fg-1)' }}>42</b> de 50
          </div>
        </Card>

        {/* Clinical case */}
        <Card padding={26} style={{ background: 'var(--ivory)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
            color: 'var(--teal-700)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Caso clínico
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 17, lineHeight: 1.65,
            color: 'var(--navy-900)', fontVariationSettings: '"opsz" 14', maxWidth: '70ch' }}>
            Paciente, 58 anos, masculino, comparece à UBS com queixa de{' '}
            <mark style={{ background: '#fde68a', padding: '0 2px', borderRadius: 2 }}>cefaleia occipital matinal</mark>{' '}
            há três semanas, associada a episódios de tontura. Antecedentes: tabagismo (30 maços-ano), sedentarismo, pai falecido por AVC aos 62 anos. Ao exame: PA 168×104 mmHg (média de três aferições), IMC 31, ausculta cardíaca sem alterações, pulsos periféricos preservados.
            <br/><br/>
            Laboratório inicial: creatinina 1,1 mg/dL, glicemia 112 mg/dL, LDL 162 mg/dL, potássio 4,3 mEq/L.
            <br/><br/>
            <b style={{ color: 'var(--navy-900)' }}>Qual a conduta mais adequada no contexto do SUS?</b>
          </div>
        </Card>

        {/* Alternatives with Raio-X picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ALTS.map(a => {
            const active = picks[a.letter];
            const activeState = active ? RX_STATES.find(s => s.code === active) : null;
            return (
              <Card key={a.letter} padding={14} style={{
                borderColor: active ? activeState.color : 'var(--border-1)',
                boxShadow: active ? `0 0 0 1px ${activeState.color}` : 'var(--shadow-xs)',
                transition: 'all 180ms'
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9999,
                    background: active ? activeState.color : 'var(--slate-100)',
                    color: active ? '#fff' : 'var(--slate-700)',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 180ms'
                  }}>{a.letter}</div>
                  <div style={{ flex: 1, fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.5, paddingTop: 4 }}>{a.text}</div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', paddingTop: 2 }}>
                    {RX_STATES.map(s => (
                      <XRayButton key={s.code} code={s.code} color={s.color}
                        active={picks[a.letter] === s.code}
                        onClick={() => set(a.letter, s.code)} />
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer actions */}
        <Card padding={14} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button variant="ghost" iconLeft="refresh">Limpar marcação</Button>
          <div style={{ flex: 1 }}/>
          <Button variant="secondary" iconLeft="lock">Exportar PDF · Premium</Button>
          <Button variant="primary" iconRight="arrowRight">Enviar análise</Button>
        </Card>
      </div>

      {/* Right: side panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card padding={18}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Matriz Raio-X</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {RX_STATES.map(s => (
              <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                  padding: '3px 7px', borderRadius: 5, background: s.color, color: '#fff',
                  minWidth: 28, textAlign: 'center'
                }}>{s.code}</span>
                <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{s.label}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.5 }}>
            Marque cada alternativa para alimentar o mapeamento de convicção. Estamos medindo o que você sabe — e o que você acha que sabe.
          </p>
        </Card>

        <Card padding={18}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Bateria atual</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 500,
              color: 'var(--navy-900)', fontVariantNumeric: 'tabular-nums' }}>41</span>
            <span style={{ color: 'var(--fg-3)' }}>/ 50 respondidas</span>
          </div>
          <div style={{ height: 6, background: 'var(--slate-100)', borderRadius: 9999, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ width: '82%', height: '100%', background: 'var(--teal-500)', borderRadius: 9999 }}/>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            <Tag color="success" mono>CC 18</Tag>
            <Tag color="teal" mono>CD 9</Tag>
            <Tag color="danger" mono>EC 7</Tag>
            <Tag color="warn" mono>ED 7</Tag>
          </div>
        </Card>

        <Card padding={18} style={{
          background: 'linear-gradient(180deg, var(--teal-50), #fff 75%)',
          borderColor: 'var(--teal-200)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 600, color: 'var(--teal-700)',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            <Icon name="sparkles" size={13}/>Dica INEP
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5 }}>
            Em 72% dos casos de hipertensão estágio 2 no INEP, a resposta correta envolve <b>terapia combinada inicial</b> + rastreio de lesão em órgão-alvo.
          </p>
        </Card>
      </div>
    </div>
  );
};

window.XRay = XRay;
