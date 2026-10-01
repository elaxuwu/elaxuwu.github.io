# aboutMe
My e-portfolio written in HTML + CSS + JS

View the webpage here: https://elaxuwu.me/

The portfolio uses GSAP for page and gallery animation, and Three.js for the homepage background. Both are project dependencies. Build their static browser bundles with:

```sh
npm ci
npm run build
npm run check
```

Edit `hero-scene.js` or `motion.js`, then run `npm run build` to regenerate `assets/hero-scene.js` and `assets/motion.js`. The HTML, CSS and shared JavaScript can be edited directly. Serve the project over HTTP to preview it, for example with `python -m http.server 4173`.

Full animation is enabled by default as requested. The display menu offers On, System and Off options. English is the first-visit default, with Vietnamese translation and both light and dark themes.

Brand assets in `assets/brand` are the supplied Elax and Elaxion Games artwork. Project visuals include real app screenshots, a captured Unity tutorial screenshot and the existing project icons. Light = Die and Ball Eat Balls currently use studio artwork pending real game images. The academic report remains available only through its existing URL and has no public navigation link.
