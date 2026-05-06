/* global React, Card, Tag, Button, Icon */
const { useState: useStateProvas, useMemo: useMemoProvas } = React;

/* ─── Questões extraídas das provas INEP/REVALIDA ─────────────────────── */
const QUESTOES_INEP = [
  { id: 'q2025-003', ano: 2025, numero: 3, area: 'Cardiologia',
    gabarito: 'A',
    enunciado: `Homem de 62 anos vai a uma unidade de pronto atendimento
(UPA) referindo cansaço e tontura ao se levantar há 2 semanas.
Nega outras queixas, comorbidades ou cirurgias prévias, assim
como o uso de medicamentos. Ao exame físico, apresenta-se
corado, hidratado, lúcido e orientado em tempo e espaço;
pressão arterial de 120 x 70 mmHg; frequência cardíaca de
45 bpm; saturação de O 2 de 96% em ar ambiente; ritmo
cardíaco regular, sem turgência jugular; murmúrio vesicular
fisiológico, sem ruídos acessórios; e enchimento capilar de
2 segundos.
Diante disso, o médico solicita um eletrocardiograma de
12 derivações:
Menina de 7 anos e 6 meses é encaminhada ao ambulatório de
pediatria porque sua família percebeu surgimento de broto
mamário há cerca de 3 meses. O exame físico revela que seu
estadiamento puberal é M2P1 e sua estatura está próxima ao
escore Z +2 para a idade, com peso em escore Z 0. Um exame
de radiografia simples de punho, solicitado pelo médico da
atenção primária, mostra idade óssea compatível com 9 anos e
6 meses.
Considerando essa situação, assinale a alternativa que
apresenta a principal hipótese diagnóstica, seguida de sua
justificativa.`,
    alternativas: [
    { letra: 'A', texto: 'Puberdade precoce central, pois o crescimento das mamas' },
    { letra: 'B', texto: 'Telarca isolada precoce, pois a diferença entre a idade' },
    { letra: 'C', texto: 'Telarca isolada precoce, pois o crescimento das mamas foi' },
    { letra: 'D', texto: 'Puberdade precoce central, pois, além da telarca, há' }
    ],
  },
  { id: 'q2025-006', ano: 2025, numero: 6, area: 'Clínica Médica',
    gabarito: 'C',
    enunciado: `apresentou vômitos de conteúdo bilioso e inapetência.
Ao exame físico abdominal, apresenta defesa à palpação e
Mulher de 38 anos, com deficiência congênita de IgA, é
descompressão brusca dolorosa.
atendida em ambulatório de clínica médica devido a insucesso`,
    alternativas: [
    { letra: 'A', texto: 'partir desse caso, assinale a alternativa que apresenta' },
    { letra: 'B', texto: 'Descompressão brusca dolorosa.' },
    { letra: 'C', texto: 'Dor abdominal associada a vômitos.' },
    { letra: 'D', texto: 'Massa palpável em fossa ilíaca direita.' }
    ],
  },
  { id: 'q2025-013', ano: 2025, numero: 13, area: 'G. Obstetrícia',
    gabarito: 'D',
    enunciado: `Paciente de 25 anos, com duas gestações e um parto, no
segundo trimestre de gestação, compareceu à primeira consulta
de pré-natal sem queixas. Após orientações e realização dos
testes rápidos, verificou-se que o teste para sífilis foi positivo e
imediatamente a paciente recebeu 2,4 milhões UI de penicilina
benzatina intramuscular. Paciente nega diagnóstico e tratamento
prévios para sífilis.`,
    alternativas: [
    { letra: 'A', texto: 'médica da UBS suspeita de intoxicação aguda por agrotóxicos.' },
    { letra: 'B', texto: 'titulações menores ou iguais a um quarto indicarão cicatriz' },
    { letra: 'C', texto: 'a queda de duas titulações do VDRL indicará efetividade de' },
    { letra: 'D', texto: 'o exame de FTA-Abs reagente indicará doença ativa.' }
    ],
  },
  { id: 'q2025-015', ano: 2025, numero: 15, area: 'Clínica Médica',
    gabarito: 'B',
    enunciado: `Homem de 39 anos, sem comorbidades e em bom estado de
saúde, encontra-se em preparação pré-operatória eletiva de
colecistectomia que será realizada por via laparoscópica.
Durante consulta com o médico que o acompanha, o paciente
manifesta preocupação sobre o que pode ingerir e por quanto
tempo deve permanecer em jejum antes do procedimento.`,
    alternativas: [
    { letra: 'A', texto: 'professora da criança procurou a equipe preocupada com a' },
    { letra: 'B', texto: '6 a 8 horas e de líquidos claros por 2 horas.' },
    { letra: 'C', texto: '4 a 6 horas e de bebida proteica por 1 hora.' },
    { letra: 'D', texto: '10 horas e de pequenos volumes de água por 4 horas.' }
    ],
  },
  { id: 'q2025-017', ano: 2025, numero: 17, area: 'Cardiologia',
    gabarito: 'D',
    enunciado: `Homem de 50 anos, queixando-se de astenia e constipação
com fezes em fita. Há 15 dias, apresenta edema de membros
inferiores até a raiz da região crural, bilateralmente, com pouca
melhora à elevação dos membros. Ele perdeu 10 kg em 6
meses. Nega hipertensão arterial e diabetes mellitus e não faz
uso de medicamento. Os exames do paciente apresentaram os
seguintes resultados:`,
    alternativas: [
    { letra: 'A', texto: 'muro”, sem cinto de segurança, é atendido ainda na cena pelo' },
    { letra: 'B', texto: 'Cricotireoidostomia.' },
    { letra: 'C', texto: 'Pericardiocentese.' },
    { letra: 'D', texto: 'Toracocentese.' }
    ],
  },
  { id: 'q2025-018', ano: 2025, numero: 18, area: 'Clínica Médica',
    gabarito: 'A',
    enunciado: `Creatinina
1,2 mg/dL
0,7 a 1,3 mg/dL`,
    alternativas: [
    { letra: 'A', texto: 'principal hipótese diagnóstica dessa paciente é' },
    { letra: 'B', texto: 'malformação Mulleriana.' },
    { letra: 'C', texto: 'obstrução do trato genital.' },
    { letra: 'D', texto: 'insensibilidade androgênica.' }
    ],
  },
  { id: 'q2025-021', ano: 2025, numero: 21, area: 'Pneumologia',
    gabarito: 'B',
    enunciado: `Homem de 55 anos procura atendimento em unidade básica
de saúde (UBS) para renovar prescrição de losartana. Durante a
consulta, relata dispneia aos esforços físicos moderados. Além
disso, refere tosse pouco produtiva há alguns anos, o que
atribui ao uso de 20 cigarros por dia há 20 anos. Radiografia do
tórax revela alargamento dos espaços intercostais, sem outras
alterações. Espirometria apresenta os seguintes resultados:`,
    alternativas: [
    { letra: 'A', texto: 'partir do exposto, assinale a alternativa que relaciona' },
    { letra: 'B', texto: 'Rash macular com úlceras, plaquetopenia e alteração' },
    { letra: 'C', texto: 'Rinite serossanguinolenta, pseudoparalisia de Parrot,' },
    { letra: 'D', texto: 'Catarata, persistência do canal arterial ou estenose' }
    ],
  },
  { id: 'q2025-022', ano: 2025, numero: 22, area: 'Psiquiatria',
    gabarito: 'A',
    enunciado: `Um casal consulta com o médico de família e comunidade
devido à preocupação da esposa com marido, que tem
demonstrado compulsividade relacionada ao consumo de
pornografia. Isso tem gerado discussões constantes entre eles,
pois o homem é motorista por aplicativo e está deixando de
trabalhar devido a este padrão de comportamento — o que
tem impactado na situação financeira da família, que já é difícil.
Ele relata que a prática começou como distração e alívio do
estresse, mas admite que tem dificuldades para controlar esses
comportamentos e reconhece as consequências que isso tem
gerado para seu contexto familiar. Durante a consulta, o
médico identifica sinais de baixa autoestima e de ansiedade
nesse paciente.
Homem de 40 anos é levado a uma unidade de pronto
atendimento após sofrer um acidente de trabalho enquanto
utilizava uma máquina de esmerilhamento. Ele relata que um
fragmento metálico de alta velocidade ultrapassou a proteção
de seus óculos e atingiu seu olho direito. O paciente apresenta
dor intensa no olho afetado, com perda parcial da visão e
sensação de corpo estranho. O exame físico revela laceração
na conjuntiva bulbar com extravasamento espontâneo de
pequena quantidade de conteúdo gelatinoso pelo olho direito.
Nesse momento, antes de encaminhar o paciente para o
especialista, qual é a conduta adequada para o caso?`,
    alternativas: [
    { letra: 'A', texto: 'Irrigar o olho afetado com solução salina estéril, fazer' },
    { letra: 'B', texto: 'Colocar escudo rígido sobre o olho afetado, iniciar' },
    { letra: 'C', texto: 'Aplicar colírio corticoide no olho afetado, colocar escudo' },
    { letra: 'D', texto: 'Aplicar colírio antibiótico no olho afetado, realizar curativo' }
    ],
  },
  { id: 'q2025-025', ano: 2025, numero: 25, area: 'Cardiologia',
    gabarito: 'D',
    enunciado: `Mulher, G2P1 (parto vaginal), é conduzida ao serviço de
Os povos ciganos/Romani que vivem no Brasil possuem um
estilo de vida não homogêneo, com uma cultura muitas vezes
urgência obstétrica por estar desacordada, após ter
divergente. Portanto, é essencial que gestores e profissionais
apresentado dor abdominal súbita e desmaio em casa. Está
da saúde se aproximem dessa população e conheçam suas
com 35 semanas de gestação e é hipertensa crônica em uso de
questões específicas.
metildopa e nifedipina. Está inconsciente, apresenta tônus
Nesse contexto, ao se fazer o planejamento de ações de saúde
uterino aumentado, com batimento cardíaco fetal de 50 bpm,
para essa população, é importante considerar que
colo uterino fechado e com moderado sangramento escuro por`,
    alternativas: [
    { letra: 'A', texto: 'as questões de saúde são conduzidas por homens na' },
    { letra: 'B', texto: 'a depressão e o suicídio são problemas de saúde nas' },
    { letra: 'C', texto: 'as mulheres são as lideranças mais respeitadas por toda a' },
    { letra: 'D', texto: 'os povos ciganos/Romani optam, em sua grande maioria, por' }
    ],
  },
  { id: 'q2025-027', ano: 2025, numero: 27, area: 'Cardiologia',
    gabarito: 'A',
    enunciado: `Paciente do sexo masculino, 18 anos, chega ao pronto
Primigesta de 24 anos chega à maternidade com queixa de
cefaleia, febre e dores articulares leves há 5 dias. Relata que
ontem houve piora da febre e surgimento de manchas pelo
corpo, o que a fez procurar a emergência. O obstetra verifica o
cartão do pré-natal e constata que ela está com 22 semanas de
gestação e já realizou 3 consultas na unidade básica de saúde
(UBS), sempre com sinais vitais normais e exames laboratoriais
sem alterações. Ao exame físico, a paciente apresenta-se em
bom estado geral, lúcida e orientada. Durante a análise clínica,
foram obtidos os seguintes resultados:
atendimento com dor abdominal em mesogástrio e epigástrio,
de início insidioso e caráter progressivo, associada a náuseas e
hiporexia. A evolução do quadro tem cerca de 24 horas. Ao
exame físico, a dor abdominal é exacerbada pela tosse, há
discreta diferença de temperatura entre a região axilar e a retal
(+1,2 °C), além de dor à palpação profunda em região inferior
direita do abdome. Exames laboratoriais mostram leucócitos
14.000/mm³ com 80% de neutrófilos, além de sumário de
Exame
Resultado
urina com 6 piócitos/campo.
Pressão arterial
90 x 70 mmHg
Com base no quadro clínico e laboratorial, qual achado clínico
complementa o diagnóstico mais provável?
Frequência cardíaca
82 bpm`,
    alternativas: [
    { letra: 'A', texto: 'Dor à punho-percussão na região lombar à direita.' },
    { letra: 'B', texto: 'Crepitação na parede abdominal associada à presença de' },
    { letra: 'C', texto: 'Dor à palpação no hipocôndrio direito durante inspiração' },
    { letra: 'D', texto: 'Dor à descompressão entre a espinha ilíaca ântero-' }
    ],
  },
  { id: 'q2025-029', ano: 2025, numero: 29, area: 'Clínica Médica',
    gabarito: 'B',
    enunciado: `Mulher de 72 anos foi atendida em hospital de médio porte.
Relatava emagrecimento e dor abdominal com irradiação para
região dorsal há 3 meses; há 1 mês a urina ficou mais escura,
começou a apresentar prurido cutâneo intenso e icterícia
em escleras. Ao exame físico, encontrava-se ictérica +++/4+,
emagrecida; exame do abdome com fígado palpável abaixo da
borda costal direita, assim como uma massa bem definida, de
consistência cística, não dolorosa em hipocôndrio direito.
Nesse caso, o mais adequado é solicitar`,
    alternativas: [
    { letra: 'A', texto: 'apresentar extensão de isquemia superior a 1/3 do' },
    { letra: 'B', texto: 'tomografia computadorizada para avaliar vias biliares e' },
    { letra: 'C', texto: 'colangiopancreatografia por ressonância para avaliar' },
    { letra: 'D', texto: 'biópsia percutânea com agulha da massa palpada para' }
    ],
  },
  { id: 'q2025-043', ano: 2025, numero: 43, area: 'Cardiologia',
    gabarito: 'B',
    enunciado: `Homem de 21 anos, portador de diabetes mellitus tipo 1,
diagnosticado há 5 anos, foi levado à Unidade de Pronto
Atendimento (UPA) devido à dor abdominal, náuseas e vômitos.
Familiares informam que está sem utilizar insulina há 3 dias por
dificuldades financeiras. No exame físico, encontra-se torporoso,
desidratado, com hálito cetótico e dor abdominal à palpação
profunda de forma generalizada. Ao exame, frequência cardíaca
de 112 bpm; frequência respiratória de 38 irpm; pressão arterial
de 110 x 70 mmHg.
Os exames laboratoriais na admissão indicam:`,
    alternativas: [
    { letra: 'A', texto: 'Laparotomia para drenagem.' },
    { letra: 'B', texto: 'Tratamento clínico conservador.' },
    { letra: 'C', texto: 'Drenagem guiada por colonoscopia.' },
    { letra: 'D', texto: 'Drenagem percutânea guiada por tomografia.' }
    ],
  },
  { id: 'q2025-084', ano: 2025, numero: 84, area: 'Clínica Médica',
    gabarito: 'B',
    enunciado: `Mulher de 82 anos, com diagnóstico de câncer de pâncreas,
foi levada pela filha para atendimento. Após avaliação clínica e
realização de exames, o médico informa que o caso está fora
de possibilidade terapêutica. A filha insiste na realização de um
tratamento novo com um medicamento importado que ela viu
na internet, enquanto a paciente, lúcida e capaz, discorda da
utilização de intervenções experimentais.
Qual é a conduta adequada nesse caso?`,
    alternativas: [
    { letra: 'A', texto: 'Fazer uma histeroscopia diagnóstica para afastar a hipótese' },
    { letra: 'B', texto: 'Dosar TSH, FSH, LH, estradiol e prolactina para afastar a' },
    { letra: 'C', texto: 'Realizar uma ultrassonografia pélvica para afastar a' },
    { letra: 'D', texto: 'justiça distributiva.' }
    ],
  },
  { id: 'q2025-087', ano: 2025, numero: 87, area: 'Pediatria',
    gabarito: 'D',
    enunciado: `Em Unidade de Pronto Atendimento (UPA), mulher de 30 anos,
negra, casada, refere vários episódios de dores nas pernas
no último ano, às vezes com edema local, e dores torácicas,
associadas à febre, coriza e tosse, apresentando melhora com
paracetamol há 1 semana. Relata fortes dores em membros
inferiores, intensidade 8/10, sem irradiação, e dor na região
lombar, fadiga, indisposição e edema doloroso em tornozelo
sem melhora, com utilização de analgésicos há 1 dia. Pai faleceu
aos 40 anos devido a acidente vascular encefálico. Exame físico:
eupneica; afebril; mucosas descoradas (++/4+); icterícia (+/4+).
Sem alterações nos sinais vitais. Ausculta cardíaca com sopro
sistólico (++/4+). Abdome plano, sem visceromegalias. Edema
unilateral sem empastamento em tornozelo esquerdo (++/4+),
associado à úlcera maleolar de 2 cm, com secreção purulenta e
hiperemia nas bordas.
Lactente de 9 meses foi admitido em Unidade de Pronto
Atendimento (UPA) com quadro de diarreia; febre de 38,5 °C;
diminuição do volume urinário; sonolência alternada com
períodos de irritabilidade; apatia; palidez de pele.
Ao exame físico: peso de 9 kg; temperatura axilar de 38 °C;
frequência cardíaca de 130 bpm; frequência respiratória de
34 rpm; pressão arterial de 80 x 50 mmHg; mau estado geral;
sonolento; reagindo com irritabilidade aos estímulos; palidez
de pele; tecido subcutâneo com turgor pastoso; mucosas
ressecadas; olhos encovados; extremidades frias; pulsos fracos.
Tempo de enchimento capilar de 4 segundos. Respiração
gemente, com aumento da amplitude e tiragens intercostais.
O diagnóstico e a hidratação endovenosa indicada para o caso
são, respectivamente,`,
    alternativas: [
    { letra: 'A', texto: 'choque hipovolêmico; solução fisiológica 180 mL em 15' },
    { letra: 'B', texto: 'choque hipovolêmico; solução glicofisiológica 270 mL em' },
    { letra: 'C', texto: 'desidratação grave; solução fisiológica 270 mL em 60' },
    { letra: 'D', texto: 'desidratação grave; solução glicofisiológica 900 mL em 120' }
    ],
  },
  { id: 'q2025-088', ano: 2025, numero: 88, area: 'Cardiologia',
    gabarito: 'B',
    enunciado: `Plaquetas
420.000/mm³
150.000 a 450.000/mm³
Homem de 61 anos comparece à consulta com queixa de lesão
no pênis há 3 meses, a qual se desenvolveu após episódio de
eritema, prurido e fissura local, sem melhora após o uso de
antibiótico por 30 dias. Como antecedentes pessoais, relata ter
feito tratamento de HPV há 2 anos.
Glicemia
de jejum
80 mg/dL
70 a 99 mg/dL
Colesterol total
151 mg/dL
Abaixo de 200 mg/dL
HDL-C
53 mg/dL
Acima de 50 mg/dL
Ao exame físico do pênis, odor fétido à retração prepucial, com
má higienização local; lesão com aspecto verrucoso na glande;
presença de linfonodos inguinais bilaterais à palpação, indolores,
arredondados e imóveis.
Triglicerídeos
134 mg/dL
Abaixo de 150 mg/dL
Esfregaço
Apresenta
drepanócitos
------
Considerando o diagnóstico mais provável, qual é a conduta
adequada?
ECG
Sem alterações
------
Qual achado no exame complementar confirma a principal
hipótese diagnóstica para o caso?`,
    alternativas: [
    { letra: 'A', texto: 'Solicitar biópsia da lesão em glande peniana antes de' },
    { letra: 'B', texto: 'Iniciar tratamento medicamentoso enquanto aguarda os' },
    { letra: 'C', texto: 'Orientar correta higienização genital e uso de antibiótico' },
    { letra: 'D', texto: 'Orientar higienização genital, uso de medicação tópica e' }
    ],
  },
  { id: 'q2024-001', ano: 2024, numero: 1, area: 'Cardiologia',
    gabarito: 'C',
    enunciado: `Um homem de 46 anos vai ao pronto-socorro com queixa de
Um adolescente não identificado, encontrado desacordado
numa festa Rave, é atendido pelo SAMU. Há relatos de que
consumiu drogas de abuso e álcool minutos antes de ser
encontrado. À avaliação está sem respiração e sem pulso,
segundo relatos há pelo menos 10 minutos. Dois socorristas
iniciam a realização das compressões e das ventilações. São
colocados eletrodos no paciente, identificando-se atividade
elétrica sem pulso (AESP). A partir desse diagnóstico, é
realizado acesso venoso de urgência.
dor em cólica de forte intensidade na região lombar direita,
com irradiação para flanco e fossa ilíaca direita há 12 horas,
levando-o à incapacidade laboral. Ele refere que já apresentou
alguns episódios semelhantes, com várias ocorrências de
vômitos, e que fez uso de chás caseiros para tratamento. Ele
nega disúria e polaciúria. Ao exame físico, apresenta-se em
regular estado geral com fácies de dor, sudorese profusa,
mucosas desidratadas (1+/4+), temperatura de 36,5°C,
Assinale a alternativa que apresenta as próximas condutas
imediatas.
frequência cardíaca de 100 batimentos por minuto, pressão
arterial de 130 × 80 mmHg, pulmões limpos e bulhas rítmicas e`,
    alternativas: [
    { letra: 'A', texto: 'Pausar massagem cardíaca e obter via aérea segura.' },
    { letra: 'B', texto: 'Obter via aérea segura e iniciar administração de drogas.' },
    { letra: 'C', texto: 'Prosseguir com compressões e insuflações coordenadas.' },
    { letra: 'D', texto: 'Realizar desfibrilação e, depois, retornar com as' }
    ],
  },
  { id: 'q2024-004', ano: 2024, numero: 4, area: 'G. Obstetrícia',
    gabarito: 'D',
    enunciado: `Um médico de uma unidade básica de saúde realiza consulta
pré-natal em gestante com idade gestacional de 30 semanas.
Ao realizar o terceiro tempo da manobra de Leopold, na região
suprapúbica, identifica estrutura fetal óssea arredondada,
regular e compatível com calota craniana.
Com base nessas informações, assinale a alternativa que
apresenta, respectivamente, o diagnóstico da doença e o
tratamento adequado para esse paciente.`,
    alternativas: [
    { letra: 'A', texto: 'Litíase renal; cirurgia de urgência.' },
    { letra: 'B', texto: 'Infecção urinária; antibioticoterapia.' },
    { letra: 'C', texto: 'Litíase renal; analgesia e hidratação.' },
    { letra: 'D', texto: 'Infecção urinária; analgesia e urocultura.' }
    ],
  },
  { id: 'q2024-005', ano: 2024, numero: 5, area: 'Saúde Pública',
    gabarito: 'A',
    enunciado: `membros inferiores, no período vespertino, há 3 anos. Ao
Após a promulgação da Constituição Federal de 1988,
foram aprovadas duas leis, pelo Congresso Nacional, que
são chamadas de leis orgânicas do SUS. Uma delas, a lei
n. 8.142/1990,
dispõe
sobre
as
transferências
intergovernamentais de recursos financeiros na área da saúde.
exame físico, o médico observa dermatite ocre no terço
inferior dos membros inferiores associada a uma lesão circular
de 2 cm, superficial, com bordas elevadas e com tecido de
granulação, localizada na região maleolar interna da perna
direita.
Considerando a legislação mencionada, para que o Governo
Federal repasse recursos do SUS para estados e municípios, é
necessária a existência de
Com base nessas informações, a conduta médica adequada
para o caso é indicar`,
    alternativas: [
    { letra: 'A', texto: 'a deambulação e o uso de meias de baixa compressão.' },
    { letra: 'B', texto: 'o uso de meias de média compressão e a elevação das' },
    { letra: 'C', texto: 'a utilização de bota de Unna e a realização de atividade' },
    { letra: 'D', texto: 'a realização de desbridamento e o repouso em' }
    ],
  },
  { id: 'q2024-008', ano: 2024, numero: 8, area: 'Pediatria',
    gabarito: 'B',
    enunciado: `Um recém-nascido a termo, com 6 horas de vida, com peso de
nascimento de 4.200 gramas, é internado em alojamento
conjunto. Sabe-se que sua mãe possui diagnóstico de diabetes
gestacional.
Considerando-se o risco do recém-nascido desenvolver um
quadro de hipoglicemia neonatal, a conduta inicial correta
deve ser`,
    alternativas: [
    { letra: 'A', texto: 'monitorar a glicemia capilar para avaliar se o paciente' },
    { letra: 'B', texto: 'administrar fórmula infantil de forma complementar ao' },
    { letra: 'C', texto: 'realizar reposição de glicose venosa, caso a glicemia' },
    { letra: 'D', texto: 'iniciar reposição de glicose venosa, caso o paciente' }
    ],
  },
  { id: 'q2024-012', ano: 2024, numero: 12, area: 'Cardiologia',
    gabarito: 'D',
    enunciado: `Uma mulher de 45 anos, hipertensa controlada, com índice de
massa corporal de 20 kg/m 2 , é submetida a procedimento de
correção de hérnia umbilical em regime ambulatorial sob
anestesia local. O anel herniário aparenta ter cerca de 1,5 cm
de diâmetro. Diante disso, o médico opta pela correção sem o
uso de telas de reforço.
Em relação ao uso profilático de antibióticos nesse caso, é
correto afirmar que a`,
    alternativas: [
    { letra: 'A', texto: 'antibioticoprofilaxia é justificada por conta da hipertensão' },
    { letra: 'B', texto: 'cirurgia realizada é considerada limpa, sem indicação de' },
    { letra: 'C', texto: 'cirurgia foi realizada sob anestesia local, dispensando a' },
    { letra: 'D', texto: 'antibioticoprofilaxia está indicada, pois a cirurgia ocorreu' }
    ],
  },
  { id: 'q2024-019', ano: 2024, numero: 19, area: 'G. Obstetrícia',
    gabarito: 'B',
    enunciado: `Uma paciente multigesta de 40 anos, cardiopata, com idade
desenvolvido há 1 ano. O quadro piorou há 2 meses. O
paciente passou a apresentar vômitos frequentes com restos
gestacional de 39 semanas, está na maternidade, em trabalho
alimentares, sem sangue. Nesse período, ele perdeu cerca de
de parto ativo, sendo assistida pela obstetra. Durante a
12% de seu peso corporal.
evolução do parto, a paciente começa a demonstrar exaustão e
ausência de forças para a finalização do expulsivo. A obstetra,`,
    alternativas: [
    { letra: 'A', texto: 'partir dessas informações, é correto afirmar que a' },
    { letra: 'B', texto: 'dilatação cervical de, pelo menos, 8 cm.' },
    { letra: 'C', texto: 'integridade das membranas amnióticas.' },
    { letra: 'D', texto: 'apresentação fetal no plano -1 de DELEE.' }
    ],
  },
  { id: 'q2024-020', ano: 2024, numero: 20, area: 'Pediatria',
    gabarito: 'D',
    enunciado: `Uma criança de 6 anos é atendida em pronto-atendimento
Uma menina de 6 anos viajou de férias com a família para a
com febre contínua em torno de 40 °C. O sintoma iniciou há
República Dominicana, onde permaneceu por 10 dias. Na
aproximadamente 4 dias, a criança faz uso de paracetamol,
véspera do retorno ao Brasil, a paciente apresentou febre
sem melhora. Apresentou, a partir do 3º dia de doença, fezes
baixa, evoluindo, em 24 horas, para um quadro com diarreia
amolecidas, com aspecto de “borra de café” e odor fétido, 3 a
súbita, líquida e abundante. Ao desembarcarem no aeroporto,
4 episódios/dia. No 4º dia de evolução, surgiram artralgia em
ela foi prontamente atendida pela equipe da ANVISA, que a
joelhos, rash cutâneo avermelhado de aspecto morbiliforme e
encaminhou ao hospital para avaliação, devido à suspeita de
sangramento nasal importante. Não há descrição de sintomas
cólera. Tendo em vista a exuberância dos sintomas e o grau de
semelhantes na vida pregressa da criança.
desidratação, ao chegar ao hospital, a paciente é internada
Diante da suspeita de dengue, o médico decide realizar a prova
imediatamente. No hospital, são coletadas amostras de fezes,
do laço. Para isso ele deverá aferir a pressão arterial e
com resultado positivo para Vibrio cholerae . Durante a`,
    alternativas: [
    { letra: 'A', texto: 'calcular o valor médio; insuflar o manguito até esse valor' },
    { letra: 'B', texto: 'obter a pressão sistólica; insuflar o manguito até esse valor' },
    { letra: 'C', texto: 'calcular o valor máximo; insuflar o manguito até esse valor' },
    { letra: 'D', texto: 'vacinar contra a cólera os pais e pessoas contactantes da' }
    ],
  },
  { id: 'q2024-022', ano: 2024, numero: 22, area: 'G. Obstetrícia',
    gabarito: 'D',
    enunciado: `Uma primigesta de 35 anos, com idade gestacional de 12
semanas, comparece a segunda consulta pré-natal no
ambulatório de gestação de alto risco. Apresenta diabetes
mellitus tipo 1 desde a infância e está adequadamente tratada.
Em consulta anterior, queixou-se de fadiga, pele seca, queda
de cabelo e obstipação. O médico realizou exame físico no qual
notou a tireoide palpável, solicitou a realização de exames
laboratoriais, cujos resultados mostraram TSH de 5,0 mcU/L
(valor de referência [VR]: 0,3 a 4,0 mcU/L) e T4 livre de 0,6 ng/L
(VR: 0,9 a 1,5 ng/L).
Uma paciente de 62 anos foi submetida à colectomia direita
com anastomose primária devido a adenocarcinoma colônico.
Ela relata antecedente de radioterapia pélvica para tratamento
de neoplasia de endométrio. No 4º dia de pós-operatório, ela
apresenta 39 °C de temperatura axilar, distensão abdominal
sem defesa, presença de ferida operatória sem sinais
flogísticos e fístula colo-cutânea com débito de 150 mL/dia em
área de cicatriz cirúrgica.
Acerca do tratamento adequado para essa paciente, é correto
indicar
Diante desse quadro clínico e do resultado dos exames, além
de iniciar o tratamento com levotiroxina, até que se atinja a
meta de tratamento o seguimento deve ser feito com dosagem
mensal de`,
    alternativas: [
    { letra: 'A', texto: 'fistulectomia' },
    { letra: 'B', texto: 'T3 livre, com a finalidade de reduzir o risco de' },
    { letra: 'C', texto: 'T4 livre, a fim de se reduzir o risco de pré-eclâmpsia.' },
    { letra: 'D', texto: 'TSH, para se evitar o parto prematuro.' }
    ],
  },
  { id: 'q2024-030', ano: 2024, numero: 30, area: 'Pediatria',
    gabarito: 'A',
    enunciado: `Um menino de 10 anos, escolar, é levado à unidade de pronto-
atendimento com queixa de dor em bolsa escrotal esquerda
iniciada há 3 horas. A criança é eutrófica, sem antecedendes
mórbidos e sem história de trauma ou de quedas. Ao exame
testicular, o local da dor apresenta-se com edema e o testículo
esquerdo encontra-se localizado em porção superior ao
contralateral, próximo ao anel inguinal externo, com reflexo
cremastérico abolido, cuja manobra de elevação é dolorosa.
Em certo município brasileiro, a gestão da saúde é feita de
forma centralizada: todas as decisões e ações são tomadas por
um pequeno grupo de gestores sem a participação efetiva da
população. Isso tem gerado descontentamento e desconfiança
por parte dos cidadãos, que sentem que suas necessidades e
demandas não estão sendo consideradas. Um grupo de
moradores, então, decide organizar-se para reivindicar maior
participação no processo de gestão da saúde. A primeira
medida que esses moradores tomam é buscar informações
sobre o controle social no SUS.
Nesse caso, a conduta médica correta é realizar
Esse grupo de moradores descobriu, com base na lei n. 8.142
de 1990 e no Decreto n. 7.508 de 2011, que eles têm o
direito de`,
    alternativas: [
    { letra: 'A', texto: 'encaminhamento imediato para o centro de referência de' },
    { letra: 'B', texto: 'participar de conselhos de saúde em proporção não' },
    { letra: 'C', texto: 'eleger representantes para o conselho estadual de saúde,' },
    { letra: 'D', texto: 'atuar na gerência de unidades básicas municipais de saúde' }
    ],
  },
  { id: 'q2024-031', ano: 2024, numero: 31, area: 'Cardiologia',
    gabarito: 'A',
    enunciado: `Um homem de 66 anos, com hipertensão arterial sistêmica e
sem outros antecedentes pessoais ou familiares, comparece a
um ambulatório de pneumologia de um hospital terciário
referindo ser tabagista (39 anos/maço) e estar com medo de
ter câncer de pulmão. Ele apresentou o resultado de uma
tomografia de tórax, sem contraste, realizada há 2 semanas,
que revelou um nódulo sólido, único, medindo 18 mm, em
parênquima de lobo inferior de pulmão esquerdo. Diante desse
quadro, o paciente foi encaminhado pelo médico para
investigação.
Nesse caso, a conduta médica adequada é`,
    alternativas: [
    { letra: 'A', texto: 'indicar que a paciente repita o exame citológico em 6' },
    { letra: 'B', texto: 'indicar que a paciente realize biópsia dirigida pelo teste de' },
    { letra: 'C', texto: 'encaminhar a paciente para acompanhamento em serviço' },
    { letra: 'D', texto: 'biópsia guiada por ultrassonografia.' }
    ],
  },
  { id: 'q2024-037', ano: 2024, numero: 37, area: 'Cardiologia',
    gabarito: 'B',
    enunciado: `Uma paciente de 64 anos é socorrida, em via pública, pelo
SAMU por queda da própria altura com rebaixamento do nível
de consciência. Ao exame físico, constata-se ferida corto-
contusa na região occipital direita de 3 cm; Glasgow 9;
pressão arterial de 110 × 70 mmHg; e frequência cardíaca de
88 batimentos por minuto. Ao exame pulmonar, percebe-se
expansibilidade preservada bilateralmente e, à ausculta
cardíaca, constata-se bulhas rítmicas e normofonéticas.
O abdome apresenta-se flácido e indolor.
Ao exame físico, apresenta-se afebril, eupneica com frequência
cardíaca de 88 batimentos por minuto, pressão arterial de
127 × 66 mmHg. Ao exame físico obstétrico, identifica-se altura
uterina de 34 cm, movimentação fetal presente, dinâmica
uterina ausente e índice de Bishop de 8.
À
carditocografia,
identificou-se
aumento
abrupto
da
frequência cardíaca fetal, com ápice maior ou igual a
15 batimentos por minuto e duração maior ou igual a
15 segundos; batimento cardíaco fetal basal de 130 batimentos
por minuto e variabilidade da frequência cardíaca fetal de
20 batimentos por minuto.
Nesse caso, a conduta imediata deve ser a`,
    alternativas: [
    { letra: 'A', texto: 'intubação com inclinação da cabeça para trás, em' },
    { letra: 'B', texto: 'ventilação com máscara por meio da tração anterior da' },
    { letra: 'C', texto: 'intubação com tração anterior pelo ângulo da mandíbula' },
    { letra: 'D', texto: 'ventilação com pinçamento da arcada dentária inferior,' }
    ],
  },
  { id: 'q2024-040', ano: 2024, numero: 40, area: 'Psiquiatria',
    gabarito: 'A',
    enunciado: `Um homem de 45 anos, trabalhador da construção civil há
Um paciente, que está no 5º dia pós-operatório de
gastroduodenopancreatectomia
para
o
tratamento
de
neoplasia da papila duodenal, é encaminhado a consulta.
Ao examiná-lo, o médico nota o paciente normocárdico,
afebril, com drenagem de 500 mL/24h de secreção clara e
límpida por meio de dreno abdominal. A ferida cirúrgica está
sem sinais de flogose.
25 anos, é atendido na unidade básica de saúde com queixas
de dispneia progressiva, tosse sem expectoração e fadiga. Ele
nega comorbidades ou tabagismo e não se notam alterações
neurológicas ou psiquiátricas durante a realização da
anamnese e do exame físico. É realizada radiografia de tórax, a
qual revela opacidades reticulares e placas pleurais calcificadas
Nesse caso, para o diagnóstico de eventual complicação, deve-
se realizar
bilaterais na parede do tórax e no diafragma. Na investigação
subsequente, é solicitada tomografia de alta resolução do`,
    alternativas: [
    { letra: 'A', texto: 'ultrassonografia endoscópica.' },
    { letra: 'B', texto: 'cultura e antibiograma da secreção.' },
    { letra: 'C', texto: 'dosagem de amilase e lipase da secreção.' },
    { letra: 'D', texto: 'colangiopancreatografia retrógrada endoscópica.' }
    ],
  },
  { id: 'q2024-041', ano: 2024, numero: 41, area: 'Clínica Médica',
    gabarito: 'C',
    enunciado: `Uma mulher de 33 anos vai a uma consulta com um clínico`,
    alternativas: [
    { letra: 'A', texto: 'O paciente apresenta 25% de chance de apresentar o' },
    { letra: 'B', texto: 'O paciente apresenta 25% de chance de desenvolver' },
    { letra: 'C', texto: 'O pai não transmitiu o gene alterado pois a anemia' },
    { letra: 'D', texto: 'O pai teve 50% de chance de ter transmitido a' },
    { letra: 'E', texto: 'procedente de São Paulo, programadora de computadores,' }
    ],
  },
  { id: 'q2024-043', ano: 2024, numero: 43, area: 'Pediatria',
    gabarito: 'D',
    enunciado: `Com relação a esse caso clínico, o diagnóstico mais provável
Encontra-se na maternidade um recém-nascido a termo, peso
3 kg, estatura 50 cm, Apgar 9/10, cujo pré-natal e parto
transcorreram sem intercorrências. Os exames físico e
neurológico não apresentaram alterações. Com relação aos
antecedentes familiares, o pai é heterozigoto para anemia
falciforme e a eletroforese de hemoglobina materna mostra
homozigose com padrão HbAA.
para esse paciente é`,
    alternativas: [
    { letra: 'A', texto: 'asbestose.' },
    { letra: 'B', texto: 'paracoccidioidomicose.' },
    { letra: 'C', texto: 'intoxicação por chumbo.' },
    { letra: 'D', texto: 'doença pulmonar obstrutiva crônica.' }
    ],
  },
  { id: 'q2024-044', ano: 2024, numero: 44, area: 'G. Obstetrícia',
    gabarito: 'D',
    enunciado: `ÁREA LIVRE
Uma primigesta, com idade gestacional de 39 semanas,
assistida em pré-natal de baixo risco, é admitida no pronto-
socorro obstétrico com queixa de “cólica forte que vai e volta”,
nega outras queixas. Com intuito de avaliar se a paciente está
em trabalho de parto, o médico pede consentimento à
gestante para executar o exame físico, informando que precisa
realizar, entre outras etapas, a avaliação da dinâmica uterina.
Sobre a avaliação da dinâmica uterina, o médico explica para a
gestante que o procedimento consiste em colocar a mão
espalmada`,
    alternativas: [
    { letra: 'A', texto: 'no fundo uterino e, a partir da percepção de uma' },
    { letra: 'B', texto: 'na região suprapúbica e, a partir da percepção de uma' },
    { letra: 'C', texto: 'no fundo uterino e, a partir da percepção de uma' },
    { letra: 'D', texto: 'na região suprapúbica e, a partir da percepção de uma' }
    ],
  },
  { id: 'q2023-002', ano: 2023, numero: 2, area: 'Cirurgia',
    gabarito: 'D',
    enunciado: `Um paciente de 48 anos é internado devido a uma fratura de
fêmur fechada, a qual ocorreu há 12 horas. Durante a
internação,
o
paciente
mantém-se
estável;
não
há
intercorrências. Ele não apresenta comorbidades e não faz uso
de medicações. Ao avaliar o caso, a equipe de ortopedia indica
fixação definitiva da fratura. Visando à segurança do paciente,
de acordo com as práticas recomendadas para realização de
cirurgia segura, é importante verificar uma listagem de itens
durante a etapa de identificação, antes da indução anestésica
para o procedimento cirúrgico.
Com base nessas informações, o que deve ser realizado pela
equipe médica durante a etapa de identificação do paciente,
visando a sua segurança?
Nesse caso, para prevenção primária da osteoporose, o médico
deve`,
    alternativas: [
    { letra: 'A', texto: 'Apresentação de cada membro da equipe pelo nome e' },
    { letra: 'B', texto: 'Confirmação da explicação do procedimento e seus riscos' },
    { letra: 'C', texto: 'Contagem de materiais a serem utilizados, como pinças e' },
    { letra: 'D', texto: 'Demarcação da lateralidade (direita ou esquerda) do' }
    ],
  },
  { id: 'q2023-003', ano: 2023, numero: 3, area: 'Pediatria',
    gabarito: 'B',
    enunciado: `Uma mulher de 60 anos, hipertensa, em uso irregular de
medicamentos, é levada pelo filho ao pronto-socorro com
história de ter começado a sentir, há 8 horas, cefaleia
holocraniana intensa, apresentando náuseas e vômitos. Ela
passou a ter confusão mental e, na última hora, está mais
sonolenta. Ao exame físico, apresenta pressão arterial
de 220 × 140 mmHg em ambos os membros superiores; está
sonolenta, mas é responsiva ao chamado verbal. Percebe-se,
também, que está desorientada no tempo e no espaço. Além
disso, suas pupilas estão isocóricas e fotorreativas e ela não
apresenta déficit motor ou sensitivo.
Um menino de 9 anos, com peso de 29 kg e altura de 1,36 m,
recém-adotado, comparece à primeira consulta de rotina com a
família atual. Seus pais questionam o médico sobre a forma mais
segura de transportar o filho na parte central do banco traseiro
do automóvel, a fim de zelar por sua integridade física em caso
de acidente.
Em resposta ao questionamento dos pais, o médico deve
orientar que a forma mais segura de transportar a criança é de
frente para o painel do veículo,`,
    alternativas: [
    { letra: 'A', texto: 'no banco, utilizando o cinto de segurança de três pontos do' },
    { letra: 'B', texto: 'na cadeirinha, utilizando o cinto de segurança da própria' },
    { letra: 'C', texto: 'na cadeirinha, utilizando o cinto de segurança de três' },
    { letra: 'D', texto: 'no assento de elevação, utilizando o cinto de segurança de' }
    ],
  },
  { id: 'q2023-005', ano: 2023, numero: 5, area: 'Cirurgia',
    gabarito: 'A',
    enunciado: `Os plantonistas do serviço de atendimento pré-hospitalar
socorrem um rapaz de 18 anos, que foi atropelado por carro ao
atravessar uma rodovia, e o levam até a emergência hospitalar
para continuidade do atendimento. Após estabilização
hemodinâmica e realização de exames complementares, é
diagnosticada fratura de pelve anterior e posterior e, no exame
físico, observa-se hematoma perineal e sangue no óstio externo
da uretra.
Em
um
território
com
população
em
situação
de
vulnerabilidade, uma unidade básica de saúde possui duas
equipes que atendem 9 000 pessoas cadastradas. Estima-se que
as demandas por atendimento médico se tornarão ainda
maiores, já que a população local está em rápida expansão, pois
há ocupações em áreas próximas a um córrego que corta a
extremidade do território de abrangência. Devido à sobrecarga
dessas duas equipes e do potencial crescimento populacional, o
gestor, portanto, decide implantar uma nova equipe de saúde
da família.
Nesse caso, para confirmar o diagnóstico de lesão uretral total
associada, é indicado realizar uma`,
    alternativas: [
    { letra: 'A', texto: 'uretrocistografia retrógrada.' },
    { letra: 'B', texto: 'cateterização suprapúbica.' },
    { letra: 'C', texto: 'cateterização uretral.' },
    { letra: 'D', texto: 'tomografia pélvica.' }
    ],
  },
  { id: 'q2023-006', ano: 2023, numero: 6, area: 'Pediatria',
    gabarito: 'A',
    enunciado: `Uma criança de 9 anos e 4 meses é levada à consulta pela sua
mãe, que está muito preocupada porque sua filha está
apresentando desenvolvimento mamário há 2 meses. A mãe
nega que a paciente tenha doenças crônicas ou que faça uso de
medicações contínuas. Relata que a menina possui boa
alimentação e que faz atividade física regular. Na história
familiar, a irmã da criança apresentou menarca aos 13 anos. Ao
exame físico: curvas de crescimento e peso dentro da
normalidade, mamas em fase de botão (Tanner M2), pelos
pubianos longos, ligeiramente pigmentados ao longo dos
grandes lábios (Tanner P2), e genitália externa de aspecto
normal.
Um homem de 20 anos, previamente hígido e sem uso crônico
de medicação, procura um médico da unidade básica de saúde
relatando que, há 2 dias, iniciou o uso de nimesulida para alívio
de dor causada por uma entorse de tornozelo. No entanto, há
24 horas, afirma ter começado a apresentar prurido e pápulas
vermelhas de tamanhos variados, distribuídas de forma
irregular em tronco e em membros superiores. O paciente nega
dispneia, palpitações ou alterações gastrointestinais.
Além de suspender o uso da nimesulida, a conduta do médico
da atenção primária deve ser
Diante desse quadro, a conduta médica adequada é informar à
mãe e paciente que se trata de um caso sugestivo de`,
    alternativas: [
    { letra: 'A', texto: 'iniciar medicamento anti-histamínico e hidratação da pele.' },
    { letra: 'B', texto: 'fazer uma dose de epinefrina subcutânea e iniciar anti-' },
    { letra: 'C', texto: 'encaminhar o paciente para observação em pronto-socorro' },
    { letra: 'D', texto: 'administrar corticoide tópico e oral e, caso persistam os' },
    { letra: 'E', texto: 'encaminhar' }
    ],
  },
  { id: 'q2023-008', ano: 2023, numero: 8, area: 'Cirurgia',
    gabarito: 'D',
    enunciado: `Um adolescente de 18 anos encontra-se internado após cirurgia
bariátrica (derivação gástrica em Y-de-Roux) realizada há
3 meses. Ele refere que, ocasionalmente, apresenta náuseas,
diarreia, dor abdominal, sudorese, sensação de desmaio
iminente e fraqueza cerca de 2 a 3 horas após a ingestão de
carboidratos simples, os quais consome com frequência. Seu
exame físico apresenta-se sem alterações no momento. Exames
de bioquímica, de imagem e endoscopia digestiva alta também
apresentam-se sem alterações.
Diante desse quadro, qual é a hipótese diagnóstica mais
provável?`,
    alternativas: [
    { letra: 'A', texto: 'Fístula gastro-gástrica.' },
    { letra: 'B', texto: 'Síndrome de dumping .' },
    { letra: 'C', texto: 'Peritonite bacteriana secundária.' },
    { letra: 'D', texto: 'Deficiência de ferro e de vitaminas do complexo B.' }
    ],
  },
  { id: 'q2023-016', ano: 2023, numero: 16, area: 'Cardiologia',
    gabarito: 'A',
    enunciado: `Uma mulher de 51 anos vem ao ambulatório de referência
mencionando fogachos, insônia, irritabilidade e labilidade
emocional há 3 meses. A última menstruação foi há 6 meses e
nunca usou hormônios. É hipertensa em uso de medicação com
níveis tensionais controlados. Realizou revisão ginecológica
recentemente, com exames clínico e complementares normais.
Após a explanação do médico sobre os riscos e benefícios da
terapia hormonal (TH) no climatério, a paciente informa que
deseja usar hormônios para alívio da sintomatologia, solicitando
um esquema hormonal de menor risco para o seu organismo.
Uma mulher de 28 anos é avaliada em unidade básica de saúde
com queixa de diarreia crônica. A paciente refere estar
preocupada, pois sua mãe e irmã têm doença de Crohn. Ela
relata que a diarreia tem 2 anos de evolução, sendo, às vezes,
intercalada por períodos de constipação intestinal. Afirma,
também, que nunca foi despertada do sono em função da
diarreia e que há dor abdominal recorrente que sempre
alivia com a evacuação. Refere que não notou emagrecimento
Considerando as evidências disponíveis quanto ao perfil
farmacológico e clínico dos esquemas de TH, o médico deverá
prescrever
ao longo desse período e afirma, ainda, que as fezes não
flutuam no vaso sanitário nem contêm muco, pus ou sangue.
Ao exame físico, a paciente revela-se eutrófica (índice de`,
    alternativas: [
    { letra: 'A', texto: 'estradiol 1 mg + acetato de noretisterona 0,5 mg, por via' },
    { letra: 'B', texto: 'estradiol 50 mcg + acetato de noretisterona em adesivo,' },
    { letra: 'C', texto: 'estrogênios equinos conjugados 0,625 mg + acetato de' },
    { letra: 'D', texto: 'estradiol 1 mg em gel, por via transdérmica, contínuo +' }
    ],
  },
  { id: 'q2023-017', ano: 2023, numero: 17, area: 'Clínica Médica',
    gabarito: 'C',
    enunciado: `Um homem de 49 anos procura atendimento com queixa de
dor epigástrica e retroesternal em queimação, diária, nos
últimos 5 meses. Relata que esses sintomas parecem agravar-se`,
    alternativas: [
    { letra: 'A', texto: 'paciente nega possuir doenças prévias ou fazer uso de' },
    { letra: 'B', texto: 'TGO, TGP, coagulograma e hemograma; prescrição de' },
    { letra: 'C', texto: 'Coagulograma e ultrassonografia transvaginal; prescrição' },
    { letra: 'D', texto: 'FSH, LH e prolactina; prescrição de diclofenaco sódico.' }
    ],
  },
  { id: 'q2023-020', ano: 2023, numero: 20, area: 'Saúde Pública',
    gabarito: 'C',
    enunciado: `Um menino de 7 anos é atendido em consulta de rotina na
O prefeito de um município brasileiro deseja implantar as
Práticas Integrativas e Complementares (PICS) em sua cidade,
para que os cidadãos tenham acesso a sessões de
auriculoterapia, musicoterapia, entre outras PICS.
unidade básica de saúde. Ele não apresenta queixas no
momento da consulta, porém, ao exame físico genital, é
verificada a impossibilidade da retratibilidade completa do
Sobre as orientações expressas no referido programa do
Sistema Único de Saúde (SUS), é correto afirmar que
prepúcio, para exposição parcial do meato uretral, com anel
cicatricial prepucial. Quando a responsável foi questionada`,
    alternativas: [
    { letra: 'A', texto: 'a acupuntura deve ser ofertada pela atenção especializada,' },
    { letra: 'B', texto: 'as PICS são recomendadas pela Organização Mundial da' },
    { letra: 'C', texto: 'as ações das PICS devem ter caráter multiprofissional, com' },
    { letra: 'D', texto: 'a auriculoterapia deve ser inserida em todos os níveis de' }
    ],
  },
  { id: 'q2023-023', ano: 2023, numero: 23, area: 'Clínica Médica',
    gabarito: 'C',
    enunciado: `Uma mulher de 45 anos procura o pronto-socorro com queixa`,
    alternativas: [
    { letra: 'A', texto: 'redução da mortalidade infantil é ainda um desafio para os' },
    { letra: 'B', texto: 'Sarampo; desnutrição; malformações congênitas do' },
    { letra: 'C', texto: 'Tuberculose; anemias carenciais; síndrome da morte súbita' },
    { letra: 'D', texto: 'Síndrome da rubéola congênita; traumatismo de parto;' }
    ],
  },
  { id: 'q2023-024', ano: 2023, numero: 24, area: 'Cardiologia',
    gabarito: 'D',
    enunciado: `Exame
Resultado
Valor de Referência
Uma paciente de 28 anos, G3P2A1 (partos normais), procura a
unidade básica de saúde para informar-se acerca de métodos
contraceptivos para o seu caso. Ela refere ter útero didelfo e
relata fazer acompanhamento no ambulatório de hematologia
por ter tido tromboembolismo pulmonar após COVID-19. Além
disso, também faz acompanhamento no ambulatório de
reumatologia por possuir lúpus eritematoso sistêmico. A
paciente apresenta fluxo menstrual intenso e não deseja
laqueadura, por questões pessoais.
Leucócitos
16 150 mm³
4 500 a 11 000 mm 3
Transaminase glutâmico
oxalacética (TGO)
81 U/L
0 a 35 U/L
Transaminase glutâmico
pirúvica (TGP)
79 U/L
0 a 35 U/L
Fosfatase alcalina
850 U/L
30 a 120 U/L
Gama glutamil transferase
GGT
790 U/L
1 a 94 U/L
Segundo os critérios de elegibilidade, qual método é indicado
para o caso dessa paciente?
Bilirrubinas totais
6,90 mg/dL
0,3 a 1,0 mg/dL
Bilirrubinas diretas
6,50 mg/dL
0,1 a 0,3 mg/dL`,
    alternativas: [
    { letra: 'A', texto: 'Sistema intrauterino de levonogestrel (SIU-l).' },
    { letra: 'B', texto: 'Dispositivo intrauterino de cobre (DIU T-Cu).' },
    { letra: 'C', texto: 'Pílula de etinilestradiol e gestodeno.' },
    { letra: 'D', texto: 'Pílula de progestágeno isolado.' }
    ],
  },
  { id: 'q2023-025', ano: 2023, numero: 25, area: 'Clínica Médica',
    gabarito: 'A',
    enunciado: `Um homem de 19 anos, previamente hígido, vem à consulta na
unidade de saúde relatando o surgimento, há algumas semanas,
de lesão única na mão direita. Inicialmente, a lesão era como
pápula, que aumentou progressivamente até ficar com o
aspecto atual. O paciente é militar, pardo, servindo na floresta
amazônica, solteiro, natural de Belém do Pará. Ele nega dor.
Ao exame, a lesão apresenta consistência firme e o aspecto
como mostrado na imagem.`,
    alternativas: [
    { letra: 'A', texto: 'pontuação obtida pelo paciente no teste foi 25. A esposa,' },
    { letra: 'B', texto: 'avaliar a presença de sobrecarga da esposa através de' },
    { letra: 'C', texto: 'Hanseníase; administração de rifampicina, clofazimina e dapsona.' },
    { letra: 'D', texto: 'Leishmaniose tegumentar; tratamento com antimoniato de' }
    ],
  },
  { id: 'q2023-027', ano: 2023, numero: 27, area: 'Clínica Médica',
    gabarito: 'D',
    enunciado: `Um homem de 58 anos, trabalhador na construção civil, procura
o ambulatório com história clínica de lesão na face há,
aproximadamente, 4 anos, com crescimento há 2 meses,
conforme figura a seguir. Ele nega outras lesões cutâneas ou
outras comorbidades. O exame físico se mostrou sem alterações.
ÁREA LIVRE
Figura — Lesão cutânea`,
    alternativas: [
    { letra: 'A', texto: 'partir dessas informações, qual é a hipótese diagnóstica mais' },
    { letra: 'B', texto: 'Nevo melanocítico.' },
    { letra: 'C', texto: 'Ceratose seborrérica.' },
    { letra: 'D', texto: 'Carcinoma espinocelular.' }
    ],
  },
  { id: 'q2023-032', ano: 2023, numero: 32, area: 'Cardiologia',
    gabarito: 'C',
    enunciado: `Um homem de 53 anos foi submetido à laparotomia de
emergência devido à diverticulite perfurada e, em seu caso,
realizadas sigmoidectomia com colostomia a Hartmann,
há 7 dias. Desde o segundo dia de pós-operatório, o paciente
apresenta febre intermitente de 39 °C e não consegue se
alimentar em razão de distensão abdominal persistente. Ele não
apresenta outras queixas.
Nesse caso, a conduta médica correta é realizar
Ao exame físico, apresenta temperatura de 38,9 °C; frequência
respiratória de 22 incursões respiratórias por minuto;
frequência cardíaca de 114 batimentos por minuto; pressão
arterial de 110 × 70 mmHg; pele quente e úmida; pulmões com
murmúrios vesiculares pouco diminuídos em bases, sem ruídos
adventícios;
ritmo
cardíaco
regular,
com
bulhas
normofonéticas, sem sopros; abdome distendido, ruídos
hidroaéreos diminuídos, hipertimpânico, doloroso à palpação
profunda difusamente; ferida operatória limpa e seca, sem
sinais flogísticos; colostomia com bom aspecto; e sinal de
Giordano negativo.`,
    alternativas: [
    { letra: 'A', texto: 'coleta de colpocitologia oncótica após 6 meses.' },
    { letra: 'B', texto: 'colposcopia e biópsia do colo do útero.' },
    { letra: 'C', texto: 'exérese da zona de transformação.' },
    { letra: 'D', texto: 'coleta para o teste de DNA-HPV.' }
    ],
  },
  { id: 'q2023-036', ano: 2023, numero: 36, area: 'Saúde Pública',
    gabarito: 'D',
    enunciado: `Um homem de 30 anos é atendido em unidade básica de saúde
com queixa de alteração no padrão do sono, alternando noites
de insônia com noites de sono inquieto há 7 meses. Sente-se
preocupado, com medo excessivo de adoecer ou de algo
desagradável ocorrer. Seus amigos o consideram inquieto,
tenso, irritado e com dificuldade de se concentrar. Ele relata que
mantém suas atividades profissionais normalmente.
Diante desse quadro, qual é o diagnóstico mais provável?`,
    alternativas: [
    { letra: 'A', texto: 'Depressão maior.' },
    { letra: 'B', texto: 'Transtorno bipolar do humor.' },
    { letra: 'C', texto: 'Transtorno de ansiedade generalizada.' },
    { letra: 'D', texto: 'Transtorno do deficit da atenção em adulto.' }
    ],
  },
  { id: 'q2023-037', ano: 2023, numero: 37, area: 'Pediatria',
    gabarito: 'B',
    enunciado: `Um menino de 6 meses e 15 dias é trazido pela mãe em consulta
Um paciente de 71 anos apresenta quadro de sangramento
de puericultura na unidade básica de saúde. A criança recusa
intermitente na urina há 4 semanas, acompanhado por dor em
papas sólidas e aceita apenas o leite materno. Revisando
peso no hipogástrio, sensação de plenitude vesical e urgência
consultas anteriores, o médico de família e comunidade
miccional. Ele relata dois episódios prévios de hematúria com
identifica que a mãe já havia demonstrado preocupação, pois a
eliminação de cálculos. Possui, como antecedente, hipertensão
criança ainda não apresentava sorriso social, não observava a
arterial sistêmica controlada, diabetes mellitus tipo 2,
mãe nem olhava nos seus olhos enquanto mamava, não se
dislipidemia, obesidade e tabagismo (40 maços/ano).
interessava por outras crianças, não respondia a chamados e
Acerca desse caso, assinale a opção que apresenta a principal
não apresentava nenhum tipo de lalação. Por isso, a criança foi
hipótese diagnóstica e os exames mais adequados para a
encaminhada para investigação com um otorrinolaringologista,
investigação.
o qual não identificou nenhum déficit auditivo. A mãe,`,
    alternativas: [
    { letra: 'A', texto: 'Tumor urotelial; ressonância nuclear magnética e' },
    { letra: 'B', texto: 'Ureterolitíase obstrutiva; urina tipo 1 e urotomografia com' },
    { letra: 'C', texto: 'Hiperplasia benigna de próstata; dosagem de PSA e' },
    { letra: 'D', texto: 'Tuberculose genitourinária; urocultura específica para' },
    { letra: 'E', texto: 'planejamento' }
    ],
  },
  { id: 'q2020-007', ano: 2020, numero: 7, area: 'Saúde Pública',
    gabarito: 'D',
    enunciado: `Um homem com 19 anos de idade, motorista de aplicativo, procura a Unidade de Saúde da Família (USF) por
tristeza e insônia há uma semana, desde que sua mãe faleceu por acidente ciclístico. O pai faleceu em um
acidente de moto há 5 anos. Relata que tem estado muito preocupado com o futuro, pois agora está morando
apenas com sua irmã de 15 anos de idade. Nos últimos dias, ele tomou 3 comprimidos de diazepam que achou
na bolsa da mãe e pede uma receita para pegar mais dessa medicação na USF. Nega histórico de transtornos
mentais.
Nesse caso, a conduta médica inicial deve ser`,
    alternativas: [
    { letra: 'A', texto: 'suspender benzodiazepínico e encaminhar ao psiquiatra.' },
    { letra: 'B', texto: 'manter o uso da medicação e orientar o paciente a fazer a redução gradual.' },
    { letra: 'C', texto: 'oferecer escuta ativa, técnicas de higiene do sono e terapia cognitivo-comportamental.' },
    { letra: 'D', texto: 'trocar por um benzodiazepínico em gotas para facilitar a redução gradual da medicação.' }
    ],
  },
  { id: 'q2020-008', ano: 2020, numero: 8, area: 'Saúde Pública',
    gabarito: 'C',
    enunciado: `Um paciente com 54 anos de idade procurou a Unidade Básica de Saúde para atendimento. O homem relatou
que, há um ano, apresentou abscesso na região perineal que foi drenado em pronto-socorro. Desde então,
apresentou uma ferida próxima ao ânus, que ocasionalmente inflama e apresenta saída de secreção turva, com
odor fecaloide. O paciente realizou colonoscopia há 3 anos, a qual não evidenciou lesões no cólon. O exame
da região perianal evidenciou orifício cutâneo a 2 cm da borda anal, na região anterior direita do períneo. O
toque retal evidenciou próstata com características normais e induração anteriormente à borda anal. Após a
compressão local, houve saída de secreção pelo orifício cutâneo.
Com base na história clínica e nos dados do exame físico, o diagnóstico e a conduta adequada são`,
    alternativas: [
    { letra: 'A', texto: 'abscesso perianal e drenagem cirúrgica.' },
    { letra: 'B', texto: 'fissura anal aguda e uso de anti-inflamatórios tópicos.' },
    { letra: 'C', texto: 'fístula perianal e encaminhamento para tratamento cirúrgico eletivo.' },
    { letra: 'D', texto: 'fissura anal crônica e encaminhamento para tratamento cirúrgico eletivo.' }
    ],
  },
  { id: 'q2020-010', ano: 2020, numero: 10, area: 'Clínica Médica',
    gabarito: 'A',
    enunciado: `Quais são a vacina que preveniria a atual doença e a
idade para a sua administração?
Um adolescente com 13 anos de idade é atendido no
pronto-socorro devido à picada de escorpião no dedo
indicador esquerdo. Em exame físico, apresenta sinais
vitais estáveis, dor intensa, hiperemia e formigamento
no local da picada, associados a náuseas, vômitos,
sudorese e sialorreia discretos.`,
    alternativas: [
    { letra: 'A', texto: 'Vacina tetraviral; 12 meses.' },
    { letra: 'B', texto: 'Vacina tetraviral; 15 meses.' },
    { letra: 'C', texto: 'Vacina tríplice viral; 12 meses.' },
    { letra: 'D', texto: 'Vacina tríplice viral; 15 meses.' }
    ],
  },
  { id: 'q2020-011', ano: 2020, numero: 11, area: 'Clínica Médica',
    gabarito: 'B',
    enunciado: ``,
    alternativas: [
    { letra: 'A', texto: '192 UI/L) e gama-glutamil transferase = 302 UI/L' },
    { letra: 'B', texto: 'beta hCG sérico.' },
    { letra: 'C', texto: 'progesterona sérica.' },
    { letra: 'D', texto: 'fator de Von Willebrand.' }
    ],
  },
  { id: 'q2020-012', ano: 2020, numero: 12, area: 'Clínica Médica',
    gabarito: 'A',
    enunciado: ``,
    alternativas: [
    { letra: 'E', texto: 'lesões vésico-pústulo-crostosas em tronco há 2' },
    { letra: 'A', texto: 'Colangite aguda com pêntade de Reynolds.' },
    { letra: 'B', texto: 'Colangite aguda com tríade de Charcot.' },
    { letra: 'C', texto: 'Colecistite crônica alitiásica.' },
    { letra: 'D', texto: 'Colecistite aguda litiásica.' }
    ],
  },
  { id: 'q2020-013', ano: 2020, numero: 13, area: 'Endocrinologia',
    gabarito: 'D',
    enunciado: `Uma paciente com 20 anos de idade notou nodulação
na região central do pescoço. Procurou atendimento
médico ambulatorial, no qual foi solicitada dosagem
de hormônio tireoidiano (com resultados normais) e
ultrassonografia com punção aspirativa por agulha fina
(PAAF) do nódulo. O resultado foi nódulo de 1 cm em
lobo esquerdo da tireoide, hipoecoico, de margens
irregulares, sem calcificação. A PAAF não conseguiu
distinguir entre lesão maligna ou benigna (Bethesda IV).
O resultado do perfil de expressão gênica (PEG) indicou
suspeita para malignidade.`,
    alternativas: [
    { letra: 'E', texto: 'aumento da dor e do inchaço na região. A mãe' },
    { letra: 'A', texto: 'conduta médica adequada para esse caso é' },
    { letra: 'B', texto: 'repetir ultrassonografia e realizar nova punção' },
    { letra: 'C', texto: 'indicar tireoidectomia total com esvaziamento' },
    { letra: 'D', texto: 'indicar cirurgia com retirada apenas do lobo' }
    ],
  },
  { id: 'q2020-016', ano: 2020, numero: 16, area: 'G. Obstetrícia',
    gabarito: 'C',
    enunciado: `Uma mulher com 20 anos de idade, com 10 semanas
de gestação, retorna para consulta de pré-natal
com exames de rotina. A urocultura apresentou
crescimento bacteriano maior que 10 5 UFC/mL
(unidades formadoras de colônias por mL). A paciente
relatou aumento da frequência urinária, entretanto
negou sintomas como disúria, urgência miccional,
noctúria, dor suprapúbica ou febre.
Nesse caso, qual é o achado semiológico que contribui
para esse diagnóstico?`,
    alternativas: [
    { letra: 'A', texto: 'Reflexos patelares exaltados associados à presença' },
    { letra: 'B', texto: 'Tremor em repouso, de baixa frequência e algo' },
    { letra: 'C', texto: 'Diminuição da sensibilidade vibratória e da' },
    { letra: 'D', texto: 'cistite aguda; ciprofloxacina.' }
    ],
  },
  { id: 'q2020-018', ano: 2020, numero: 18, area: 'Saúde Pública',
    gabarito: 'B',
    enunciado: `Um paciente com 23 anos de idade procurou
atendimento em Unidade Básica de Saúde devido
ao aparecimento de dor ocular intensa. Ele relatou
ser soldador e que, no dia anterior, não utilizou seu
equipamento de proteção durante sua atividade
com a solda elétrica. Acredita que pode ter entrado
corpo estranho nos olhos, por isso resolveu
procurar atendimento. Na inspeção, apresentou
lacrimejamento e fotofobia.
Em função de o paciente estar em tratamento
imunossupressor com ciclosporina e tacrolimus,
qual é o tratamento antimicrobiano adequado a ser
prescrito?`,
    alternativas: [
    { letra: 'A', texto: 'Sulfametoxazol-trimetoprim.' },
    { letra: 'B', texto: 'Levofloxacino.' },
    { letra: 'C', texto: 'Azitromicina.' },
    { letra: 'D', texto: 'Doxiciclina.' }
    ],
  },
  { id: 'q2020-019', ano: 2020, numero: 19, area: 'G. Obstetrícia',
    gabarito: 'A',
    enunciado: `Uma gestante com 18 anos de idade e 32 semanas
de gestação realizou tratamento com penicilina
benzatina para sífilis no final do primeiro trimestre
de gestação. Desde então, não compareceu às
consultas de pré-natal porque ficou isolada em casa
devido à pandemia da COVID-19. A paciente, então,
retorna com resultado de exames mostrando VDRL
com aumento de duas diluições em relação ao título
anterior.
Um homem com 54 anos de idade, transplantado
renal há 3 meses, apresenta, há cerca de 7 dias, febre
elevada (> 40 o C), tosse pouco produtiva (escarro
pouco purulento) e dor torácica à esquerda. Ele
procurou o serviço onde realizou o transplante de
órgão, sendo observada a presença de febre elevada e
ausculta pulmonar com estertores crepitantes difusos,
além de semiologia compatível com derrame pleural à
esquerda. O Gram de escarro não mostrou patógenos,
mas apenas alguns polimorfonucleares. A Tomografia
Computadorizada de Tórax (TCT), realizada no mesmo
dia, revelou opacidades alveolares arredondadas e
derrame pleural leve à esquerda. Como o paciente
respondeu bem à administração de antitérmico,
mantendo bom estado hemodinâmico e padrão
respiratório satisfatório, foi liberado para casa com
prescrição de amoxicilina-clavulanato. No entanto,
após 4 dias de tratamento, mantinha-se febril, sem
melhora do quadro clínico. Nova TCT revelou que
algumas das opacidades parenquimatosas haviam
evoluído com escavação central. Foi formulada a
hipótese de pneumonia por Legionella pneumophila .
Nesse caso, a conduta apropriada é`,
    alternativas: [
    { letra: 'A', texto: 'repetir o VDRL e adotar conduta expectante.' },
    { letra: 'B', texto: 'instituir novo tratamento com outro fármaco.' },
    { letra: 'C', texto: 'repetir o tratamento com penicilina benzatina.' },
    { letra: 'D', texto: 'encaminhar a paciente ao serviço pré-natal de alto' }
    ],
  },
  { id: 'q2020-020', ano: 2020, numero: 20, area: 'Cardiologia',
    gabarito: 'A',
    enunciado: `Um escolar com 9 anos da idade comparece à consulta médica de rotina em Unidade Básica de Saúde. O
paciente apresenta crises de broncoespasmo recorrentes desde 4 anos de idade, com sintomas diurnos 3
vezes por semana e despertar noturno sempre com necessidade de uso de β2-agonista de curta duração por
demanda. Ele não consegue realizar atividades comuns da infância, como correr com seus amigos. Refere
controle ambiental adequado. Há 4 meses, faz uso contínuo de corticoide inalatório em dose baixa. Ao exame
físico, apresenta-se em bom estado geral, corado, hidratado e eupneico. Possui auscultas cardíaca e respiratória
normais.
Qual é a classificação da asma e a terapêutica recomendada, além do uso do β2-agonista de curta duração por
demanda?`,
    alternativas: [
    { letra: 'A', texto: 'Asma parcialmente controlada; uso contínuo de corticoide inalatório em dose média.' },
    { letra: 'B', texto: 'Asma parcialmente controlada; uso contínuo de corticoide oral em doses baixas.' },
    { letra: 'C', texto: 'Asma não controlada; uso contínuo de corticoide inalatório em dose média.' },
    { letra: 'D', texto: 'Asma não controlada; uso contínuo de corticoide oral em doses baixas.' }
    ],
  },
  { id: 'q2020-021', ano: 2020, numero: 21, area: 'Pediatria',
    gabarito: 'B',
    enunciado: `Na enfermaria de uma maternidade, encontram-se internadas quatro puérperas. Todas tiveram partos vaginais
sem intercorrências.
• Paciente 1: 22 anos, G2P2A0, classificação sanguínea da mãe foi A positivo; classificação sanguínea do
recém-nascido foi O negativo.
• Paciente 2: 30 anos, G1P1A0, classificação sanguínea da mãe foi O negativo; classificação sanguínea do
recém-nascido foi O negativo.
• Paciente 3: 27 anos, G1P1A0, classificação sanguínea da mãe foi O negativo; classificação sanguínea do
recém-nascido foi A positivo.
• Paciente 4: 20 anos, G2P2A0, classificação sanguínea da mãe foi A positivo; classificação sanguínea do
recém-nascido foi A positivo.
Deve ser prescrita imunoglobulina anti-Rh, antes da alta hospitalar, apenas para`,
    alternativas: [
    { letra: 'A', texto: 'a paciente 1.' },
    { letra: 'B', texto: 'a paciente 3.' },
    { letra: 'C', texto: 'as pacientes 1 e 4.' },
    { letra: 'D', texto: 'as pacientes 2 e 3.' }
    ],
  },
  { id: 'q2020-022', ano: 2020, numero: 22, area: 'Cirurgia',
    gabarito: 'C',
    enunciado: `Um homem com 51 anos de idade, assintomático, comparece à consulta agendada na Unidade de Saúde da
Família do seu bairro. Afirma ter procurado atendimento porque sua última consulta médica foi há 7 anos e
ficou apreensivo após seu vizinho comentar que havia descoberto um câncer no intestino depois de realizar
exames de rotina. Nega comorbidades, uso regular de medicamentos, cirurgias prévias e história de câncer na
família.
Como o médico de família deve abordar essa situação?`,
    alternativas: [
    { letra: 'A', texto: 'Solicitar o exame de sangue oculto nas fezes e orientar que ele é suficiente para o diagnóstico de câncer de' },
    { letra: 'B', texto: 'Orientar que os exames para detecção de câncer de cólon e reto devem ser realizados apenas em pacientes' },
    { letra: 'C', texto: 'Solicitar o exame de sangue oculto nas fezes e orientar que, se positivo, o paciente poderá realizar' },
    { letra: 'D', texto: 'Orientar que o exame de colonoscopia para rastreamento do câncer de cólon e reto está indicado apenas' }
    ],
  },
  { id: 'q2020-023', ano: 2020, numero: 23, area: 'Clínica Médica',
    gabarito: 'D',
    enunciado: ``,
    alternativas: [
    { letra: 'A', texto: 'paciente. Seguindo a rotina hospitalar,  foi colhido swab para teste de COVID-19 por RT-PCR, mesmo com a' },
    { letra: 'B', texto: 'cirurgia adiada até obtenção do resultado do RT-PCR, a ser feita por via laparoscópica ou aberta, com' },
    { letra: 'C', texto: 'cirurgia de emergência, por via laparoscópica ou aberta, com equipe cirúrgica utilizando os seguintes' },
    { letra: 'D', texto: 'cirurgia de emergência somente por via aberta, com equipe cirúrgica utilizando os seguintes equipamentos' }
    ],
  },
  { id: 'q2020-024', ano: 2020, numero: 24, area: 'Cardiologia',
    gabarito: 'A',
    enunciado: `Uma mulher com 69 anos de idade, hipertensa, em uso de enalapril 40 mg/dia e de hidroclorotiazida 25 mg/dia,
tem palpitações, tremores de membros superiores e dispneia que começaram há cerca de 30 minutos, logo após ter
sido assaltada. Está orientada, corada, sem déficits motores focais, FC = 110 bpm, PA = 200 x 120 mmHg em membros
superiores. Ausculta cardíaca: bulhas normofonéticas, ritmo regular em 2 tempos, sem sopros. Pulsos radiais e
femorais amplos, bilateralmente, FR = 24 irpm, sem esforço respiratório. Ausculta pulmonar normal. Oximetria de
pulso de 99 % (em ar ambiente). O eletrocardiograma mostra taquicardia sinusal e sinais de sobrecarga ventricular
esquerda.`,
    alternativas: [
    { letra: 'A', texto: 'abordagem inicial adequada para essa paciente é administrar' },
    { letra: 'B', texto: 'ansiolítico por via oral, mantendo-a em observação em local tranquilo e reavaliando os níveis pressóricos' },
    { letra: 'C', texto: 'nitroglicerina por via endovenosa contínua, ajustando a dose a cada 5 minutos até alcançar níveis pressóricos' },
    { letra: 'D', texto: 'metoprolol em bolus por via endovenosa, repetindo a medicação se PA permanecer acima de 180 x 100' }
    ],
  },
  { id: 'q2020-025', ano: 2020, numero: 25, area: 'Pediatria',
    gabarito: 'C',
    enunciado: `Um menino com 8 anos de idade comparece à Unidade Básica de Saúde, acompanhado de sua mãe, para
consulta anual. Quando perguntada sobre a atividade física, a mãe relata que a criança frequenta a escola de
manhã e não gosta de realizar as atividades que exigem esforço físico na escola e, em casa, tem o hábito de
jogar videogame e jogos pelo celular. No recordatório alimentar foi observada alta ingesta de carboidratos. A
avaliação antropométrica apresenta estatura de 130 cm e peso de 37 kg.
Fonte: WHO Growht reference data for 8-19 years, 2007.
Com base na situação e no quadro apresentados e de acordo com o Índice de Massa Corporal (IMC) para a
idade, qual é a classificação do estado nutricional do menino?`,
    alternativas: [
    { letra: 'A', texto: 'Obesidade.' },
    { letra: 'B', texto: 'Sobrepeso.' },
    { letra: 'C', texto: 'Obesidade grave.' },
    { letra: 'D', texto: 'Risco de sobrepeso.' }
    ],
  },
  { id: 'q2017-008', ano: 2017, numero: 8, area: 'G. Obstetrícia',
    gabarito: null,
    enunciado: `8
INEP1703 | 001-ProvaObjetiva-V2-Manhã
REVALIDA 2017
questão
questão
Uma mulher com 30 anos de idade, primigesta,
com gestação a termo, internada em um hospital,
apresenta pré-eclâmpsia com sinais de sofrimento
fetal, tendo-se optado por interrupção da gestação.
Em seu prontuário, registra-se que, no segundo
trimestre da gestação, a paciente havia apresentado
dosagens de TSH = 5,0 mcU/L (valor de referência: 0,3 a
4,0 mcU/L) e de T4 livre = 0,7 ng/L (valor de referência:
0,9 a 1,7 ng/L), tendo sido aumentada a dose da
levotiroxina que a paciente usava algum tempo antes de
iniciada a gravidez, de 50 mcg para 100 mcg.
Uma mulher com 32 anos de idade procura Unidade
Básica de Saúde com queixa de dores intensas nas
articulações das mãos e dos pés associadas à rigidez
matinal, com duração de cerca de 15 minutos e prejuízo
funcional. Relata que os sintomas começaram há
3 meses, quando, ao passar as férias de verão em
outro estado, apresentou quadro de febre alta, além de
manchas vermelhas no rosto, nos braços e no tórax,
que persistiram por cerca de 10 dias. Informa que não
procurou atendimento médico na ocasião, passando a
fazer uso de dipirona para alívio da dor, com melhora não
satisfatória. O exame clínico atual da paciente evidencia
edema e dor nas articulações interfalangianas distais,
bilateralmente, e em tornozelos, não sendo observados,
no momento, lesões de pele, mucosas ou nódulos
subcutâneos. Os resultados do hemograma completo e
do exame de urina de rotina revelaram-se normais.
No puerpério imediato, ainda durante a sua internação
hospitalar, qual deve ser a indicação adequada para a
paciente quanto à dose diária de levotiroxina?`,
    alternativas: [
    { letra: 'A', texto: 'Manter a dose de 100 mcg até o 28 o dia de puerpério.' },
    { letra: 'B', texto: 'Retornar o uso regular para a dose pré-gestacional de' },
    { letra: 'C', texto: 'Aumentar para 125 mcg e manter durante o período' },
    { letra: 'D', texto: 'Suspender o uso dessa medicação e avaliar,' },
    { letra: 'E', texto: 'ativa, ao ser atendida em uma Unidade Básica de' }
    ],
  },
  { id: 'q2017-008', ano: 2017, numero: 8, area: 'G. Obstetrícia',
    gabarito: null,
    enunciado: `8
INEP1703 | 001-ProvaObjetiva-V2-Manhã
REVALIDA 2017
questão
questão
Uma mulher com 30 anos de idade, primigesta,
com gestação a termo, internada em um hospital,
apresenta pré-eclâmpsia com sinais de sofrimento
fetal, tendo-se optado por interrupção da gestação.
Em seu prontuário, registra-se que, no segundo
trimestre da gestação, a paciente havia apresentado
dosagens de TSH = 5,0 mcU/L (valor de referência: 0,3 a
4,0 mcU/L) e de T4 livre = 0,7 ng/L (valor de referência:
0,9 a 1,7 ng/L), tendo sido aumentada a dose da
levotiroxina que a paciente usava algum tempo antes de
iniciada a gravidez, de 50 mcg para 100 mcg.
Uma mulher com 32 anos de idade procura Unidade
Básica de Saúde com queixa de dores intensas nas
articulações das mãos e dos pés associadas à rigidez
matinal, com duração de cerca de 15 minutos e prejuízo
funcional. Relata que os sintomas começaram há
3 meses, quando, ao passar as férias de verão em
outro estado, apresentou quadro de febre alta, além de
manchas vermelhas no rosto, nos braços e no tórax,
que persistiram por cerca de 10 dias. Informa que não
procurou atendimento médico na ocasião, passando a
fazer uso de dipirona para alívio da dor, com melhora não
satisfatória. O exame clínico atual da paciente evidencia
edema e dor nas articulações interfalangianas distais,
bilateralmente, e em tornozelos, não sendo observados,
no momento, lesões de pele, mucosas ou nódulos
subcutâneos. Os resultados do hemograma completo e
do exame de urina de rotina revelaram-se normais.
No puerpério imediato, ainda durante a sua internação
hospitalar, qual deve ser a indicação adequada para a
paciente quanto à dose diária de levotiroxina?`,
    alternativas: [
    { letra: 'A', texto: 'Manter a dose de 100 mcg até o 28 o dia de puerpério.' },
    { letra: 'B', texto: 'Retornar o uso regular para a dose pré-gestacional de' },
    { letra: 'C', texto: 'Aumentar para 125 mcg e manter durante o período' },
    { letra: 'D', texto: 'Suspender o uso dessa medicação e avaliar,' },
    { letra: 'E', texto: 'ativa, ao ser atendida em uma Unidade Básica de' }
    ],
  },
  { id: 'q2017-008', ano: 2017, numero: 8, area: 'G. Obstetrícia',
    gabarito: null,
    enunciado: `8
INEP1703 | 001-ProvaObjetiva-V1-Manhã
REVALIDA 2017
questão
questão
Uma mulher com 32 anos de idade procura Unidade
Básica de Saúde com queixa de dores intensas nas
articulações das mãos e dos pés associadas à rigidez
matinal, com duração de cerca de 15 minutos e prejuízo
funcional. Relata que os sintomas começaram há
3 meses, quando, ao passar as férias de verão em
outro estado, apresentou quadro de febre alta, além de
manchas vermelhas no rosto, nos braços e no tórax,
que persistiram por cerca de 10 dias. Informa que não
procurou atendimento médico na ocasião, passando a
fazer uso de dipirona para alívio da dor, com melhora não
satisfatória. O exame clínico atual da paciente evidencia
edema e dor nas articulações interfalangianas distais,
bilateralmente, e em tornozelos, não sendo observados,
no momento, lesões de pele, mucosas ou nódulos
subcutâneos. Os resultados do hemograma completo e
do exame de urina de rotina revelaram-se normais.
Uma mulher com 30 anos de idade, primigesta,
com gestação a termo, internada em um hospital,
apresenta pré-eclâmpsia com sinais de sofrimento
fetal, tendo-se optado por interrupção da gestação.
Em seu prontuário, registra-se que, no segundo
trimestre da gestação, a paciente havia apresentado
dosagens de TSH = 5,0 mcU/L (valor de referência: 0,3 a
4,0 mcU/L) e de T4 livre = 0,7 ng/L (valor de referência:
0,9 a 1,7 ng/L), tendo sido aumentada a dose da
levotiroxina que a paciente usava algum tempo antes de
iniciada a gravidez, de 50 mcg para 100 mcg.
No puerpério imediato, ainda durante a sua internação
hospitalar, qual deve ser a indicação adequada para a
paciente quanto à dose diária de levotiroxina?`,
    alternativas: [
    { letra: 'A', texto: 'Manter a dose de 100 mcg até o 28 o dia de puerpério.' },
    { letra: 'B', texto: 'Retornar o uso regular para a dose pré-gestacional de' },
    { letra: 'C', texto: 'Aumentar para 125 mcg e manter durante o período' },
    { letra: 'D', texto: 'Suspender o uso dessa medicação e avaliar,' },
    { letra: 'E', texto: 'ativa, ao ser atendida em uma Unidade Básica de' }
    ],
  },
  { id: 'q2017-008', ano: 2017, numero: 8, area: 'G. Obstetrícia',
    gabarito: null,
    enunciado: `8
INEP1703 | 001-ProvaObjetiva-V1-Manhã
REVALIDA 2017
questão
questão
Uma mulher com 32 anos de idade procura Unidade
Básica de Saúde com queixa de dores intensas nas
articulações das mãos e dos pés associadas à rigidez
matinal, com duração de cerca de 15 minutos e prejuízo
funcional. Relata que os sintomas começaram há
3 meses, quando, ao passar as férias de verão em
outro estado, apresentou quadro de febre alta, além de
manchas vermelhas no rosto, nos braços e no tórax,
que persistiram por cerca de 10 dias. Informa que não
procurou atendimento médico na ocasião, passando a
fazer uso de dipirona para alívio da dor, com melhora não
satisfatória. O exame clínico atual da paciente evidencia
edema e dor nas articulações interfalangianas distais,
bilateralmente, e em tornozelos, não sendo observados,
no momento, lesões de pele, mucosas ou nódulos
subcutâneos. Os resultados do hemograma completo e
do exame de urina de rotina revelaram-se normais.
Uma mulher com 30 anos de idade, primigesta,
com gestação a termo, internada em um hospital,
apresenta pré-eclâmpsia com sinais de sofrimento
fetal, tendo-se optado por interrupção da gestação.
Em seu prontuário, registra-se que, no segundo
trimestre da gestação, a paciente havia apresentado
dosagens de TSH = 5,0 mcU/L (valor de referência: 0,3 a
4,0 mcU/L) e de T4 livre = 0,7 ng/L (valor de referência:
0,9 a 1,7 ng/L), tendo sido aumentada a dose da
levotiroxina que a paciente usava algum tempo antes de
iniciada a gravidez, de 50 mcg para 100 mcg.
No puerpério imediato, ainda durante a sua internação
hospitalar, qual deve ser a indicação adequada para a
paciente quanto à dose diária de levotiroxina?`,
    alternativas: [
    { letra: 'A', texto: 'Manter a dose de 100 mcg até o 28 o dia de puerpério.' },
    { letra: 'B', texto: 'Retornar o uso regular para a dose pré-gestacional de' },
    { letra: 'C', texto: 'Aumentar para 125 mcg e manter durante o período' },
    { letra: 'D', texto: 'Suspender o uso dessa medicação e avaliar,' },
    { letra: 'E', texto: 'ativa, ao ser atendida em uma Unidade Básica de' }
    ],
  },
  { id: 'q2017-015', ano: 2017, numero: 15, area: 'Clínica Médica',
    gabarito: null,
    enunciado: `15
INEP1703 | 001-ProvaObjetiva-V1-Manhã
REVALIDA 2017
questão
questão
Um trabalhador rural com 69 anos de idade, e história de
exposição prolongada ao sol, procura atendimento médico
devido a lesão de face demonstrada na figura abaixo.`,
    alternativas: [
    { letra: 'A', texto: 'paciente é internada na Unidade de Tratamento' },
    { letra: 'B', texto: 'Ressecção da lesão, com margem de 0,5 cm.' },
    { letra: 'C', texto: 'Encaminhamento do paciente para radioterapia.' },
    { letra: 'D', texto: 'Encaminhamento do paciente para quimioterapia.' },
    { letra: 'E', texto: 'procura a Unidade Básica de Saúde de referência,' }
    ],
  },
  { id: 'q2017-018', ano: 2017, numero: 18, area: 'Cardiologia',
    gabarito: null,
    enunciado: `18
INEP1703 | 001-ProvaObjetiva-V1-Manhã
REVALIDA 2017
questão
Uma mulher com 50 anos de idade é encaminhada ao ambulatório de Nefrologia pela Equipe de Saúde da Família
apresentando quadro de síndrome nefrótica. A paciente relata que, há 3 meses, iniciou-se edema nos tornozelos. O edema
ascendeu progressivamente, estando, atualmente, na altura dos joelhos. Refere ganho de 10 kg nesse período, além
de astenia. Nega hematúria, febre, lesões cutâneas ou queixas respiratórias. Relata ser diabética há 10 anos, fazendo
uso irregular de metformina (850 mg, 1 a 2 vezes/dia) e glibenclamida (5 mg, 1 a 2 vezes/dia), sem acompanhamento
médico há, pelo menos, 5 anos. O exame físico revela palidez cutâneo-mucosa, hipertensão arterial (pressão arterial
= 180 x 100 mmHg) e importante edema de membros inferiores (++++/4+). Os resultados dos exames solicitados
pelo médico da Equipe de Saúde da Família demonstram: hemoglobina = 10 g/dL (valor de referência: 12 a 14 g/dL),
hematócrito = 31% (valor de referência: 36 a 42%), VCM = 95 fL (valor de referência: 80 a 100 fL), HCM = 31 pg (valor
de referência: 27 a 32 pg), RDW = 13,4% (valor de referência: 11,5 a 15%); série branca e plaquetas normais; creatinina
= 4,8 mg/dL (valor de referência: 0,6 a 1,2 mg/dL), ureia = 190 mg/dL (valor de referência: 15 a 38 mg/dL); glicemia
de jejum = 230 mg/dL (valor de referência: < 126 mg/dL), hemoglobina glicada = 9,0% (valor de referência: < 6,5%);
sódio = 143 mEq/L (valor de referência:136 a 145 mEq/L), potássio = 5,5 mEq/L (valor de referência: 3,5 a 5,1 mEq/L);
colesterol total = 305 mg/dL (valor de referência: < 200 mg/dL), HDL = 30 mg/dL (valor de referência: > 45 mg/dL),
triglicerídeos = 322 mg/dL (valor de referência: < 150 mg/dL); albumina sérica = 2 g/dL (valor de referência: 3,5 a
4,5 g/dL); urina EAS = proteína +++ (valor de referência: ausente) e glicose ++ (valor de referência: ausente); proteinúria
de 24 h = 5 g (valor de referência: < 0,5 g). Após a avaliação inicial, é feita uma ultrassonografia, que mostra rins de
tamanho normal e, então, é realizada biópsia renal, cujo resultado indica esclerose nodular mesangial.`,
    alternativas: [
    { letra: 'A', texto: 'estabilização do comprometimento parenquimatoso e da função renal, desde que seja obtido o controle da glicemia.' },
    { letra: 'B', texto: 'estabilização do comprometimento parenquimatoso e da função renal, desde que seja obtido o controle da pressão' },
    { letra: 'C', texto: 'evolução para insuficiência renal crônica terminal por alteração da função renal, presença de hipertensão arterial e' },
    { letra: 'D', texto: 'evolução para insuficiência renal crônica terminal por alteração da função renal, persistência da hiperglicemia e' }
    ],
  },
  { id: 'q2017-026', ano: 2017, numero: 26, area: 'Cardiologia',
    gabarito: null,
    enunciado: `26
INEP1703 | 001-ProvaObjetiva-V1-Manhã
REVALIDA 2017
questão
Um homem com 60 anos de idade foi internado em um hospital municipal com quadro de confusão mental. O
paciente reside em outro município, a 300 km do hospital. Na admissão, o paciente se disse assintomático, relatou
que não costuma procurar atendimento médico e que preferia morar sozinho no sítio onde nasceu e cuida de
uma pequena lavoura. Os familiares que o acompanhavam confirmaram que ele não apresenta comorbidades
diagnosticadas, mas relataram que, há 5 dias, o paciente apresentou um episódio de confusão mental, tendo sido
levado para internação hospitalar. Acrescentaram que, na ocasião, foi diagnosticada e tratada uma infecção do
trato urinário e que, durante o exame físico, detectou-se uma arritmia cardíaca, confirmada por eletrocardiograma,
cujo resultado é reproduzido a seguir.
aVR
aVL
aVF
O resultado do eletrocardiograma realizado na internação atual apresenta o mesmo padrão. Agora, consciente e
orientado, sem queixas, o paciente manifesta desejo de ter alta e de retornar ao seu sítio, afirmando que não pretende
realizar outras consultas médicas.
Nesse contexto, qual é a conduta médica indicada?`,
    alternativas: [
    { letra: 'A', texto: 'Dar alta hospitalar ao paciente após introdução de digoxina.' },
    { letra: 'B', texto: 'Dar alta hospitalar ao paciente após a introdução e o ajuste da dose da varfarina.' },
    { letra: 'C', texto: 'Dar alta hospitalar ao paciente após introdução e ajuste de dose do betabloqueador.' },
    { letra: 'D', texto: 'Orientar os familiares para que busquem, por meios jurídicos, a guarda do idoso e o mantenham na sede do' }
    ],
  },
  { id: 'q2017-028', ano: 2017, numero: 28, area: 'Cardiologia',
    gabarito: null,
    enunciado: `questão
Durante plantão em enfermaria de um hospital, o médico
plantonista é chamado pela equipe de enfermagem
porque um homem, com 38 anos de idade, que aguarda
para realização de uma herniorrafia eletiva, apresenta
uma crise. Chegando ao quarto, o médico se depara com
o paciente referindo dor torácica, taquicardia, dispneia,
tontura e sudorese de início súbito. Imediatamente, o
médico avalia o paciente que refere medo de estar tendo
um ataque cardíaco e de “estar ficando louco”. Não possui
antecedentes de doença dignos de nota. Ao exame físico,
apresenta frequência cardíaca = 110 bpm e frequência
respiratória = 32 irpm, sem evidenciar outras alterações.
Avaliações cardiológica, metabólica e pulmonar de
emergência também apresentam resultados normais.
O paciente não tem histórico de doenças cardíacas
nem apresenta fatores de risco cardiovascular. O médico
chega à hipótese diagnóstica de crise de pânico.`,
    alternativas: [
    { letra: 'A', texto: 'filha revela estar preocupada com os problemas de' },
    { letra: 'B', texto: 'iniciar o diagnóstico diferencial de demências mediante' },
    { letra: 'C', texto: 'avaliar a possibilidade de tumor cerebral e solicitar' },
    { letra: 'D', texto: 'investigar a possibilidade de neurocisticercose e' }
    ],
  },
  { id: 'q2017-029', ano: 2017, numero: 29, area: 'Saúde Pública',
    gabarito: null,
    enunciado: `29
INEP1703 | 001-ProvaObjetiva-V2-Manhã
REVALIDA 2017
questão
questão
Um homem com 54 anos de idade, casado, sem história
familiar de câncer, solicita ao médico de família e
comunidade que o atende em consulta de rotina, em uma
Unidade Básica de Saúde, exame de sangue para “checar
se tem câncer de próstata”.`,
    alternativas: [
    { letra: 'A', texto: 'pressão arterial do paciente é de 165 x 95 mmHg.' },
    { letra: 'B', texto: 'Glaucoma; consulta de urgência.' },
    { letra: 'C', texto: 'Uveíte anterior; consulta de urgência.' },
    { letra: 'D', texto: 'Hemorragia subconjuntival; consulta ambulatorial.' }
    ],
  },
  { id: 'q2017-029', ano: 2017, numero: 29, area: 'Saúde Pública',
    gabarito: null,
    enunciado: `29
INEP1703 | 001-ProvaObjetiva-V2-Manhã
REVALIDA 2017
questão
questão
Um homem com 54 anos de idade, casado, sem história
familiar de câncer, solicita ao médico de família e
comunidade que o atende em consulta de rotina, em uma
Unidade Básica de Saúde, exame de sangue para “checar
se tem câncer de próstata”.`,
    alternativas: [
    { letra: 'A', texto: 'pressão arterial do paciente é de 165 x 95 mmHg.' },
    { letra: 'B', texto: 'Glaucoma; consulta de urgência.' },
    { letra: 'C', texto: 'Uveíte anterior; consulta de urgência.' },
    { letra: 'D', texto: 'Hemorragia subconjuntival; consulta ambulatorial.' }
    ],
  },
  { id: 'q2017-029', ano: 2017, numero: 29, area: 'Clínica Médica',
    gabarito: null,
    enunciado: `29
INEP1703 | 001-ProvaObjetiva-V1-Manhã
REVALIDA 2017
questão
questão`,
    alternativas: [
    { letra: 'A', texto: 'pressão arterial do paciente é de 165 x 95 mmHg.' },
    { letra: 'B', texto: 'Glaucoma; consulta de urgência.' },
    { letra: 'C', texto: 'Uveíte anterior; consulta de urgência.' },
    { letra: 'D', texto: 'Hemorragia subconjuntival; consulta ambulatorial.' }
    ],
  },
  { id: 'q2017-100', ano: 2017, numero: 100, area: 'Pediatria',
    gabarito: null,
    enunciado: `questão
Uma criança do sexo masculino, com 8 anos de idade,
é atendida em consulta com médico de Unidade
Secundária de Saúde para avaliação de transtorno de
comportamento. A mãe relata que o filho perde material
escolar com frequência, costuma esquecer as tarefas
do dia-a-dia e demora a atender quando chamado pelo
nome. Informa, ainda, que a criança é repreendida na
escola por não parar no mesmo lugar, levantar-se o tempo
todo da cadeira, falar demais e intrometer-se na conversa
alheia, além de ter notas ruins. O exame clínico não
evidencia anormalidades.
Uma adolescente com 16 anos de idade é trazida à
Unidade Básica de Saúde (UBS) pela mãe, apresentando
quadro de tristeza e amenorreia há 4 meses. A mãe
relata que o comportamento da adolescente tem mudado
desde que ela passou a frequentar o grupo de dança da
comunidade onde mora, há um ano. Informa que, desde
então, a filha vem perdendo peso e tem se alimentado
apenas com frutas e verduras, recusando-se a participar
dos eventos familiares e se isolando de amigos da escola,
embora continue a frequentar com assiduidade o grupo
de dança.
Ao exame físico, a adolescente mostra-se triste e
pouco interativa, está hipocorada, hidratada, eupneica.
Apresenta índice de massa corporal = 15 kg/m 2 ; pressão
arterial = 90 x 50 mmHg; frequência cardíaca = 55 bpm.
Observa-se discreto aumento do volume das parótidas
bilateralmente. Exames laboratoriais realizados na UBS
mostram anemia normocrômica/normocítica, elevação de
aminotransferases, hiponatremia, normocalemia e nível
de creatinina normal.
O diagnóstico e a conduta adequados ao caso são`,
    alternativas: [
    { letra: 'A', texto: 'desenvolvimento' },
    { letra: 'B', texto: 'transtorno de déficit de atenção/hiperatividade; iniciar' },
    { letra: 'C', texto: 'transtorno do espectro autista; encaminhar o paciente' },
    { letra: 'D', texto: 'transtorno de déficit de atenção/hiperatividade; iniciar' },
    { letra: 'E', texto: 'orientar a família acerca do risco de suicídio e' }
    ],
  },
  { id: 'q2017-100', ano: 2017, numero: 100, area: 'Pediatria',
    gabarito: null,
    enunciado: `questão
Uma criança do sexo masculino, com 8 anos de idade,
é atendida em consulta com médico de Unidade
Secundária de Saúde para avaliação de transtorno de
comportamento. A mãe relata que o filho perde material
escolar com frequência, costuma esquecer as tarefas
do dia-a-dia e demora a atender quando chamado pelo
nome. Informa, ainda, que a criança é repreendida na
escola por não parar no mesmo lugar, levantar-se o tempo
todo da cadeira, falar demais e intrometer-se na conversa
alheia, além de ter notas ruins. O exame clínico não
evidencia anormalidades.
Uma adolescente com 16 anos de idade é trazida à
Unidade Básica de Saúde (UBS) pela mãe, apresentando
quadro de tristeza e amenorreia há 4 meses. A mãe
relata que o comportamento da adolescente tem mudado
desde que ela passou a frequentar o grupo de dança da
comunidade onde mora, há um ano. Informa que, desde
então, a filha vem perdendo peso e tem se alimentado
apenas com frutas e verduras, recusando-se a participar
dos eventos familiares e se isolando de amigos da escola,
embora continue a frequentar com assiduidade o grupo
de dança.
Ao exame físico, a adolescente mostra-se triste e
pouco interativa, está hipocorada, hidratada, eupneica.
Apresenta índice de massa corporal = 15 kg/m 2 ; pressão
arterial = 90 x 50 mmHg; frequência cardíaca = 55 bpm.
Observa-se discreto aumento do volume das parótidas
bilateralmente. Exames laboratoriais realizados na UBS
mostram anemia normocrômica/normocítica, elevação de
aminotransferases, hiponatremia, normocalemia e nível
de creatinina normal.
O diagnóstico e a conduta adequados ao caso são`,
    alternativas: [
    { letra: 'A', texto: 'desenvolvimento' },
    { letra: 'B', texto: 'transtorno de déficit de atenção/hiperatividade; iniciar' },
    { letra: 'C', texto: 'transtorno do espectro autista; encaminhar o paciente' },
    { letra: 'D', texto: 'transtorno de déficit de atenção/hiperatividade; iniciar' },
    { letra: 'E', texto: 'orientar a família acerca do risco de suicídio e' }
    ],
  },
  { id: 'q2017-100', ano: 2017, numero: 100, area: 'Pediatria',
    gabarito: null,
    enunciado: `questão
Uma adolescente com 16 anos de idade é trazida à
Unidade Básica de Saúde (UBS) pela mãe, apresentando
quadro de tristeza e amenorreia há 4 meses. A mãe
relata que o comportamento da adolescente tem mudado
desde que ela passou a frequentar o grupo de dança da
comunidade onde mora, há um ano. Informa que, desde
então, a filha vem perdendo peso e tem se alimentado
apenas com frutas e verduras, recusando-se a participar
dos eventos familiares e se isolando de amigos da escola,
embora continue a frequentar com assiduidade o grupo
de dança.
Ao exame físico, a adolescente mostra-se triste e
pouco interativa, está hipocorada, hidratada, eupneica.
Apresenta índice de massa corporal = 15 kg/m 2 ; pressão
arterial = 90 x 50 mmHg; frequência cardíaca = 55 bpm.
Observa-se discreto aumento do volume das parótidas
bilateralmente. Exames laboratoriais realizados na UBS
mostram anemia normocrômica/normocítica, elevação de
aminotransferases, hiponatremia, normocalemia e nível
de creatinina normal.
Uma criança do sexo masculino, com 8 anos de idade,
é atendida em consulta com médico de Unidade
Secundária de Saúde para avaliação de transtorno de
comportamento. A mãe relata que o filho perde material
escolar com frequência, costuma esquecer as tarefas
do dia-a-dia e demora a atender quando chamado pelo
nome. Informa, ainda, que a criança é repreendida na
escola por não parar no mesmo lugar, levantar-se o tempo
todo da cadeira, falar demais e intrometer-se na conversa
alheia, além de ter notas ruins. O exame clínico não
evidencia anormalidades.
O diagnóstico e a conduta adequados ao caso são`,
    alternativas: [
    { letra: 'A', texto: 'desenvolvimento' },
    { letra: 'B', texto: 'transtorno de déficit de atenção/hiperatividade; iniciar' },
    { letra: 'C', texto: 'transtorno do espectro autista; encaminhar o paciente' },
    { letra: 'D', texto: 'transtorno de déficit de atenção/hiperatividade; iniciar' },
    { letra: 'E', texto: 'orientar a família acerca do risco de suicídio e' }
    ],
  },
  { id: 'q2017-537', ano: 2017, numero: 537, area: 'Saúde Pública',
    gabarito: null,
    enunciado: `Região Centro-Oeste
1 648
537
1 012
234 687
Disponível em: <datasus.gov.br>. Acesso em: 17 mai. 2017.
Considerando os dados apresentados nessa tabela, assinale a alternativa que apresenta a faixa etária com maior taxa
de mortalidade no Brasil, em 2013, e as principais causas de óbito a ela associadas.`,
    alternativas: [
    { letra: 'A', texto: 'Entre 0 e 6 dias, por anomalias congênitas e afecções perinatais.' },
    { letra: 'B', texto: 'Entre 7 e 27 dias, por doenças infecciosas e de origem nutricional.' },
    { letra: 'C', texto: 'Entre 0 e 6 dias, por doenças infecciosas e fatores socioambientais.' },
    { letra: 'D', texto: 'Entre 28 e 364 dias, por causas relacionadas à assistência direta ao parto.' }
    ],
  },
  { id: 'q2015-009', ano: 2015, numero: 9, area: 'Clínica Médica',
    gabarito: null,
    enunciado: `Uma paciente de 41 anos de idade, com queixa de
dor epigástrica em queimação de longa data relacionada à
ingesta de alimentos condimentados, retorna em consulta
ambulatorial tendo como resultado de endoscopia
digestiva alta o diagnóstico de úlcera duodenal e
pesquisa de H.pylori positivo. Relatava uso esporádico de
antiácidos, mas com pouca melhora da dor. Nega uso de
anti-inflamatórios não esteroidais (AINES).
Considerando os aspectos organizativos e de gestão
dessa política, são responsabilidades do trabalho dessa
equipe
Qual a associação de medicamentos com melhor nível de
evidência científica para o tratamento desse caso?`,
    alternativas: [
    { letra: 'A', texto: 'garantir que o horário diário de funcionamento das' },
    { letra: 'B', texto: 'dialogar com a comunidade acerca das características' },
    { letra: 'C', texto: 'Inibidor da bomba de prótons, amoxicilina e' },
    { letra: 'D', texto: 'Antagonistas' },
    { letra: 'E', texto: 'organização do serviço, de  modo a estabelecer sua' }
    ],
  },
  { id: 'q2015-013', ano: 2015, numero: 13, area: 'Cardiologia',
    gabarito: null,
    enunciado: `Uma primigesta com 38 semanas de gestação é
admitida na Maternidade em trabalho de parto. O exame
obstétrico inicial revela feto em situação longitudinal,
apresentação cefálica, frequência cardíaca fetal = 140 bpm
sem desacelerações; dinâmica uterina com 2 contrações
moderadas em 10 minutos; colo uterino dilatado 4 cm e
apagado 40%; pelvimetria interna clínica com conjugata
diagonalis de 11 cm, medida do diâmetro bituberoso de
11 cm, espinhas isquiáticas não salientes. A amniorrexe
foi espontânea aos 6 cm de dilatação. O padrão de
contração uterina manteve-se com 4 contrações em 10
minutos e a paciente recebeu analgesia peridural. Após
12 horas de evolução do trabalho de parto, o exame
obstétrico revelou: colo uterino com 10 cm de dilatação,
feto com polo cefálico no plano –1 de De Lee e presença
de bossa serossanguínea.
Um homem de 45 anos de idade, sedentário,
obeso, é atendido no ambulatório com história de
constipação intestinal associada a tenesmo há uma
semana. Após utilizar laxativos orais, evoluiu com
hematoquesia e dor abdominal. No exame físico, apresenta
dentes supranumerários na arcada superior e cicatriz
cirúrgica à esquerda, devido a uma hemicolectomia por
tumor de cólon esquerdo.
Qual o diagnóstico mais provável sugerido por esse
quadro clínico?`,
    alternativas: [
    { letra: 'A', texto: 'Fístula e fissura anal.' },
    { letra: 'B', texto: 'Polipose retosigmoide.' },
    { letra: 'C', texto: 'Doença hemorroidária.' },
    { letra: 'D', texto: 'Doença diverticular do cólon.' }
    ],
  },
  { id: 'q2015-015', ano: 2015, numero: 15, area: 'Cardiologia',
    gabarito: null,
    enunciado: `EXAME NACIONAL DE REVALIDAÇÃO DE DIPLOMAS MÉDICOS EXPEDIDOS POR INSTITUIÇÕES DE EDUCAÇÃO SUPERIOR ESTRANGEIRAS
Prova Cinza
15
Uma mulher de 23 anos de idade foi admitida na Emergência em trabalho de parto, com ruptura de bolsa
uterina. Ela estava na 40ª semana de gestação e com pressão arterial de 170 x 100 mmHg. Duas horas após o parto,
apresentou crise convulsiva, sendo controlada com medicação. Uma hora depois, apresentou nova crise convulsiva,
que evoluiu para coma, seguido de parada cardíaca irreversível e óbito. A figura a seguir apresenta o formulário relativo
ao atestado de óbito.
Como se deve preencher adequadamente o atestado de óbito?`,
    alternativas: [
    { letra: 'A', texto: 'Parte I: a - coma; b - crise convulsiva; c - crise hipertensiva. Parte II: (sem preenchimento).' },
    { letra: 'B', texto: 'Parte I: a - parada cardíaca; b - coma; c - edema cerebral; d - crise convulsiva. Parte II: eclâmpsia.' },
    { letra: 'C', texto: 'Parte I: a - parada cardíaca; b - coma; c - crise convulsiva; d - crise hipertensiva. Parte II: hipertensão.' },
    { letra: 'D', texto: 'Parte I: a - coma; b - edema cerebral; c - crise convulsiva; d - eclâmpsia no puerpério. Parte II: gestação de 40' }
    ],
  },
  { id: 'q2015-017', ano: 2015, numero: 17, area: 'Cardiologia',
    gabarito: null,
    enunciado: `Uma gestante de 28 anos de idade, primigesta,
comparece à Unidade Básica de Saúde no dia 25 de
junho de 2015, relatando que “seu bebê passou da data
de nascer”. Ao verificar o cartão da gestante, o médico
encontrou anotação de data da última menstruação
de 06/09/2014 e realização de ultrassonografia em
01/11/2014, mostrando idade gestacional de 08 semanas
pela biometria fetal. Ao exame obstétrico: altura uterina =
34 cm, feto único, cefálico, insinuado, frequência cardíaca
fetal = 140 bpm sem desacelerações, colo apagado 50%,
fechado e pressão arterial = 100 x 60 mmHg.
7,28, PaO2 = 76 mmHg, PaCO2 = 32 mmHg, HCO 3 = 16,
BE = -10 e saturação de O 2 = 92% (valores normais:
pH = 7,35 - 7,45, PaO 2 = 80 - 108 mmHg, PaCO 2 = 35 - 48 mmHg,
HCO 3 = 22 - 26, BE = -2 a +2 e saturação de O 2 = (>93%)).
Nesse momento, além da expansão volêmica, constitui
conduta correta para as próximas horas:`,
    alternativas: [
    { letra: 'A', texto: 'início imediato de antibioticoterapia empírica, uso de' },
    { letra: 'B', texto: 'Encaminhar a gestante para a maternidade para' },
    { letra: 'C', texto: 'Encaminhar a gestante a uma maternidade de alto' },
    { letra: 'D', texto: 'Liberar a gestante para casa, informando que o' }
    ],
  },
  { id: 'q2015-026', ano: 2015, numero: 26, area: 'Clínica Médica',
    gabarito: null,
    enunciado: `Uma paciente de 37 anos de idade encontra-se
internada em hospital de referência há dois dias, com
diagnóstico clínico e laboratorial de pancreatite aguda
leve. Nega quadro semelhante previamente. O ultrassom
abdominal realizado na admissão mostrou colelitíase
(cálculos múltiplos) sem dilatação de vias biliares
intra e extra hepáticas. Os exames séricos realizados
na admissão mostraram: hemoglobina = 12 g/dL
Os exames laboratoriais iniciais revelaram:
(valor normal = 11 a 15 g/dL); hematócrito = 36% (valor
Hemoglobina = 8,3 g/dL (VR = 11,5 - 15 g/dL);
Hematócrito = 25,2% (VR = 35 - 45%);
VCM = 90 fL (VR = 80 – 96 fL);
Leucócitos = 7.500/mm 3 , com contagem diferencial
normal;
Plaquetas = 197.000/mm 3 (VR = 100.000 - 400.000 mm 3 ) ;
Reticulócitos = 7,4% (VR = 0,5 – 1,5%);
Desidrogenase láctica = 870 U/L (VR = 240 – 480 U/L);
Aspartato aminotransferase = 52 U/L (VR = até 38 U/L).
normal = 35 a 45%); glóbulos brancos (GB) = 11.000 mm 3
(9% de bastonetes e 80% de segmentados - valores
normais: GB entre 4.000 e 11.000 mm 3 com menos de 10%
de bastonetes); amilase = 2.120 mg/dL (até 120 mg/dL);
TGO = 76 (até 40 mg/dL); TGP = 60 (até 25 mg/dL);
bilirrubina total = 0,6 (até 0,8 mg/dL); bilirrubina direta = 0,4
(até 0,5 mg/dL); sódio = 134 mEq/L (valor normal entre
135 e 145 mEq/L) e potássio = 3,6 mEq/L (valor normal
Com base no quadro descrito, qual exame complementar
deveria ser realizado a fim de se obter o provável
diagnóstico etiológico?
entre 3,5 e 4,5 mEq/L). Com o tratamento instituído,
houve melhora quase completa da dor abdominal e a
paciente teve boa aceitação da dieta que foi liberada.`,
    alternativas: [
    { letra: 'A', texto: 'Teste de Coombs direto.' },
    { letra: 'B', texto: 'Hematoscopia de sangue periférico.' },
    { letra: 'C', texto: 'Teste de solubilidade da hemoglobina.' },
    { letra: 'D', texto: 'Cromatografia líquida de alto desempenho.' },
    { letra: 'E', texto: 'colecistectomia, se houver mais um episódio de' }
    ],
  },
  { id: 'q2015-029', ano: 2015, numero: 29, area: 'Clínica Médica',
    gabarito: null,
    enunciado: `Um menino de 7 anos de idade, filho de genitor desconhecido, presenciou a morte da mãe. Desde então,
passou a apresentar alterações do sono, com terror noturno. Na escola, mudou seu comportamento, passou a se
isolar das brincadeiras com os colegas, desmonstrando alteração no humor. Além disso, desistiu das aulas de violão
que antes gostava de frequentar. A tia materna, que assumiu sua criação, o levou ao ambulatório em busca de ajuda.
Nesse caso, além da intervenção multiprofissional, qual a conduta adequada?`,
    alternativas: [
    { letra: 'A', texto: 'Suspender as atividades escolares, com retorno progressivo, e prescrever clonidina.' },
    { letra: 'B', texto: 'Sugerir a manutenção da rotina diária e ingresso em terapia cognitiva-comportamental.' },
    { letra: 'C', texto: 'Sugerir aumento da ingestão de cálcio e ingresso em psicoterapia individual e em grupo.' },
    { letra: 'D', texto: 'Instruir que as atividades escolares sejam desempenhadas em casa, e prescrever sertralina.' }
    ],
  },
  { id: 'q2015-031', ano: 2015, numero: 31, area: 'Infectologia',
    gabarito: null,
    enunciado: `Uma menina de 4 anos de idade é trazida à
Unidade Básica de Saúde, pois apresentou há dez
dias manchas eritematopapulares coalescentes em
face e palidez perioral, associadas a episódio de
febre de 37,9 ºC. O quadro evoluiu nos cinco dias
seguintes com manchas eritematopapulares em braços,
tronco e nádegas, que esvaneceram com aparência
reticulada. Oito dias depois, após exposição solar, as
manchas retornaram na face e no tronco. O estado
geral é bom, sem outras alterações no exame físico.`,
    alternativas: [
    { letra: 'A', texto: 'Punção aspirativa do nódulo tireoidiano por agulha' },
    { letra: 'B', texto: 'Cintilografia da tireoide para avaliação do nódulo' },
    { letra: 'C', texto: 'Excisão cirúrgica do nódulo tiroideano e exame' },
    { letra: 'D', texto: 'Ultrassonografias' }
    ],
  },
  { id: 'q2015-036', ano: 2015, numero: 36, area: 'Pediatria',
    gabarito: null,
    enunciado: `Uma mulher de 19 anos de idade não fez pré-
natal e foi internada na maternidade em trabalho de
parto. Nasceu uma criança do sexo masculino em boas
condições. Os exames realizados na admissão da
paciente revelaram sorologia positiva para HIV.
Em relação à amamentação, assinale a orientação correta:`,
    alternativas: [
    { letra: 'A', texto: 'Estimular o aleitamento materno sob livre demanda.' },
    { letra: 'B', texto: 'Inibir a lactação com cabergolina e iniciar fórmula' },
    { letra: 'C', texto: 'Realizar a alimentação do recém-nascido com o leite' },
    { letra: 'D', texto: 'Liberar a amamentação após avaliação da carga viral' },
    { letra: 'E', texto: 'início da terapia antiretroviral para a mãe.' }
    ],
  },
  { id: 'q2015-039', ano: 2015, numero: 39, area: 'Pediatria',
    gabarito: null,
    enunciado: `Um lactente de 4 meses de vida é trazido à
consulta de Puericultura em Unidade Básica de Saúde. A
mãe relata lacrimejamento persistente no olho esquerdo,
desde o nascimento. Realizou tratamento para conjuntivite
com colírio de tobramicina por três vezes nos últimos dois
meses, sem melhoras. Ao exame físico, constatou-se
lacrimejamento em olho esquerdo, com leve hiperemia
conjuntival, sem secreção ou edema palpebral.`,
    alternativas: [
    { letra: 'A', texto: 'conduta adequada nesse caso é' },
    { letra: 'B', texto: 'indicar colírio antialérgico.' },
    { letra: 'C', texto: 'tratar com novo colírio antibiótico.' },
    { letra: 'D', texto: 'massagear a região nasolacrimal para desobstrução.' }
    ],
  },
  { id: 'q2015-041', ano: 2015, numero: 41, area: 'Saúde Pública',
    gabarito: null,
    enunciado: `Uma paciente de 40 anos de idade procura a
Unidade Básica de Saúde com ferimento corto-contuso
de 7 cm de extensão na face anterior da coxa direita, de
bordas regulares, acometendo pele, tecido subcutâneo e
musculatura, causado por vidro, o sangramento local é de
pequena monta. Informa reforço de vacina antitetânica há
1 ano.`,
    alternativas: [
    { letra: 'A', texto: 'partir do quadro clínico, laboratorial e da imagem' },
    { letra: 'B', texto: 'Inciar o tratamento com antirretroviral (lamivudina' },
    { letra: 'C', texto: 'Iniciar tratamento com RIPE (rifampicina + isoniazida' },
    { letra: 'D', texto: 'Iniciar o tratamento com RIPE (rifampicina +' }
    ],
  },
  { id: 'q2015-044', ano: 2015, numero: 44, area: 'Saúde Pública',
    gabarito: null,
    enunciado: `Uma Equipe de Saúde da Família, juntamente
com membros do Conselho de Saúde Local, trabalha no
diagnóstico comunitário de saúde. Chama atenção o alto
número de casos de verminose e diarreia diagnosticados
na Unidade de Saúde. A falta de tratamento dos dejetos
domiciliares, o uso de águas de poço raso, o baixo nível
socioeconômico e o fato da coleta de lixo ocorrer apenas
uma vez por semana são possíveis fatores identificados
como causadores ou agravantes do problema.
Uma mulher de 42 anos de idade realizou auto-
exame das mamas e detectou nodulação na mama direita,
com aumento da sensibilidade local. Na consulta com o
médico foi realizado exame das mamas, que revelou
mamas difusamente densas à palpação, sem nódulos
palpáveis, descarga papilar ou linfonodomegalia. Foi
solicitada mamografia, com o seguinte resultado: mamas
São propostas recomendáveis como atividades de
prevenção primária, prevenção terciária e vigilância em
saúde, respectivamente, o(a)
densas difusamente, BI-RADS 0 (resultado inconclusivo).`,
    alternativas: [
    { letra: 'A', texto: 'atividade de educação em saúde sobre destino correto' },
    { letra: 'B', texto: 'mapeamento dos casos; tratamento dos casos;' },
    { letra: 'C', texto: 'atividade de educação em saúde sobre destino correto' },
    { letra: 'D', texto: 'tratamento dos casos; atividade de educação em' }
    ],
  },
  { id: 'q2015-057', ano: 2015, numero: 57, area: 'Cardiologia',
    gabarito: null,
    enunciado: `Um adolescente do sexo masculino de 12 anos de idade é levado à Emergência para avaliação clínica.
Apresenta quadro de febre, cefaleia e vômitos com 12h de evolução. A mãe nega antecedentes patológicos relevantes.
Exame físico: bom estado geral, com fotofobia, hipocorado 1+/4+, desidratado 1+/4+, anictérico e acianótico. Aparelho
respiratório, ausculta cardíaca e exame abdominal sem anormalidades. Não apresenta sinais focais e as pupilas
são isocóricas e fotorreativas. Apresenta sinal de Brudzinski positivo. Exame do líquor evidencia glicose = 40 mg/dL
(VR = 40 - 70 mg/dL); 1.000 células/mm 3 , 80% de neutrófilos (VR = 0 - 5 células/mm 3 ); proteínas = 150 mg/dL
(VR = 8 - 32 mg/dL).
Tendo em vista o quadro acima descrito, o diagnóstico mais provável e o respectivo tratamento são`,
    alternativas: [
    { letra: 'A', texto: 'meningite fúngica e anfotericina B.' },
    { letra: 'B', texto: 'meningite bacteriana e ceftriaxone.' },
    { letra: 'C', texto: 'meningite viral e medicação sintomática.' },
    { letra: 'D', texto: 'meningite tuberculosa e esquema tríplice.' }
    ],
  },
  { id: 'q2015-064', ano: 2015, numero: 64, area: 'Neurologia',
    gabarito: null,
    enunciado: `Uma paciente de 20 anos de idade, Gesta 2 Para
1 Aborto 1, procura atendimento médico para orientação
quanto à contracepção. Desde os 8 anos de idade tem
diagnóstico de epilepsia de difícil controle, estando
atualmente em uso de carbamazepina (1.000 mg/dia) e
ácido valpróico (1.500 mg/dia).
Diante desse quadro, seria mais recomendado
Os exames laboratoriais iniciais mostraram:
Hemoglobina = 12,2 g/dL (VR = 11,5 - 15g/dL);
Leucócitos = 4.500/mm 3 (contagem diferencial normal)
(VR = 4.000 - 11.000 mm 3 );
Plaquetas = 297.000/mm 3 (VR = 100.000 - 400.000 mm 3 );
INR ( International Normalized Ratio ) = 1,27 (valor de
referência até 1,3);
Sódio = 130 mEq/L (VR = 136-145 mEq/L);
Potássio = 3,8 mEq/L (VR = 3,5-5 mEq/L).`,
    alternativas: [
    { letra: 'A', texto: 'o dispositivo intrauterino.' },
    { letra: 'B', texto: 'a laqueadura tubária bilateral.' },
    { letra: 'C', texto: 'o diafragma com geleia espermicida.' },
    { letra: 'D', texto: 'a anticoncepção hormonal combinado de baixa' }
    ],
  },
  { id: 'q2015-067', ano: 2015, numero: 67, area: 'Pediatria',
    gabarito: null,
    enunciado: `Uma  puérpera vem à Unidade Básica de Saúde
com seu recém-nascido (RN) de 4 dias de vida. Segundo
ela, o bebê está “muito amarelo”. Ela refere ainda que na
alta do hospital, há 2 dias, o RN já estava amarelo, mas
que houve aumento progressivo da amarelidão. O exame
físico revela pele ictérica até região umbilical, sem outras
alterações. A carteira de saúde do RN mostra os seguintes
dados:
Idade gestacional = 38 semanas;
Peso do RN = 2.900 g;
Comprimento = 49 cm;
Apgar = 8/9;
Tipagem sanguínea do RN = O positivo;
Tipagem sanguínea da mãe = O positivo;
Ausência de intercorrências no nascimento.
Quais são, respectivamente, a hipótese diagnóstica mais
provável e a conduta adequada nesse caso?`,
    alternativas: [
    { letra: 'A', texto: 'Insuficiência cardíaca diastólica secundária a doença' },
    { letra: 'B', texto: 'Insuficiência' },
    { letra: 'C', texto: 'Insuficiência' },
    { letra: 'D', texto: 'Insuficiência' }
    ],
  },
  { id: 'q2015-074', ano: 2015, numero: 74, area: 'G. Obstetrícia',
    gabarito: null,
    enunciado: `Uma paciente com 27 anos de idade, primigesta,
com gestação de 34 semanas, queixa-se de sangramento
genital há cerca de uma hora. Nega dor abdominal ou
outros sintomas. Ao exame clínico, constata-se bom
estado geral e PA = 110 x 70 mmHg. O feto está em
situação transversa, com batimentos cardiofetais de
144 bpm. A dinâmica uterina é de uma contração de leve
intensidade, com 30 segundos de duração, em 10 minutos
de observação. O exame especular revelou colo uterino
com orifício puntiforme e presença de sangramento
discreto, cor vermelho-vivo, de origem uterina, contínuo e
de leve intensidade.
Qual o provável diagnóstico diante desse quadro?`,
    alternativas: [
    { letra: 'A', texto: 'Placenta prévia.' },
    { letra: 'B', texto: 'Abortamento tardio.' },
    { letra: 'C', texto: 'Trabalho de parto pré-termo.' },
    { letra: 'D', texto: 'Descolamento prematuro de placenta.' }
    ],
  },
  { id: 'q2014-002', ano: 2014, numero: 2, area: 'Infectologia',
    gabarito: 'B',
    enunciado: `Leia a notícia abaixo:
CAMPINAS - No mesmo dia em que dois representantes
do Ministério da Saúde chegaram a Campinas para avaliar
o pedido de ajuda para que a Força Nacional do Sistema
Único de Saúde (FN-SUS) atue no combate da maior
epidemia de dengue vivida na cidade, a Secretaria
Municipal
de
Saúde
confirmou
nesta
terça-feira,
22/04/2014, a segunda morte provocada pela doença.
Faltam profissionais de saúde para o atendimento na rede
de atenção primária e secundária de saúde da cidade.
O secretário municipal de saúde também cogita solicitar
auxílio do Governo do Estado para o envio de profissionais
de saúde para esses locais.`,
    alternativas: [
    { letra: 'A', texto: 'executar os serviços de vigilância sanitária e' },
    { letra: 'B', texto: 'gerir e executar diretamente os serviços públicos de' },
    { letra: 'C', texto: 'intervir no controle da organização da rede de atenção' },
    { letra: 'D', texto: 'atender às necessidades coletivas, urgentes e' }
    ],
  },
  { id: 'q2014-013', ano: 2014, numero: 13, area: 'Cardiologia',
    gabarito: 'B',
    enunciado: `Um paciente com 24 anos de idade, estudante universitário, procura Unidade Básica de Saúde referindo há dois
dias “febre alta”, de início súbito, dor torácica na inspiração profunda e tosse produtiva, com expectoração amarelada.
Nega antecedentes patológicos significativos. Ao exame o paciente apresenta-se lúcido, orientado, com mucosas
normocoradas, normo-hidratadas, escleróticas anictéricas. Aparelho respiratório: murmúrio vesicular audível, exceto em
terço médio de hemitórax direito, onde ausculta-se um sopro tubário. Verifica-se aumento do frêmito tóraco-vocal nessa
mesma região. Aparelho cardiovascular: ritmo cardíaco regular em dois tempos com bulhas normofonéticas, sem sopros.
Abdome flácido, ausência de visceromegalias. Membros inferiores sem alterações. Sinais vitais: pressão arterial =
120 × 80 mmHg, frequência respiratória = 24  irpm, frequência cardíaca = 98 bpm e temperatura axilar =   39,0 ºC.`,
    alternativas: [
    { letra: 'A', texto: 'radiografia de tórax realizada no atendimento é mostrada abaixo.' },
    { letra: 'B', texto: 'azitromicina por via oral.' },
    { letra: 'C', texto: 'levofloxacina por via oral ou endovenosa.' },
    { letra: 'D', texto: 'ceftriaxona endovenosa ou intramuscular + azitromicina por via oral.' }
    ],
  },
  { id: 'q2014-014', ano: 2014, numero: 14, area: 'G. Obstetrícia',
    gabarito: 'D',
    enunciado: `Uma primigesta, com 36 semanas de gestação, procura a Maternidade queixando-se de dores em baixo ventre.
Ao exame: bom estado geral, afebril, altura uterina de 33 cm, dinâmica uterina presente (três a quatro contrações a cada
10 minutos, moderadas), batimentos cardiofetais presentes. Ao toque vaginal: colo fino, dilatado para 4 cm, bolsa
íntegra, apresentação cefálica. A cardiotocografia de entrada é mostrada na figura abaixo.
Assinale a alternativa que apresenta a interpretação da cardiotocografia e a conduta indicada.`,
    alternativas: [
    { letra: 'A', texto: 'Padrão normal; inibição do trabalho de parto pré-termo.' },
    { letra: 'B', texto: 'Padrão patológico; antibioticoterapia profilática e resolução da gestação por cesárea.' },
    { letra: 'C', texto: 'Padrão não tranquilizador; inibição do trabalho de parto pré-termo e profilaxia para estreptococo B.' },
    { letra: 'D', texto: 'Padrão suspeito; assistência ao trabalho de parto com monitorização contínua da frequência cardíaca fetal.' }
    ],
  },
  { id: 'q2014-016', ano: 2014, numero: 16, area: 'Pediatria',
    gabarito: 'A',
    enunciado: `Uma paciente com 19 anos de idade, primípara, na
24 a semana de gestação, vem à consulta pré-natal com
Um lactente com quatro meses de idade nasceu a
termo com peso de 3 Kg. Desde o nascimento, faz uso de
queixa de dispneia progressiva há duas semanas,
inicialmente aos grandes esforços e, atualmente, aos
leite
materno
complementado
com
fórmula
láctea.
médios esforços. Ao exame físico, apresenta altura uterina
Atualmente pesa 5,5 kg. Há um mês iniciou quadro de
compatível com a idade gestacional, edema de membros
diarreia, com seis evacuações ao dia e raios de sangue e
inferiores
++/4+,
estertores
crepitantes
em
bases
fezes não explosivas. No exame físico foi observado que a
pulmonares. Frequência respiratória = 24 irpm, frequência
criança estava em bom estado geral, bem nutrida,
cardíaca = 106 bpm, ausculta com ritmo cardíaco regular e
hidratada e que não havia hiperemia perianal.
sopro
diastólico
(++/4)
mais
audível
no
ápice,
acompanhado de hiperfonese de B1.
Nesse caso, a conduta indicada é
Assinale a alternativa que apresenta corretamente a`,
    alternativas: [
    { letra: 'A', texto: 'suspender a fórmula láctea e oferecer aleitamento' },
    { letra: 'B', texto: 'manter o aleitamento materno e substituir a fórmula' },
    { letra: 'C', texto: 'manter o aleitamento materno complementado com' },
    { letra: 'D', texto: 'suspender o aleitamento materno e a fórmula láctea,' }
    ],
  },
  { id: 'q2014-017', ano: 2014, numero: 17, area: 'Saúde Pública',
    gabarito: 'D',
    enunciado: `Um paciente com 21 anos de idade, servente de
Uma senhora com 47 anos de idade é atendida na
pedreiro, vem à Unidade Básica de Saúde (UBS)
Unidade Básica de Saúde com queixa de “caroço” no
acompanhado pela mãe, que refere estar preocupada com
pescoço há quatro meses. À palpação da região cervical, o
o comportamento do filho. No acolhimento pela enfermeira,
médico encontrou um nódulo de mais ou menos 4 cm, de`,
    alternativas: [
    { letra: 'A', texto: 'mãe informa que o filho tem chegado em casa' },
    { letra: 'B', texto: 'cisto do conduto tireoglosso; biópsia excisional.' },
    { letra: 'C', texto: 'tireoidite de Hashimoto; dosagem de anticorpos' },
    { letra: 'D', texto: 'carcinoma de tireoide;  biópsia por agulha fina guiada' }
    ],
  },
  { id: 'q2014-019', ano: 2014, numero: 19, area: 'Clínica Médica',
    gabarito: 'B',
    enunciado: `Uma
adolescente,
com
19
anos
de
idade,
idade foi  internada na Enfermaria de um hospital com
comparece ao plantão da Unidade de Emergência
história de diarreia há 4 meses, com 7 a 8 evacuações por
relatando ter sofrido violência sexual há cerca de 48 horas.
dia, caracterizadas por fezes volumosas e de odor fétido.
Afirma que não procurou o atendimento antes por ter
Ao exame físico: estado geral comprometido, palidez
recebido ameaças anônimas por telefone. Afirma que
cutânea,
emagrecimento,
hipotrofia
muscular
mais
sofreu penetração vaginal com ejaculação.
evidente em região glútea e distensão abdominal. Não há
outros achados significativos.`,
    alternativas: [
    { letra: 'A', texto: 'profilaxia da infecção por HIV com antirretrovirais para a' },
    { letra: 'B', texto: 'iniciada em até 96 horas da violência sexual.' },
    { letra: 'C', texto: 'mantida sem interrupção por quatro semanas.' },
    { letra: 'D', texto: 'é contra-indicada pelo tempo já decorrido.' },
    { letra: 'E', texto: 'antitransglutaminase e biópsia intestinal.' }
    ],
  },
  { id: 'q2014-021', ano: 2014, numero: 21, area: 'Pediatria',
    gabarito: 'B',
    enunciado: `Um lactente com nove meses de idade vem à
Puérpera, no quinto dia após parto normal, retorna à
consulta na Unidade Básica de Saúde (UBS) com febre há
Unidade Básica de Saúde para reavaliação. Na consulta,
seis dias, acompanhada de tosse, secreção seromucosa
paciente e recém-nascido apresentam-se em bom estado
nasal, hiperemia e secreção conjuntival intensa. Procurou
geral. No exame físico materno, mamas ingurgitadas,`,
    alternativas: [
    { letra: 'A', texto: 'UBS no início dos sintomas, sendo diagnosticado um' },
    { letra: 'B', texto: 'encorajar a amamentação e orientar a expressão' },
    { letra: 'C', texto: 'suspender a amamentação pelo quadro clínico de' },
    { letra: 'D', texto: 'alternar o leite artificial com o leite materno, para a' }
    ],
  },
  { id: 'q2014-022', ano: 2014, numero: 22, area: 'Pediatria',
    gabarito: 'D',
    enunciado: `Um paciente com 18 anos de idade deu entrada no
Uma menina com 7 anos de idade é trazida pela
Pronto-Socorro com quadro de dor escrotal aguda, iniciada
mãe à Unidade Básica de Saúde, com queixa de “chiado
há quatro horas, de início súbito, não havendo história de
no peito” frequente desde os 2 anos de idade. A mãe
trauma local. Ao exame físico específico, apresentava
informa que há vários dias o quadro vem piorando, depois
de uma mudança climática abrupta. Informa também que a
edema escrotal, associado a hiperemia e dor à palpação
criança teve várias crises no último ano, inclusive com uma
do testículo direito. A dor não foi aliviada com a elevação
internação hospitalar.  Ao exame físico apresenta:
do testículo. O reflexo cremastérico estava ausente.
frequência respiratória = 40 irpm, frequência cardíaca =
102 bpm, sibilância expiratória difusa, ausência de tiragem
Assinale a alternativa que apresenta o diagnóstico e a
intercostal. Apresenta hipertrofia e palidez de cornetos
conduta corretos.
nasais à rinoscopia. O médico conclui que a criança é
portadora de asma brônquica persistente moderada.`,
    alternativas: [
    { letra: 'A', texto: 'Torção de cordão espermático; cintilografia escrotal' },
    { letra: 'B', texto: 'Torção de cordão espermático; ultrassonografia com' },
    { letra: 'C', texto: 'Orquiepididimite;' },
    { letra: 'D', texto: 'Orquiepididimite; pesquisa de Clamídia na urina.' }
    ],
  },
  { id: 'q2014-057', ano: 2014, numero: 57, area: 'Clínica Médica',
    gabarito: 'D',
    enunciado: `pelas condições do paciente. Hemograma com leucocitose
moderada,
sem
desvio.
O
paciente
fez
uso
de`,
    alternativas: [
    { letra: 'A', texto: 'predisposição genética.' },
    { letra: 'B', texto: 'exposição crônica a agrotóxicos.' },
    { letra: 'C', texto: 'exposição crônica a radiação ionizante.' },
    { letra: 'D', texto: 'exposição solar cumulativa prolongada.' }
    ],
  },
  { id: 'q2014-065', ano: 2014, numero: 65, area: 'Infectologia',
    gabarito: 'D',
    enunciado: `Um homem com 35 anos de idade, etilista há 20
anos, procura a Unidade Básica de Saúde com queixa de
dor moderada em hipocôndrio direito, febre não aferida,
calafrios há 15 dias. Ao exame físico apresenta
temperatura axilar de 38 ºC, fígado aumentado e dor à
palpação abdominal em hipocôndrio direito. Uma imagem
da ultrassonografia abdominal é mostrada abaixo.
Uma mulher com 31 anos de idade, auxiliar de
cozinha, comparece à Unidade Básica de Saúde
necessitando de ajuda para solicitar o auxílio-doença ao
que há três dias fraturou o ombro direito, no trabalho,
quando escorregou no piso que estava lavando e caiu
sobre o referido braço. Na Unidade de Pronto Atendimento
(UPA), seu braço e ombro foram imobilizados. A empresa
em que trabalha negou a emissão da Comunicação de
Acidente de Trabalho (CAT) por julgar que o acidente
ocorreu por negligência da paciente.
Com base nessas informações, o médico que atua na
Atenção Primária à Saúde (APS)`,
    alternativas: [
    { letra: 'A', texto: 'não poderá emitir atestado médico para a concessão' },
    { letra: 'B', texto: 'poderá emitir atestado médico para a concessão de' },
    { letra: 'C', texto: 'hepatite alcoólica; o paciente deve ser encaminhado' },
    { letra: 'D', texto: 'abscesso hepático; o paciente deve ser encaminhado' }
    ],
  },
  { id: 'q2014-069', ano: 2014, numero: 69, area: 'Infectologia',
    gabarito: 'B',
    enunciado: `Uma mulher com 25 anos de idade comparece ao Ambulatório e refere o aparecimento, há 10 dias, de ferida não
dolorosa na vulva, mostrada na foto abaixo. Relata relação sexual desprotegida há 30 dias. Nega dor ou febre.
Ao exame, observa-se lesão única, ulcerada, de bordas endurecidas.`,
    alternativas: [
    { letra: 'A', texto: 'bacterioscopia de esfregaço da lesão corado pelo método de Gram.' },
    { letra: 'B', texto: 'pesquisa em campo escuro do agente etiológico.' },
    { letra: 'C', texto: 'pesquisa bacteriológica a fresco.' },
    { letra: 'D', texto: 'cultura de secreção da lesão.' }
    ],
  },
  { id: 'q2014-079', ano: 2014, numero: 79, area: 'Cardiologia',
    gabarito: 'D',
    enunciado: `Uma paciente secundigesta, com idade gestacional de 30 semanas e pré-natal realizado em Unidade Básica de
Saúde, vinha evoluindo sem anormalidades até o momento em que deu entrada no Pronto-Socorro com queixa de
cólicas e sangramento vaginal há duas horas. Ao exame apresenta: bom estado geral, normocorada, pressão arterial =
120 × 70 mmHg, frequência cardíaca = 80 bpm, dinâmica uterina ausente, ausculta fetal = 136 bpm. O exame especular
evidencia sangramento discreto pelo orifício do colo uterino. A ultrassonografia é compatível com placenta prévia.`,
    alternativas: [
    { letra: 'A', texto: 'conduta indicada para essa paciente é' },
    { letra: 'B', texto: 'encaminhar para maternidade para realização de cesárea de urgência.' },
    { letra: 'C', texto: 'encaminhar para maternidade para realização de cerclagem do colo uterino.' },
    { letra: 'D', texto: 'internar a paciente para monitorização e corticoterapia para maturação pulmonar fetal.' }
    ],
  },
  { id: 'q2014-080', ano: 2014, numero: 80, area: 'Cardiologia',
    gabarito: 'C',
    enunciado: `Um homem com 25 anos de idade, baterista de trio elétrico, deu entrada no Pronto-Socorro há 24 horas, vítima de
extensa queimadura elétrica em rede de alta tensão. Foi transferido para Unidade de Terapia Intensiva após hidratação
vigorosa e mantém estabilidade hemodinâmica com aminas vasoativas. Está evoluindo com redução do débito urinário e
aumento da creatinina sérica. Está também em ventilação mecânica e o balanço hídrico de 24 horas é positivo em
+3.500 mL. A medida da pressão venosa central do paciente é de 20 cmH 2 O. O potássio sérico dosado hoje é de
5,5 mEq/L. O pH sérico é de 7,6 mEq/L; e o pH urinário, 6,5. O ECG está normal.
Qual deve ser a conduta imediata a ser tomada para o paciente?`,
    alternativas: [
    { letra: 'A', texto: 'Alcalinizar a urina.' },
    { letra: 'B', texto: 'Aumentar a volemia.' },
    { letra: 'C', texto: 'Prescrever diurético.' },
    { letra: 'D', texto: 'Prescrever gluconato de cálcio.' }
    ],
  },
  { id: 'q2014-082', ano: 2014, numero: 82, area: 'Infectologia',
    gabarito: 'C',
    enunciado: `Uma mulher com 20 anos de idade comparece à Unidade Básica de Saúde com a lesão em hálux mostrada
abaixo, que surgiu há sete dias, após manipulação da unha pela manicure. A paciente refere dor latejante, mas nega
febre ou outros sintomas. Ao exame apresenta: ausência de secreção purulenta; ausência de adenopatia regional.`,
    alternativas: [
    { letra: 'A', texto: 'conduta adequada para a resolução do quadro apresentado pela paciente é' },
    { letra: 'B', texto: 'a limpeza do dedo com sabão e água, degermação com povidine e remoção da unha inteira com anestesia local.' },
    { letra: 'C', texto: 'a remoção de uma elipse de pele e tecido subcutâneo da borda com tecido de granulação, suturando-se com nylon.' },
    { letra: 'D', texto: 'a remoção de um segmento da unha com anestesia da região realizada através de bloqueio digital com lidocaína' }
    ],
  },
  { id: 'q2014-087', ano: 2014, numero: 87, area: 'Pneumologia',
    gabarito: 'A',
    enunciado: `dos profissionais de saúde responsáveis pela assistência.
Um homem com 53 anos de idade, tabagista e com
Não foram verificadas alterações no registro de inspeção
história
prévia
de
cardiopatia,
tem
parada
cardiorrespiratória na Unidade Básica de Saúde, enquanto
da
esterilização
das
caixas
cirúrgicas.
aguardava atendimento.`,
    alternativas: [
    { letra: 'A', texto: 'antibioticoprofilaxia de todas as pacientes foi mantida por' },
    { letra: 'B', texto: 'iniciar compressões torácicas; verificar o pulso; acionar' },
    { letra: 'C', texto: 'acionar o Serviço de Emergência; verificar o pulso;' },
    { letra: 'D', texto: 'acionar o Serviço de Emergência; avaliar o nível de' }
    ],
  }
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
  'Cardiologia':   'navy',
  'Pediatria':     'teal',
  'G. Obstetrícia':'info',
  'Cirurgia':      'warn',
  'Saúde Pública': 'success',
  'Clínica Médica':'slate',
  'Infectologia':  'navy',
  'Neurologia':    'warn',
  'Pneumologia':   'teal',
  'Psiquiatria':   'info',
  'Endocrinologia':'success',
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
            const isGabarito = revealed && q.gabarito && a.letra === q.gabarito;
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
            q.gabarito ? (
              <Button variant="secondary" size="sm" iconLeft="eyeOff" onClick={() => setRevealed(true)}>
                Ver gabarito
              </Button>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--fg-4)', fontStyle: 'italic' }}>
                Gabarito não disponível
              </span>
            )
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
              ['Gabarito', q.gabarito || '—'],
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
        color: 'var(--teal-700)' }}>Q{String(idx+1).padStart(3,'0')}</span>
      <Tag color={areaColor(q.area)}>{q.area}</Tag>
      <Tag color="navy">INEP · {q.ano}</Tag>
      <div style={{ flex: 1 }}/>
      {q.gabarito && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-4)' }}>
          #{q.numero.toString().padStart(3,'0')}
        </span>
      )}
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
  const [selected,   setSelected]   = useStateProvas(null);

  const filtered = useMemoProvas(() => {
    let r = QUESTOES_INEP;
    if (anoFiltro !== 'todos') r = r.filter(q => q.ano === Number(anoFiltro));
    if (areaFiltro !== 'todas') r = r.filter(q => q.area === areaFiltro);
    return r;
  }, [anoFiltro, areaFiltro]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-3)',
            letterSpacing: '0.08em', textTransform: 'uppercase' }}>Banco de Provas</div>
          <h2 style={{ margin: '6px 0 4px' }}>Questões INEP · Revalida</h2>
          <p style={{ margin: 0, color: 'var(--fg-3)', fontSize: 14 }}>
            Questões objetivas extraídas das provas oficiais. Marque com o Raio-X para mapear sua convicção.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Tag color="teal" mono>{filtered.length} questões</Tag>
          <Tag color="navy">INEP · {ANOS[ANOS.length-1]}–{ANOS[0]}</Tag>
        </div>
      </div>

      {/* filtros */}
      <Card padding={14}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-3)',
            letterSpacing: '0.06em', textTransform: 'uppercase' }}>Filtrar por</span>

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
