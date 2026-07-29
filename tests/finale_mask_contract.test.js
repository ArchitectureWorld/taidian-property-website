const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '..', 'finale-correction.js'), 'utf8');
function expect(condition, message) { if (!condition) throw new Error(message); }
expect(source.includes("globalCompositeOperation = 'destination-out'"), 'text must be a transparent cutout');
expect(source.includes('findLargestInteriorAnchor'), 'start view must anchor inside a thick glyph stroke');
expect(source.includes('startScale'), 'word must begin far beyond the viewport');
expect(!source.includes('updateFinalImage'), 'finale must not reposition or replace the existing fifth-chapter image');
expect(!source.includes('finalImage.style'), 'finale must leave the current background image untouched');
expect(!source.includes('finale-word--solid'), 'finale must not render a solid company-name layer');
console.log('finale mask contract ok');
