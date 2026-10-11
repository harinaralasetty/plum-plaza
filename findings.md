# Findings

The exact dependency constraint excludes a routing library. Implement a small local HashRouter using the browser hashchange event.
Existing plan preserved with original-product names and source URLs redacted to satisfy publication constraint. Original bytes backed up outside repository at /tmp/plum-plaza-original-plan.md.
Technical references: https://vite.dev/guide/ and https://zustand.docs.pmnd.rs/reference/apis/create

Safari27.0 matches reported WebDriver regression: https://github.com/SeleniumHQ/selenium/issues/18109 . Remote automation enabled but creation times out; user also enabled AppleEvents scripts, version query succeeds but document commands time out. Native CUA tab navigation works. Owner enabled both permissions and restarted Safari. Apple Events now works; Safari-only runner uses a dedicated owned window. Native select popups must close before issuing document Apple Events.
