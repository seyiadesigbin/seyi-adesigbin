/*
 * Contact form, sent through Web3Forms (https://web3forms.com).
 *
 * window.ContactForm.create(site) returns a <form> element, or null when no
 * access key is set in content.js (so no broken form is ever shown).
 *
 * It is a normal HTML form that posts to Web3Forms. With JavaScript it sends
 * in the background and shows the result under the button; if sending fails
 * it tells the visitor and offers the email address instead.
 */
(function () {
  var ENDPOINT = "https://api.web3forms.com/submit";
  var counter = 0;

  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }

  function field(id, labelText, control) {
    var wrap = el("div", "cf-field");
    var label = el("label", null, labelText);
    label.htmlFor = id;
    control.id = id;
    wrap.appendChild(label);
    wrap.appendChild(control);
    return wrap;
  }

  function hidden(name, value) {
    var i = el("input");
    i.type = "hidden"; i.name = name; i.value = value;
    return i;
  }

  function create(site) {
    var c = site.contact;
    if (!c || !c.formKey) return null;
    var uid = "cf" + (++counter) + "-";

    var form = el("form", "contact-form");
    form.action = ENDPOINT;
    form.method = "POST";

    form.appendChild(hidden("access_key", c.formKey));
    form.appendChild(hidden("subject", c.formSubject || "New message from your website"));
    form.appendChild(hidden("from_name", site.name + " website"));

    var name = el("input"); name.type = "text"; name.name = "name"; name.required = true; name.autocomplete = "name";
    var email = el("input"); email.type = "email"; email.name = "email"; email.required = true; email.autocomplete = "email";
    var message = el("textarea"); message.name = "message"; message.required = true; message.rows = 4;
    form.appendChild(field(uid + "name", "Your name", name));
    form.appendChild(field(uid + "email", "Your email", email));
    form.appendChild(field(uid + "message", "Message", message));

    // Spam trap: real visitors never see or tick this.
    var trap = el("input");
    trap.type = "checkbox"; trap.name = "botcheck"; trap.tabIndex = -1;
    trap.setAttribute("aria-hidden", "true"); trap.autocomplete = "off";
    trap.style.display = "none";
    form.appendChild(trap);

    var button = el("button", "cf-button", "Send message");
    button.type = "submit";
    form.appendChild(button);

    var status = el("p", "cf-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    form.appendChild(status);

    function say(text, withEmailLink) {
      status.textContent = text;
      if (withEmailLink) {
        var a = el("a", null, c.email);
        a.href = "mailto:" + c.email;
        status.appendChild(a);
        status.appendChild(document.createTextNode("."));
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (trap.checked) return; // a bot: pretend nothing happened
      button.disabled = true;
      say("Sending...");
      fetch(ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
        .then(function (res) {
          return res.json().then(function (json) { return { ok: res.ok, json: json }; });
        })
        .then(function (r) {
          if (!r.ok || !r.json || r.json.success !== true) throw new Error("rejected");
          form.reset();
          say("Thanks, your message is on its way. I'll reply soon.");
        })
        .catch(function () {
          say("Sorry, that did not send. Please email me at ", true);
        })
        .then(function () { button.disabled = false; });
    });

    return form;
  }

  window.ContactForm = { create: create };
})();
