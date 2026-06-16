const fs = require('fs');
const file = 'c:/Users/Admin/Documents/Custom Office Templates/OneDrive/Desktop/bug-tracker-main/bug-tracker/bug-tracker/bug-report.html';
let content = fs.readFileSync(file, 'utf8');

const anchor1 = `                <!-- AI Proposed Fix Panel -->`;
const anchor2 = `            <!-- Activity & Comments -->`;

const idx1 = content.indexOf(anchor1);
const idx2 = content.indexOf(anchor2);

if (idx1 > -1 && idx2 > -1) {
    let newMiddle = `                <!-- AI Proposed Fix Panel -->
                <div id="ai-fix-panel" class="hidden mt-4 glossy-card p-4 rounded-xl border border-primary/50 bg-[#0f172a] relative">
                    <div class="absolute -top-3 left-4 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-primary/30 flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px]">auto_awesome</span> AI Proposal
                    </div>
                    <div class="mt-2 mb-4 overflow-x-auto">
                        <pre><code id="ai-fixed-code" class="text-sm font-mono text-green-400"></code></pre>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <button id="accept-fix-btn" class="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-lg shadow-green-500/20">
                                <span class="material-symbols-outlined text-[14px]">check</span> Accept Fix
                            </button>
                            <button id="reject-fix-btn" class="bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-red-500/30 flex items-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">close</span> Reject
                            </button>
                        </div>
                        <div class="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                            <span class="material-symbols-outlined text-[14px]">bug_report</span>
                            <span><span id="ai-error-count">0</span> Errors Found</span>
                        </div>
                    </div>
                </div>
            </section>
            <!-- Screenshot Preview Area -->
            <section class="space-y-4">
                <h3 class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Attachments</h3>
                <div id="bug-detail-screenshot"
                    class="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-surface-dark">
                    <div class="flex flex-col items-center justify-center h-full text-slate-500">
                        <span class="material-symbols-outlined text-4xl mb-2">image</span>
                        <span class="text-sm">Loading...</span>
                    </div>
                </div>
            </section>
`;

    content = content.substring(0, idx1) + newMiddle + content.substring(idx2);
    fs.writeFileSync(file, content);
    console.log('Fixed html');
}
