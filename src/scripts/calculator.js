/* ============================================
   TipSplit — Application Logic (Astro Version)
   ============================================ */

(function () {
    'use strict';

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
    const toast = document.getElementById('toast');

    // ─── Initialize ─────────────────────────
    function init() {
        if (!totalTipsInput) return; // Guard for Astro pages if script is loaded globally

        // Start with 2 empty members
        addMember();
        addMember();

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

        // Role preset chips
        document.querySelectorAll('.preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                addMember(chip.dataset.role, '', chip.dataset.points);
            });
        });

        // Auto-recalculate on input change
        totalTipsInput.addEventListener('input', autoRecalc);

        // Focus the total tips input on load
        setTimeout(() => totalTipsInput.focus(), 300);
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
    function addMember(name = '', role = '', points = '') {
        memberIdCounter++;
        members.push({
            id: memberIdCounter,
            name: name,
            role: role,
            hours: '',
            points: points
        });
        renderTeamList();
        
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
            row.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', (e) => {
                    const field = e.target.dataset.field;
                    member[field] = e.target.value;
                    autoRecalc();
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

    // ─── Auto Recalculate ───────────────────
    function autoRecalc() {
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

    // ─── Boot ───────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
