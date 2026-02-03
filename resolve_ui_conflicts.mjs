import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const conflictedFiles = execSync('git status --porcelain | grep "^UU" | cut -c 4-', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);

console.log(`Found ${conflictedFiles.length} conflicted files.`);

for (const relPath of conflictedFiles) {
    const fullPath = path.resolve('/Data/CascadeProjects/openclaw', relPath);
    if (!fs.existsSync(fullPath)) continue;
    if (relPath.endsWith('.md')) continue;

    let content = fs.readFileSync(fullPath, 'utf8');

    // Match any conflict block
    const conflictRegex = /<<<<<<< HEAD([\s\S]*?)=======([\s\S]*?)>>>>>>> [0-9a-f]+/g;

    content = content.replace(conflictRegex, (match, head, theirs) => {
        const headLines = head.trim().split('\n');
        const theirsLines = theirs.trim().split('\n');

        const result = [...headLines];
        for (const line of theirsLines) {
            const normalizedLine = line.replace(/\.(ts|js)"/g, '"');
            const exists = headLines.some(h => h.replace(/\.(ts|js)"/g, '"') === normalizedLine);
            if (!exists) {
                result.push(line);
            }
        }
        return result.join('\n');
    });

    fs.writeFileSync(fullPath, content);
    console.log(`Resolved ${relPath}`);
}
