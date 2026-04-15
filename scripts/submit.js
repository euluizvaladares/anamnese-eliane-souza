/* ============================================================
   SUBMIT.JS — Envio via Web3Forms
   Eliane Souza Naturopata
============================================================ */

var WEB3FORMS_KEY = '396f7445-3f53-4fa3-824c-920db9a57bad';

function submitForm() {
  if (!validateStep(9)) return;
  collectStep(9);

  var btn    = document.getElementById('btn-submit');
  var errDiv = document.getElementById('send-error');

  errDiv.classList.remove('visible');
  btn.classList.add('btn-loading');
  btn.textContent = 'Enviando';

  var payload = buildEmailPayload();

  fetch('https://api.web3forms.com/submit', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body:    JSON.stringify(payload),
  })
  .then(function (res) { return res.json(); })
  .then(function (data) {
    btn.classList.remove('btn-loading');
    if (data.success) {
      goTo(10);
    } else {
      btn.textContent = 'Enviar anamnese ✓';
      errDiv.classList.add('visible');
      console.error('Web3Forms error:', data);
    }
  })
  .catch(function (err) {
    btn.classList.remove('btn-loading');
    btn.textContent = 'Enviar anamnese ✓';
    errDiv.classList.add('visible');
    console.error('Fetch error:', err);
  });
}

/* ============================================================
   BUILD EMAIL PAYLOAD — texto simples
============================================================ */
function buildEmailPayload() {
  var d    = formData;
  var id   = d.identificacao   || {};
  var tri  = d.triagem         || {};
  var esp  = d.especifico      || {};
  var hist = d.historico       || {};
  var ev   = d.estiloVida      || {};
  var se   = d.saudeEmocional  || {};
  var obj  = d.objetivo        || {};
  var exp  = d.experiencias    || {};
  var comp = d.compromisso     || {};
  var cont = d.contato         || {};

  var sint = d.sintomas || [];
  var sintomasTexto = sint.length
    ? sint.map(function (s) { return s.sintoma + (s.intensidade ? ' (' + s.intensidade + ')' : ''); }).join(', ')
    : '—';

  var hf = (hist.historicoFamiliar || []).join(', ') || '—';

  var especificoTexto = formatSpecifico(esp);

  var lines = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  ANAMNESE DIGITAL — ELIANE SOUZA NATUROPATA',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    '▸ ÁREA PRINCIPAL',
    '  ' + or(tri.areaLabel) + (tri.area ? ' (' + tri.area + ')' : ''),
    '',
    '▸ IDENTIFICAÇÃO',
    '  Nome:         ' + or(id.nome),
    '  Idade:        ' + or(id.idade) + ' anos',
    '  Sexo:         ' + or(id.sexo),
    '  Estado civil: ' + or(id.estadoCivil),
    '  Cidade:       ' + or(id.cidade),
    '  Profissão:    ' + or(id.profissao),
    '  Filhos:       ' + yn(id.temFilhos) + (id.temFilhos ? ' — ' + or(id.qtdFilhos) : ''),
    '  Aborto:       ' + yn(id.teveAborto) + (id.teveAborto ? ' — ' + or(id.qtdAbortos) : ''),
    '',
    '▸ QUEIXA ESPECÍFICA (' + or(tri.areaLabel) + ')',
    especificoTexto,
    '',
    '▸ SINTOMAS ATUAIS',
    '  ' + sintomasTexto,
    '',
    '▸ HISTÓRICO DE SAÚDE',
    '  Doenças:            ' + or(hist.doencas),
    '  Cirurgias:          ' + or(hist.cirurgias),
    '  Medicamentos:       ' + or(hist.medicamentos),
    '  Histórico familiar: ' + hf,
    '',
    '▸ ESTILO DE VIDA',
    '  Alimentação:  ' + or(ev.alimentacao),
    '  Álcool:       ' + yn(ev.alcool) + (ev.alcool ? ' — ' + or(ev.alcoolFreq) : ''),
    '  Fuma:         ' + yn(ev.fuma),
    '  Atividade:    ' + yn(ev.atividade) + (ev.atividade ? ' — ' + or(ev.atividadeQual) + ', ' + or(ev.atividadeFreq) : ''),
    '  Sono:         ' + or(ev.horasSono) + 'h — Qualidade: ' + or(ev.qualidadeSono),
    '  Estresse:     ' + or(ev.nivelEstresse) + '/10',
    '',
    '▸ SAÚDE EMOCIONAL',
    '  Estado:            ' + emojiLabel(se.estabilidade),
    '  Diagnóstico ansiedade:  ' + yn(se.ansiedade),
    '  Diagnóstico depressão:  ' + yn(se.depressao),
    '  Relação com o corpo:    ' + or(se.corpoHoje),
    '  Impacto na vida:        ' + or(se.impactoVida),
    '',
    '▸ OBJETIVO PRINCIPAL',
    '  O que incomoda:   ' + or(obj.incomoda),
    '  Quer melhorar:    ' + or(obj.melhorar),
    '  O que mudaria:    ' + or(obj.mudanca),
    '  Importância:      ' + or(obj.importancia) + '/10',
    '',
    '▸ EXPERIÊNCIAS ANTERIORES',
    '  Tentou tratamento:  ' + yn(exp.tentou),
    '  O que funcionou:    ' + or(exp.funcionou),
    '  Não funcionou:      ' + or(exp.naoFuncionou),
    '  Por que falhou:     ' + or(exp.porQue),
    '',
    '▸ COMPROMISSO',
    '  Seguir orientações: ' + yn(comp.seguirOrientacoes),
    '  Busca:              ' + or(comp.busca),
    '  Investir na saúde:  ' + yn(comp.investir),
    '',
    '▸ CONTATO',
    '  WhatsApp: ' + or(cont.whatsapp),
    '  E-mail:   ' + or(cont.email),
    '  Horário:  ' + or(cont.horario),
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ];

  return {
    access_key: WEB3FORMS_KEY,
    subject:    'Nova Anamnese — ' + or(id.nome, 'Paciente') + ' (' + or(id.idade, '?') + ' anos) — ' + or(areaLabel(triageArea), ''),
    from_name:  'Anamnese Digital',
    replyto:    or(cont.email, ''),
    message:    lines.join('\n'),
  };
}

