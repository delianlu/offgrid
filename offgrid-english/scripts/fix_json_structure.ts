import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const modulesDir = join(process.cwd(), 'public/modules');
const files = readdirSync(modulesDir)
    .filter(f => f.endsWith('.json'))
    .map(f => join('public/modules', f));

for (const file of files) {
    const path = join(process.cwd(), file);
    try {
        const raw = readFileSync(path, 'utf8');
        const json = JSON.parse(raw);

        if (json.items && !Array.isArray(json.items) && Array.isArray(json.items.items)) {
            console.log(`Fixing ${file}...`);
            // Keep outer metadata, replace items object with inner items array
            json.items = json.items.items;
            writeFileSync(path, JSON.stringify(json, null, 2));
            console.log(`✅ Fixed ${file} `);
        } else {
            console.log(`ℹ️ ${file} does not need fixing or has unexpected structure.`);
        }
    } catch (e) {
        console.error(`❌ Error processing ${file}: `, e);
    }
}
