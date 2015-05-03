let DEFAULT_CLASS_NAME = 'Class';

function getClassName(clazz) {
  let className = clazz.name || (clazz.constructor && clazz.constructor.name);

  if (!className) {
    let funcNameRegex = /function (.{1,})\(/;
    let results = (funcNameRegex).exec(clazz.toString());
    className = (results && results.length > 1) ? results[1] : '';
  }

  return className === DEFAULT_CLASS_NAME ? null : className;
}

module.exports = getClassName;
