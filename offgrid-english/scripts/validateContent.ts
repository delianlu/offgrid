import { readFileSync } from 'node:fs';
import { glob } from 'glob';
import { ModuleSchema, ItemSchema } from '../src/types/schemas';

const files = glob.sync('public/modules/*.json');
let ok = true;

for (const file of files) {
  try {
    const raw = readFileSync(file, 'utf8');
    const json = JSON.parse(raw);
    const { items, ...moduleMeta } = json;
    ModuleSchema.parse(moduleMeta);

    const A = items.filter((i: any) => i.formType === 'A');
    const B = items.filter((i: any) => i.formType === 'B');
    if (A.length !== B.length) {
      ok = false;
      console.error(`❌ ${file}: A(${A.length}) vs B(${B.length}) mismatch`);
    }

    for (const it of items) ItemSchema.parse(it);

    // optional: near/far parity check (warn only)
    const near = items.filter((i: any) => i.transferType === 'near').length;
    const far = items.filter((i: any) => i.transferType === 'far').length;
    if (far > near) console.warn(`⚠️ ${file}: far(${far}) > near(${near})`);

    console.log(`✅ ${file}: valid (${A.length} A, ${B.length} B)`);
  } catch (e: any) {
    ok = false;
    console.error(`❌ ${file}: ${e.message}`);
  }
}

process.exit(ok ? 0 : 1);
