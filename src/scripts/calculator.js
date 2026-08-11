/* ============================================
   TipSplit — Application Logic (Astro Version)
   ============================================ */

(function () {
    'use strict';

    // ─── Compliance Database (August 2026) ────
    const LEGAL_RULES = {
      "lastUpdated": "August 2026",
      "source": "U.S. Department of Labor (DOL) Wage & Hour Division",
      "disclaimer": "This tool provides general calculations and compliance alerts based on public rules, but does not constitute legal advice. Please consult an employment attorney or payroll specialist to verify compliance with your local laws.",
      "states": {
        "US": {
          "name": "Federal (FLSA Baseline)",
          "allowsTipCredit": true,
          "bohRule": "no_tip_credit",
          "managerRule": "never",
          "notes": "Under federal FLSA rules, managers and supervisors can never participate in tip pools. Back-of-house (BOH) staff can only be included if the employer pays full minimum wage and takes NO tip credit."
        },
        "CA": {
          "name": "California",
          "allowsTipCredit": false,
          "bohRule": "allowed",
          "managerRule": "never",
          "notes": "California strictly prohibits tip credits. Employers must pay full state minimum wage. Under CA Labor Code Section 351, BOH employees can be included in a tip pool if they are in the chain of service, but managers/agents are strictly excluded."
        },
        "TX": {
          "name": "Texas",
          "allowsTipCredit": true,
          "bohRule": "no_tip_credit",
          "managerRule": "never",
          "notes": "Texas follows the federal FLSA baseline. BOH employees cannot participate in the tip pool if the employer claims a tip credit. Managers and supervisors cannot participate under any circumstances."
        },
        "NY": {
          "name": "New York",
          "allowsTipCredit": true,
          "bohRule": "restricted",
          "managerRule": "never",
          "notes": "New York has strict FOH-only rules. BOH employees (cooks, dishwashers) cannot participate in a tip pool if a tip credit is claimed, and are generally restricted even without a tip credit unless they perform FOH-like direct customer-facing services. Managers are strictly excluded."
        },
        "FL": {
          "name": "Florida",
          "allowsTipCredit": true,
          "bohRule": "no_tip_credit",
          "managerRule": "never",
          "notes": "Florida allows tip credits. BOH staff cannot participate in the tip pool if the employer claims a tip credit. Managers and supervisors can never participate."
        }
      }
    };

    // ─── State ──────────────────────────────
    let currentMethod = 'equal';
    let memberIdCounter = 0;
    let members = [];

    // ─── DOM References ─────────────────────
    const totalTipsInput = document.getElementById('totalTips');
    const methodBtns = document.querySelectorAll('.method-btn');
    const rolePresets = document.getElementById('rolePresets');
    const teamList = document.getElementById('teamList');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultsCard = document.getElementById('resultsCard');
    const resultsSummary = document.getElementById('resultsSummary');
    const resultsTableHead = document.getElementById('resultsTableHead');
    const resultsTableBody = document.getElementById('resultsTableBody');
    const methodExplanation = document.getElementById('methodExplanation');
    const copyBtn = document.getElementById('copyBtn');
    const printBtn = document.getElementById('printBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const toast = document.getElementById('toast');

    // Compliance elements
    const stateSelect = document.getElementById('stateSelect');
    const takeTipCreditInput = document.getElementById('takeTipCredit');
    const tipCreditContainer = document.getElementById('tipCreditContainer');
    const tipCreditNote = document.getElementById('tipCreditNote');
    const complianceAlert = document.getElementById('complianceAlert');

    // ─── Initialize ─────────────────────────
    function init() {
        if (!totalTipsInput) return; // Guard for Astro pages if script is loaded globally

        const hasSavedState = loadAppState();

        if (!hasSavedState) {
            // Start with 2 empty members
            addMember('', '', '', 'foh');
            addMember('', '', '', 'foh');
        } else {
            renderTeamList();
        }

        // Event listeners
        methodBtns.forEach(btn => btn.addEventListener('click', () => setMethod(btn.dataset.method)));

        // Keyboard navigation for method radiogroup (Arrow keys)
        const methodsArray = Array.from(methodBtns);
        methodBtns.forEach(btn => {
            btn.addEventListener('keydown', (e) => {
                const currentIdx = methodsArray.indexOf(btn);
                let nextIdx = -1;
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    nextIdx = (currentIdx + 1) % methodsArray.length;
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    nextIdx = (currentIdx - 1 + methodsArray.length) % methodsArray.length;
                }
                if (nextIdx >= 0) {
                    e.preventDefault();
                    const nextBtn = methodsArray[nextIdx];
                    setMethod(nextBtn.dataset.method);
                    nextBtn.focus();
                }
            });
        });
        addMemberBtn.addEventListener('click', () => addMember());
        calculateBtn.addEventListener('click', calculate);
        copyBtn.addEventListener('click', copyResults);
        printBtn.addEventListener('click', () => window.print());
        if (pdfBtn) pdfBtn.addEventListener('click', () => loadJsPdf(generatePdf));
        if (whatsappBtn) whatsappBtn.addEventListener('click', shareWhatsApp);

        // State & Tip Credit setup
        if (stateSelect && takeTipCreditInput) {
            stateSelect.addEventListener('change', handleStateChange);
            takeTipCreditInput.addEventListener('change', () => {
                validateCompliance();
                autoRecalc();
            });
        }

        // Role preset chips
        document.querySelectorAll('.preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                addMember(chip.dataset.role, '', chip.dataset.points, 'foh');
            });
        });

        // Auto-recalculate on input change
        totalTipsInput.addEventListener('input', autoRecalc);

        // Focus the total tips input on load
        setTimeout(() => totalTipsInput.focus(), 300);

        // Run compliance check initially
        if (stateSelect) {
            handleStateChange();
        } else {
            validateCompliance();
        }

        // Save state before leaving the page via links
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                saveAppState();
            });
        });

        // Automatically calculate if there is total tips input
        if (totalTipsInput && parseFloat(totalTipsInput.value) > 0) {
            calculate(true);
        }
    }

    // ─── State & Wage Settings Change ────────
    function handleStateChange() {
        const state = stateSelect.value;

        // Redirect to state-specific page if dropdown changed
        const STATE_URLS = {
            'CA': '/california-tip-pooling-calculator',
            'TX': '/texas-tip-pooling-calculator',
            'NY': '/new-york-tip-pooling-calculator',
            'FL': '/florida-tip-pooling-calculator',
            'US': '/'
        };
        const targetPath = STATE_URLS[state];
        if (targetPath) {
            const currentPath = window.location.pathname;
            const normalize = p => p.replace(/\/$/, '');
            const normCurrent = normalize(currentPath);
            const normTarget = normalize(targetPath);
            
            if (normCurrent !== normTarget && !(normTarget === '' && normCurrent === '/index.html')) {
                // Save current state before redirecting
                saveAppState();
                window.location.href = targetPath;
                return;
            }
        }

        const stateRules = LEGAL_RULES.states[state] || LEGAL_RULES.states.US;
        
        if (!stateRules.allowsTipCredit) {
            takeTipCreditInput.checked = false;
            takeTipCreditInput.disabled = true;
            if (tipCreditContainer) {
                tipCreditContainer.style.opacity = '0.5';
                tipCreditContainer.style.cursor = 'not-allowed';
            }
            if (tipCreditNote) {
                tipCreditNote.textContent = `${stateRules.name} does not allow tip credits.`;
                tipCreditNote.style.display = 'block';
            }
        } else {
            takeTipCreditInput.disabled = false;
            if (tipCreditContainer) {
                tipCreditContainer.style.opacity = '1';
                tipCreditContainer.style.cursor = 'pointer';
            }
            if (tipCreditNote) {
                tipCreditNote.style.display = 'none';
            }
        }
        validateCompliance();
        autoRecalc();
    }

    // ─── Method Switching ───────────────────
    function setMethod(method) {
        currentMethod = method;
        methodBtns.forEach(btn => {
            const isActive = btn.dataset.method === method;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
            btn.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        // Show/hide role presets
        rolePresets.style.display = method === 'points' ? 'block' : 'none';

        // Re-render team members to show/hide fields
        renderTeamList();
        autoRecalc();
    }

    // ─── Member Management ──────────────────
    function addMember(name = '', role = '', points = '', type = 'foh') {
        memberIdCounter++;
        members.push({
            id: memberIdCounter,
            name: name,
            role: role,
            hours: '',
            points: points,
            type: type
        });
        renderTeamList();
        validateCompliance();
        
        // Focus the name field of the new member
        setTimeout(() => {
            const lastNameInput = teamList.querySelector(`.team-member:last-child .member-name`);
            if (lastNameInput && !name) lastNameInput.focus();
        }, 50);
    }

    function removeMember(id) {
        if (members.length <= 1) return; // Keep at least 1
        members = members.filter(m => m.id !== id);
        renderTeamList();
        validateCompliance();
        autoRecalc();
    }

    function renderTeamList() {
        teamList.innerHTML = '';
        members.forEach((member, idx) => {
            const row = document.createElement('div');
            row.className = 'team-member';
            row.setAttribute('role', 'listitem');
            row.dataset.id = member.id;

            const memberLabel = member.name.trim() || `Member ${idx + 1}`;

            let fieldsHTML = `
                <select class="member-type" data-field="type" name="member-type-${idx}" aria-label="Role classification for ${memberLabel}">
                    <option value="foh" ${member.type === 'foh' ? 'selected' : ''}>FOH</option>
                    <option value="boh" ${member.type === 'boh' ? 'selected' : ''}>BOH</option>
                    <option value="manager" ${member.type === 'manager' ? 'selected' : ''}>Manager</option>
                </select>
                <input type="text" class="member-name" placeholder="Name…" 
                       value="${escapeHTML(member.name)}" data-field="name" 
                       name="member-name-${idx}" aria-label="Name for member ${idx + 1}" 
                       autocomplete="off" spellcheck="false">
            `;

            if (currentMethod === 'hours') {
                fieldsHTML += `
                    <input type="number" class="member-hours" placeholder="Hours…" 
                           value="${member.hours}" data-field="hours" min="0" step="0.25" 
                           inputmode="decimal" name="member-hours-${idx}" 
                           aria-label="Hours worked by ${memberLabel}">
                `;
            }

            if (currentMethod === 'points') {
                fieldsHTML += `
                    <input type="text" class="member-role" placeholder="Role…" 
                           value="${escapeHTML(member.role)}" data-field="role" 
                           name="member-role-${idx}" aria-label="Role for ${memberLabel}" 
                           autocomplete="off" spellcheck="false">
                    <input type="number" class="member-points" placeholder="Points…" 
                           value="${member.points}" data-field="points" min="0" step="1" 
                           inputmode="decimal" name="member-points-${idx}" 
                           aria-label="Points for ${memberLabel}">
                `;
            }

            row.innerHTML = `
                <span class="member-number" aria-hidden="true">${idx + 1}</span>
                <div class="member-fields">${fieldsHTML}</div>
                <button class="remove-btn" title="Remove ${memberLabel}" aria-label="Remove ${memberLabel}">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                </button>
            `;

            // Input change listeners
            row.querySelectorAll('input, select').forEach(input => {
                input.addEventListener('input', (e) => {
                    const field = e.target.dataset.field;
                    member[field] = e.target.value;
                    autoRecalc();
                    validateCompliance();
                });

                // Enter key adds new member from last row
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (idx === members.length - 1) {
                            addMember();
                        } else {
                            // Focus next row's first input
                            const nextRow = teamList.children[idx + 1];
                            if (nextRow) nextRow.querySelector('input')?.focus();
                        }
                    }
                });
            });

            // Remove button
            row.querySelector('.remove-btn').addEventListener('click', () => removeMember(member.id));

            teamList.appendChild(row);
        });
    }

    // ─── Compliance Check Logic ─────────────
    function validateCompliance() {
        if (!stateSelect || !complianceAlert) return;

        const state = stateSelect.value;
        const stateRules = LEGAL_RULES.states[state] || LEGAL_RULES.states.US;
        const takeTipCredit = takeTipCreditInput ? takeTipCreditInput.checked : false;

        saveAppState();

        let hasManager = false;
        let hasBoh = false;
        let activeMems = members.filter(m => m.name.trim() !== '');

        activeMems.forEach(m => {
            if (m.type === 'manager') hasManager = true;
            if (m.type === 'boh') hasBoh = true;
        });

        let isCompliant = true;
        let alertTitle = "Calculations Compliant";
        let alertDesc = `Your tip pool configuration is compliant with <strong>${stateRules.name}</strong> rules. All participating employees are eligible.`;
        
        // 1. Manager check
        if (hasManager) {
            isCompliant = false;
            alertTitle = "Compliance Alert: Manager Included";
            alertDesc = `Under <strong>${stateRules.name}</strong> rules, managers and supervisors are strictly prohibited from participating in employee tip pools. Please remove them from the pool.`;
        }
        // 2. BOH check (Tip Credit)
        else if (hasBoh && stateRules.allowsTipCredit && takeTipCredit) {
            isCompliant = false;
            alertTitle = "Compliance Alert: BOH with Tip Credit";
            alertDesc = `Under <strong>${stateRules.name}</strong> rules, back-of-house (BOH) staff can only participate in a tip pool if the employer pays full minimum wage and claims <strong>NO tip credit</strong>. Turn off the tip credit option to include BOH staff.`;
        }
        // 3. NY state BOH restrictions
        else if (hasBoh && state === 'NY') {
            isCompliant = false;
            alertTitle = "Compliance Alert: New York BOH Restrictions";
            alertDesc = `New York state law restricts tip pooling strictly to FOH employees in direct customer service roles. Back-of-house staff (cooks, dishwashers) are generally excluded from tip sharing.`;
        }

        // Show/hide banner
        if (activeMems.length === 0) {
            complianceAlert.style.display = 'none';
            return;
        }

        complianceAlert.style.display = 'flex';
        complianceAlert.className = `compliance-alert ${isCompliant ? 'success' : 'warning'}`;
        complianceAlert.querySelector('.alert-title').innerHTML = alertTitle;
        complianceAlert.querySelector('.alert-desc').innerHTML = alertDesc;
        complianceAlert.querySelector('.alert-icon').innerHTML = isCompliant ? '✅' : '⚠️';
    }

    // ─── Auto Recalculate ───────────────────
    function autoRecalc() {
        saveAppState();
        if (resultsCard.style.display !== 'none') {
            calculate(true);
        }
    }

    // ─── Calculate ──────────────────────────
    function calculate(silent = false) {
        clearErrors();

        const totalTips = parseFloat(totalTipsInput.value);

        // Validation
        if (isNaN(totalTips) || totalTips <= 0) {
            if (!silent) showError(totalTipsInput, 'Enter the total tip amount');
            return;
        }

        // Filter members with names
        const activeMems = members.filter(m => m.name.trim() !== '');
        if (activeMems.length === 0) {
            if (!silent) showError(teamList, 'Add at least one team member with a name');
            return;
        }

        // Check compliance first
        validateCompliance();
        const isNotCompliant = complianceAlert && complianceAlert.classList.contains('warning');

        if (isNotCompliant && complianceAlert.style.display !== 'none') {
            if (!silent) {
                // Shake the compliance alert banner
                complianceAlert.classList.add('shake-alert');
                setTimeout(() => complianceAlert.classList.remove('shake-alert'), 400);
                showToast('Non-compliant setup. Resolve compliance alert below to calculate.');
            }
            if (resultsCard) resultsCard.style.display = 'none';
            return;
        }

        let results = [];

        switch (currentMethod) {
            case 'equal':
                results = calcEqual(totalTips, activeMems);
                break;
            case 'hours':
                results = calcByHours(totalTips, activeMems, silent);
                break;
            case 'points':
                results = calcByPoints(totalTips, activeMems, silent);
                break;
        }

        if (!results) return;

        displayResults(totalTips, results);
    }

    // ─── Equal Split ────────────────────────
    function calcEqual(totalTips, mems) {
        const share = totalTips / mems.length;
        const pct = 100 / mems.length;
        return mems.map(m => ({
            name: m.name.trim(),
            role: m.role || '',
            tipAmount: share,
            percentage: pct,
            detail: ''
        }));
    }

    // ─── Hours-Based ────────────────────────
    function calcByHours(totalTips, mems, silent) {
        let hasError = false;
        mems.forEach(m => {
            const h = parseFloat(m.hours);
            if (isNaN(h) || h <= 0) {
                if (!silent) {
                    const input = teamList.querySelector(`[data-id="${m.id}"] .member-hours`);
                    if (input) showError(input, 'Enter hours');
                }
                hasError = true;
            }
        });
        if (hasError) return null;

        const totalHours = mems.reduce((sum, m) => sum + parseFloat(m.hours), 0);
        const ratePerHour = totalTips / totalHours;

        return mems.map(m => {
            const h = parseFloat(m.hours);
            const tip = (h / totalHours) * totalTips;
            return {
                name: m.name.trim(),
                role: m.role || '',
                hours: h,
                tipAmount: tip,
                percentage: (h / totalHours) * 100,
                detail: `${h}h × $${ratePerHour.toFixed(2)}/hr`
            };
        });
    }

    // ─── Points-Based ───────────────────────
    function calcByPoints(totalTips, mems, silent) {
        let hasError = false;
        mems.forEach(m => {
            const p = parseFloat(m.points);
            if (isNaN(p) || p <= 0) {
                if (!silent) {
                    const input = teamList.querySelector(`[data-id="${m.id}"] .member-points`);
                    if (input) showError(input, 'Enter points');
                }
                hasError = true;
            }
        });
        if (hasError) return null;

        const totalPoints = mems.reduce((sum, m) => sum + parseFloat(m.points), 0);
        const valuePerPoint = totalTips / totalPoints;

        return mems.map(m => {
            const p = parseFloat(m.points);
            const tip = (p / totalPoints) * totalTips;
            return {
                name: m.name.trim(),
                role: m.role || m.name.trim(),
                points: p,
                tipAmount: tip,
                percentage: (p / totalPoints) * 100,
                detail: `${p} pts × $${valuePerPoint.toFixed(2)}/pt`
            };
        });
    }

    // ─── Display Results ────────────────────
    function displayResults(totalTips, results) {
        // Sort by tip amount descending
        results.sort((a, b) => b.tipAmount - a.tipAmount);

        // Summary stats
        const avgTip = totalTips / results.length;
        const highestTip = Math.max(...results.map(r => r.tipAmount));
        const lowestTip = Math.min(...results.map(r => r.tipAmount));

        resultsSummary.innerHTML = `
            <div class="summary-stat">
                <div class="stat-value">$${totalTips.toFixed(2)}</div>
                <div class="stat-label">Total Pool</div>
            </div>
            <div class="summary-stat">
                <div class="stat-value">${results.length}</div>
                <div class="stat-label">Team Members</div>
            </div>
            <div class="summary-stat">
                <div class="stat-value">$${avgTip.toFixed(2)}</div>
                <div class="stat-label">Average Share</div>
            </div>
        `;

        // Table header
        let headHTML = '<th>Name</th>';
        if (currentMethod === 'hours') headHTML += '<th>Hours</th>';
        if (currentMethod === 'points') headHTML += '<th>Role</th><th>Points</th>';
        headHTML += '<th>Share</th><th style="text-align:right">Tips</th>';
        resultsTableHead.innerHTML = headHTML;

        // Table body
        resultsTableBody.innerHTML = '';
        results.forEach(r => {
            const tr = document.createElement('tr');
            let cells = `<td><strong>${escapeHTML(r.name)}</strong></td>`;
            if (currentMethod === 'hours') cells += `<td>${r.hours}h</td>`;
            if (currentMethod === 'points') {
                cells += `<td>${escapeHTML(r.role)}</td>`;
                cells += `<td>${r.points} pts</td>`;
            }
            cells += `<td class="pct-col">${r.percentage.toFixed(1)}%</td>`;
            cells += `<td class="tip-amount" style="text-align:right">$${r.tipAmount.toFixed(2)}</td>`;
            tr.innerHTML = cells;
            resultsTableBody.appendChild(tr);
        });

        // Method explanation
        const explanations = {
            equal: `Equally divided $${totalTips.toFixed(2)} among ${results.length} people — $${avgTip.toFixed(2)} each.`,
            hours: `Distributed $${totalTips.toFixed(2)} proportionally by hours worked. Each hour earned $${(totalTips / results.reduce((s, r) => s + r.hours, 0)).toFixed(2)}.`,
            points: `Distributed $${totalTips.toFixed(2)} based on role points. Each point was worth $${(totalTips / results.reduce((s, r) => s + r.points, 0)).toFixed(2)}.`
        };
        methodExplanation.textContent = explanations[currentMethod];

        // Show results
        resultsCard.style.display = 'block';
        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ─── Copy to Clipboard ──────────────────
    function copyResults() {
        const totalTips = parseFloat(totalTipsInput.value);
        const rows = resultsTableBody.querySelectorAll('tr');
        let text = `TipSplit Results\n`;
        text += `═══════════════════════════\n`;
        text += `Total Pool: $${totalTips.toFixed(2)}\n`;
        text += `Method: ${currentMethod === 'equal' ? 'Equal Split' : currentMethod === 'hours' ? 'By Hours Worked' : 'By Role Points'}\n`;
        text += `Team Size: ${rows.length}\n`;
        text += `───────────────────────────\n`;

        rows.forEach(tr => {
            const cells = tr.querySelectorAll('td');
            const name = cells[0].textContent;
            const amount = cells[cells.length - 1].textContent;
            const pct = cells[cells.length - 2].textContent;
            text += `${name}: ${amount} (${pct})\n`;
        });

        text += `───────────────────────────\n`;
        text += `Generated by TipSplit`;

        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!');
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Copied to clipboard!');
        });
    }

    // ─── Error Handling ─────────────────────
    function showError(inputEl, message) {
        if (inputEl.classList) {
            inputEl.classList.add('input-error');
            // Add error message below if not already
            const parent = inputEl.closest('.input-group') || inputEl.parentElement;
            if (!parent.querySelector('.error-msg')) {
                const msg = document.createElement('div');
                msg.className = 'error-msg';
                msg.textContent = message;
                parent.appendChild(msg);
            }
        }
        // Auto-clear after 3 seconds
        setTimeout(() => clearErrors(), 3000);
    }

    function clearErrors() {
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        document.querySelectorAll('.error-msg').forEach(el => el.remove());
    }

    // ─── Toast ──────────────────────────────
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ─── Utils ──────────────────────────────
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function saveAppState() {
        try {
            const stateToSave = {
                currentMethod: currentMethod,
                totalTips: totalTipsInput ? totalTipsInput.value : '',
                takeTipCredit: takeTipCreditInput ? takeTipCreditInput.checked : false,
                members: members.map(m => ({
                    name: m.name,
                    role: m.role,
                    hours: m.hours,
                    points: m.points,
                    type: m.type
                }))
            };
            sessionStorage.setItem('tipsplit_state', JSON.stringify(stateToSave));
        } catch (e) {
            console.error('Failed to save state to sessionStorage', e);
        }
    }

    function loadAppState() {
        try {
            const saved = sessionStorage.getItem('tipsplit_state');
            if (!saved) return false;

            const savedState = JSON.parse(saved);

            if (savedState.currentMethod) {
                currentMethod = savedState.currentMethod;
                methodBtns.forEach(btn => {
                    const isActive = btn.dataset.method === currentMethod;
                    btn.classList.toggle('active', isActive);
                    btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
                    btn.setAttribute('tabindex', isActive ? '0' : '-1');
                });

                if (rolePresets) {
                    rolePresets.style.display = currentMethod === 'points' ? 'block' : 'none';
                }
            }

            if (totalTipsInput && savedState.totalTips !== undefined) {
                totalTipsInput.value = savedState.totalTips;
            }

            if (takeTipCreditInput && savedState.takeTipCredit !== undefined) {
                takeTipCreditInput.checked = savedState.takeTipCredit;
            }

            if (savedState.members && Array.isArray(savedState.members)) {
                members = [];
                memberIdCounter = 0;
                savedState.members.forEach(m => {
                    memberIdCounter++;
                    members.push({
                        id: memberIdCounter,
                        name: m.name || '',
                        role: m.role || '',
                        hours: m.hours || '',
                        points: m.points || '',
                        type: m.type || 'foh'
                    });
                });
            }
            return true;
        } catch (e) {
            console.error('Failed to load state from sessionStorage', e);
            return false;
        }
    }

    // ─── PDF & WhatsApp Export ──────────────
    let isJsPdfLoading = false;
    
    function loadJsPdf(callback) {
        if (window.jspdf) {
            callback();
            return;
        }
        if (isJsPdfLoading) {
            setTimeout(() => loadJsPdf(callback), 100);
            return;
        }
        isJsPdfLoading = true;
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            isJsPdfLoading = false;
            callback();
        };
        script.onerror = () => {
            isJsPdfLoading = false;
            showToast('Failed to load PDF library. Check your connection.');
        };
        document.head.appendChild(script);
    }

    function generatePdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const stateSelect = document.getElementById('stateSelect');
        const stateName = stateSelect ? stateSelect.options[stateSelect.selectedIndex].text : 'Federal (FLSA Baseline)';
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Header
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(240, 165, 0); // Accent #f0a500
        doc.text("TipSplit Calculation Summary", 20, 25);
        
        doc.setFontSize(10);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${dateStr}`, 20, 32);
        
        // Divider
        doc.setDrawColor(220, 220, 220);
        doc.line(20, 37, 190, 37);
        
        // Setup Card Details
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(30, 30, 30);
        doc.text("Calculation Setup", 20, 47);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Location / State Rules: ${stateName}`, 20, 55);
        doc.text(`Split Method: ${currentMethod === 'equal' ? 'Equal Split' : currentMethod === 'hours' ? 'By Hours Worked' : 'By Role Points'}`, 20, 61);
        doc.text(`Total Tips Pool: $${parseFloat(totalTipsInput.value).toFixed(2)}`, 20, 67);
        
        const activeMems = members.filter(m => m.name.trim() !== '');
        
        // Divider
        doc.line(20, 75, 190, 75);
        
        // Table Headers
        doc.setFont("Helvetica", "bold");
        doc.text("No.", 20, 83);
        doc.text("Team Member", 32, 83);
        doc.text("Role / Class", 85, 83);
        if (currentMethod === 'hours') {
            doc.text("Hours", 125, 83);
        } else if (currentMethod === 'points') {
            doc.text("Points", 125, 83);
        } else {
            doc.text("Share", 125, 83);
        }
        doc.text("Tip Share ($)", 160, 83);
        
        // Divider under headers
        doc.line(20, 87, 190, 87);
        
        // Table Body
        doc.setFont("Helvetica", "normal");
        let y = 94;
        
        let results = [];
        if (currentMethod === 'equal') {
            results = calcEqual(parseFloat(totalTipsInput.value), activeMems);
        } else if (currentMethod === 'hours') {
            results = calcByHours(parseFloat(totalTipsInput.value), activeMems, true);
        } else if (currentMethod === 'points') {
            results = calcByPoints(parseFloat(totalTipsInput.value), activeMems, true);
        }
        
        if (results && results.length > 0) {
            results.sort((a, b) => b.tipAmount - a.tipAmount);
            results.forEach((r, idx) => {
                if (y > 270) {
                    doc.addPage();
                    y = 25;
                    // Redraw headers on new page
                    doc.setFont("Helvetica", "bold");
                    doc.text("No.", 20, y);
                    doc.text("Team Member", 32, y);
                    doc.text("Role / Class", 85, y);
                    if (currentMethod === 'hours') {
                        doc.text("Hours", 125, y);
                    } else if (currentMethod === 'points') {
                        doc.text("Points", 125, y);
                    } else {
                        doc.text("Share", 125, y);
                    }
                    doc.text("Tip Share ($)", 160, y);
                    doc.line(20, y + 4, 190, y + 4);
                    doc.setFont("Helvetica", "normal");
                    y += 11;
                }
                
                doc.text(`${idx + 1}`, 20, y);
                doc.text(r.name, 32, y);
                
                const origMem = activeMems.find(m => m.name.trim() === r.name);
                const roleClass = origMem ? origMem.type.toUpperCase() : 'FOH';
                doc.text(roleClass, 85, y);
                
                if (currentMethod === 'hours') {
                    doc.text(`${r.hours}h`, 125, y);
                } else if (currentMethod === 'points') {
                    doc.text(`${r.points} pts`, 125, y);
                } else {
                    doc.text(`${(100 / results.length).toFixed(1)}%`, 125, y);
                }
                
                doc.text(`$${r.tipAmount.toFixed(2)}`, 160, y);
                
                doc.setDrawColor(245, 245, 245);
                doc.line(20, y + 3, 190, y + 3);
                doc.setDrawColor(220, 220, 220);
                
                y += 8;
            });
        }
        
        // Footer
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("TipSplit — Fair tips, zero drama. Get started at https://tip-umber.vercel.app", 20, 285);
        
        doc.save(`tipsplit-summary-${stateName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('PDF downloaded successfully!');
    }

    function shareWhatsApp() {
        const stateSelect = document.getElementById('stateSelect');
        const stateName = stateSelect ? stateSelect.options[stateSelect.selectedIndex].text : 'Federal (FLSA Baseline)';
        const totalTipsVal = parseFloat(totalTipsInput.value);
        
        const activeMems = members.filter(m => m.name.trim() !== '');
        
        let results = [];
        if (currentMethod === 'equal') {
            results = calcEqual(totalTipsVal, activeMems);
        } else if (currentMethod === 'hours') {
            results = calcByHours(totalTipsVal, activeMems, true);
        } else if (currentMethod === 'points') {
            results = calcByPoints(totalTipsVal, activeMems, true);
        }
        
        if (!results || results.length === 0) return;
        results.sort((a, b) => b.tipAmount - a.tipAmount);
        
        let text = `📊 *TipSplit Summary*\n`;
        text += `• *Rules / State:* ${stateName}\n`;
        text += `• *Total Pool:* $${totalTipsVal.toFixed(2)}\n`;
        text += `• *Split Method:* ${currentMethod === 'equal' ? 'Equal Split' : currentMethod === 'hours' ? 'By Hours Worked' : 'By Role Points'}\n`;
        text += `• *Team Members:* ${results.length}\n\n`;
        text += `*Share Breakdown:*\n`;
        
        results.forEach((r, idx) => {
            const origMem = activeMems.find(m => m.name.trim() === r.name);
            const roleClass = origMem ? origMem.type.toUpperCase() : 'FOH';
            let detail = '';
            if (currentMethod === 'hours') {
                detail = ` (${r.hours}h)`;
            } else if (currentMethod === 'points') {
                detail = ` (${r.points} pts)`;
            }
            text += `${idx + 1}. *${r.name}* [${roleClass}]${detail}: *$${r.tipAmount.toFixed(2)}* (${r.percentage.toFixed(1)}%)\n`;
        });
        
        text += `\nCalculated via https://tip-umber.vercel.app/`;
        
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }

    // ─── Boot ───────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
