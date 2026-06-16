<?php
header('Content-Type: text/html; charset=utf-8');
session_start();
require_once __DIR__ . '/../php/db.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'Admin') {
    http_response_code(403);
    die('<div style="background:#111;color:#f44;padding:20px;font-family:sans-serif;text-align:center;min-height:100vh;display:flex;align-items:center;justify-content:center;"><h1>Access Denied. Only Admins can assign bugs.</h1></div>');
}

$bugId = isset($_GET['id']) ? (int) $_GET['id'] : (isset($_POST['bug_id']) ? (int) $_POST['bug_id'] : 0);
$bug = null;
$error = '';

if ($bugId <= 0) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Bug ID missing or invalid.']);
        exit();
    }

    header('Location: ../bug-list.html?error=' . urlencode('Bug ID not found.'));
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT id, bug_id, title, assignee_id FROM bugs WHERE id = :id");
    $stmt->execute([':id' => $bugId]);
    $bug = $stmt->fetch();

    if (!$bug) {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Bug ID not found in database.']);
            exit();
        }

        header('Location: ../bug-list.html?error=' . urlencode('Bug ID not found in database.'));
        exit();
    }
} catch (PDOException $e) {
    $error = 'Database Error: ' . $e->getMessage();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $error === '') {
    header('Content-Type: application/json');
    $developerId = isset($_POST['developer_id']) ? (int) $_POST['developer_id'] : 0;

    if ($developerId <= 0) {
        echo json_encode(['success' => false, 'message' => 'Please select a developer.']);
        exit();
    }

    try {
        $verifyDeveloper = $pdo->prepare("SELECT id FROM users WHERE id = :id AND role = 'Developer'");
        $verifyDeveloper->execute([':id' => $developerId]);

        if (!$verifyDeveloper->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Selected user is not a valid developer.']);
            exit();
        }

        $stmt = $pdo->prepare("
            UPDATE bugs
            SET assignee_id = :developer_id,
                status = CASE WHEN status = 'Open' THEN 'In Progress' ELSE status END
            WHERE id = :bug_id
        ");
        $stmt->execute([
            ':developer_id' => $developerId,
            ':bug_id' => $bugId,
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Bug assigned successfully.'
        ]);
        exit();
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error assigning bug: ' . $e->getMessage()]);
        exit();
    }
}

$developers = [];
try {
    $stmt = $pdo->query("SELECT id, name FROM users WHERE role = 'Developer' ORDER BY name ASC");
    $developers = $stmt->fetchAll();
} catch (PDOException $e) {
    $error = 'Unable to load developers.';
}
?>
<!DOCTYPE html>
<html class="dark" lang="en">
<head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Bug Tracker - Assign Bug</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    <link href="../css/style.css" rel="stylesheet" />
    <link rel="icon" href="../images/bug-logo.png" type="image/png" />
</head>
<body id="page-assign-bug" class="dark:bg-background-dark text-slate-100 min-h-screen font-display">
    <div class="flex flex-col min-h-screen border-x border-slate-800 bg-background-dark shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-primary/10 blur-[120px] pointer-events-none"></div>
        <nav class="border-b border-slate-800 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50 w-full">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16 items-center">
                    <div class="flex items-center gap-8">
                        <div class="flex items-center gap-2">
                            <div class="bg-primary-gradient p-1.5 rounded-lg">
                                <span class="material-symbols-outlined text-white text-[24px]" style="font-variation-settings: 'FILL' 1;">bug_report</span>
                            </div>
                            <span class="text-xl font-bold tracking-tight text-white hidden sm:block">Bug Tracker</span>
                        </div>
                        <div class="hidden md:flex items-center gap-8">
                            <a class="text-slate-400 hover:text-white transition-colors py-5" href="../dashboard.html">Dashboard</a>
                            <a class="text-slate-400 hover:text-white transition-colors py-5" href="../bug-list.html">Bugs</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        <main class="flex-1 p-6 space-y-8 relative z-10 max-w-lg w-full mx-auto mt-12">
            <div class="space-y-1 text-center">
                <h2 class="text-3xl font-bold text-white tracking-tight">Assign Bug <span id="display-bug-id" class="text-primary"><?php echo $bug ? htmlspecialchars($bug['bug_id']) : '(ID Missing)'; ?></span></h2>
                <p class="text-slate-400 text-sm">Select a developer to assign to this bug.</p>
                <?php if ($bug): ?>
                    <p class="text-slate-300 text-xs mt-2 font-medium">Bug Title: <span class="text-white"><?php echo htmlspecialchars($bug['title']); ?></span></p>
                <?php endif; ?>
            </div>

            <div id="message-container" class="<?php echo $error ? '' : 'hidden'; ?> p-4 rounded-xl text-sm font-medium text-center border bg-red-500/10 border-red-500/20 text-red-400">
                <?php echo htmlspecialchars($error); ?>
            </div>

            <form id="assign-bug-form" class="space-y-6">
                <input type="hidden" name="bug_id" value="<?php echo $bugId; ?>">
                <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Assign To Developer</label>
                    <div class="glossy-card rounded-xl p-[1px]">
                        <select id="developer-id" name="developer_id" class="w-full h-14 px-4 rounded-xl border-none bg-white text-black focus:ring-2 focus:ring-primary transition-all appearance-none" required <?php if ($error) echo 'disabled'; ?>>
                            <option value="" class="text-black bg-white">-- Choose Developer --</option>
                            <?php foreach ($developers as $developer): ?>
                                <option value="<?php echo $developer['id']; ?>" <?php echo $bug && (int) $bug['assignee_id'] === (int) $developer['id'] ? 'selected' : ''; ?> class="text-black bg-white"><?php echo htmlspecialchars($developer['name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <button class="w-full h-14 mt-4 rounded-xl font-bold text-white primary-gradient shadow-[0_10px_20px_-5px_rgba(236,72,153,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-white/10 <?php if ($error) echo 'opacity-50 cursor-not-allowed'; ?>" type="submit" id="submit-btn" <?php if ($error) echo 'disabled'; ?>>
                    <span class="material-symbols-outlined">person_add</span>
                    Assign Bug
                </button>
            </form>

            <div class="text-center mt-4">
                <a href="../bug-list.html" class="text-sm font-medium text-slate-400 hover:text-white transition-colors">Back to Bug List</a>
            </div>
        </main>
    </div>

    <script>
        document.getElementById('assign-bug-form')?.addEventListener('submit', function (e) {
            e.preventDefault();
            const form = e.target;
            const btn = document.getElementById('submit-btn');
            const msg = document.getElementById('message-container');
            const formData = new FormData(form);

            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Assigning...';

            fetch('assign_bug.php', {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    msg.textContent = data.message;
                    msg.classList.remove('hidden', 'bg-red-500/10', 'border-red-500/20', 'text-red-400', 'bg-green-500/10', 'border-green-500/20', 'text-green-400');
                    if (data.success) {
                        msg.classList.add('bg-green-500/10', 'border-green-500/20', 'text-green-400');
                    } else {
                        msg.classList.add('bg-red-500/10', 'border-red-500/20', 'text-red-400');
                    }
                })
                .catch(() => {
                    msg.textContent = 'An unexpected error occurred while assigning the bug.';
                    msg.classList.remove('hidden');
                    msg.classList.add('bg-red-500/10', 'border-red-500/20', 'text-red-400');
                })
                .finally(() => {
                    btn.disabled = false;
                    btn.innerHTML = '<span class="material-symbols-outlined">person_add</span> Assign Bug';
                });
        });
    </script>
</body>
</html>
