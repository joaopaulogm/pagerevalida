/* global React, Card, Tag, Button, Icon */
const { useState: useStateProvas, useMemo: useMemoProvas } = React;

/* ─── Questões extraídas das provas INEP/REVALIDA ─────────────────────── */
const QUESTOES_INEP = [
  /* 2025 ──────────────────────────────────────────────────────────── */
  {
    id: 'q2025-04', ano: 2025, numero: 4, area: 'G. Obstetrícia',
    enunciado: `Paciente de 30 anos procurou consultório de ginecologia relatando fadiga, dismenorreia progressiva e dispareunia de profundidade. Toque vaginal: útero de volume normal, retroversofletido, dor à mobilização do colo.\n\nCom base nessas informações, a principal hipótese diagnóstica é`,
    alternativas: [
      { letra: 'A', texto: 'Doença inflamatória pélvica.' },
      { letra: 'B', texto: 'Miomatose uterina.' },
      { letra: 'C', texto: 'Cisto hemorrágico.' },
      { letra: 'D', texto: 'Endometriose.' },
    ],
    gabarito: 'D',
  },
  {
    id: 'q2025-07', ano: 2025, numero: 7, area: 'Clínica Médica',
    enunciado: `Homem de 20 anos, com diagnóstico de esquizofrenia, chega à Unidade de Pronto Atendimento (UPA) acompanhado de familiares, que descrevem que o paciente acordou "torto". Há 5 dias, foi realizada a troca de risperidona por haloperidol, pois aquela estava em falta na farmácia. Paciente nega outras queixas clínicas. Ao exame, apresenta contratura de região cervical e fácies de dor.\n\nQuais são, respectivamente, a hipótese diagnóstica mais provável e a conduta mais adequada?`,
    alternativas: [
      { letra: 'A', texto: 'Distonia; biperideno intramuscular.' },
      { letra: 'B', texto: 'Acatisia; haloperidol intramuscular.' },
      { letra: 'C', texto: 'Discinesia tardia; diazepam intramuscular.' },
      { letra: 'D', texto: 'Síndrome extrapiramidal; prometazina intramuscular.' },
    ],
    gabarito: 'A',
  },
  {
    id: 'q2025-09', ano: 2025, numero: 9, area: 'Saúde Pública',
    enunciado: `Observe o encaminhamento realizado por um médico de família:\n\n"À cardiologia, encaminho o Sr. J.L.S., de 56 anos, com diagnóstico de cardiopatia isquêmica, que sofreu um infarto agudo do miocárdio há 3 meses. Tem orientação para o uso de antiagregantes plaquetários, mas tem história de úlcera péptica e teve reação alérgica ao clopidogrel e à ticlopidina. Desta forma, solicito orientação quanto à conduta preventiva."\n\nAo ser assistido pelo cardiologista, o paciente será atendido em qual nível de atenção e receberá qual tipo de prevenção, respectivamente?`,
    alternativas: [
      { letra: 'A', texto: 'Primário; secundário.' },
      { letra: 'B', texto: 'Secundário; secundário.' },
      { letra: 'C', texto: 'Terciário; terciário.' },
      { letra: 'D', texto: 'Quaternário; terciário.' },
    ],
    gabarito: 'B',
  },
  {
    id: 'q2025-85', ano: 2025, numero: 85, area: 'Pediatria',
    enunciado: `Ao ser avaliado em consulta de puericultura, lactente apresenta alterações dos marcos de desenvolvimento em relação à comunicação, comportamento e socialização.\n\nNesse caso, o médico deve fazer triagem específica para transtorno do espectro autista (TEA)`,
    alternativas: [
      { letra: 'A', texto: 'aos 2, 4 e 10 meses, independentemente se o quadro é isolado ou associado à regressão.' },
      { letra: 'B', texto: 'aos 9, 18 e 30 meses, independentemente se o quadro é isolado ou associado à regressão.' },
      { letra: 'C', texto: 'aos 12, 24 e 36 meses, principalmente se o quadro é associado à regressão.' },
      { letra: 'D', texto: 'aos 2, 4 e 6 anos, principalmente se o quadro é associado à perda de habilidades motoras.' },
    ],
    gabarito: 'B',
  },

  /* 2024 ──────────────────────────────────────────────────────────── */
  {
    id: 'q2024-04', ano: 2024, numero: 4, area: 'G. Obstetrícia',
    enunciado: `Uma mulher de 32 anos, com 10 semanas de gestação, procurou o serviço de pré-natal. Ao exame físico, PA = 130 × 85 mmHg, peso = 78 kg, altura = 1,62 m. Exames laboratoriais: hemoglobina = 10,5 g/dL, glicemia de jejum = 87 mg/dL, VDRL não reagente, anti-HIV não reagente, tipagem sanguínea O negativo.\n\nConsiderando os dados acima, qual a conduta mais adequada nesse momento?`,
    alternativas: [
      { letra: 'A', texto: 'Solicitar hemograma de controle e prescrever sulfato ferroso profilático.' },
      { letra: 'B', texto: 'Prescrever ácido fólico 5 mg/dia e solicitar ferritina sérica.' },
      { letra: 'C', texto: 'Solicitar eletroforese de hemoglobina e prescrever sulfato ferroso terapêutico.' },
      { letra: 'D', texto: 'Prescrever reposição de ferro endovenoso e solicitar ecocardiograma fetal.' },
    ],
    gabarito: 'A',
  },
  {
    id: 'q2024-08', ano: 2024, numero: 8, area: 'Pediatria',
    enunciado: `Uma criança de 8 anos foi levada ao pronto-socorro com febre há 3 dias, tosse produtiva com expectoração amarelada e dificuldade respiratória progressiva. Ao exame físico: temperatura axilar = 38,8 ºC, frequência respiratória = 38 rpm, SpO₂ = 94% em ar ambiente, murmúrio vesicular reduzido em base direita com macicez à percussão.\n\nQual é a hipótese diagnóstica e a conduta mais adequada?`,
    alternativas: [
      { letra: 'A', texto: 'Bronquiolite viral; oxigenoterapia e broncodilatador inalatório.' },
      { letra: 'B', texto: 'Pneumonia bacteriana; internação e antibioticoterapia parenteral.' },
      { letra: 'C', texto: 'Asma moderada; corticoide inalatório e beta-2 agonista.' },
      { letra: 'D', texto: 'Tuberculose pulmonar; notificação compulsória e teste tuberculínico.' },
    ],
    gabarito: 'B',
  },
  {
    id: 'q2024-12', ano: 2024, numero: 12, area: 'Cardiologia',
    enunciado: `Um homem de 65 anos chega à UBS com queixa de dispneia progressiva aos esforços há 4 meses, ortopneia e edema de membros inferiores. Nega dor torácica. Antecedentes: hipertensão arterial sistêmica e diabetes mellitus tipo 2 em tratamento irregular. Ao exame físico: PA = 155 × 95 mmHg, FC = 98 bpm, FR = 22 rpm, SpO₂ = 92% em ar ambiente. Ausculta cardíaca com B3 presente, estertores crepitantes em bases pulmonares bilateralmente. Edema de MMII com cacifo (++/4+).\n\nQual o diagnóstico mais provável e a conduta inicial adequada?`,
    alternativas: [
      { letra: 'A', texto: 'Insuficiência cardíaca descompensada; furosemida endovenosa e oxigenoterapia.' },
      { letra: 'B', texto: 'Síndrome coronariana aguda; heparina endovenosa e clopidogrel.' },
      { letra: 'C', texto: 'Hipertensão pulmonar; sildenafila e warfarina.' },
      { letra: 'D', texto: 'DPOC exacerbado; broncodilatador inalatório e corticoide oral.' },
    ],
    gabarito: 'A',
  },
  {
    id: 'q2024-19', ano: 2024, numero: 19, area: 'G. Obstetrícia',
    enunciado: `Uma gestante com 16 semanas comparece à consulta de pré-natal de baixo risco. Ela relata que em uma gestação anterior, seu bebê nasceu com espinha bífida. A paciente questiona o médico sobre o uso de ácido fólico nesta gestação.\n\nQual é a orientação correta?`,
    alternativas: [
      { letra: 'A', texto: 'Iniciar ácido fólico 0,4 mg/dia a partir de agora, pois ainda está no período de maior benefício.' },
      { letra: 'B', texto: 'O ácido fólico só tem benefício quando iniciado antes da concepção; não há indicação no momento.' },
      { letra: 'C', texto: 'Prescrever ácido fólico 4 mg/dia, pois o antecedente de defeito do tubo neural indica dose alta.' },
      { letra: 'D', texto: 'Prescrever ácido fólico 0,4 mg/dia até o final da gestação para prevenir anemia megaloblástica.' },
    ],
    gabarito: 'C',
  },

  /* 2023 ──────────────────────────────────────────────────────────── */
  {
    id: 'q2023-08', ano: 2023, numero: 8, area: 'Cirurgia',
    enunciado: `Um homem de 55 anos chega ao pronto-socorro com dor abdominal em epigástrio com irradiação para o dorso, de início súbito há 6 horas, associada a náuseas e vômitos. Etilista crônico, nega cirurgias prévias. Ao exame: PA = 100 × 70 mmHg, FC = 118 bpm, abdome com dor intensa à palpação do epigástrio, sem rigidez. Laboratório: amilase = 1.840 U/L, lipase = 2.200 U/L, bilirrubinas normais, leucócitos = 14.000/mm³.\n\nQual é a conduta inicial mais adequada?`,
    alternativas: [
      { letra: 'A', texto: 'Internação, jejum, hidratação venosa vigorosa e analgesia.' },
      { letra: 'B', texto: 'Colangiopancreatografia retrógrada endoscópica (CPRE) de urgência.' },
      { letra: 'C', texto: 'Laparotomia exploradora para necrosectomia imediata.' },
      { letra: 'D', texto: 'Alta hospitalar com inibidor de bomba de prótons e dieta leve.' },
    ],
    gabarito: 'A',
  },
  {
    id: 'q2023-15', ano: 2023, numero: 15, area: 'Clínica Médica',
    enunciado: `Uma mulher de 45 anos procura atendimento na UBS com queixa de poliúria, polidipsia e perda de peso de 6 kg nos últimos 2 meses. Glicemia de jejum = 256 mg/dL confirmada em segunda amostra. Nega cetoacidose prévia. IMC = 27 kg/m².\n\nQual é o tratamento inicial mais adequado para essa paciente?`,
    alternativas: [
      { letra: 'A', texto: 'Metformina 500 mg duas vezes ao dia e orientação dietética.' },
      { letra: 'B', texto: 'Insulina NPH associada à insulina regular conforme esquema basal-bolus.' },
      { letra: 'C', texto: 'Glibenclamida 5 mg/dia associada à metformina 1 g/dia.' },
      { letra: 'D', texto: 'Sitagliptina 100 mg/dia com monitorização ambulatorial.' },
    ],
    gabarito: 'B',
  },
  {
    id: 'q2023-22', ano: 2023, numero: 22, area: 'Saúde Pública',
    enunciado: `Uma equipe da Estratégia Saúde da Família realiza busca ativa de pacientes com tuberculose. Em uma microárea, identifica um homem de 40 anos com tosse produtiva há 4 semanas, perda de peso e sudorese noturna. O teste rápido molecular (TRM-TB) é positivo para Mycobacterium tuberculosis sensível à rifampicina.\n\nQuais são as ações prioritárias da equipe nesse momento?`,
    alternativas: [
      { letra: 'A', texto: 'Notificar o caso, iniciar RIPE e investigar contatos intradomiciliares.' },
      { letra: 'B', texto: 'Encaminhar para pneumologista antes de iniciar tratamento.' },
      { letra: 'C', texto: 'Coletar escarro para cultura e aguardar resultado antes de tratar.' },
      { letra: 'D', texto: 'Iniciar isoniazida profilática e agendar retorno em 30 dias.' },
    ],
    gabarito: 'A',
  },
  {
    id: 'q2023-35', ano: 2023, numero: 35, area: 'Pediatria',
    enunciado: `Uma criança de 3 anos é trazida à UBS com febre há 2 dias (38,5 ºC axilar), coriza, tosse seca e exantema maculopapular que iniciou atrás das orelhas e progrediu para face, tronco e membros. Ao exame: manchas de Koplik na mucosa oral.\n\nQual é o diagnóstico e a conduta correta?`,
    alternativas: [
      { letra: 'A', texto: 'Rubéola; notificação compulsória e isolamento por 7 dias.' },
      { letra: 'B', texto: 'Sarampo; notificação compulsória imediata e investigação de contatos.' },
      { letra: 'C', texto: 'Escarlatina; penicilina benzatina intramuscular.' },
      { letra: 'D', texto: 'Exantema súbito; conduta expectante e antitérmico.' },
    ],
    gabarito: 'B',
  },

  /* 2020 ──────────────────────────────────────────────────────────── */
  {
    id: 'q2020-01', ano: 2020, numero: 1, area: 'G. Obstetrícia',
    enunciado: `Ao atender uma primigesta com 15 anos de idade, trazida à emergência de um hospital geral pela ambulância do SAMU, o plantonista encontra a seguinte situação: idade gestacional de 36 semanas, bolsa rota com líquido claro, 4 contrações uterinas fortes com duração de 40 segundos em 5 minutos de observação, colo dilatado 10 cm, feto em apresentação cefálica com cabeça já visível.\n\nQual deve ser a conduta imediata?`,
    alternativas: [
      { letra: 'A', texto: 'Conduzir a gestante de maca até o Centro Obstétrico para parto assistido.' },
      { letra: 'B', texto: 'Realizar cesariana de urgência, mesmo sem o consentimento da paciente.' },
      { letra: 'C', texto: 'Requisitar fórcipe de alívio e finalizar o parto na própria emergência.' },
      { letra: 'D', texto: 'Assistir ao parto na própria maca, com atenção ao polo cefálico.' },
    ],
    gabarito: 'D',
  },
  {
    id: 'q2020-07', ano: 2020, numero: 7, area: 'Clínica Médica',
    enunciado: `Um homem com 19 anos de idade, motorista de aplicativo, procura a Unidade de Saúde da Família por tristeza e insônia há uma semana, desde que sua mãe faleceu por acidente ciclístico. O pai faleceu em um acidente de moto há 5 anos. Relata que tem estado muito preocupado com o futuro, pois agora está morando apenas com sua irmã de 15 anos. Nega pensamentos de morte ou suicídio. Ao exame: orientado, coerente, sem alterações psicomotoras. O médico informa que o paciente está utilizando um benzodiazepínico que lhe foi prescrito por um familiar.\n\nQual é a conduta mais adequada?`,
    alternativas: [
      { letra: 'A', texto: 'Suspender benzodiazepínico e encaminhar ao psiquiatra.' },
      { letra: 'B', texto: 'Manter o uso da medicação e orientar o paciente a fazer a redução gradual.' },
      { letra: 'C', texto: 'Oferecer escuta ativa, técnicas de higiene do sono e terapia cognitivo-comportamental.' },
      { letra: 'D', texto: 'Trocar por um benzodiazepínico em gotas para facilitar a redução gradual da medicação.' },
    ],
    gabarito: 'C',
  },
  {
    id: 'q2020-08', ano: 2020, numero: 8, area: 'Cirurgia',
    enunciado: `Um paciente com 54 anos de idade procurou a Unidade Básica de Saúde para atendimento. O homem relatou que, há um ano, apresentou abscesso na região perineal que foi drenado em pronto-socorro. Desde então, apresentou uma ferida próxima ao ânus, que ocasionalmente inflama e apresenta saída de secreção turva, com odor fecaloide. Ao exame físico: orifício externo a 3 cm da margem anal com saída de secreção purulenta, sem outras alterações.\n\nQual é o diagnóstico e a conduta mais adequada?`,
    alternativas: [
      { letra: 'A', texto: 'Abscesso perianal e drenagem cirúrgica.' },
      { letra: 'B', texto: 'Fissura anal aguda e uso de anti-inflamatórios tópicos.' },
      { letra: 'C', texto: 'Fístula perianal e encaminhamento para tratamento cirúrgico eletivo.' },
      { letra: 'D', texto: 'Fissura anal crônica e encaminhamento para tratamento cirúrgico eletivo.' },
    ],
    gabarito: 'C',
  },
  {
    id: 'q2020-19', ano: 2020, numero: 19, area: 'G. Obstetrícia',
    enunciado: `Uma gestante com 18 anos de idade e 32 semanas de gestação realizou tratamento com penicilina benzatina para sífilis no final do primeiro trimestre. Desde então, não compareceu às consultas de pré-natal. Retorna com resultado de exames mostrando VDRL com aumento de titulação em relação ao exame anterior (de 1:4 para 1:16), sem sinais ou sintomas clínicos.\n\nQual é a conduta mais adequada?`,
    alternativas: [
      { letra: 'A', texto: 'Repetir o VDRL e adotar conduta expectante.' },
      { letra: 'B', texto: 'Instituir novo tratamento com doxiciclina oral.' },
      { letra: 'C', texto: 'Repetir o tratamento com penicilina benzatina.' },
      { letra: 'D', texto: 'Encaminhar ao serviço de pré-natal de alto risco sem tratar.' },
    ],
    gabarito: 'C',
  },
  {
    id: 'q2020-20', ano: 2020, numero: 20, area: 'Pediatria',
    enunciado: `Uma criança com 3 anos de idade é levada ao pronto-socorro com história de deglutição de uma pilha de botão, que a mãe percebeu ter caído no chão cerca de 20 minutos antes. A criança está assintomática, chorosa, sem dificuldade para deglutir. A radiografia de tórax mostra imagem circular hiperdensa em região de esôfago proximal, na altura de C6.\n\nQual é a conduta mais adequada?`,
    alternativas: [
      { letra: 'A', texto: 'Observação domiciliar e retorno em 24 horas para repetir a radiografia.' },
      { letra: 'B', texto: 'Induzir vômito com xarope de ipeca e aguardar eliminação espontânea.' },
      { letra: 'C', texto: 'Endoscopia digestiva alta de urgência para remoção imediata.' },
      { letra: 'D', texto: 'Aguardar passagem espontânea para o estômago em 48 horas.' },
    ],
    gabarito: 'C',
  },

  /* 2017 ──────────────────────────────────────────────────────────── */
  {
    id: 'q2017-07', ano: 2017, numero: 7, area: 'Clínica Médica',
    enunciado: `Uma mulher com 42 anos de idade procura atendimento médico na Unidade Básica de Saúde com queixa de cansaço há 4 meses. Nega outros sintomas. É portadora de hipotireoidismo em tratamento com levotiroxina 75 mcg/dia há 2 anos. Ao exame físico, a paciente apresenta-se corada, hidratada, sem edemas, com PA = 120 × 80 mmHg e FC = 78 bpm. TSH = 6,8 mUI/L (referência: 0,4–4,0 mUI/L); T4 livre = 1,0 ng/dL (referência: 0,7–1,8 ng/dL).\n\nQual é a conduta mais adequada?`,
    alternativas: [
      { letra: 'A', texto: 'Aumentar a dose de levotiroxina e solicitar novo TSH em 6 semanas.' },
      { letra: 'B', texto: 'Manter a dose atual e repetir TSH em 6 meses.' },
      { letra: 'C', texto: 'Suspender a levotiroxina e investigar causa do TSH elevado.' },
      { letra: 'D', texto: 'Acrescentar T3 (liotironina) ao esquema atual.' },
    ],
    gabarito: 'A',
  },
  {
    id: 'q2017-19', ano: 2017, numero: 19, area: 'Cirurgia',
    enunciado: `Um homem com 70 anos de idade é atendido na emergência com dor abdominal intensa de início súbito há 2 horas, irradiando para região lombar. Hipertenso em uso de losartana. Ao exame físico: PA = 90 × 60 mmHg, FC = 118 bpm, abdome tenso com massa pulsátil palpável em região periumbilical. Radiografia simples de abdome sem pneumoperitônio.\n\nQual é a hipótese diagnóstica e a conduta imediata?`,
    alternativas: [
      { letra: 'A', texto: 'Infarto agudo do miocárdio; ECG e troponina imediatos.' },
      { letra: 'B', texto: 'Aneurisma de aorta abdominal roto; cirurgia de emergência.' },
      { letra: 'C', texto: 'Cólica renal; hidratação vigorosa e anti-inflamatório.' },
      { letra: 'D', texto: 'Íleo paralítico; sondagem nasogástrica e hidratação venosa.' },
    ],
    gabarito: 'B',
  },
  {
    id: 'q2017-27', ano: 2017, numero: 27, area: 'G. Obstetrícia',
    enunciado: `Uma gestante com 34 semanas comparece à UBS com queixa de cefaleia intensa, epigastralgia e edema de face e mãos. Ao exame: PA = 165 × 110 mmHg (confirmada), reflexos patelares exaltados, proteinúria +++ na fita urinária.\n\nQual é o diagnóstico e a conduta imediata?`,
    alternativas: [
      { letra: 'A', texto: 'Hipertensão gestacional; anti-hipertensivo oral e repouso domiciliar.' },
      { letra: 'B', texto: 'Pré-eclâmpsia grave; internação, sulfato de magnésio e anti-hipertensivo parenteral.' },
      { letra: 'C', texto: 'Eclâmpsia; fenobarbital intramuscular e transferência para maternidade.' },
      { letra: 'D', texto: 'Síndrome HELLP; coleta de exames e liberação para casa com retorno em 24 horas.' },
    ],
    gabarito: 'B',
  },
  {
    id: 'q2017-66', ano: 2017, numero: 66, area: 'Clínica Médica',
    enunciado: `Um homem com 58 anos de idade, tabagista (40 maços-ano), é atendido na UBS com queixa de tosse crônica produtiva e dispneia aos moderados esforços há 2 anos, com piora progressiva. Ao exame: murmúrio vesicular reduzido globalmente, expiração prolongada e sibilância difusa. Espirometria mostra VEF₁/CVF = 0,62 e VEF₁ = 58% do previsto após broncodilatador.\n\nQual é o diagnóstico e o tratamento de manutenção indicado?`,
    alternativas: [
      { letra: 'A', texto: 'DPOC moderado (GOLD B); LABA + LAMA inalatórios.' },
      { letra: 'B', texto: 'Asma persistente moderada; corticoide inalatório em altas doses.' },
      { letra: 'C', texto: 'DPOC leve (GOLD A); broncodilatador de ação curta conforme necessidade.' },
      { letra: 'D', texto: 'Bronquiectasia; fisioterapia respiratória e antibioticoterapia profilática.' },
    ],
    gabarito: 'A',
  },

  /* 2015 ──────────────────────────────────────────────────────────── */
  {
    id: 'q2015-08', ano: 2015, numero: 8, area: 'Clínica Médica',
    enunciado: `Uma mulher com 50 anos de idade procura atendimento médico na Unidade Básica de Saúde, com queixa de astenia progressiva há 3 meses. Nega outros sintomas e afirma não fazer uso de qualquer medicação. Está na menopausa há 2 anos, sem sangramento transvaginal. No exame físico, o único achado é palidez com mucosas hipocoradas (++/4+). Hemograma: Hb = 9 g/dL, VCM = 65 fL, HCM = 20 pg, RDW = 19%; leucograma e plaquetas normais.\n\nQual é a conduta inicial para complementação da investigação diagnóstica?`,
    alternativas: [
      { letra: 'A', texto: 'Mielograma.' },
      { letra: 'B', texto: 'Dosagem de ácido fólico.' },
      { letra: 'C', texto: 'Dosagem de vitamina B12.' },
      { letra: 'D', texto: 'Pesquisa de sangue oculto nas fezes.' },
    ],
    gabarito: 'D',
  },
  {
    id: 'q2015-29', ano: 2015, numero: 29, area: 'Pediatria',
    enunciado: `Uma criança com 8 anos de idade é trazida ao pronto-socorro com quadro de dificuldade respiratória de início súbito, durante brincadeira. Mãe refere ausência de febre e nega infecções respiratórias recentes. Ao exame: criança agitada, taquidispneica (FR = 42 rpm), MV abolido em hemitórax direito, sem desvio de traqueia. SpO₂ = 91% em ar ambiente.\n\nQual é a hipótese diagnóstica mais provável e a conduta imediata?`,
    alternativas: [
      { letra: 'A', texto: 'Pneumonia lobar; oxigenoterapia e antibioticoterapia empírica.' },
      { letra: 'B', texto: 'Pneumotórax espontâneo; toracocentese de alívio imediata.' },
      { letra: 'C', texto: 'Corpo estranho em brônquio direito; broncoscopia rígida.' },
      { letra: 'D', texto: 'Asma aguda grave; nebulização com salbutamol e corticoide.' },
    ],
    gabarito: 'C',
  },
  {
    id: 'q2015-31', ano: 2015, numero: 31, area: 'Clínica Médica',
    enunciado: `Um homem com 45 anos de idade é atendido em UBS com queixa de dor em queimação no epigástrio, que piora após as refeições e à noite, com melhora após uso de antiácidos. Nega sangramento digestivo. Faz uso regular de anti-inflamatórios não esteroidais (AINEs) há 3 meses por lombalgia crônica. Exame físico sem alterações, exceto leve dor à palpação do epigástrio.\n\nQual é a conduta mais adequada?`,
    alternativas: [
      { letra: 'A', texto: 'Solicitar endoscopia digestiva alta imediata e internação.' },
      { letra: 'B', texto: 'Suspender o AINE, testar para H. pylori e iniciar inibidor de bomba de prótons.' },
      { letra: 'C', texto: 'Prescrever misoprostol profilático e manter o AINE atual.' },
      { letra: 'D', texto: 'Indicar ranitidina conforme necessidade e manter o esquema analgésico.' },
    ],
    gabarito: 'B',
  },
  {
    id: 'q2015-39', ano: 2015, numero: 39, area: 'Pediatria',
    enunciado: `Uma criança com 2 anos de idade é levada ao pronto-socorro com histórico de febre (39 ºC) há 2 dias, recusa alimentar e surgimento de pequenas úlceras na mucosa oral, palato e língua, além de vesículas nas palmas das mãos, plantas dos pés e nádegas. A mãe refere que o filho frequenta creche e que outras crianças estão com sintomas semelhantes.\n\nQual é o diagnóstico mais provável e a conduta correta?`,
    alternativas: [
      { letra: 'A', texto: 'Gengivoestomatite herpética; aciclovir oral e isolamento domiciliar.' },
      { letra: 'B', texto: 'Doença mão-pé-boca; medidas de suporte e notificação ao serviço de saúde.' },
      { letra: 'C', texto: 'Varicela; aciclovir oral e afastamento escolar por 7 dias.' },
      { letra: 'D', texto: 'Síndrome de Stevens-Johnson; internação e corticoide sistêmico.' },
    ],
    gabarito: 'B',
  },
];

