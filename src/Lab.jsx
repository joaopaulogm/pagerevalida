/* global React, Card, Tag, Button, Icon */
const { useState: useStateLab } = React;

const selectStyle = {
  width: '100%', padding: '10px 12px', fontFamily: 'var(--font-sans)', fontSize: 14,
  border: '1px solid var(--border-2)', borderRadius: 10, background: '#fff',
  color: 'var(--fg-1)', outline: 'none', boxSizing: 'border-box',
};

const Lab = () => {
  const [text, setText] = useStateLab('');
  const [generating, setGenerating] = useStateLab(false);
  const [questions, setQuestions] = useStateLab(null);

  const handleGenerate = () => {
    setGenerating(true);
    setQuestions(null);
    setTimeout(() => {
      setGenerating(false);
      setQuestions([
        { tag: 'Cardiologia', text: 'Paciente masculino, 58 anos, hipertenso estágio 2, comparece à UBS. Qual a conduta inicial recomendada pela Diretriz Brasileira de Hipertensão no contexto do SUS?' },
        { tag: 'Saúde pública', text: 'Segundo as diretrizes do SUS, a estratificação de risco cardiovascular em paciente hipertenso deve considerar qual conjunto de fatores?' },
        { tag: 'Farmacologia', text: 'Sobre a terapia combinada inicial (losartana + anlodipino), qual é o principal mecanismo de ação sinérgico?' },
      ]);
    }, 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 1fr', gap: 20, maxWidth: 1200 }}>
      {/* Input side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal-700)',
            letterSpacing: '0.08em', textTransform: 'uppercase' }}>Laboratório de IA</div>
          <h2 style={{ margin: '6px 0 4px' }}>Gerador de questões INEP</h2>
          <p style={{ margin: 0, color: 'var(--fg-3)', fontSize: 14, maxWidth: '58ch' }}>
            Cole uma diretriz, resumo ou capítulo. A IA extrai o <i>DNA do INEP</i> — casos longos, foco em SUS, medicina preventiva — e devolve questões no padrão da banca.
          </p>
        </div>

        <Card padding={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-1)',
            display: 'flex', alignItems: 'center', gap: 8, background: 'var(--slate-50)' }}>
            <Icon name="book" size={14} style={{ color: 'var(--fg-3)' }}/>
            <span style={{ fontSize: 12.5, color: 'var(--fg-2)', fontWeight: 500 }}>
              Texto-base · Diretriz Brasileira de Hipertensão (trecho)
            </span>
            <div style={{ flex: 1 }}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)' }}>
              {String(text.length).padStart(4, '0')} / 8000
            </span>
          </div>
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder={"Cole aqui o texto clínico, diretriz, resumo ou capítulo…\n\nExemplo: A abordagem inicial ao paciente hipertenso na Atenção Primária deve considerar estratificação de risco cardiovascular, rastreio de lesão em órgão-alvo e adesão farmacológica…"}
            style={{
              width: '100%', minHeight: 260, border: 0, padding: 18, resize: 'vertical',
              fontFamily: 'var(--font-display)', fontSize: 15, lineHeight: 1.6,
              color: 'var(--navy-900)', background: 'var(--ivory)', outline: 'none',
              boxSizing: 'border-box', fontVariationSettings: '"opsz" 14'
            }}
          />
        </Card>

        {/* Controls */}
        <Card padding={16}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto', gap: 12, alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--fg-3)',
                letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Dificuldade</label>
              <select style={selectStyle}>
                <option>Intermediária · INEP</option>
                <option>Básica</option>
                <option>Avançada</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--fg-3)',
                letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Estilo</label>
              <select style={selectStyle}>
                <option>INEP · caso clínico longo</option>
                <option>Direto</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--fg-3)',
                letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Nº de questões</label>
              <input style={selectStyle} defaultValue="10" />
            </div>
            <Button variant="ai" size="lg" iconLeft="sparkles" glow onClick={handleGenerate}>
              {generating ? 'Gerando…' : 'Gerar questões com IA'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Output side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Pré-visualização</h3>
          {questions && <Tag color="success" mono>{questions.length} pronta(s)</Tag>}
        </div>

        {!questions && !generating && (
          <Card padding={28} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 10, textAlign: 'center', color: 'var(--fg-3)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--teal-50)',
              color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="sparkles" size={22}/>
            </div>
            <div style={{ fontSize: 14, color: 'var(--fg-2)', fontWeight: 500 }}>
              Seu output vai aparecer aqui
            </div>
            <div style={{ fontSize: 12.5, maxWidth: '30ch' }}>
              Cole um texto ao lado e clique em <b style={{ color: 'var(--teal-700)' }}>Gerar questões com IA</b>.
            </div>
          </Card>
        )}

        {generating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
            {[0, 1, 2].map(i => (
              <Card key={i} padding={16}>
                <div style={{
                  height: 12, borderRadius: 4, width: '35%', marginBottom: 10,
                  background: 'linear-gradient(90deg, var(--slate-100), var(--slate-200), var(--slate-100))',
                  backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite'
                }}/>
                <div style={{
                  height: 10, borderRadius: 4, width: '90%', marginBottom: 6,
                  background: 'linear-gradient(90deg, var(--slate-100), var(--slate-200), var(--slate-100))',
                  backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite'
                }}/>
                <div style={{
                  height: 10, borderRadius: 4, width: '75%',
                  background: 'linear-gradient(90deg, var(--slate-100), var(--slate-200), var(--slate-100))',
                  backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite'
                }}/>
              </Card>
            ))}
          </div>
        )}

        {questions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {questions.map((q, i) => (
              <Card key={i} padding={16}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                    color: 'var(--teal-700)' }}>Q{String(i + 1).padStart(2, '0')}</span>
                  <Tag color="navy">{q.tag}</Tag>
                  <Tag color="slate">INEP</Tag>
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--fg-1)', lineHeight: 1.55 }}>{q.text}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button variant="secondary" size="sm">Ver alternativas</Button>
                  <Button variant="ghost" size="sm" iconLeft="check">Adicionar ao banco</Button>
                </div>
              </Card>
            ))}
            <Button variant="primary" iconRight="arrowRight" style={{ alignSelf: 'flex-start' }}>
              Salvar todas no banco
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

window.Lab = Lab;
