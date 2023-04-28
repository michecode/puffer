# puffer

terms:

- PAINTING is the P5.js painting that is being drawn. User defined, so it can be 1920x1080
  internally without actually showing that because it it scaled visually on the site
  for formatting
- CANVAS is the rectangle that defines how large the user facing painting on the website is. So a
  1920x1080 painting could theoretically be scaled down to 1280x720 on the site and the canvas would then
  be 1280x720. Unless inside a worker file, then it refers to the internal canvas or the painting itself.