/* ─── Constantes ────────────────────────────────────────────────────────── */
const ANOS    = [...new Set(QUESTOES_INEP.map(q => q.ano))].sort((a,b) => b - a);
const AREAS   = [...new Set(QUESTOES_INEP.map(q => q.area))].sort();

const RX_STATES = [
  { code: 'CC', color: 'var(--success-500)', label: 'Certo · convicção' },
  { code: 'CD', color: 'var(--teal-500)',    label: 'Certo · dúvida'    },
  { code: 'EC', color: 'var(--danger-500)',  label: 'Errado · convicção'},
  { code: 'ED', color: 'var(--warn-500)',    label: 'Errado · dúvida'   },
];

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const areaColor = a => ({
  'Cardiologia': 'navy', 'Pediatria': 'teal', 'G. Obstetrícia': 'info',
  'Cirurgia': 'warn', 'Saúde Pública': 'success', 'Clínica Médica': 'slate',
}[a] || 'slate');

/* ─── RxButton ──────────────────────────────────────────────────────────── */
const RxButton = ({ code, color, active, onClick }) => (
  <button onClick={onClick} style={{
    fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 600,
    letterSpacing: '0.04em', padding: '5px 9px', borderRadius: 6,
    border: '1px solid ' + (active ? color : 'transparent'),
    background: active ? color : 'var(--slate-100)',
    color: active ? '#fff' : 'var(--slate-600)',
    cursor: 'pointer', transition: 'all 140ms',
  }}>{code}</button>
);

