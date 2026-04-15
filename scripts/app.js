/* ============================================================
   APP.JS — Navegação, validação, renderização, coleta de dados
   Eliane Souza Naturopata
============================================================ */

let currentStep = 0;
let triageArea  = '';
const formData  = {};

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  renderTriageCards();
  renderSymptoms();
  // Mostra step-0 diretamente, sem animação de entrada
  var step0 = document.getElementById('step-0');
  step0.style.display = 'block';
  setTimeout(function () { step0.classList.add('active'); }, 20);
  updateProgress();
});

/* ============================================================
   TRIAGE CARDS — render dinâmico
============================================================ */
function renderTriageCards() {
  var grid = document.getElementById('triage-grid');
  if (!grid) return;
  grid.innerHTML = TRIAGE_AREAS.map(function (a) {
    return (
      '<label class="triage-card">' +
        '<input type="radio" name="triage" value="' + a.value + '" onchange="onTriageChange()">' +
        '<span class="triage-card-inner">' +
          '<span class="triage-icon">' + a.icon + '</span>' +
          '<span class="triage-title">' + a.title + '</span>' +
          '<span class="triage-sub">' + a.sub + '</span>' +
        '</span>' +
      '</label>'
    );
  }).join('');
}

function onTriageChange() {
  triageArea = radioVal('triage');
}

/* ============================================================
   ADAPT STEP 3 — mostra seção correta de perguntas específicas
============================================================ */
function adaptStep3() {
  document.querySelectorAll('.triage-section').forEach(function (el) {
    el.classList.remove('active');
  });
  var section = document.getElementById('ts-' + triageArea);
  if (section) section.classList.add('active');

  var area = TRIAGE_AREAS.find(function (a) { return a.value === triageArea; });
  if (area) {
    var titleEl = document.getElementById('step3-title');
    if (titleEl) titleEl.innerHTML = area.step3Title;
    var labelEl = document.getElementById('step3-label');
    if (labelEl) labelEl.textContent = area.icon + ' ' + area.title;
  }

  updateSexoFields();
}

