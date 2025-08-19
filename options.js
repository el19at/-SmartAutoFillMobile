const ruleForm = document.getElementById("ruleForm");
const rulesList = document.getElementById("rulesList");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");

// Load and render rules
async function loadRules() {
  const { rules = [] } = await browser.storage.local.get("rules");
  rulesList.innerHTML = "";

  rules.forEach((rule, index) => {
    const li = document.createElement("li");

    // Editable "match" input
    const matchInput = document.createElement("input");
    matchInput.type = "text";
    matchInput.value = rule.match;
    matchInput.style.flex = "1";
    matchInput.addEventListener("change", async () => {
      rules[index].match = matchInput.value.trim();
      await browser.storage.local.set({ rules });
      loadRules();
    });

    // Editable "value" input
    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.value = rule.value;
    valueInput.style.flex = "1";
    valueInput.addEventListener("change", async () => {
      rules[index].value = valueInput.value.trim();
      await browser.storage.local.set({ rules });
      loadRules();
    });

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.onclick = async () => {
      rules.splice(index, 1);
      await browser.storage.local.set({ rules });
      loadRules();
    };

    li.style.display = "flex";
    li.style.flexDirection = "column";
    li.style.gap = "5px";
    li.appendChild(matchInput);
    li.appendChild(valueInput);
    li.appendChild(delBtn);

    rulesList.appendChild(li);
  });
}

// Add new rule
ruleForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const match = document.getElementById("match").value.trim();
  const value = document.getElementById("value").value.trim();
  if (!match || !value) return;

  const { rules = [] } = await browser.storage.local.get("rules");
  rules.push({ match, value });
  await browser.storage.local.set({ rules });
  ruleForm.reset();
  loadRules();
});

// Copy rules to clipboard instead of download
exportBtn.addEventListener("click", async () => {
  const { rules = [] } = await browser.storage.local.get("rules");
  const text = JSON.stringify(rules, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    alert("Rules copied to clipboard!");
  } catch (err) {
    alert("Failed to copy rules: " + err);
  }
});

// Import rules via prompt (mobile-friendly)
importBtn.addEventListener("click", async () => {
  const input = prompt("Paste JSON rules here:");
  if (!input) return;

  let importedRules;
  try {
    importedRules = JSON.parse(input);
    if (!Array.isArray(importedRules)) throw new Error("Invalid format");
  } catch (err) {
    alert("Invalid JSON");
    return;
  }

  const { rules: existingRules = [] } = await browser.storage.local.get("rules");

  // Merge with override
  importedRules.forEach(imported => {
    const idx = existingRules.findIndex(r => r.match === imported.match);
    if (idx >= 0) {
      existingRules[idx] = imported; // override
    } else {
      existingRules.push(imported); // add new
    }
  });

  await browser.storage.local.set({ rules: existingRules });
  loadRules();
});

loadRules();
