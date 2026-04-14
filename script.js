const fs = require('fs');
const path = require('path');
const dir = 'd:/Antigravity/ÂÌÍ¶ÃÅ»§/v2';
const indexHtml = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const startTag = '<header class=\"site-header\" id=\"site-header\">';
const endTag = '</header>';
const headerStart = indexHtml.indexOf(startTag);
const headerEnd = indexHtml.indexOf(endTag) + endTag.length;
const newHeader = indexHtml.substring(headerStart, headerEnd);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');
for(let file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const contentStart = content.indexOf(startTag);
  const contentEnd = content.indexOf(endTag) + endTag.length;
  if (contentStart !== -1 && contentEnd !== -1) {
    content = content.substring(0, contentStart) + newHeader + content.substring(contentEnd);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated header in ' + file);
  }
}
