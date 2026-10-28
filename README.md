# Red Cycle Comics Co.

A responsive comic-art portfolio with a black and red animated background, an introductory loader, gallery categories, character profiles, commissions, an About page, and a protected studio admin.

## Managing your portfolio

Open `/admin` on the published website and enter the studio password.

- Choose **Add artwork**, upload an image or video, enter a title, and choose its section.
- Character design entries use the main upload for the front portrait and an optional second upload for the full design. Add the character name, manga/comic, and origin story.
- Backgrounds include a manga/comic/source field.
- Animation uploads accept MP4, WebM, and animated GIF files. Each file can be up to 25 MB.
- **Edit** updates existing work. **Delete** removes it from the published galleries after confirmation.
- **About & contact** edits the bio, commission email, and full social profile links.
- Artwork and settings are stored online, independently of the browser. Files are held in object storage.

Commission links open an email enquiry addressed to the studio. No prices or payment collection have been invented.

## Source

The site renders HTML and CSS with JavaScript interactions using React/Vinext. The main portfolio is in `app/portfolio.tsx`; its CSS is in `app/globals.css`. Studio editing is in `app/admin/studio.tsx`. API routes save work and settings to Cloudflare D1 and uploads to R2.

Install locked dependencies with `npm run install:ci`; use `npm run dev` for development and `npm run build` for a production build. The `.openai/hosting.json` file retains the registered Sites project and storage bindings. Set `ADMIN_PASSWORD` and a long random `ADMIN_SESSION_SECRET` as secret environment variables on the host. Changing the public commission email does not grant administration rights.

Production schemas are defined in `db/schema.ts` and applied through the generated Drizzle migrations. Local previews need those migrations applied to the local D1 database. For local admin access, copy `.env.example` to `.dev.vars` and replace both example values with your own password and random secret. Keep `.dev.vars` private.

The supplied artwork stays unmodified. The original logo screenshot is shown through a CSS crop on the About page.