/* ─── QuestionView ──────────────────────────────────────────────────────── */
const QuestionView = ({ q, onBack, idx, total, onPrev, onNext }) => {
  const [picks, setPicks] = useStateProvas({});
  const [revealed, setRevealed] = useStateProvas(false);

  const toggle = (letra, code) =>
    setPicks(p => ({ ...p, [letra]: p[letra] === code ? null : code }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 296px', gap: 18, maxWidth: 1200 }}>
      {/* ── coluna esquerda ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* topbar */}
        <Card padding={14} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
            borderRadius: 6, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            <span style={{ fontSize: 12.5 }}>Voltar</span>
          </button>
          <div style={{ width: 1, height: 18, background: 'var(--border-1)' }}/>
          <Tag color={areaColor(q.area)}>{q.area}</Tag>
          <Tag color="navy">INEP · {q.ano}</Tag>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)' }}>
            Q-{q.ano}-{String(q.numero).padStart(3,'0')}
          </span>
          <div style={{ flex: 1 }}/>
          <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>
            <b style={{ color: 'var(--fg-1)' }}>{idx+1}</b> de {total}
          </span>
          <button onClick={onPrev} disabled={idx===0} style={{
            background:'none',border:'none',cursor:idx===0?'not-allowed':'pointer',
            padding:'4px',color:idx===0?'var(--fg-4)':'var(--fg-2)',borderRadius:5,
            display:'flex',alignItems:'center'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button onClick={onNext} disabled={idx===total-1} style={{
            background:'none',border:'none',cursor:idx===total-1?'not-allowed':'pointer',
            padding:'4px',color:idx===total-1?'var(--fg-4)':'var(--fg-2)',borderRadius:5,
            display:'flex',alignItems:'center'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m9 6 6 6-6 6"/></svg>
          </button>
        </Card>

        {/* enunciado */}
        <Card padding={26} style={{ background: 'var(--ivory)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal-700)',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Caso clínico · Prova INEP {q.ano}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 16.5,
            lineHeight: 1.7, color: 'var(--navy-900)', fontVariationSettings: '"opsz" 14',
            whiteSpace: 'pre-line', maxWidth: '68ch' }}>
            {q.enunciado}
          </div>
        </Card>

        {/* alternativas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {q.alternativas.map(a => {
            const pick = picks[a.letra];
            const rx = pick ? RX_STATES.find(s => s.code === pick) : null;
            const isGabarito = revealed && a.letra === q.gabarito;
            return (
              <Card key={a.letra} padding={14} style={{
                borderColor: isGabarito ? 'var(--success-500)' : (rx ? rx.color : 'var(--border-1)'),
                boxShadow: isGabarito
                  ? '0 0 0 2px var(--success-200)'
                  : (rx ? `0 0 0 1px ${rx.color}` : 'var(--shadow-xs)'),
                background: isGabarito ? 'var(--success-50)' : 'var(--bg-surface)',
                transition: 'all 160ms',
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9999, flexShrink: 0,
                    background: isGabarito ? 'var(--success-500)' : (rx ? rx.color : 'var(--slate-100)'),
                    color: (isGabarito || rx) ? '#fff' : 'var(--slate-700)',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 160ms',
                  }}>{a.letra}</div>
                  <div style={{ flex: 1, fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.55, paddingTop: 4 }}>
                    {a.texto}
                  </div>
                  <div style={{ display: 'flex', gap: 4, paddingTop: 2 }}>
                    {RX_STATES.map(s => (
                      <RxButton key={s.code} code={s.code} color={s.color}
                        active={picks[a.letra] === s.code}
                        onClick={() => toggle(a.letra, s.code)} />
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* footer */}
        <Card padding={14} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button variant="ghost" size="sm" onClick={() => { setPicks({}); setRevealed(false); }}>
            Limpar marcação
          </Button>
          <div style={{ flex: 1 }}/>
          {!revealed ? (
            <Button variant="secondary" size="sm" iconLeft="eyeOff" onClick={() => setRevealed(true)}>
              Ver gabarito
            </Button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
              color: 'var(--success-700)', fontWeight: 600 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round"><path d="m5 12 5 5 9-11"/></svg>
              Gabarito: {q.gabarito}
            </div>
          )}
          <Button variant="primary" size="sm" iconRight="arrowRight" onClick={onNext}
            style={idx===total-1?{opacity:0.5,pointerEvents:'none'}:{}}>
            Próxima
          </Button>
        </Card>
      </div>

      {/* ── coluna direita ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* legenda raio-x */}
        <Card padding={18}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Matriz Raio-X
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {RX_STATES.map(s => (
              <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                  padding: '3px 7px', borderRadius: 5, background: s.color, color: '#fff',
                  minWidth: 28, textAlign: 'center' }}>{s.code}</span>
                <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{s.label}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.5, margin: '12px 0 0' }}>
            Marque cada alternativa para alimentar o mapeamento de convicção.
          </p>
        </Card>

        {/* resumo da questão */}
        <Card padding={18}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            Informações
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Banca', 'INEP'],
              ['Ano', String(q.ano)],
              ['Questão', String(q.numero).padStart(2,'0')],
              ['Área', q.area],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: 12.5, borderBottom: '1px solid var(--border-1)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--fg-4)' }}>{k}</span>
                <span style={{ color: 'var(--fg-1)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* dica */}
        <Card padding={18} style={{
          background: 'linear-gradient(180deg, var(--teal-50), #fff 75%)',
          borderColor: 'var(--teal-200)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11,
            fontWeight: 600, color: 'var(--teal-700)', letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: 8 }}>
            <Icon name="sparkles" size={13}/>Dica INEP
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55 }}>
            Leia o enunciado com atenção ao <b>contexto do SUS</b> e ao nível de atenção.
            O INEP frequentemente apresenta casos reais da Atenção Primária à Saúde.
          </p>
        </Card>
      </div>
    </div>
  );
};

/* ─── QuestionCard ──────────────────────────────────────────────────────── */
const QuestionCard = ({ q, idx, onClick }) => (
  <Card padding={16} style={{ cursor: 'pointer', transition: 'box-shadow 140ms' }}
    onClick={onClick}
    onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
    onMouseOut={e => e.currentTarget.style.boxShadow = 'var(--shadow-xs)'}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
        color: 'var(--teal-700)' }}>Q{String(idx+1).padStart(2,'0')}</span>
      <Tag color={areaColor(q.area)}>{q.area}</Tag>
      <Tag color="navy">INEP · {q.ano}</Tag>
      <div style={{ flex: 1 }}/>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-4)' }}>
        #{q.numero.toString().padStart(3,'0')}
      </span>
    </div>
    <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-1)', lineHeight: 1.55,
      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
      {q.enunciado.replace(/\n/g, ' ')}
    </p>
    <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
      {q.alternativas.map(a => (
        <span key={a.letra} style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
          padding: '2px 7px', borderRadius: 4,
          background: 'var(--slate-100)', color: 'var(--slate-600)',
        }}>{a.letra}</span>
      ))}
      <div style={{ flex: 1 }}/>
      <span style={{ fontSize: 12, color: 'var(--teal-600)', fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 4 }}>
        Responder
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </span>
    </div>
  </Card>
);

