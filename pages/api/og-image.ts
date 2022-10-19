import { withOGImage } from 'next-api-og-image';

interface QueryParams {
  type: string;
  categories: string;
}

export default withOGImage<'query', QueryParams>({
  // Dynamic meta images used for certain pages where the content is dynamic
  template: {
    html: async ({ type, categories }) => {
      let url = `https://api.polyhaven.com/assets?t=${type}&future=true`
      if (categories) {
        url += `&c=${categories}`
      }
      const data = await fetch(url)
        .then(response => response.ok ? response.json() : {})

      const sortedKeys = Object.keys(data).sort(function (a, b) {
        return (data[b].download_count - data[a].download_count);
      }).slice(0, 12);

      if (sortedKeys.length === 0) {
        return `
          <body style="margin: 0; padding: 0; background-color: rgb(45, 45, 45);">
            <div style="
                display: grid;
                place-items: center;
                width: 100%;
                height: 100%;
              ">
              <h1 style="color: white; font-size: 72px; font-family: 'Open Sans', sans-serif; text-align: center;">No assets found</h1>
            </div>
          </body>
        `
      }

      return `
      <body style="margin: 0; padding: 0; background-color: rgb(45, 45, 45);">
        <div style="
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-evenly;
          flex-wrap: wrap;
          font-size: 0;
          margin: 10px;
          width: calc(100% - 20px);
          height: calc(100% - 20px);
          ">
          ${sortedKeys.map(key => `
          <img
            src="https://cdn.polyhaven.com/asset_img/thumbs/${key}.png?width=371&height=278"
            style="
              margin: 10px;
              width: calc(25% - 20px);
            "
          />
          `)}
        </div>
      </body>
      `
    },
  },
  cacheControl: 'public, max-age=604800, immutable',
  dev: {
    inspectHtml: false,
  },
});
