'use strict';

const build = require('@microsoft/sp-build-web');
const fs = require('fs');
const glob = require('glob');

build.addSuppression(
  `Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`
);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

var version = build.subTask('version', function (gulp, build, done) {
  this.log('Starting version...');
  this.log(
    `Possible arguments for this function --major --minor --patch --build`
  );
  const incMajor = process.argv.indexOf('--major') > -1;
  const incMinor = process.argv.indexOf('--minor') > -1;
  const incPatch = process.argv.indexOf('--patch') > -1;
  const incBuild = process.argv.indexOf('--build') > -1;
  const versionRegex = /\"version\":.*,/gm;
  let versionContent = '';

  if (incMajor + incMinor + incPatch + incBuild > 1) {
    this.logError('Only possible to increase 1 version, exiting...');
    done();
  } else
    fs.readFile('./config/package-solution.json', 'utf8', (err, data) => {
      const packageSolution = JSON.parse(data);
      const currVersion = packageSolution.solution.version;
      const versionSplit = currVersion.split('.');

      let majorVersion = parseInt(versionSplit[0]);
      let minorVersion =
        versionSplit.length >= 2 ? parseInt(versionSplit[1]) : 0;
      let patchVersion =
        versionSplit.length >= 3 ? parseInt(versionSplit[2]) : 0;
      let buildVersion =
        versionSplit.length === 4 ? parseInt(versionSplit[3]) : 0;

      if (incMajor) {
        majorVersion += 1;
        // minorVersion=1,patchVersion=1,buildVersion = 1
        minorVersion = patchVersion = buildVersion = 0;
      }
      if (incMinor) {
        minorVersion += 1;
        patchVersion = buildVersion = 0;
      }
      if (incPatch) {
        patchVersion += 1;
        buildVersion = 0;
      }
      if (incBuild) buildVersion += 1;

      this.log(`Current version: \x1b[32m${currVersion}`);
      const newVersion = `${majorVersion}.${minorVersion}.${patchVersion}.${buildVersion}`;
      versionContent = `"version": "${newVersion}",`
      if (incMajor | incMinor | incPatch | incBuild) {
        this.log(`Version increasing to \x1b[32m${newVersion}`);
        
        const newPackageSolution = data.replace(versionRegex,versionContent);
        fs.writeFile('./config/package-solution.json', newPackageSolution, (err) => {
          if (err) {
            this.logError(
              `Something went wrong updating ${'./config/package-solution.json'}, err provided:`
            );
            this.logError(err);
          }
        });
      }
      glob('src/*/*/*.manifest.json', (err, matches) => {
        matches.forEach((match) => {
          this.log(`Found manifest: \x1b[34m${match}`);
          fs.readFile(match, (err, currManifestFile) => {
            const currManifest = currManifestFile.toString();            
            const currManifestVersion = currManifest.match(versionRegex);
            const newFile = currManifest.replace(
              versionRegex,
              versionContent              
            );

            this.log(`Updating manifest version from: \x1b[32m${currManifestVersion}`);
            fs.writeFile(match, newFile, (err) => {
              if (err) {
                this.logError(
                  `Something went wrong updating ${match}, err provided:`
                );
                this.logError(err);
              }
            });
          });
        });
      });
      fs.writeFileSync('./src/ngageInfo.ts',`const ngageInfo = {\r\n${versionContent.replace('"version"','\tversion')}\r\n}\r\nexport default ngageInfo`)
    });
  done();
});
build.task('version', version);

build.initialize(require('gulp'));
