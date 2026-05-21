const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const basePath = 'e:/downloads/MIWAY-website-main';
const files = [
    ...walk(path.join(basePath, 'src/app/admin')),
    ...walk(path.join(basePath, 'src/components/admin'))
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace text-gray-800 with text-white if bg-primary is also in the same className attribute
    content = content.replace(/className="([^"]*)"/g, (match, classes) => {
        if (classes.includes('bg-primary') && classes.includes('text-gray-800')) {
            return 'className="' + classes.replace('text-gray-800', 'text-white') + '"';
        }
        return match;
    });
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('done');
