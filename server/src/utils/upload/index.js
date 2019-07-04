import { Magic } from "mmmagic";
import { createWriteStream } from "fs";

const imageTypes = ["JPG", "PNG"];

export const storeUpload = ({ stream, filename }) => {
  let magic = new Magic();
  new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(filename))
      .on("finish", () => {
        magic.detectFile(filename, function(err, result) {
          if (err) throw err;
          if (imageTypes.includes(result)) {
            resolve();
          } else {
            reject("Bad Type");
          }
        });
      })
      .on("error", reject)
  );
};
