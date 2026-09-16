import React from "react";
import {createRoot} from "react-dom/client";
import BookShelfLibrary from "./book-shelf.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BookShelfLibrary />
  </React.StrictMode>,
);