/* ============================================================
   ADAPT SYMPTOMS — carrega lista correta por área
============================================================ */
function renderSymptoms() {
  var grid = document.getElementById('symptoms-grid');
  if (!grid) return;
  var set = SYMPTOM_SETS[triageArea] || SYMPTOM_SETS.hormonal;
  grid.innerHTML = set.map(function (s) {
    return (
      '<div class="symptom-card" id="sc-' + s.id + '" onclick="toggleSymptom(\'' + s.id + '\')">' +
        '<div class="symptom-check">' +
          '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor"><polyline points="2 6 5 9 10 3"/></svg>' +
        '</div>' +
        '<span class="symptom-icon">' + s.icon + '</span>' +
        '<span class="symptom-name">' + s.name + '</span>' +
        '<div class="symptom-intensity">' +
          '<button class="intensity-btn leve"     onclick="setIntensity(event,\'' + s.id + '\',\'leve\')">Leve</button>' +
          '<button class="intensity-btn moderado" onclick="setIntensity(event,\'' + s.id + '\',\'moderado\')">Mod.</button>' +
          '<button class="intensity-btn intenso"  onclick="setIntensity(event,\'' + s.id + '\',\'intenso\')">Intenso</button>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

function toggleSymptom(id) {
  var card = document.getElementById('sc-' + id);
  card.classList.toggle('selected');
  if (!card.classList.contains('selected')) {
    card.querySelectorAll('.intensity-btn').forEach(function (b) { b.classList.remove('active'); });
  }
}

function setIntensity(event, id, level) {
  event.stopPropagation();
  var card = document.getElementById('sc-' + id);
  card.querySelectorAll('.intensity-btn').forEach(function (b) { b.classList.remove('active'); });
  event.target.classList.add('active');
}

/* ============================================================
   SEXO — oculta campos não aplicáveis
============================================================ */
function updateSexoFields() {
  var sexo = radioVal('sexo');
  var abortoSection = document.getElementById('aborto-section');
  var feminino      = document.getElementById('step3-feminino');
  var masculino     = document.getElementById('step3-masculino');

  if (abortoSection) {
    abortoSection.style.display = (sexo === 'Masculino') ? 'none' : 'block';
  }

  if (triageArea === 'hormonal') {
    if (feminino)  feminino.style.display  = (sexo === 'Masculino') ? 'none' : 'block';
    if (masculino) masculino.style.display = (sexo === 'Masculino') ? 'block' : 'none';
  }
}

/* ============================================================
   TOGGLE HELPER
============================================================ */
function toggleField(checkboxId, targetId) {
  var cb     = document.getElementById(checkboxId);
  var target = document.getElementById(targetId);
  if (!cb || !target) return;
  if (cb.checked) {
    target.classList.add('visible');
  } else {
    target.classList.remove('visible');
  }
}

/* ============================================================
   SLIDERS
============================================================ */
function updateImportance(val) {
  document.getElementById('importance-val').textContent = val;
  var hearts = ['🤍','🤍','💛','💛','💛','🧡','🧡','❤️','❤️','❤️','💗'];
  document.getElementById('importance-heart').textContent = hearts[+val] || '💗';
}

/* ============================================================
   PHONE MASK
============================================================ */
function maskPhone(input) {
  var v = input.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length <= 10) {
    v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else {
    v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }
  input.value = v.replace(/-$/, '');
}

/* ============================================================
   PROGRESS BAR
============================================================ */
function updateProgress() {
  var pct = currentStep === 0 ? 0 : Math.round((currentStep / TOTAL_STEPS) * 100);
  document.getElementById('progress-bar').style.width = pct + '%';
  var label = document.getElementById('progress-label');
  if (label) {
    label.textContent = currentStep > 0 ? currentStep + ' / ' + TOTAL_STEPS : '';
  }
}

/* ============================================================
   NAVIGATION
============================================================ */
function goTo(step) {
  var prevCard = document.getElementById('step-' + currentStep);

  // Anima saída somente se o card estiver visível
  if (prevCard.classList.contains('active')) {
    prevCard.classList.add('slide-out');
    prevCard.classList.remove('active');
  }

  setTimeout(function () {
    prevCard.classList.remove('slide-out');
    prevCard.style.display = 'none';
    currentStep = step;
    var nextCard = document.getElementById('step-' + step);
    nextCard.style.display = 'block';
    setTimeout(function () {
      nextCard.classList.add('active');
      updateProgress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 20);
  }, 340);
}

function nextStep(step) {
  if (!validateStep(step)) return;
  collectStep(step);
  if (step === 2) { adaptStep3(); }
  if (step === 3) { renderSymptoms(); }
  goTo(step + 1);
}

function prevStep(step) {
  goTo(step - 1);
}

/* ============================================================
   VALIDATION
============================================================ */
function showError(fieldId, errId) {
  var el = document.getElementById(fieldId);
  if (el) el.classList.add('error');
  var e = document.getElementById(errId);
  if (e) e.classList.add('visible');
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(function (el) { el.classList.remove('error'); });
  document.querySelectorAll('.error-msg.visible').forEach(function (el) { el.classList.remove('visible'); });
}

function validateStep(step) {
  clearErrors();
  var ok = true;

  if (step === 1) {
    if (!val('f-nome'))  { showError('f-nome',  'e-nome');  ok = false; }
    if (!val('f-idade')) { showError('f-idade', 'e-idade'); ok = false; }
  }

  if (step === 2) {
    triageArea = radioVal('triage');
    var trErr = document.getElementById('triage-error');
    if (!triageArea) {
      if (trErr) trErr.classList.add('visible');
      ok = false;
    } else {
      if (trErr) trErr.classList.remove('visible');
    }
  }

  if (step === 8) {
    if (!val('f-incomoda')) { showError('f-incomoda', 'e-incomoda'); ok = false; }
  }

  if (step === 9) {
    if (!val('f-whatsapp')) { showError('f-whatsapp', 'e-whatsapp'); ok = false; }
    var email = val('f-email');
    if (!email || email.indexOf('@') === -1) { showError('f-email', 'e-email'); ok = false; }
  }

  return ok;
}

/* ============================================================
   COLLECT DATA
============================================================ */
function collectStep(step) {
  if (step === 1) {
    formData.identificacao = {
      nome:        val('f-nome'),
      idade:       val('f-idade'),
      sexo:        radioVal('sexo'),
      estadoCivil: val('f-estado-civil'),
      cidade:      val('f-cidade'),
      profissao:   val('f-profissao'),
      temFilhos:   checked('f-filhos'),
      qtdFilhos:   checked('f-filhos') ? val('f-qtd-filhos') : null,
      teveAborto:  checked('f-aborto'),
      qtdAbortos:  checked('f-aborto') ? val('f-qtd-aborto') : null,
    };
  }

  if (step === 2) {
    triageArea = radioVal('triage');
    formData.triagem = { area: triageArea, areaLabel: areaLabel(triageArea) };
  }

  if (step === 3) {
    formData.especifico = collectSpecific();
  }

  if (step === 4) {
    var set = SYMPTOM_SETS[triageArea] || SYMPTOM_SETS.hormonal;
    formData.sintomas = set.map(function (s) {
      var card    = document.getElementById('sc-' + s.id);
      var selected = card && card.classList.contains('selected');
      var activeBtn = card && card.querySelector('.intensity-btn.active');
      return {
        sintoma:    s.name,
        presente:   selected,
        intensidade: selected && activeBtn ? activeBtn.textContent.trim() : selected ? 'Não informada' : null,
      };
    }).filter(function (s) { return s.presente; });
  }

  if (step === 5) {
    var hf = [];
    document.querySelectorAll('#historico-familiar input:checked').forEach(function (cb) { hf.push(cb.value); });
    formData.historico = {
      doencas:               val('f-doencas'),
      cirurgias:             val('f-cirurgias'),
      medicamentos:          val('f-medicamentos'),
      historicoFamiliar:     hf,
      historicoFamiliarOutros: hf.indexOf('Outros') !== -1 ? val('f-hf-outros') : null,
    };
  }

  if (step === 6) {
    formData.estiloVida = {
      alimentacao:    val('f-alimentacao'),
      alcool:         checked('f-alcool'),
      alcoolFreq:     checked('f-alcool') ? val('f-alcool-freq') : null,
      fuma:           checked('f-fuma'),
      atividade:      checked('f-atividade'),
      atividadeQual:  checked('f-atividade') ? val('f-atividade-qual') : null,
      atividadeFreq:  checked('f-atividade') ? val('f-atividade-freq') : null,
      horasSono:      val('f-sono'),
      qualidadeSono:  radioVal('qualidade-sono'),
      nivelEstresse:  val('f-stress'),
    };
  }

  if (step === 7) {
    formData.saudeEmocional = {
      estabilidade: radioVal('emocional'),
      ansiedade:    checked('f-ansiedade'),
      depressao:    checked('f-depressao'),
      corpoHoje:    val('f-corpo'),
      impactoVida:  val('f-impacto'),
    };
  }

  if (step === 8) {
    formData.objetivo = {
      incomoda:   val('f-incomoda'),
      melhorar:   val('f-melhorar'),
      mudanca:    val('f-mudanca'),
      importancia: val('f-importancia'),
    };
    formData.experiencias = {
      tentou:        checked('f-tentou'),
      funcionou:     checked('f-tentou') ? val('f-funcionou')      : null,
      naoFuncionou:  checked('f-tentou') ? val('f-nao-funcionou')  : null,
      porQue:        checked('f-tentou') ? val('f-por-que')        : null,
    };
  }

  if (step === 9) {
    formData.compromisso = {
      seguirOrientacoes: checked('f-orientacoes'),
      busca:             radioVal('busca'),
      investir:          checked('f-investir'),
    };
    formData.contato = {
      whatsapp: val('f-whatsapp'),
      email:    val('f-email'),
      horario:  val('f-horario'),
    };
  }
}

/* ============================================================
   COLLECT SPECIFIC — perguntas da área selecionada
============================================================ */
function collectSpecific() {
  var data = { area: triageArea };

  if (triageArea === 'hormonal') {
    data.menstrua          = checked('f-menstrua');
    data.ciclo             = checked('f-menstrua') ? radioVal('ciclo') : null;
    data.ultimaMenstruacao = val('f-ultima-menstruacao');
    data.menopausa         = checked('f-menopausa');
    data.tempoMenopausa    = checked('f-menopausa') ? val('f-tempo-menopausa') : null;
    data.precoce           = checked('f-precoce');
    data.tpm               = checked('f-tpm');
    data.reposicao         = checked('f-reposicao');
    data.qualReposicao     = checked('f-reposicao') ? val('f-qual-reposicao') : null;
    data.andropausa        = checked('f-andropausa');
    data.tireoide          = checked('f-tireoide');
    data.qualTireoide      = checked('f-tireoide') ? val('f-qual-tireoide') : null;
  }

  if (triageArea === 'digestao') {
    data.intestino     = radioVal('intestino');
    data.inchaco       = checked('f-inchaco-gases');
    data.refluxo       = checked('f-refluxo');
    data.intolerancia  = checked('f-intolerancia');
    data.qualIntoler   = checked('f-intolerancia') ? val('f-qual-intolerancia') : null;
    data.posRefeicao   = radioVal('pos-refeicao');
  }

  if (triageArea === 'sono') {
    data.difAdormecer  = checked('f-dif-adormecer');
    data.acordaNoite   = checked('f-acorda-noite');
    data.qtdAcordadas  = checked('f-acorda-noite') ? val('f-qtd-acordadas') : null;
    data.acordaDesc    = checked('f-acorda-descansado');
    data.fadigaInt     = checked('f-fadiga-intensa');
    data.medDormir     = checked('f-med-dormir');
    data.qualMedDormir = checked('f-med-dormir') ? val('f-qual-med-dormir') : null;
    data.cafeina       = checked('f-cafeina');
  }

  if (triageArea === 'mental') {
    data.nivelAnsiedade = radioVal('nivel-ansiedade');
    data.panico         = checked('f-panico');
    data.tristeza       = checked('f-tristeza');
    data.acompPsi       = checked('f-acomp-psi');
    data.medMental      = checked('f-med-mental');
    data.qualMedMental  = checked('f-med-mental') ? val('f-qual-med-mental') : null;
    data.difFoco        = checked('f-dif-foco');
    data.burnout        = checked('f-burnout');
  }

  if (triageArea === 'peso') {
    data.tempoDificuldade = val('f-tempo-dificuldade');
    data.diagMetab        = checked('f-diag-metab');
    data.qualDiagMetab    = checked('f-diag-metab') ? val('f-qual-diag-metab') : null;
    data.fezDietas        = checked('f-fez-dietas');
    data.qualDietas       = checked('f-fez-dietas') ? val('f-qual-dietas') : null;
    data.apetite          = radioVal('apetite');
    data.desejoDoce       = checked('f-desejo-doce');
  }

  if (triageArea === 'dores') {
    var locais = [];
    document.querySelectorAll('#dores-locais input:checked').forEach(function (cb) { locais.push(cb.value); });
    data.locaisDor      = locais;
    data.tempoDor       = val('f-tempo-dor');
    data.diagDores      = checked('f-diag-dores');
    data.qualDiagDores  = checked('f-diag-dores') ? val('f-qual-diag-dores') : null;
    data.antiInflamator = checked('f-anti-inflam');
  }

  if (triageArea === 'pele') {
    var queixas = [];
    document.querySelectorAll('#pele-queixas input:checked').forEach(function (cb) { queixas.push(cb.value); });
    data.queixasPele    = queixas;
    data.tempoPele      = val('f-tempo-pele');
    data.tratDerm       = checked('f-trat-derm');
    data.qualTratDerm   = checked('f-trat-derm') ? val('f-qual-trat-derm') : null;
    data.protetorSolar  = checked('f-protetor');
  }

  if (triageArea === 'imunidade') {
    data.freqAdoecer    = radioVal('freq-adoecer');
    data.alergiasImun   = checked('f-alergias-imun');
    data.quaisAlergias  = checked('f-alergias-imun') ? val('f-quais-alergias') : null;
    data.sinusite       = checked('f-sinusite-imun');
    data.infRecorrentes = checked('f-inf-recorrentes');
    data.quaisInf       = checked('f-inf-recorrentes') ? val('f-quais-inf') : null;
    data.autoimune      = checked('f-autoimune-imun');
    data.qualAutoimune  = checked('f-autoimune-imun') ? val('f-qual-autoimune') : null;
    data.ultimoCheckup  = val('f-ultimo-checkup');
  }

  return data;
}

/* ============================================================
   HELPERS
============================================================ */
function val(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function checked(id) {
  var el = document.getElementById(id);
  return el ? el.checked : false;
}

function radioVal(name) {
  var el = document.querySelector('input[name="' + name + '"]:checked');
  return el ? el.value : '';
}

function areaLabel(area) {
  var found = TRIAGE_AREAS.find(function (a) { return a.value === area; });
  return found ? found.title : area;
}

function emojiLabel(v) {
  var map = { '1': '😔 Muito mal', '2': '😕 Mal', '3': '😐 Regular', '4': '🙂 Bem', '5': '😊 Muito bem' };
  return map[v] || v || '—';
}

function yn(v) { return v ? 'Sim' : 'Não'; }
function or(v, fb) { return (v !== null && v !== undefined && v !== '') ? v : (fb || '—'); }