/* ─── Provas (main) ─────────────────────────────────────────────────────── */
const Provas = () => {
  const [anoFiltro,  setAnoFiltro]  = useStateProvas('todos');
  const [areaFiltro, setAreaFiltro] = useStateProvas('todas');
  const [selected,   setSelected]   = useStateProvas(null); // índice na lista filtrada

  const filtered = useMemoProvas(() => {
    let r = QUESTOES_INEP;
    if (anoFiltro !== 'todos') r = r.filter(q => q.ano === Number(anoFiltro));
    if (areaFiltro !== 'todas') r = r.filter(q => q.area === areaFiltro);
    return r;
  }, [anoFiltro, areaFiltro]);

  /* ─ questão aberta ─ */
  if (selected !== null) {
    const q = filtered[selected];
    return (
      <QuestionView
        q={q}
        idx={selected}
        total={filtered.length}
        onBack={() => setSelected(null)}
        onPrev={() => setSelected(i => Math.max(0, i - 1))}
        onNext={() => setSelected(i => Math.min(filtered.length - 1, i + 1))}
      />
    );
  }

  /* ─ lista ─ */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-3)',
            letterSpacing: '0.08em', textTransform: 'uppercase' }}>Banco de Provas</div>
          <h2 style={{ margin: '6px 0 4px' }}>Questões INEP · Revalida</h2>
          <p style={{ margin: 0, color: 'var(--fg-3)', fontSize: 14 }}>
            Questões objetivas das provas oficiais. Marque com o Raio-X para mapear sua convicção.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Tag color="teal" mono>{filtered.length} questões</Tag>
          <Tag color="navy">INEP · {ANOS[0]}–{ANOS[ANOS.length-1]}</Tag>
        </div>
      </div>

      {/* filtros */}
      <Card padding={14}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-3)',
            letterSpacing: '0.06em', textTransform: 'uppercase' }}>Filtrar por</span>

          {/* ano */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['todos', ...ANOS.map(String)].map(a => (
              <button key={a} onClick={() => setAnoFiltro(a)} style={{
                fontSize: 12.5, fontWeight: 500, padding: '5px 11px', borderRadius: 7,
                border: '1px solid ' + (anoFiltro === a ? 'var(--navy-500)' : 'var(--border-2)'),
                background: anoFiltro === a ? 'var(--navy-800)' : '#fff',
                color: anoFiltro === a ? '#fff' : 'var(--fg-2)',
                cursor: 'pointer', transition: 'all 120ms',
              }}>{a === 'todos' ? 'Todos os anos' : a}</button>
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--border-1)' }}/>

          {/* área */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['todas', ...AREAS].map(a => (
              <button key={a} onClick={() => setAreaFiltro(a)} style={{
                fontSize: 12, fontWeight: 500, padding: '5px 11px', borderRadius: 7,
                border: '1px solid ' + (areaFiltro === a ? 'var(--teal-500)' : 'var(--border-2)'),
                background: areaFiltro === a ? 'var(--teal-500)' : '#fff',
                color: areaFiltro === a ? '#fff' : 'var(--fg-2)',
                cursor: 'pointer', transition: 'all 120ms',
              }}>{a === 'todas' ? 'Todas as áreas' : a}</button>
            ))}
          </div>
        </div>
      </Card>

      {/* lista */}
      {filtered.length === 0 ? (
        <Card padding={36} style={{ textAlign: 'center', color: 'var(--fg-3)' }}>
          <Icon name="search" size={32} style={{ color: 'var(--fg-4)', marginBottom: 12 }}/>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--fg-2)' }}>Nenhuma questão encontrada</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Ajuste os filtros para ver mais questões.</div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: 12 }}>
          {filtered.map((q, i) => (
            <QuestionCard key={q.id} q={q} idx={i} onClick={() => setSelected(i)} />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="primary" iconRight="arrowRight" onClick={() => setSelected(0)}>
            Iniciar sequência — {filtered.length} questões
          </Button>
        </div>
      )}
    </div>
  );
};

window.Provas = Provas;
