const pdfService = require('./services/pdfService');

const testData = {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  elements: [{
    id: 'test1',
    type: 'text',
    content: 'Test PDF Export',
    x: 100,
    y: 100,
    fontSize: 24,
    fontFamily: 'Arial',
    color: '#000000',
    zIndex: 1
  }]
};

console.log('Testing PDF generation...');

pdfService.generatePDF(testData)
  .then(buffer => {
    console.log('✅ PDF generated successfully!');
    console.log('Buffer size:', buffer.length, 'bytes');
    console.log('Buffer type:', typeof buffer);
    console.log('Is Buffer:', Buffer.isBuffer(buffer));
  })
  .catch(err => {
    console.error('❌ PDF generation failed:', err.message);
    console.error('Stack:', err.stack);
  });
