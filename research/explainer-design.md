# How the guide and ecosystem pages are written and drawn

Distilled from a survey of visual explainers (2026-11-13): Bartosz Ciechanowski, Mike Bostock's "Visualizing Algorithms", Distill's "Research Debt", Jay Alammar's "Illustrated Transformer", Josh Comeau, Oso Academy, OpenFGA concepts, Permit.io, AuthZed's "New Enemies", Jepsen, Martin Kleppmann, Eli Bendersky and Michael Whittaker on linearizability, NIST's RBAC project page, W3C WAI complex images. Sources are listed at the end.

## Rules

1. One figure answers one question. The sentence before the figure asks it; the sentence after answers it and says where to look ("notice that …"). (Bostock, Ciechanowski)
2. One running example everywhere: Anne, Beto and Chen; `doc:readme` in `folder:A`; `group:eng`. The same example appears in the model comparison, the tuple primer, the consistency timelines and every product schema. (OpenFGA concepts, Oso Academy)
3. Colour keeps one meaning on every page and in both themes. Figures use the paper's Figure 2 palette: blue = client, yellow = server, green = storage; subjects and objects are plain outlined boxes; the link colour marks the path being discussed. (Ciechanowski)
4. Never rely on colour alone: also use line style (dashed = derived or indirect), shape (pill = subject) and a label. (W3C WAI)
5. Label things on the figure itself. A legend is a last resort.
6. Open the black box in stages: Check API → namespace config → tuples → userset rewrites → Leopard. (Alammar)
7. Show change over time as small multiples, side by side, before reaching for interaction. (Bostock)
8. Anything step-by-step must also make sense as static frames, and respect reduced motion. (Bostock, MDN)
9. Consistency timelines: actors as lanes, time running down, events as boxes, causality as arrows. The new-enemy problem is drawn as two frames: the order Zanzibar guarantees, and the violation it prevents. (Kleppmann, Whittaker, Bendersky, AuthZed)
10. RBAC, ABAC and ReBAC are compared on the same decision, drawn three ways (a role matrix, a predicate, a graph), with a table whose cells are filled with that same example. (Oso, Permit.io as a counter-example of vague cells)
11. Every figure has a short title and a longer description (`title` and `desc` on the SVG), and a caption in the page language. Where the data matters, a table carries it too. (W3C WAI)
12. At 390 px, a wide figure either stacks or scrolls sideways with a visible cue. Breakpoints are in rem. (Comeau)
13. Every fact about history or a product has a date and a primary source link. Product pages show "facts checked on" and keep a neutral tone; vendor-authored sources are named as such. (NIST, zanzibar.tech's separation of annotations and paper)
14. Product pages use text, not logos, unless the project's own terms clearly allow the logo; the same treatment for every product keeps the directory neutral.
15. No autoplaying loops, scroll-driven animation or physics demos.

## Sources

- <https://ciechanow.ski/gps/>
- <https://bost.ocks.org/mike/algorithms/>
- <https://distill.pub/2017/research-debt/>
- <https://jalammar.github.io/illustrated-transformer/>
- <https://www.joshwcomeau.com/blog/how-i-built-my-blog-v2/>
- <https://www.permit.io/blog/rbac-vs-abac-vs-rebac>
- <https://www.osohq.com/academy/relationship-based-access-control-rebac>
- <https://openfga.dev/docs/concepts>
- <https://authzed.com/blog/new-enemies>
- <https://zanzibar.tech/>
- <https://jepsen.io/consistency>
- <https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html>
- <https://eli.thegreenplace.net/2024/linearizability-in-distributed-systems/>
- <https://mwhittaker.github.io/blog/visualizing_linearizability/>
- <https://csrc.nist.gov/projects/role-based-access-control>
- <https://www.w3.org/WAI/tutorials/images/complex/>
- <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>
