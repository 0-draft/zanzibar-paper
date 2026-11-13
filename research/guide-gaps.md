# What readers ask that the first seven guides did not answer

Survey of 2026-11-13 (HN threads on the paper, Oso Academy, AuthZed blog and docs, OpenFGA modeling guides, Permify, WorkOS, Cedar paper, Styra, Brown CSCI2390, macwright's "Reading Zanzibar"). The first guides explain how the paper works; readers mostly ask how to apply it. Sources are listed per topic.

## New guide topics, ranked

1. Listing and filtering: "return every document Anne can see". Expand returns a userset tree, not a flat list; Leopard only flattens groups. SpiceDB added LookupResources / LookupSubjects; OpenFGA has ListObjects / ListUsers. Approaches: lookup APIs, CheckBulk post-filtering, a denormalized index. Sources: <https://news.ycombinator.com/item?id=20132520>, <https://news.ycombinator.com/item?id=36470943>, <https://authzed.com/docs/spicedb/modeling/protecting-a-list-endpoint>, <https://github.com/authzed/spicedb/issues/207>, <https://authzed.com/docs/spicedb/concepts/zanzibar>.
2. Source of truth and dual writes: how tuples stay in step with the application database. Google keeps everything in Spanner; elsewhere this is the most underestimated cost. Transactional outbox, CDC, Watch durability. Sources: <https://authzed.com/blog/the-dual-write-problem>, <https://github.com/authzed/spicedb/issues/2015>, <https://www.osohq.com/post/authorization-for-the-rest-of-us>, <https://www.osohq.com/post/local-authorization>, <https://news.ycombinator.com/item?id=45661547>.
3. Modeling cookbook: roles and permissions, parent-child inheritance, blocklists (exclusion), public access (wildcards), multiple restrictions (intersection), custom roles, each in the paper's notation and two products' languages. Sources: OpenFGA modeling guides <https://openfga.dev/docs/modeling> (roles-and-permissions, parent-child, blocklists, public-access, multiple-restrictions, custom-roles), <https://www.osohq.com/academy/relationship-based-access-control-rebac>, <https://www.osohq.com/post/google-zanzibar-isnt-flexible>.
4. When relationships are not enough: conditions and context (IP, time, amounts, expiry). The paper has no ABAC; products add CEL caveats (SpiceDB, three-valued with CAVEATED), conditions and contextual tuples (OpenFGA), attributes and rules (Permify). Compare with Cedar. Sources: <https://authzed.com/blog/abac-example>, <https://authzed.com/blog/the-evolution-of-expiration>, <https://openfga.dev/docs/modeling/contextual-time-based-authorization>, <https://openfga.dev/blog/conditional-tuples-announcement>, <https://docs.permify.co/use-cases/abac>, <https://arxiv.org/pdf/2403.04651>, <https://www.styra.com/blog/comparing-opa-rego-to-aws-cedar-and-google-zanzibar/>.
5. Preventing the new enemy without TrueTime: what a zookie needs from the datastore, and what each product offers. Sources: <https://authzed.com/blog/prevent-newenemy-cockroachdb>, <https://authzed.com/blog/new-enemies>, <https://macwright.com/2025/05/02/reading-zanzibar.html>.
6. Inside one Check: decomposition into sub-problems, short-circuiting (union stops at the first yes; intersection and exclusion may not), caching sub-results at a snapshot, dispatch, recursion depth limits. Sources: <https://authzed.com/blog/check-it-out>, <https://authzed.com/blog/check-it-out-2>, <https://authzed.com/blog/hotspot-caching-in-google-zanzibar-and-spicedb>, <https://authzed.com/blog/spicedb-architecture>; paper §3.2.3.
7. Changing and testing a schema: removing a relation takes three steps (drop references, delete tuples, drop the relation); assertion files in CI. Sources: <https://authzed.com/docs/spicedb/modeling/migrating-schema>, <https://authzed.com/blog/online-schema-migrations>, <https://openfga.dev/docs/modeling/testing>, <https://auth0.com/blog/continuous-authorization-testing-fga-github-ci-cd/>.
8. Do you need this? A decision guide: a role table in your database, a policy engine, a Zanzibar-style service, or a mix. Sources: <https://news.ycombinator.com/item?id=36470943>, <https://macwright.com/2025/05/02/reading-zanzibar.html>, <https://news.ycombinator.com/item?id=28543457>, <https://www.osohq.com/academy/authorization-enforcement>, <https://www.osohq.com/academy/microservices-authorization>.
9. Lower priority: authorization for LLM and RAG retrieval (filter after retrieval). Sources: <https://www.osohq.com/academy/authorization-in-llm-applications>, <https://authzed.com/blog/spicedb-secures-authorization-for-ai>.

## Misconceptions for an FAQ page

1. Zanzibar does authentication. It does authorization only. (HN 20132520)
2. You can buy it from Google. It is internal. (HN 36470943)
3. "Zanzibar-inspired" means the whole paper is implemented. Some products borrow the API shape and drop zookies. (macwright)
4. 99.999% means about five minutes of downtime a year. The paper defines availability over qualified RPCs within latency thresholds (§4.3). (HN 20132520)
5. Only p95 is reported. Table 2 and Figure 4 report p50, p95, p99 and p99.9.
6. ACL entry order and negative entries matter. Zanzibar has no entry order; order in time matters; denial is written with exclusion.
7. Running Check in a loop gives you a list, or Expand is a list. Neither (see topic 1).
8. Store every user → permission pair as a tuple. Groups and rewrites keep it indirect; expanding everything explodes. (HN 45661547)
9. You need a graph database. Most implementations run on an RDBMS or Spanner. (HN 36470943)
10. It is the same as AWS IAM. IAM policies do not nest groups; Zanzibar evaluates recursively. (HN 36470943)
11. Zanzibar cannot do any ABAC, or does ABAC natively. The paper has none; caveats and conditions are product extensions. (Cedar paper, HN 28543457)
12. You need TrueTime or atomic clocks. You need some mechanism that orders writes and snapshots; products use other datastores' guarantees. (AuthZed CockroachDB post)

## Not verified

Reddit threads; QCon / Strange Loop talk contents; Cerbos material; AWS Verified Permissions docs (comparison via the Cedar paper); the "maximum recursion depth" claim (one former employee on HN, not in the paper).
