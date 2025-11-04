/**
 * Transform rich content JSON files to app schema format
 * Usage: node scripts/transform-content.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping of category numbers to module IDs and categories
const MODULE_MAP = {
  1: { id: 'tense-form', category: 'tense', name: 'Tense and Form' },
  2: { id: 'subject-verb-agreement', category: 'agreement', name: 'Subject-Verb Agreement' },
  3: { id: 'prepositions', category: 'prepositions', name: 'Prepositions' },
  4: { id: 'word-order', category: 'wordorder', name: 'Word Order' },
  5: { id: 'plurality', category: 'plurality', name: 'Plurality' },
  6: { id: 'articles', category: 'articles', name: 'Articles' },
  7: { id: 'auxiliaries', category: 'auxiliaries', name: 'Auxiliaries' }
};

const DOWNLOAD_DIR = '/Users/erdem/Downloads';
const OUTPUT_DIR = path.join(__dirname, '../public/modules');

// Source files
const SOURCE_FILES = [
  'Category_1_TENSE-FORM_REVISED.json',
  'Category_2_SUBJECT-VERB-AGREEMENT_REVISED.json',
  'Category_3_PREPOSITIONS_REVISED.json',
  'Category_4_WORD-ORDER_REVISED.json',
  'Category_5_PLURALITY_REVISED.json',
  'Category_6_ARTICLES_REVISED.json',
  'Category_7_AUXILIARIES_REVISED.json'
];

/**
 * Transform a single question to app item format
 */
function transformQuestion(question, moduleId, formType) {
  const itemId = `${moduleId}-${question.question_number}-${formType}`;

  return {
    id: itemId,
    moduleId: moduleId,
    questionText: question.question_text,
    type: question.type || 'multiple_choice',
    options: question.options,
    correctAnswer: question.correct_answer,
    feedback: question.feedback,
    formType: formType,
    transferType: (question.transfer_type || 'NEAR').toLowerCase(),
    item_version: '1.0.0',
    ...(question.correction && { correction: question.correction }),
    ...(question.sub_topic && { subTopic: question.sub_topic })
  };
}

/**
 * Transform rich content JSON to app schema
 */
function transformModule(sourceData, categoryNumber) {
  const moduleInfo = MODULE_MAP[categoryNumber];

  if (!moduleInfo) {
    throw new Error(`Unknown category number: ${categoryNumber}`);
  }

  // Combine Form A and Form B questions
  const items = [];

  // Transform Form A questions
  if (sourceData.form_a_questions) {
    sourceData.form_a_questions.forEach(question => {
      items.push(transformQuestion(question, moduleInfo.id, 'A'));
    });
  }

  // Transform Form B questions
  if (sourceData.form_b_questions) {
    sourceData.form_b_questions.forEach(question => {
      items.push(transformQuestion(question, moduleInfo.id, 'B'));
    });
  }

  // Transform common errors
  const commonErrors = (sourceData.common_errors || []).map(error => ({
    number: error.number,
    subTopic: error.sub_topic,
    wrong: error.wrong,
    correct: error.correct,
    frenchConnection: error.french_connection
  }));

  // Create app schema module
  return {
    id: moduleInfo.id,
    name: moduleInfo.name,
    category: moduleInfo.category,
    moduleIntroduction: sourceData.module_introduction?.text || '',
    contrastiveExplanation: sourceData.contrastive_explanation?.text || '',
    commonErrors: commonErrors,
    schema_version: '1',
    module_version: '1.0.0',
    items: items
  };
}

/**
 * Main transformation function
 */
function transformAll() {
  console.log('Starting content transformation...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let totalItems = 0;
  let successCount = 0;

  SOURCE_FILES.forEach((filename, index) => {
    const categoryNumber = index + 1;
    const sourceFile = path.join(DOWNLOAD_DIR, filename);
    const moduleInfo = MODULE_MAP[categoryNumber];
    const outputFile = path.join(OUTPUT_DIR, `${moduleInfo.id}.json`);

    try {
      console.log(`Processing: ${filename}`);

      // Read source file
      const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

      // Transform
      const transformed = transformModule(sourceData, categoryNumber);

      // Write output
      fs.writeFileSync(outputFile, JSON.stringify(transformed, null, 2), 'utf8');

      console.log(`  ✓ Created: ${moduleInfo.id}.json`);
      console.log(`  ✓ Items: ${transformed.items.length}`);
      console.log(`  ✓ Form A: ${transformed.items.filter(i => i.formType === 'A').length}`);
      console.log(`  ✓ Form B: ${transformed.items.filter(i => i.formType === 'B').length}\n`);

      totalItems += transformed.items.length;
      successCount++;

    } catch (error) {
      console.error(`  ✗ Error processing ${filename}:`, error.message);
    }
  });

  console.log('='.repeat(50));
  console.log(`Transformation complete!`);
  console.log(`Modules processed: ${successCount}/${SOURCE_FILES.length}`);
  console.log(`Total items: ${totalItems}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('='.repeat(50));
}

// Run transformation
transformAll();
