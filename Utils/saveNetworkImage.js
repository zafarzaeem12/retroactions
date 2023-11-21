const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { uid } = require("uid/secure");
const { writeFile } = require("fs");

const saveNetworkImage = async (url) => {
  const networkImage = await fetch(url).catch(function (err) {

  });

  if (networkImage.status === 200) {
    const extension = networkImage.headers.get("content-type").split("/").pop();
    const profilePic = await networkImage
      .arrayBuffer()
      .then((buffer) => Buffer.from(buffer));

    const name = await uid(16);

    const image = `${name}.${extension}`.replace("./", "/");

    await writeFile("public/uploads/imges/" + image, profilePic, (err) => {
      if (err) console.log(err);
    });
    return {
      hasError: false,
      image: "public/uploads/images/" + image,
    };
  } else {
    console.log("failed network image ", networkImage);
    return {
      hasError: true,
      message: "Error while fetching image",
    };
  }
};
module.exports = { saveNetworkImage };
