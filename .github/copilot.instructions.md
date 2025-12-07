# Copilot Instructions for wabot Repository

This file provides guidance for GitHub Copilot and other AI coding assistants when working in this repository. Follow these rules to ensure code consistency, maintainability, and best practices for both backend and frontend code.

---

## General Guidelines

- Use clear, descriptive variable and function names.
- Prefer async/await for asynchronous operations in Node.js.
- Always validate and sanitize user input, especially in server-side code.
- Write concise, well-documented code. Add comments for complex logic.
- Use ES6+ syntax (const/let, arrow functions, destructuring, etc.).
- Avoid hardcoding secrets; use environment variables and config files.
- Ensure all new code is covered by tests (unit or integration).

---

## Backend (Node.js)

- Main server entry point: `server.js`.
- Use Express.js conventions for routing and middleware (if applicable).
- Store configuration in `config.js` and `.env` files. Never commit secrets.
- Queue logic is in `msgQueue.js`. Use this for message processing.
- Audio conversion logic is in `convertAudioPtt.js`. Keep audio handling modular.
- Use `botFunctions.js` for bot-specific logic. Keep functions atomic and reusable.
- Data files are in `data/`. Do not modify these directly from code unless necessary.
- Use `package.json` for dependency management. Run `npm install` after changes.

---

## Frontend (React, Vite)

- Main app entry: `client/src/main.tsx` and `client/src/App.tsx`.
- Use functional components and React hooks.
- Organize UI components in `client/src/components/`.
- Use TypeScript for all new frontend code. Type all props and state.
- Style using CSS modules or scoped styles in `client/src/index.css`.
- Store static assets in `client/src/assets/` and public files in `client/public/`.
- Use Vite for development and builds. Update `vite.config.ts` for config changes.
- Use `tsconfig.json` for TypeScript configuration. Keep types strict.

---

## Testing

- Place backend tests in `test.js` or a dedicated `tests/` folder.
- Use Jest or Mocha for backend tests. For frontend, use React Testing Library.
- All new features and bug fixes must include relevant tests.

---

## Documentation

- Update `README.md` with any major changes or new features.
- Document all public functions and exported modules.

---

## Commit & PR Guidelines

- Write clear, descriptive commit messages.
- Reference issues or features in PRs.
- Ensure all code passes linting and tests before merging.

---

## Security & Secrets

- Never commit `.env` or secret keys to the repository.
- Use environment variables for sensitive data.

---

## Data Handling

- Do not modify files in `data/` unless explicitly required.
- Validate all data read from or written to disk.

---

## Miscellaneous

- Follow the existing project structure for new files and folders.
- Remove unused code and dependencies regularly.
- Prefer open-source libraries with active maintenance.

---

## Example File Structure

```
botFunctions.js
config.js
convertAudioPtt.js
msgQueue.js
package.json
README.md
server.js
test.js
client/
  src/
    App.tsx
    components/
    assets/
    ...
  public/
  ...
data/
```

---

## Contact

For questions, contact the repository owner or maintainers listed in `package.json`.
