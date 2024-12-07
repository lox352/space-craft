// stitchWorker.js
import { Color } from "three";
import { colourNode } from "../helpers/node-colouring";

onmessage = (e) => {
  const { translation, maxY, rigidBodyRef } = e.data;

  // Simulate a heavy computation for determining stitch color
  const colorName = colourNode(translation, maxY);

  let color;
  switch (colorName) {
    case "blue":
      color = new Color(0x0000ff);
      break;
    case "green":
      color = new Color(0x00ff00);
      break;
    case "white":
      color = new Color(0xffffff);
      break;
    case "black":
      color = new Color(0x000000);
      break;
    default:
      color = new Color(0xffffff); // Default to white if no match
  }

  // Send the color back to the main thread
  postMessage({
    r: color.r,
    g: color.g,
    b: color.b,
    ref: rigidBodyRef
  });
};
