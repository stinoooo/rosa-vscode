# Publishing

The extension goes to two stores: the Visual Studio Marketplace, which VS
Code searches, and Open VSX, which Cursor, VSCodium and Gitpod search. Both
use the publisher name in `package.json`, `rosa-realism`.

You set up each store once. After that, a release is two commands.

## Once: the Visual Studio Marketplace

1. Sign in at https://marketplace.visualstudio.com/manage with a Microsoft
   account.
2. Create a publisher with the ID `rosa-realism` and the display name
   `Rosa Wildlife Reserve`. The ID has to match `publisher` in
   `package.json`.
3. Open https://dev.azure.com, sign in with the same account, and create an
   organization if it asks for one.
4. Open **User settings > Personal access tokens** and create a token:
   - Organization: **All accessible organizations**
   - Scopes: **Custom defined**, then **Marketplace > Manage**
5. Copy the token and run this in this folder. Paste the token when it asks:

   ```bash
   npx vsce login rosa-realism
   ```

The token stays on your computer. Never commit it or paste it in a chat.

## Once: Open VSX

1. Sign in at https://open-vsx.org with your GitHub account.
2. In your profile settings, connect an Eclipse account and sign the
   publisher agreement. Open VSX won't publish without it.
3. Under **Access Tokens**, create a token and copy it.
4. Claim the publisher name with that token:

   ```bash
   npx ovsx create-namespace rosa-realism -p <your token>
   ```

## Every release

1. Raise `version` in `package.json` and add a section to `CHANGELOG.md`.
2. Commit and push, so the pictures in the listing match the release.
3. Publish to both stores:

   ```bash
   npm install
   npm run publish:marketplace
   npx ovsx publish -p <your Open VSX token>
   ```

`vsce publish` builds the themes and icons first, through
`vscode:prepublish`. The Marketplace takes a few minutes to show a new
version, and Open VSX is usually quicker.

## Where your friends find it

- In VS Code: search **Rosa Wildlife Reserve** in the Extensions view.
- On the web: https://marketplace.visualstudio.com/items?itemName=rosa-realism.rosa-theme
- In Cursor or VSCodium: https://open-vsx.org/extension/rosa-realism/rosa-theme
