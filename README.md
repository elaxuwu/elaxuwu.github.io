# aboutMe
My e-portfolio written in HTML + CSS + JS

View the webpage here: https://elaxuwu.me/

Run npm run build after editing scripts, styles or fonts. The build writes minified files into assets/dist, gives each file a hash of its contents, and updates the HTML references. Publish the generated files along with the HTML. Run npm run check to check local links, project pagination and motion cleanup.

The _headers file enables one-year immutable caching for assets/dist on Cloudflare Pages. If this domain uses GitHub Pages behind Cloudflare, _headers is not applied: configure a Cloudflare Cache Rule matching URI paths starting with /assets/dist/, with Browser TTL of one year. Keep HTML on revalidation. Old generated hashes remain available so visitors with an older HTML document still load its resources correctly. Cache changes must be verified on the deployed site; they do not take effect online from a local edit.