/* ============================================================
   FORMATA DADOS ESPECÍFICOS DA ÁREA
============================================================ */
function formatSpecifico(esp) {
  if (!esp || !esp.area) return '  —';
  var lines = [];

  if (esp.area === 'hormonal') {
    if (esp.menstrua !== undefined) lines.push('  Ainda menstrua: ' + yn(esp.menstrua));
    if (esp.ciclo)                  lines.push('  Ciclo: ' + esp.ciclo);
    if (esp.ultimaMenstruacao)      lines.push('  Última menstruação: ' + esp.ultimaMenstruacao);
    if (esp.menopausa !== undefined) lines.push('  Menopausa: ' + yn(esp.menopausa) + (esp.tempoMenopausa ? ' — ' + esp.tempoMenopausa : ''));
    if (esp.precoce !== undefined)   lines.push('  Menopausa precoce: ' + yn(esp.precoce));
    if (esp.tpm !== undefined)       lines.push('  TPM intensa: ' + yn(esp.tpm));
    if (esp.reposicao !== undefined) lines.push('  Reposição hormonal: ' + yn(esp.reposicao) + (esp.qualReposicao ? ' — ' + esp.qualReposicao : ''));
    if (esp.andropausa !== undefined) lines.push('  Andropausa: ' + yn(esp.andropausa));
    if (esp.tireoide !== undefined)  lines.push('  Tireoide: ' + yn(esp.tireoide) + (esp.qualTireoide ? ' — ' + esp.qualTireoide : ''));
  }

  if (esp.area === 'digestao') {
    if (esp.intestino)    lines.push('  Intestino: ' + esp.intestino);
    if (esp.inchaco !== undefined)    lines.push('  Inchaço/gases: ' + yn(esp.inchaco));
    if (esp.refluxo !== undefined)    lines.push('  Refluxo/azia: ' + yn(esp.refluxo));
    if (esp.intolerancia !== undefined) lines.push('  Intolerância alimentar: ' + yn(esp.intolerancia) + (esp.qualIntoler ? ' — ' + esp.qualIntoler : ''));
    if (esp.posRefeicao)  lines.push('  Pós-refeição: ' + esp.posRefeicao);
  }

  if (esp.area === 'sono') {
    if (esp.difAdormecer !== undefined) lines.push('  Dif. adormecer: ' + yn(esp.difAdormecer));
    if (esp.acordaNoite !== undefined)  lines.push('  Acorda à noite: ' + yn(esp.acordaNoite) + (esp.qtdAcordadas ? ' — ' + esp.qtdAcordadas + 'x' : ''));
    if (esp.acordaDesc !== undefined)   lines.push('  Acorda descansado(a): ' + yn(esp.acordaDesc));
    if (esp.fadigaInt !== undefined)    lines.push('  Fadiga intensa: ' + yn(esp.fadigaInt));
    if (esp.medDormir !== undefined)    lines.push('  Medicação para dormir: ' + yn(esp.medDormir) + (esp.qualMedDormir ? ' — ' + esp.qualMedDormir : ''));
    if (esp.cafeina !== undefined)      lines.push('  Cafeína após 15h: ' + yn(esp.cafeina));
  }

  if (esp.area === 'mental') {
    if (esp.nivelAnsiedade) lines.push('  Nível de ansiedade: ' + esp.nivelAnsiedade);
    if (esp.panico !== undefined)      lines.push('  Ataques de pânico: ' + yn(esp.panico));
    if (esp.tristeza !== undefined)    lines.push('  Tristeza persistente: ' + yn(esp.tristeza));
    if (esp.acompPsi !== undefined)    lines.push('  Acompanhamento psicológico: ' + yn(esp.acompPsi));
    if (esp.medMental !== undefined)   lines.push('  Medicação mental: ' + yn(esp.medMental) + (esp.qualMedMental ? ' — ' + esp.qualMedMental : ''));
    if (esp.difFoco !== undefined)     lines.push('  Dificuldade de foco: ' + yn(esp.difFoco));
    if (esp.burnout !== undefined)     lines.push('  Burnout: ' + yn(esp.burnout));
  }

  if (esp.area === 'peso') {
    if (esp.tempoDificuldade) lines.push('  Tempo com dificuldade: ' + esp.tempoDificuldade);
    if (esp.diagMetab !== undefined)  lines.push('  Diagnóstico metabólico: ' + yn(esp.diagMetab) + (esp.qualDiagMetab ? ' — ' + esp.qualDiagMetab : ''));
    if (esp.fezDietas !== undefined)  lines.push('  Já fez dietas: ' + yn(esp.fezDietas) + (esp.qualDietas ? '\n    ' + esp.qualDietas : ''));
    if (esp.apetite)                  lines.push('  Apetite: ' + esp.apetite);
    if (esp.desejoDoce !== undefined) lines.push('  Desejo por doces: ' + yn(esp.desejoDoce));
  }

  if (esp.area === 'dores') {
    if (esp.locaisDor && esp.locaisDor.length) lines.push('  Locais: ' + esp.locaisDor.join(', '));
    if (esp.tempoDor)                lines.push('  Há quanto tempo: ' + esp.tempoDor);
    if (esp.diagDores !== undefined) lines.push('  Diagnóstico: ' + yn(esp.diagDores) + (esp.qualDiagDores ? ' — ' + esp.qualDiagDores : ''));
    if (esp.antiInflamator !== undefined) lines.push('  Anti-inflamatórios: ' + yn(esp.antiInflamator));
  }

  if (esp.area === 'pele') {
    if (esp.queixasPele && esp.queixasPele.length) lines.push('  Queixas: ' + esp.queixasPele.join(', '));
    if (esp.tempoPele)                lines.push('  Há quanto tempo: ' + esp.tempoPele);
    if (esp.tratDerm !== undefined)   lines.push('  Tratamento dermatológico: ' + yn(esp.tratDerm) + (esp.qualTratDerm ? ' — ' + esp.qualTratDerm : ''));
    if (esp.protetorSolar !== undefined) lines.push('  Protetor solar diário: ' + yn(esp.protetorSolar));
  }

  if (esp.area === 'imunidade') {
    if (esp.freqAdoecer)                  lines.push('  Frequência de adoecer: ' + esp.freqAdoecer);
    if (esp.alergiasImun !== undefined)   lines.push('  Alergias: ' + yn(esp.alergiasImun) + (esp.quaisAlergias ? ' — ' + esp.quaisAlergias : ''));
    if (esp.sinusite !== undefined)       lines.push('  Sinusite/rinite: ' + yn(esp.sinusite));
    if (esp.infRecorrentes !== undefined) lines.push('  Infecções recorrentes: ' + yn(esp.infRecorrentes) + (esp.quaisInf ? ' — ' + esp.quaisInf : ''));
    if (esp.autoimune !== undefined)      lines.push('  Doença autoimune: ' + yn(esp.autoimune) + (esp.qualAutoimune ? ' — ' + esp.qualAutoimune : ''));
    if (esp.ultimoCheckup)               lines.push('  Último check-up: ' + esp.ultimoCheckup);
  }

  return lines.length ? lines.join('\n') : '  —';
}
