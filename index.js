#!/usr/bin/env node

const clear = require("clear");
const jimp = require("jimp");
const fs = require("fs");
const chalk = require("chalk");
const figlet = require("figlet");
const inquirer = require("inquirer");
const clui = require("clui");

const run = async () => {
  const spinner = new clui.Spinner("Processing...", ['|','/','-','\\','-']);
  const input = await inquirer.prompt([{
      name: "dir",
      type: "input",
      message: "Resized Directory",
      default: "Resized",
      validate: (value) => {
        if (value === "") return false
        return true
      },
      filter: input => input.replace(/\s/g, "")
    },
    {
      name: "size",
      type: "input",
      message: "The maximum size and image can be. [width or height]",
      validate: (value) => {
        if (value === "" || Number.isNaN(value)) return "Please enter a Number.";
        return true;
      },
      filter: input => Math.round(input)
    },
    {
      name: "mode",
      type: "list",
      message: "Resize Mode:",
      choices: [
        jimp.RESIZE_NEAREST_NEIGHBOR,
        jimp.RESIZE_BILINEAR,
        jimp.RESIZE_BICUBIC,
        jimp.RESIZE_HERMITE,
        jimp.RESIZE_BEZIER
      ],
      default: jimp.RESIZE_BILINEAR
    }
  ]);
  try {
    if (!fs.existsSync("Original")) fs.mkdirSync("Original");
    if (!fs.existsSync(input.dir)) fs.mkdirSync(input.dir);
    const origins = fs.readdirSync(process.cwd()).filter(el => /\.(jpe?g|png|gif|bmp|tiff)$/i.test(el));
    origins.forEach((filename, index) => {

      spinner.start();

      jimp.read(filename, (err, img) => {
        if (err) throw err;

        let width = img.getWidth();
        let height = img.getHeight();

        let ratio = width > height ? input.size / width : input.size / height;

        img.scale(ratio, input.mode).write(`${input.dir}/${filename.replace(/\.(jpe?g|png|gif|bmp|tiff)$/i, "")}_${width * ratio}x${height * ratio}.${img.getExtension()}`, (err, val, coords) => {
          if(err) throw err;
          spinner.message(`Processing ${filename} ${coords.x}-${coords.y}...`);
        });
        //fs.renameSync(filename, "Original/" + filename);
      });
    });
  } catch (err) {
    console.log(chalk.bgRedBright(err));
  }
};

clear();
console.log(
  chalk.hex("#30D5C8")(
    figlet.textSync("BIscale", {
      horizontalLayout: "full",
      font: "AMC 3 Line"
    })));
run();