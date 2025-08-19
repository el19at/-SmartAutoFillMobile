
function getFieldKey(input) {
  return input.name || input.id || input.placeholder || "";
}

function getRules() {
  return new Promise((resolve) => {
    browser.runtime.sendMessage({ action: "getRules" }, (response) => {
      resolve(response || []);
    });
  });
}

function getSavedValues() {
  return new Promise((resolve) => {
    browser.runtime.sendMessage({ action: "getSavedValues" }, (response) => {
      resolve(response || {});
    });
  });
}

async function autofillForm() {
  const [rules, savedValues] = await Promise.all([getRules(), getSavedValues()]);
  console.log(rules);
  document.querySelectorAll("input, textarea, select").forEach(input => {
    const id = input.id?.toLowerCase() || "";
    const name = input.name?.toLowerCase() || "";

    // 1. Apply user-defined rules first
    for (const rule of rules) {
      const match = rule.match.toLowerCase();
      if (id.includes(match) || name.includes(match)) {
        if (input.value !== rule.value) {
          input.value = rule.value;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
        return; 
      }
    }

    // 2. Apply saved values if no rule matches
    const key = getFieldKey(input);
    if (key && savedValues[key]) {
      if (input.value !== savedValues[key]) {
        input.value = savedValues[key];
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  });
}

// Save form data on submit
function saveFormData(event) {
  const form = event.target;
  const toSave = {};
  form.querySelectorAll("input, textarea, select").forEach(input => {
    const key = getFieldKey(input);
    if (key && input.value) {
      toSave[key] = input.value;
    }
  });
  browser.storage.local.set(toSave);
}

// Watch for dynamically added/changed fields
const observer = new MutationObserver(() => autofillForm());
observer.observe(document.body, { childList: true, subtree: true });

// Run on load + submit listener
document.addEventListener("DOMContentLoaded", autofillForm);
document.addEventListener("submit", saveFormData, true);
autofillForm();
setTimeout(autofillForm, 1000);
setTimeout(autofillForm, 3000);
