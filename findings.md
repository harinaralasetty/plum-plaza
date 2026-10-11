# Findings

The exact dependency constraint excludes a routing library. Implement a small local HashRouter using the browser hashchange event.
Existing plan preserved with original-product names and source URLs redacted to satisfy publication constraint. Original bytes backed up outside repository at /tmp/plum-plaza-original-plan.md.
Technical references: https://vite.dev/guide/ and https://zustand.docs.pmnd.rs/reference/apis/create

Safari27.0 matches reported WebDriver regression: https://github.com/SeleniumHQ/selenium/issues/18109 . Remote automation enabled but creation times out; user also enabled AppleEvents scripts, version query succeeds but document commands time out. Native CUA tab navigation works. Owner enabled both permissions and restarted Safari. Apple Events now works; Safari-only runner uses a dedicated owned window. Native select popups must close before issuing document Apple Events.

2026-10-11 release: owner authorised a public GitHub repository and free Pages publication. Active gh account is harinaralasetty; plum-plaza is available. Static relative assets and hash routes already support a project subpath. GitHub Pages uses workflow build_type via REST; official workflow docs: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages . Official API: https://docs.github.com/en/rest/pages/pages . Actions pins were resolved from official release tags with gh api. Ubuntu runs portable checks; native Safari E2E remains local. AGENTS.md is the requested durable project memory, not a global memory update.

Pages run38131850652 succeeded. Live application HTML/JS/CSS match the local build byte-for-byte and all three Safari game routes work. AdGuard modifies this live page in Safari (two injected local-domain scripts and rewritten DOM CSP) while the HTTP-served bytes are unchanged. Do not attribute those scripts to the app or claim an extension-free live policy test. Native AppleScript strings must preserve Unicode (Python JSON ensure_ascii=False) for tick feedback. Successful live smoke saved a town screenshot and closed its owned window.

Object UI: Shop is the only former dropdown screen. Cakes already used text buttons, now drawn as original ingredient objects. Stable test hooks are data-slot/data-color for Shop and data-station/data-ingredient for Cakes; numbered station headings should not be used as selectors. Native fieldset disabling makes Shop parts match :disabled after a result.
