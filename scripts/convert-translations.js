#!/usr/bin/env node

/**
 * Build-time script to convert XLIFF translation files to JSON format
 * This runs in Node.js environment during build, not in the browser
 */

const fs = require('fs');
const path = require('path');
const { xliff12ToJs } = require('xliff');

const I18N_DIR = path.join(__dirname, '../public/i18n');
const OUTPUT_DIR = I18N_DIR;

async function convertXliffToJson(filePath) {
  const xliffContent = fs.readFileSync(filePath, 'utf-8');

  const parserResult = await xliff12ToJs(xliffContent, {
    captureSpacesBetweenElements: true,
  });

  const xliffTranslations = parserResult.resources['ng2.template'];

  const json = Object.keys(xliffTranslations).reduce((result, current) => {
    const entry = xliffTranslations[current];
    // Use target if available, otherwise use source (for base language files)
    const translation = entry.target || entry.source;

    if (typeof translation === 'string') {
      result[current] = translation;
    } else if (Array.isArray(translation)) {
      result[current] = translation
        .map(entry => (typeof entry === 'string' ? entry : `{{${entry.Standalone.id}}}`))
        .map(entry => entry.replace('{{', '{$').replace('}}', '}'))
        .join('');
    } else if (translation === undefined) {
      // Skip entries without source or target (shouldn't happen, but just in case)
      console.warn(`  Warning: Skipping entry "${current}" - no source or target found`);
    } else {
      throw new Error('Could not parse XLIFF: ' + JSON.stringify(translation));
    }
    return result;
  }, {});

  return json;
}

async function convertAllFiles() {
  if (!fs.existsSync(I18N_DIR)) {
    console.log('No i18n directory found, skipping translation conversion');
    return;
  }

  const files = fs.readdirSync(I18N_DIR);
  const xliffFiles = files.filter(file => file.endsWith('.xlf'));

  if (xliffFiles.length === 0) {
    console.log('No XLIFF files found in public/i18n');
    return;
  }

  console.log(`Converting ${xliffFiles.length} XLIFF file(s) to JSON...`);

  for (const file of xliffFiles) {
    const inputPath = path.join(I18N_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file.replace('.xlf', '.json'));

    try {
      const json = await convertXliffToJson(inputPath);
      fs.writeFileSync(outputPath, JSON.stringify(json, null, 2), 'utf-8');
      console.log(`✓ Converted ${file} -> ${path.basename(outputPath)}`);
    } catch (error) {
      console.error(`✗ Failed to convert ${file}:`, error.message);
      process.exit(1);
    }
  }

  console.log('Translation conversion complete!');
}

convertAllFiles().catch(error => {
  console.error('Error during translation conversion:', error);
  process.exit(1);
});

