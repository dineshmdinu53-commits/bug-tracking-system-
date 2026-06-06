const fs = require('fs');
const file = 'c:/Users/Admin/Documents/Custom Office Templates/OneDrive/Desktop/bug-tracker-main/bug-tracker/bug-tracker/js/script.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `    btn.addEventListener('click', async () => {

    rejectBtn.addEventListener('click', () => {`;

const fixStr = `    btn.addEventListener('click', async () => {
        const origHtml = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> Analyzing...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('code_snippet', bug.code_snippet);
            const data = await apiPost('ai_fix.php', formData);
            
            if (data.status === 'success') {
                fixedCodeEl.textContent = data.fixed_code;
                const errorCountEl = document.getElementById('ai-error-count');
                if (errorCountEl) errorCountEl.textContent = data.error_count || '1';
                panel.classList.remove('hidden');
            } else {
                showToast(data.message || 'AI Error', 'error');
            }
        } catch (err) {
            showToast(err.message || 'Failed to connect to AI service', 'error');
        } finally {
            btn.innerHTML = origHtml;
            btn.disabled = false;
        }
    });

    rejectBtn.addEventListener('click', () => {`;

content = content.replace(targetStr, fixStr);
fs.writeFileSync(file, content);
console.log('Fixed script.js');
