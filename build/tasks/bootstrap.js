var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var shell = require('shelljs');
var projectRoot = process.cwd();
var buildRoot = path.resolve(__dirname, '..');
var defaultPkg = require('../defaultPackage.json');
var pkgPath = path.join(projectRoot, 'package.json');
var pkg = require(pkgPath);

shell.cp('-Rf', path.resolve(buildRoot, 'dotfiles') + path.sep + '.*', projectRoot);
shell.cp('-f', path.resolve(buildRoot, 'LICENSE'), projectRoot);

var readme = _.template(fs.readFileSync(path.resolve(buildRoot, 'README.md'), 'utf-8'))({
  project_name: pkg.name
});

fs.writeFileSync(path.resolve(projectRoot, 'README.md'), readme);

_.each(['dependencies', 'devDependencies', 'peerDependencies'], function (section) {
  pkg[section] = _.extend(pkg[section], defaultPkg[section]);
});

_.each(defaultPkg, function (value, key) {
  if (!pkg[key]) {
    pkg[key] = value;
  }
});

pkg.repository.url = 'git@github.com:martyjs/' + pkg.name + '.git';
pkg.bugs.url = 'https://github.com/martyjs/' + pkg.name + '/issues';
pkg.licenses[0].url = 'https://raw.github.com/martyjs/' + pkg.name + '/master/LICENSE';


fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

var testDir = path.resolve(projectRoot, 'test');
var setup = path.resolve(testDir, 'setup.js');
var buildMarty = path.resolve(testDir, 'buildMarty.js');

if (!fs.existsSync(testDir)) {
  shell.mkdir(path.resolve(projectRoot, 'test'));
}

if (!fs.existsSync(setup)) {
  shell.cp(path.resolve(buildRoot, 'test', 'setup.js'), setup);
}

if (!fs.existsSync(buildMarty)) {
  shell.cp(path.resolve(buildRoot, 'test', 'buildMarty.js'), buildMarty);
}