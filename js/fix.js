const fs = require('fs');
const file = 'c:/Users/Admin/Documents/Custom Office Templates/OneDrive/Desktop/bug-tracker-main/bug-tracker/bug-tracker/js/script.js';
let content = fs.readFileSync(file, 'utf8');

// Find the index of the first apiPost
const apiPostIdx = content.indexOf('async function apiPost');

// Find the second getCurrentUser
const secondGetUser = content.indexOf('function getCurrentUser', apiPostIdx);

// Cut out the duplicate part
if (secondGetUser > -1) {
    let cleanContent = content.substring(0, apiPostIdx) + content.substring(secondGetUser);

    // Now let's inject apiPost and apiGet back correctly.
    let correctContent = `/* =============================================
   API Helper
   ============================================= */
const API_BASE = 'php';

async function apiGet(endpoint) {
    try {
        const url = new URL(\`\${API_BASE}/\${endpoint}\`, window.location.origin);
        // Prevent aggressive caching
        url.searchParams.append('_t', Date.now());
        const res = await fetch(url.toString(), { credentials: 'include' });
        if (!res.ok) throw new Error(\`HTTP error! status: \${res.status}\`);
        return await res.json();
    } catch (err) {
        console.error('API GET error:', err);
        throw err;
    }
}

async function apiPost(endpoint, data) {
    try {
        const isFormData = data instanceof FormData;
        const res = await fetch(\`\${API_BASE}/\${endpoint}\`, {
            method: 'POST',
            body: isFormData ? data : new URLSearchParams(data),
            credentials: 'include'
        });
        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            let message = 'Request failed';
            try {
                const parsed = JSON.parse(errText);
                message = parsed.message || parsed.status || message;
            } catch {
                if (errText.trim()) {
                    message = errText;
                }
            }
            throw new Error(message);
        }
        return await res.json();
    } catch (err) {
        console.error('API POST error:', err);
        throw err;
    }
}

`;
    let endOfTailwind = content.indexOf('};', content.indexOf('tailwind.config')) + 2;
    // Replace from endOfTailwind to secondGetUser with correctContent
    cleanContent = content.substring(0, endOfTailwind) + '\n\n' + correctContent + content.substring(secondGetUser);
    fs.writeFileSync(file, cleanContent);
    console.log("Fixed");
} else {
    console.log("Could not find duplicates");
}
