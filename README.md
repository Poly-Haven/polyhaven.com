# Poly Haven Website Source

This repo contains source code for the [polyhaven.com](https://polyhaven.com) site.

Poly Haven is a public project, we'd be happy to review any code contributions :)

If you want to help but are unsure what to do, [here's a list of things that need doing](https://github.com/Poly-Haven/polyhaven.com/projects/1).


## Building

The site is a hybrid SPA built with [Next.js](https://nextjs.org/).

To build the application yourself, you'll need to:

1. Install [Node](https://nodejs.org/en/)
2. Clone this repo
3. Run `npm install`
4. Then `npm run dev` will start a local server at http://localhost:3002/ - or use `next dev -p 3002` to specify a different port.


## API

This application works in tandem with [our API](https://github.com/Poly-Haven/Public-API).

By default it uses the public https://lbtest.polyhaven.com base URL, but if you need to override this you can set an environment variable `NEXT_PUBLIC_API_URL="http://localhost:3000"`.

However, unless you set up your own Firestore database that mimicks ours, you likely don't want to run a local API and should just use the default live one instead.


## Get Help

Need help building the site? The best way to get in touch is on Discord: https://discord.gg/Dms7Mrs

Otherwise you're welcome to create an issue, [email us](https://polyhaven.com/about-contact), whatever :)

----

![Powered by vercel](https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg)

[Vercel](https://vercel.com/?utm_source=polyhaven&utm_campaign=oss) sponsors the hosting of polyhaven.com's front-end.
