const API_BASE = 'http://localhost/bug-tracker/php';

async function verify() {
    let passed = 0;
    let failed = 0;

    function assert(condition, message, data = null) {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            if (data) console.error('Data:', data);
            failed++;
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    try {
        console.log('--- Step 1: Init DB ---');
        const dbRes = await fetch(`${API_BASE}/setup_db.php`);
        const dbText = await dbRes.text();
        assert(dbText.includes('success'), 'Database initialized successfully');

        console.log('\n--- Step 2: Admin Verification ---');
        let cookieHeader = '';
        const adminLogin = await fetch(`${API_BASE}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'email=admin@bugtracker.com&password=admin123'
        });
        const adminSession = adminLogin.headers.get('set-cookie');
        cookieHeader = adminSession ? adminSession.split(';')[0] : '';
        const adminData = await adminLogin.json();
        assert(adminData.status === 'success', 'Admin login successful');

        const adminDash = await fetch(`${API_BASE}/dashboard.php?action=stats`, { headers: { 'Cookie': cookieHeader } });
        const adminDashData = await adminDash.json();
        assert(adminDashData.total >= 0, 'Admin can view dashboard stats');

        await fetch(`${API_BASE}/logout.php`, { headers: { 'Cookie': cookieHeader } });

        console.log('\n--- Step 3: Reporter Verification ---');
        const reporterLogin = await fetch(`${API_BASE}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'email=reporter@bugtracker.com&password=reporter123'
        });
        const repSession = reporterLogin.headers.get('set-cookie');
        cookieHeader = repSession ? repSession.split(';')[0] : '';
        const repData = await reporterLogin.json();
        assert(repData.status === 'success', 'Reporter login successful');

        const formData = new URLSearchParams();
        formData.append('title', 'Test Bug by Reporter');
        formData.append('description', 'This is a test bug created during verification');
        formData.append('priority', 'Medium');
        formData.append('reporter_name', 'Reporter User');
        
        const createBug = await fetch(`${API_BASE}/bugs.php?action=create`, {
            method: 'POST',
            headers: { 'Cookie': cookieHeader },
            body: formData
        });
        const createText = await createBug.text();
        let createData;
        try { createData = JSON.parse(createText); } catch(e) { console.error('Raw Bug Creation Error:', createText); }
        assert(createData && (createData.status === 'success' || createData.id), 'Reporter can create a bug', createData);
        const newBugId = createData ? (createData.status === 'success' ? createData.id : createData.id) : null;

        await fetch(`${API_BASE}/logout.php`, { headers: { 'Cookie': cookieHeader } });

        console.log('\n--- Step 4: Developer Verification ---');
        const devLogin = await fetch(`${API_BASE}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'email=dev@bugtracker.com&password=dev123'
        });
        const devSession = devLogin.headers.get('set-cookie');
        cookieHeader = devSession ? devSession.split(';')[0] : '';
        const devData = await devLogin.json();
        assert(devData.status === 'success', 'Developer login successful');

        if (newBugId) {
            const getBug = await fetch(`${API_BASE}/bugs.php?action=get&id=${newBugId}`, { headers: { 'Cookie': cookieHeader } });
            const bugData = await getBug.json();
            assert(bugData.bug_id !== undefined, 'Developer can view the bug');

            const updateBug = await fetch(`${API_BASE}/update_status.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': cookieHeader },
                body: `bug_id=${newBugId}&status=In Progress`
            });
            const updateText = await updateBug.text();
            let updateData;
            try { updateData = JSON.parse(updateText); } catch(e) { console.error('Raw Update Error:', updateText); }
            assert(updateData && updateData.status === 'success', 'Developer can update bug status', updateData);

            const addComment = await fetch(`${API_BASE}/comments.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': cookieHeader },
                body: `bug_id=${newBugId}&text=Looking into this right now`
            });
            const commentData = await addComment.json();
            assert(commentData && commentData.id, 'Developer can add a comment to bug');
        } else {
            assert(false, 'Skipped Developer bug actions because bug creation failed');
        }

        await fetch(`${API_BASE}/logout.php`, { headers: { 'Cookie': cookieHeader } });

        console.log(`\nVerification Complete! Passed: ${passed}, Failed: ${failed}`);

    } catch (e) {
        console.error('Test Execution Error:', e);
    }
}

verify();
