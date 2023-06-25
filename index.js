const core = require('@actions/core');
const glob = require("glob")
const fs = require("fs")
const readline = require("readline")
const gh = require("@actions/github")

const src = core.getInput('path');
const copyrightPath = core.getInput('copyrightPath');
const excludePath = core.getInput('exclude');

glob(src, async (error, res) => {
  if (error) {
    core.setFailed(err);
  } else {
    const copyright = await getCopyRightString(copyrightPath);
    res.forEach(file => {
      if (!file.startsWith(excludePath)) {
        getFirstFiveLines(file).then((ln) => {
          if (ln != copyright) core.setFailed(`${gh.context.job} failed!: File ${file} does not contain the right copyright information!`);
        });
      }
    });
  }
});


const getCopyRightString = async (pathToFile) => {
  const readable = fs.createReadStream(pathToFile);
  const reader = readline.createInterface({ input: readable });

  let fileData = '';

  for await (const line of reader) {
    fileData += line + '\n';
  }

  readable.close();
  return fileData;
};


const getFirstFiveLines = async (pathToFile) => {
  const readable = fs.createReadStream(pathToFile);
  const reader = readline.createInterface({ input: readable });

  let res = '';
  let lineCount = 0;

  for await (const line of reader) {
    res += line + '\n';
    lineCount++;

    if (lineCount === 5) {
      reader.close();
      break;
    }
  }

  readable.close();
  return res;
};
