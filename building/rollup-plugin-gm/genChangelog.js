import { readFileSync } from 'fs';

export default () => {
  const changelog = readFileSync('CHANGELOG.md', 'utf8');
  const firstRelease = changelog.split(/^##/m)[1].trim();
  
  const split = firstRelease.split('\n');
  
  let versionHeader = split[0];
  const headerSplit = versionHeader.split(' ');
  
  const version = headerSplit[0];
  const date = headerSplit[1].replace(/[\[\]]/g, '');
  
  let body = split.slice(2).map((x) => x.trim().replace('- ', '')).filter((x) => x.length > 0);
  
  body = body.map((x, i) => {
    if (x.startsWith('###')) {
      let type = 'added';
      
      x = x.replace('### ', '').replace(/\[(.*)\]/, (_, _type) => {
        type = _type;
        
        return '';
      }).trim();
      
      x = `${i !== 0 ? '\n' : ''}${x} {${type}${i === 0 ? ' marginTop' : ''}}\n======================\n`;
    } else {
      x = `* ${x}`;
    }
    
    return x;
  });
  
  const json = {
    version,
    date,
    
    body: body.join('\n')
  };
  
  return JSON.stringify(json).replaceAll('`', '\\`').replaceAll(`\\n`, `\\\\n`);
};
// console.log(JSON.stringify(json).replaceAll(`\\"`, `\\\\\\"`).replaceAll(`"`, `\\\\\\"`).replaceAll(`\\n`, `\\\\\\\\n`).replaceAll('/', '\\/'));