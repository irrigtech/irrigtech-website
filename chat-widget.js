/* IrrigTech website assistant — front end.
 * No API keys or secrets here: it only talks to this site's own /api/chat function
 * and submits inquiries to Netlify Forms ("chat-inquiry"), like the contact page. */
(function () {
  "use strict";
  if (window.__irrigtechChat) return;
  window.__irrigtechChat = true;

  var CONTACT = {
    email: "contact@irrigtech.com",
    whatsapp: "https://wa.me/923451616967",
    waText: {
      en: "Hello IrrigTech, I would like to discuss a project with your team.",
      de: "Hallo IrrigTech, ich möchte ein Projekt mit Ihrem Team besprechen.",
      fr: "Bonjour IrrigTech, je souhaite discuter d'un projet avec votre équipe."
    }
  };
  var PREFIX = { en: "", de: "/de", fr: "/fr" };
  var MAX_INPUT = 800;
  var MAX_HISTORY = 12;

  var T = {
    en: {
      open: "Ask IrrigTech", close: "Close chat", title: "IrrigTech Assistant",
      subtitle: "AI answers based on irrigtech.com",
      lang: "Chat language",
      notice: "AI-generated answers can be incomplete — please confirm important details with our team. Don't share sensitive personal data in the chat.",
      privacy: "Privacy",
      greet: "Hello! I can answer questions about IrrigTech's smart irrigation, field sensors, soil monitoring, farm automation, and custom technology projects. How can I help?",
      chips: ["What does IrrigTech offer?", "Which devices are available now?", "How does soil moisture monitoring work?", "How do I get a quote?"],
      placeholder: "Type your question…", send: "Send", you: "You", bot: "IrrigTech Assistant",
      talk: "Talk to the team:", whatsapp: "WhatsApp", emailL: "Email", contactPage: "Contact page", inquiry: "Send an inquiry",
      newChat: "New chat",
      errors: {
        unavailable: "Sorry — the assistant is unavailable right now. Please contact the IrrigTech team directly:",
        not_configured: "The assistant isn't available yet. Please contact the IrrigTech team directly:",
        rate_minute: "You're sending messages quickly. Please wait a minute and try again, or contact the team directly:",
        rate_daily: "You've reached today's chat limit. The IrrigTech team is happy to help directly:",
        busy: "The assistant is very busy right now. Please try again later, or contact the team directly:",
        refusal: "I can't help with that here. For anything about your project, please contact the IrrigTech team:",
        bad_request: "That message couldn't be sent. Please shorten it and try again, or contact the team:",
        network: "Connection problem — the message wasn't sent. Check your connection and try again, or contact the team:"
      },
      truncated: "(Reply shortened — ask me to continue, or contact the team for full details.)",
      form: {
        title: "Send an inquiry", intro: "Tell us about your project and the IrrigTech team will reply by email.",
        name: "Full name", email: "Email", company: "Company / farm (optional)", phone: "WhatsApp / phone (optional)",
        type: "Project type", typeChoose: "Select a project type", req: "Project requirements",
        reqHint: "Field size, crop, location, what you'd like to monitor or automate…",
        consent: "I agree that IrrigTech may use these details to respond to my inquiry, as described in the <a href=\"{privacy}\" target=\"_blank\" rel=\"noopener\">Privacy Policy</a>.",
        submit: "Send inquiry", sending: "Sending…", back: "Back to chat",
        ok: "Thank you — your inquiry has been sent. The IrrigTech team will contact you by email.",
        fail: "Sorry, the inquiry couldn't be sent. Please try again, or email us at <a href=\"mailto:contact@irrigtech.com\">contact@irrigtech.com</a>.",
        invalid: "Please fill in your name, a valid email, a project type, your requirements, and tick the consent box."
      },
      types: ["Smart Irrigation", "Farm Automation", "Soil & Environmental Monitoring", "Water Management", "IoT Device Development", "Custom Electronics / Embedded", "Other"]
    },
    de: {
      open: "IrrigTech fragen", close: "Chat schließen", title: "IrrigTech-Assistent",
      subtitle: "KI-Antworten auf Basis von irrigtech.com",
      lang: "Chat-Sprache",
      notice: "KI-generierte Antworten können unvollständig sein – bitte bestätigen Sie wichtige Details mit unserem Team. Teilen Sie im Chat keine sensiblen personenbezogenen Daten.",
      privacy: "Datenschutz",
      greet: "Hallo! Ich beantworte Fragen zu IrrigTechs intelligenter Bewässerung, Feldsensoren, Bodenüberwachung, Betriebsautomatisierung und individuellen Technologieprojekten. Wie kann ich helfen?",
      chips: ["Was bietet IrrigTech an?", "Welche Geräte sind jetzt verfügbar?", "Wie funktioniert die Bodenfeuchte-Überwachung?", "Wie erhalte ich ein Angebot?"],
      placeholder: "Ihre Frage eingeben…", send: "Senden", you: "Sie", bot: "IrrigTech-Assistent",
      talk: "Mit dem Team sprechen:", whatsapp: "WhatsApp", emailL: "E-Mail", contactPage: "Kontaktseite", inquiry: "Anfrage senden",
      newChat: "Neuer Chat",
      errors: {
        unavailable: "Der Assistent ist derzeit leider nicht verfügbar. Bitte kontaktieren Sie das IrrigTech-Team direkt:",
        not_configured: "Der Assistent ist noch nicht verfügbar. Bitte kontaktieren Sie das IrrigTech-Team direkt:",
        rate_minute: "Sie senden Nachrichten sehr schnell. Bitte warten Sie eine Minute oder kontaktieren Sie das Team direkt:",
        rate_daily: "Sie haben das heutige Chat-Limit erreicht. Das IrrigTech-Team hilft Ihnen gern direkt weiter:",
        busy: "Der Assistent ist gerade stark ausgelastet. Bitte versuchen Sie es später erneut oder kontaktieren Sie das Team direkt:",
        refusal: "Dabei kann ich hier nicht helfen. Für alles rund um Ihr Projekt wenden Sie sich bitte an das IrrigTech-Team:",
        bad_request: "Die Nachricht konnte nicht gesendet werden. Bitte kürzen Sie sie oder kontaktieren Sie das Team:",
        network: "Verbindungsproblem – die Nachricht wurde nicht gesendet. Bitte versuchen Sie es erneut oder kontaktieren Sie das Team:"
      },
      truncated: "(Antwort gekürzt – bitten Sie mich fortzufahren oder kontaktieren Sie das Team für alle Details.)",
      form: {
        title: "Anfrage senden", intro: "Beschreiben Sie Ihr Projekt – das IrrigTech-Team antwortet Ihnen per E-Mail.",
        name: "Vollständiger Name", email: "E-Mail", company: "Unternehmen / Betrieb (optional)", phone: "WhatsApp / Telefon (optional)",
        type: "Projektart", typeChoose: "Projektart auswählen", req: "Projektanforderungen",
        reqHint: "Feldgröße, Kultur, Standort, was Sie überwachen oder automatisieren möchten…",
        consent: "Ich bin damit einverstanden, dass IrrigTech diese Angaben zur Beantwortung meiner Anfrage verwendet, wie in der <a href=\"{privacy}\" target=\"_blank\" rel=\"noopener\">Datenschutzerklärung</a> beschrieben.",
        submit: "Anfrage senden", sending: "Wird gesendet…", back: "Zurück zum Chat",
        ok: "Vielen Dank – Ihre Anfrage wurde gesendet. Das IrrigTech-Team meldet sich per E-Mail bei Ihnen.",
        fail: "Die Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie an <a href=\"mailto:contact@irrigtech.com\">contact@irrigtech.com</a>.",
        invalid: "Bitte geben Sie Ihren Namen, eine gültige E-Mail-Adresse, die Projektart und Ihre Anforderungen an und bestätigen Sie die Einwilligung."
      },
      types: ["Intelligente Bewässerung", "Betriebsautomatisierung", "Boden- & Umweltüberwachung", "Wassermanagement", "IoT-Geräteentwicklung", "Individuelle Elektronik / Embedded", "Sonstiges"]
    },
    fr: {
      open: "Demander à IrrigTech", close: "Fermer le chat", title: "Assistant IrrigTech",
      subtitle: "Réponses IA basées sur irrigtech.com",
      lang: "Langue du chat",
      notice: "Les réponses générées par IA peuvent être incomplètes — veuillez confirmer les informations importantes avec notre équipe. Ne partagez pas de données personnelles sensibles dans le chat.",
      privacy: "Confidentialité",
      greet: "Bonjour ! Je réponds à vos questions sur l'irrigation intelligente, les capteurs de terrain, le suivi des sols, l'automatisation agricole et les projets technologiques sur mesure d'IrrigTech. Comment puis-je vous aider ?",
      chips: ["Que propose IrrigTech ?", "Quels appareils sont disponibles aujourd'hui ?", "Comment fonctionne le suivi de l'humidité du sol ?", "Comment obtenir un devis ?"],
      placeholder: "Saisissez votre question…", send: "Envoyer", you: "Vous", bot: "Assistant IrrigTech",
      talk: "Parler à l'équipe :", whatsapp: "WhatsApp", emailL: "E-mail", contactPage: "Page contact", inquiry: "Envoyer une demande",
      newChat: "Nouvelle conversation",
      errors: {
        unavailable: "Désolé — l'assistant est indisponible pour le moment. Veuillez contacter directement l'équipe IrrigTech :",
        not_configured: "L'assistant n'est pas encore disponible. Veuillez contacter directement l'équipe IrrigTech :",
        rate_minute: "Vous envoyez des messages rapidement. Veuillez patienter une minute, ou contactez directement l'équipe :",
        rate_daily: "Vous avez atteint la limite de messages pour aujourd'hui. L'équipe IrrigTech se fera un plaisir de vous aider directement :",
        busy: "L'assistant est très sollicité en ce moment. Veuillez réessayer plus tard, ou contactez directement l'équipe :",
        refusal: "Je ne peux pas vous aider sur ce point ici. Pour toute question sur votre projet, contactez l'équipe IrrigTech :",
        bad_request: "Ce message n'a pas pu être envoyé. Raccourcissez-le et réessayez, ou contactez l'équipe :",
        network: "Problème de connexion — le message n'a pas été envoyé. Vérifiez votre connexion et réessayez, ou contactez l'équipe :"
      },
      truncated: "(Réponse raccourcie — demandez-moi de continuer, ou contactez l'équipe pour tous les détails.)",
      form: {
        title: "Envoyer une demande", intro: "Décrivez votre projet et l'équipe IrrigTech vous répondra par e-mail.",
        name: "Nom complet", email: "E-mail", company: "Entreprise / exploitation (facultatif)", phone: "WhatsApp / téléphone (facultatif)",
        type: "Type de projet", typeChoose: "Sélectionnez un type de projet", req: "Besoins du projet",
        reqHint: "Surface, culture, localisation, ce que vous souhaitez surveiller ou automatiser…",
        consent: "J'accepte qu'IrrigTech utilise ces informations pour répondre à ma demande, comme décrit dans la <a href=\"{privacy}\" target=\"_blank\" rel=\"noopener\">Politique de confidentialité</a>.",
        submit: "Envoyer la demande", sending: "Envoi…", back: "Retour au chat",
        ok: "Merci — votre demande a été envoyée. L'équipe IrrigTech vous contactera par e-mail.",
        fail: "Désolé, la demande n'a pas pu être envoyée. Veuillez réessayer, ou écrivez-nous à <a href=\"mailto:contact@irrigtech.com\">contact@irrigtech.com</a>.",
        invalid: "Veuillez indiquer votre nom, un e-mail valide, le type de projet et vos besoins, puis cocher la case de consentement."
      },
      types: ["Irrigation intelligente", "Automatisation agricole", "Suivi des sols et de l'environnement", "Gestion de l'eau", "Développement d'objets IoT", "Électronique sur mesure / embarqué", "Autre"]
    }
  };
  var TYPE_VALUES = ["Smart Irrigation", "Farm Automation", "Environmental Monitoring", "Water Management", "IoT Device Development", "Custom Electronics", "Other"];

  // ---- storage (optional; the widget works without it) ----
  function sget(store, k) { try { return window[store].getItem(k); } catch (e) { return null; } }
  function sset(store, k, v) { try { window[store].setItem(k, v); } catch (e) {} }
  function sdel(store, k) { try { window[store].removeItem(k); } catch (e) {} }

  var pageLang = (document.documentElement.getAttribute("lang") || "en").slice(0, 2).toLowerCase();
  if (!T[pageLang]) pageLang = "en";
  // The chat follows the page language; a visitor's choice in the chat's selector is
  // remembered only while they stay on pages in that same site language.
  var lang = pageLang;
  try { var saved = JSON.parse(sget("localStorage", "itc-lang") || "null"); if (saved && saved.page === pageLang && T[saved.lang]) lang = saved.lang; } catch (e) {}
  var history = [];
  try { history = JSON.parse(sget("sessionStorage", "itc-history") || "[]"); if (!Array.isArray(history)) history = []; } catch (e) { history = []; }
  var busy = false;
  var controller = null;

  // ---- helpers ----
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (attrs[k] != null) n.setAttribute(k, attrs[k]); }
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function privacyUrl() { return PREFIX[lang] + "/privacy.html"; }
  function contactUrl() { return PREFIX[lang] + "/contact.html"; }
  function waUrl() { return CONTACT.whatsapp + "?text=" + encodeURIComponent(CONTACT.waText[lang]); }
  var INQ = /\[\[\s*inquiry\s*\]\]/gi;

  // Minimal, safe rendering: escape everything, then allow **bold**, "- " lists and
  // links to irrigtech.com only. Anything else stays plain text.
  function render(text) {
    var clean = text.replace(INQ, "").replace(/\[\[[^\]]*$/, "").trim();
    var lines = esc(clean).split(/\n/);
    var out = [], list = null, para = [];
    function flushPara() { if (para.length) { out.push("<p>" + para.join("<br>") + "</p>"); para = []; } }
    function flushList() { if (list) { out.push("<ul>" + list.join("") + "</ul>"); list = null; } }
    lines.forEach(function (raw) {
      var line = raw.trim();
      if (!line) { flushPara(); flushList(); return; }
      var m = line.match(/^(?:[-•*]|\d+[.)])\s+(.*)$/);
      if (m) { flushPara(); (list = list || []).push("<li>" + m[1] + "</li>"); }
      else { flushList(); para.push(line); }
    });
    flushPara(); flushList();
    return out.join("")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\((https:\/\/(?:www\.)?irrigtech\.com\/[^\s)"<]*)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[\s(>])(https:\/\/(?:www\.)?irrigtech\.com(?:\/[^\s)<"]*)?)/g, function (_, pre, url) {
        var trail = url.match(/[.,;:!?]+$/); trail = trail ? trail[0] : ""; url = url.slice(0, url.length - trail.length);
        return pre + '<a href="' + url + '" target="_blank" rel="noopener">' + url.replace(/^https:\/\//, "") + "</a>" + trail;
      });
  }

  // ---- build UI ----
  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01" stroke-width="2.6"/></svg>';
  var ICON_X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_RESET = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>';
  var ICON_SEND = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
  var ICON_WA = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.45 1.29 4.9L2 22l5.31-1.39a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2z"/></svg>';

  var panel = el("div", { id: "itc-panel", class: "itc-panel", role: "dialog", "aria-modal": "false", "aria-labelledby": "itc-title", hidden: "" });
  var launcher = el("button", { type: "button", class: "itc-launcher", "aria-controls": "itc-panel", "aria-expanded": "false" });

  function build() {
    var t = T[lang];
    launcher.setAttribute("aria-label", t.open);
    launcher.innerHTML = ICON_CHAT + '<span class="itc-launcher-label">' + esc(t.open) + "</span>";

    panel.setAttribute("lang", lang);
    panel.innerHTML =
      '<div class="itc-head">' +
        '<img src="/images/irrigtech-icon.png" alt="">' +
        '<div class="itc-title"><strong id="itc-title">' + esc(t.title) + "</strong><span>" + esc(t.subtitle) + "</span></div>" +
        '<label class="itc-sr" for="itc-lang">' + esc(t.lang) + "</label>" +
        '<select id="itc-lang" class="itc-lang"><option value="en">EN</option><option value="de">DE</option><option value="fr">FR</option></select>' +
        '<button type="button" class="itc-icon-btn" data-act="reset" aria-label="' + esc(t.newChat) + '" title="' + esc(t.newChat) + '">' + ICON_RESET + "</button>" +
        '<button type="button" class="itc-icon-btn" data-act="close" aria-label="' + esc(t.close) + '" title="' + esc(t.close) + '">' + ICON_X + "</button>" +
      "</div>" +
      '<p class="itc-notice">' + esc(t.notice) + ' <a href="' + privacyUrl() + '" target="_blank" rel="noopener">' + esc(t.privacy) + "</a></p>" +
      '<div class="itc-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0"></div>' +
      '<form class="itc-compose" novalidate>' +
        '<label class="itc-sr" for="itc-input">' + esc(t.placeholder) + "</label>" +
        '<textarea id="itc-input" rows="1" maxlength="' + MAX_INPUT + '" placeholder="' + esc(t.placeholder) + '" autocomplete="off"></textarea>' +
        '<input class="itc-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button type="submit" class="itc-send" aria-label="' + esc(t.send) + '">' + ICON_SEND + "</button>" +
      "</form>" +
      '<div class="itc-count" aria-hidden="true"></div>' +
      '<div class="itc-fallback">' + esc(t.talk) +
        '<a class="itc-wa" href="' + waUrl() + '" target="_blank" rel="noopener noreferrer">' + ICON_WA + esc(t.whatsapp) + "</a>" +
        '<a href="mailto:' + CONTACT.email + '">' + esc(t.emailL) + "</a>" +
        '<a href="' + contactUrl() + '">' + esc(t.contactPage) + "</a>" +
        '<button type="button" data-act="inquiry">' + esc(t.inquiry) + "</button>" +
      "</div>" +
      buildForm(t);

    panel.querySelector("#itc-lang").value = lang;
    renderLog();
  }

  function buildForm(t) {
    var f = t.form;
    var opts = '<option value="" disabled selected>' + esc(f.typeChoose) + "</option>" +
      TYPE_VALUES.map(function (v, i) { return '<option value="' + esc(v) + '">' + esc(t.types[i]) + "</option>"; }).join("");
    return '<form class="itc-form" name="chat-inquiry" hidden novalidate>' +
      "<h3>" + esc(f.title) + "</h3><p>" + esc(f.intro) + "</p>" +
      '<p class="itc-hp" aria-hidden="true"><label>Leave this field blank <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>' +
      '<label>' + esc(f.name) + ' *<input name="full-name" type="text" required maxlength="120" autocomplete="name"></label>' +
      '<label>' + esc(f.email) + ' *<input name="email" type="email" required maxlength="200" autocomplete="email"></label>' +
      '<label>' + esc(f.company) + '<input name="company" type="text" maxlength="160" autocomplete="organization"></label>' +
      '<label>' + esc(f.phone) + '<input name="phone" type="tel" maxlength="40" autocomplete="tel"></label>' +
      '<label>' + esc(f.type) + ' *<select name="project-type" required>' + opts + "</select></label>" +
      '<label>' + esc(f.req) + ' *<textarea name="project-requirements" required maxlength="3000" placeholder="' + esc(f.reqHint) + '"></textarea></label>' +
      '<label class="itc-consent"><input type="checkbox" name="consent" value="yes" required><span>' + f.consent.replace("{privacy}", privacyUrl()) + "</span></label>" +
      '<div class="itc-status" role="status" aria-live="polite"></div>' +
      '<div class="itc-form-actions"><button type="submit" class="itc-primary">' + esc(f.submit) + '</button><button type="button" class="itc-secondary" data-act="back">' + esc(f.back) + "</button></div>" +
      "</form>";
  }

  function log() { return panel.querySelector(".itc-log"); }

  function addBubble(role, text, opts) {
    opts = opts || {};
    var t = T[lang];
    var b = el("div", { class: "itc-msg " + (role === "user" ? "itc-user" : opts.error ? "itc-error" : "itc-bot") });
    var sr = '<span class="itc-sr">' + esc(role === "user" ? t.you : t.bot) + ": </span>";
    if (role === "user") b.innerHTML = sr + "<p>" + esc(text).replace(/\n/g, "<br>") + "</p>";
    else b.innerHTML = sr + render(text);
    if (opts.inquiry) addInquiryButton(b);
    log().appendChild(b);
    log().scrollTop = log().scrollHeight;
    return b;
  }

  function addInquiryButton(bubble) {
    var btn = el("button", { type: "button", class: "itc-link-btn", "data-act": "inquiry" }, esc(T[lang].inquiry) + " →");
    bubble.appendChild(btn);
  }

  function addFallback(code) {
    var t = T[lang];
    var msg = t.errors[code] || t.errors.unavailable;
    var b = addBubble("assistant", "", { error: true });
    b.innerHTML = '<p role="alert">' + esc(msg) + "</p><ul>" +
      '<li><a href="' + waUrl() + '" target="_blank" rel="noopener noreferrer">WhatsApp: +92 345 1616967</a></li>' +
      '<li><a href="mailto:' + CONTACT.email + '">' + CONTACT.email + "</a></li>" +
      '<li><a href="' + contactUrl() + '">' + esc(t.contactPage) + "</a></li></ul>";
    addInquiryButton(b);
  }

  function renderLog() {
    var t = T[lang];
    log().innerHTML = "";
    addBubble("assistant", t.greet);
    if (!history.length) {
      var chips = el("div", { class: "itc-chips" });
      t.chips.forEach(function (c) {
        var chip = el("button", { type: "button", class: "itc-chip" }, esc(c));
        chip.addEventListener("click", function () { sendMessage(c); });
        chips.appendChild(chip);
      });
      log().appendChild(chips);
    }
    history.forEach(function (m) { addBubble(m.role, m.content, { inquiry: m.role === "assistant" && INQ.test(m.content) }); INQ.lastIndex = 0; });
  }

  function saveHistory() { sset("sessionStorage", "itc-history", JSON.stringify(history.slice(-MAX_HISTORY * 2))); }

  // ---- chat ----
  function sendMessage(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    if (text.length > MAX_INPUT) text = text.slice(0, MAX_INPUT);
    var chips = panel.querySelector(".itc-chips"); if (chips) chips.remove();
    var input = panel.querySelector("#itc-input");
    input.value = ""; autoGrow(input); updateCount();

    history.push({ role: "user", content: text });
    saveHistory();
    addBubble("user", text);
    var bubble = addBubble("assistant", "");
    bubble.innerHTML = '<span class="itc-typing" aria-label="…"><i></i><i></i><i></i></span>';
    setBusy(true);

    var hp = panel.querySelector('.itc-compose input[name="website"]').value;
    controller = window.AbortController ? new AbortController() : null;
    var full = "", failed = null, truncated = false;

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: lang, website: hp, messages: history.slice(-MAX_HISTORY) }),
      signal: controller ? controller.signal : undefined
    }).then(function (res) {
      if (!res.ok || !res.body) {
        return res.json().catch(function () { return {}; }).then(function (j) { failed = (j && j.error) || "unavailable"; });
      }
      var reader = res.body.getReader(), decoder = new TextDecoder(), buf = "";
      function handle(line) {
        if (!line.trim()) return;
        var ev; try { ev = JSON.parse(line); } catch (e) { return; }
        if (ev.t === "d") { full += ev.v; bubble.innerHTML = '<span class="itc-sr">' + esc(T[lang].bot) + ": </span>" + render(full); log().scrollTop = log().scrollHeight; }
        else if (ev.t === "e") failed = ev.code || "unavailable";
        else if (ev.t === "end") truncated = !!ev.truncated;
      }
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) { handle(buf); return; }
          buf += decoder.decode(r.value, { stream: true });
          var parts = buf.split("\n"); buf = parts.pop();
          parts.forEach(handle);
          return pump();
        });
      }
      return pump();
    }).catch(function (e) {
      if (e && e.name === "AbortError") failed = failed || "aborted";
      else failed = "network";
    }).then(function () {
      setBusy(false);
      if (failed === "aborted") { if (!full) bubble.remove(); }
      else if (failed && !full) {
        bubble.remove();
        history.pop(); saveHistory(); // let the visitor resend
        addFallback(failed);
      } else {
        if (failed) addFallback(failed);
        if (!full.trim()) { bubble.remove(); history.pop(); saveHistory(); if (!failed) addFallback("unavailable"); return; }
        history.push({ role: "assistant", content: full.slice(0, 2500) });
        saveHistory();
        if (INQ.test(full)) addInquiryButton(bubble);
        INQ.lastIndex = 0;
        if (truncated) bubble.appendChild(el("p", null, "<em>" + esc(T[lang].truncated) + "</em>"));
      }
      var inp = panel.querySelector("#itc-input"); if (inp && !panel.hidden) inp.focus();
    });
  }

  function setBusy(v) {
    busy = v;
    var btn = panel.querySelector(".itc-send"); if (btn) btn.disabled = v;
    log().setAttribute("aria-busy", v ? "true" : "false");
  }
  function autoGrow(ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 112) + "px"; }
  function updateCount() {
    var ta = panel.querySelector("#itc-input"), c = panel.querySelector(".itc-count");
    if (!ta || !c) return;
    c.textContent = ta.value.length > MAX_INPUT * 0.8 ? ta.value.length + " / " + MAX_INPUT : "";
  }

  // ---- inquiry form (Netlify Forms) ----
  function showForm(show) {
    var form = panel.querySelector(".itc-form");
    var chatParts = [".itc-log", ".itc-compose", ".itc-count", ".itc-fallback"].map(function (s) { return panel.querySelector(s); });
    form.hidden = !show;
    chatParts.forEach(function (n) { n.hidden = show; n.style.display = show ? "none" : ""; });
    if (show) form.querySelector('input[name="full-name"]').focus();
    else panel.querySelector("#itc-input").focus();
  }

  function submitInquiry(form) {
    var f = T[lang].form, status = form.querySelector(".itc-status"), btn = form.querySelector(".itc-primary");
    var data = new FormData(form);
    var email = String(data.get("email") || "").trim();
    var valid = String(data.get("full-name") || "").trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      data.get("project-type") && String(data.get("project-requirements") || "").trim() && form.querySelector('input[name="consent"]').checked;
    if (!valid) { status.className = "itc-status err"; status.textContent = f.invalid; return; }

    var body = new URLSearchParams();
    body.append("form-name", "chat-inquiry");
    ["bot-field", "full-name", "email", "company", "phone", "project-type", "project-requirements"].forEach(function (k) { body.append(k, String(data.get(k) || "").trim()); });
    body.append("consent", "Yes — agreed to the privacy policy in the website chat (" + new Date().toISOString() + ")");
    body.append("language", lang);
    body.append("page", location.pathname);

    btn.disabled = true; btn.textContent = f.sending; status.className = "itc-status"; status.textContent = "";
    fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        status.className = "itc-status ok"; status.textContent = f.ok;
      })
      .catch(function () { status.className = "itc-status err"; status.innerHTML = f.fail; })
      .then(function () { btn.disabled = false; btn.textContent = f.submit; });
  }

  // ---- open / close ----
  function open() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    sset("sessionStorage", "itc-open", "1");
    var ta = panel.querySelector("#itc-input"); if (ta) ta.focus();
    log().scrollTop = log().scrollHeight;
  }
  function close() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    sdel("sessionStorage", "itc-open");
    launcher.focus();
  }

  // ---- events (delegated, so they survive a language rebuild) ----
  launcher.addEventListener("click", function () { panel.hidden ? open() : close(); });
  panel.addEventListener("click", function (e) {
    var a = e.target.closest("[data-act]"); if (!a) return;
    var act = a.getAttribute("data-act");
    if (act === "close") close();
    else if (act === "inquiry") showForm(true);
    else if (act === "back") showForm(false);
    else if (act === "reset") {
      if (controller) controller.abort();
      history = []; saveHistory(); renderLog(); panel.querySelector("#itc-input").focus();
    }
  });
  panel.addEventListener("change", function (e) {
    if (e.target.id === "itc-lang" && T[e.target.value]) {
      lang = e.target.value; sset("localStorage", "itc-lang", JSON.stringify({ page: pageLang, lang: lang }));
      build(); panel.querySelector("#itc-lang").focus();
    }
  });
  panel.addEventListener("submit", function (e) {
    e.preventDefault();
    if (e.target.classList.contains("itc-compose")) sendMessage(panel.querySelector("#itc-input").value);
    else if (e.target.classList.contains("itc-form")) submitInquiry(e.target);
  });
  panel.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.stopPropagation(); close(); }
    else if (e.target.id === "itc-input" && e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendMessage(e.target.value); }
  });
  panel.addEventListener("input", function (e) { if (e.target.id === "itc-input") { autoGrow(e.target); updateCount(); } });

  function mount() {
    // The chat window replaces the old floating WhatsApp button; WhatsApp stays available inside it.
    var oldWa = document.querySelector(".whatsapp-float"); if (oldWa) oldWa.remove();
    build();
    document.body.appendChild(panel);
    document.body.appendChild(launcher);
    if (sget("sessionStorage", "itc-open") === "1" && window.matchMedia && !window.matchMedia("(max-width:560px)").matches) open();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
