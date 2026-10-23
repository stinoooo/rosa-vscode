# Publishing

The extension is on the Visual Studio Marketplace, which VS Code searches,
under the publisher `rosa-realism` (Rosa Wildlife Reserve). It can also go to
Open VSX, which Cursor, VSCodium and Gitpod search. Both stores use the
publisher name in `package.json`.

## Every release on the Marketplace

1. Raise `version` in `package.json` and add a section to `CHANGELOG.md`.
2. Build the package:

   ```bash
   npm install
   npm run build
   npm run package
   ```

   That writes `rosa-theme-<version>.vsix` in this folder.
3. Commit and push, so the pictures in the listing match the release.
4. Open https://marketplace.visualstudio.com/manage/publishers/rosa-realism,
   click the **...** next to the extension, choose **Update**, and upload the
   new `.vsix`.

The Marketplace checks the file first. A new version usually shows up within
a few minutes, and VS Code updates everyone who has it installed.

### Publishing from the command line instead

`npm run publish:marketplace` publishes without the website, but it needs an
Azure DevOps personal access token with the **Marketplace > Manage** scope,
stored once with `npx vsce login rosa-realism`. Azure DevOps refuses some
personal Microsoft accounts, so the upload above is the route that works for
this publisher today.

The token stays on your computer. Never commit it or paste it in a chat.

## Open VSX, once

1. Sign in at https://open-vsx.org with your GitHub account.
2. In your profile settings, connect an Eclipse account and sign the
   publisher agreement. Open VSX won't publish without it.
3. Under **Access Tokens**, create a token and copy it.
4. Claim the publisher name, then publish:

   ```bash
   npx ovsx create-namespace rosa-realism -p <your token>
   npx ovsx publish rosa-theme-<version>.vsix -p <your token>
   ```

## Where your friends find it

- In VS Code: search **Rosa Wildlife Reserve** in the Extensions view.
- On the web: https://marketplace.visualstudio.com/items?itemName=rosa-realism.rosa-theme
- In Cursor or VSCodium, once it's on Open VSX: https://open-vsx.org/extension/rosa-realism/rosa-theme
