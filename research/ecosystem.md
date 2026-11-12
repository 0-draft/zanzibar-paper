# Zanzibar ecosystem fact sheet

Verified 2026-11-13. Stars, license, language, archived flag, last push and first release come from the GitHub REST API (`gh api`). SPDX ids come from each repository's LICENSE file. API names come from each project's `.proto` files. Company status comes from the companies' own posts. Schema syntax comes from official docs or maintainer sample files linked inline. Re-check everything here before relying on it after this date.

## SpiceDB (AuthZed)

- An open-source database for storing and querying fine-grained authorization relationships, modelled on Zanzibar. Maintained by AuthZed, Inc.
- Apache-2.0, Go, <https://github.com/authzed/spicedb>, docs <https://authzed.com/docs>, first release 2021-09-30, active (v1.57.1 on 2026-11-10), about 7.2k stars.
- Namespace config: SpiceDB schema language (`.zed`); permissions are declared separately from relations. <https://authzed.com/docs/spicedb/concepts/schema>
- Tuple: `resource#relation@subject`, e.g. `document:readme#editor@user:emilia`; subject set `document:readme#editor@team:engineering#member`. <https://authzed.com/docs/spicedb/concepts/relationships>
- Rewrites: `+` union, `&` intersection, `-` exclusion; naming a relation or permission inside a permission is a computed userset; `->` (alias `.any()`) is tuple_to_userset; `.all()` is an intersection arrow.
- Zookie: ZedToken ("the SpiceDB equivalent of Google Zanzibar's Zookie"). Modes `minimize_latency` (default for reads), `at_least_as_fresh`, `at_exact_snapshot`, `fully_consistent`. <https://authzed.com/docs/spicedb/concepts/consistency>
- APIs: `CheckPermission` / `CheckBulkPermissions`, `ReadRelationships`, `WriteRelationships` / `DeleteRelationships`, `Watch`, `ExpandPermissionTree`, plus `LookupResources` / `LookupSubjects`. <https://github.com/authzed/api/blob/main/authzed/api/v1/permission_service.proto>
- Leopard: AuthZed Materialize (managed, commercial), "Authzed's version of the Leopard cache". <https://authzed.com/docs/authzed/concepts/authzed-materialize>
- Storage: CockroachDB, Cloud Spanner, PostgreSQL, MySQL (not recommended), memdb (development only). <https://authzed.com/docs/spicedb/concepts/datastores>
- Architecture: clients call the gRPC/HTTP API; a dispatcher splits each check into sub-problems cached in memory; a consistent-hash ring routes each sub-problem to the peer most likely to have it cached (no coordinator); leaf reads hit the shared datastore; `Watch` streams datastore changes; optionally Materialize consumes them and serves precomputed permission sets. <https://authzed.com/docs/spicedb/ops/performance>, <https://authzed.com/blog/spicedb-architecture>, <https://authzed.com/blog/consistent-hash-load-balancing-grpc>
- Differences from the paper: pluggable SQL/NewSQL datastores instead of a global Spanner; caveats (CEL conditions, `with`); wildcards `user:*`; `.all()` arrow; cache staleness quantized by `--datastore-revision-quantization-interval` (default 5s). <https://authzed.com/blog/hotspot-caching-in-google-zanzibar-and-spicedb>
- Logo: <https://authzed.com/brand> (downloadable wordmarks; terms include "do not alter, modify, or combine these assets without permission"; seen via search snippet only).

```text
definition user {}
definition folder {
  relation viewer: user
  permission view = viewer
}
definition document {
  relation parent: folder
  relation owner: user
  relation editor: user
  relation viewer: user
  permission edit = owner + editor
  permission view = viewer + edit + parent->view
}
```

Related reading: <https://zanzibar.tech>, "The Google Zanzibar Paper, annotated by AuthZed" (annotations © AuthZed, Inc; paper © USENIX and original authors). Source <https://github.com/authzed/zanzibar-annotated> (Apache-2.0). Launch post <https://authzed.com/blog/annotated-zanzibar-launch>.

## OpenFGA (CNCF), Auth0 FGA as the managed offering

- An authorization engine inspired by Zanzibar, created by Auth0/Okta, now a CNCF Incubating project (TOC vote announced 2025-11-11 <https://www.cncf.io/blog/2025/11/11/openfga-becomes-a-cncf-incubating-project/>; project post 2026-01-07 <https://openfga.dev/blog/incubation-announcement>).
- Apache-2.0, Go, <https://github.com/openfga/openfga>, docs <https://openfga.dev/docs>, first release 2022-06-10, active (v1.22.1 on 2026-10-28), about 6.1k stars.
- Managed offering: Auth0 FGA, "based on OpenFGA". <https://docs.fga.dev/fga>
- Namespace config: OpenFGA modeling language (DSL, `model` / `schema 1.1`); the API accepts JSON and the DSL is converted with `fga model transform`. <https://openfga.dev/docs/configuration-language>
- Tuple: `{user, relation, object}`, e.g. `user:anne`, `viewer`, `doc:roadmap`; usersets `group:eng#member`.
- Rewrites: `[types]` direct assignment ("this"), `or`, `and`, `but not`, a bare relation name (computed userset), `X from Y` (tuple_to_userset).
- Zookie: none ("not implemented"). Modes `MINIMIZE_LATENCY` (default) and `HIGHER_CONSISTENCY`; caching off by default. <https://openfga.dev/docs/interacting/consistency>
- APIs: `Check` / `BatchCheck`, `Read`, `Write`, `Expand`, `ReadChanges` (polled, the Watch equivalent), `ListObjects` / `StreamedListObjects` / `ListUsers`, `WriteAuthorizationModel` / `ReadAuthorizationModel`. <https://github.com/openfga/api/blob/main/openfga/v1/openfga_service.proto>
- Leopard: no equivalent found.
- Storage: in-memory (development), PostgreSQL, MySQL, SQLite (beta).
- Architecture: API servers (gRPC/HTTP) on one SQL datastore with an optional read datastore; each server can keep an in-memory Check cache; the docs recommend "a small pool of servers with high capacity" for cache hit rates; no peer-to-peer dispatch documented; clients poll `ReadChanges`. <https://openfga.dev/docs/getting-started/running-in-production>
- Differences: no zookie; CEL conditions (`user with cond`) <https://openfga.dev/docs/modeling/conditions>; contextual tuples (per request, never stored) <https://openfga.dev/docs/interacting/contextual-tuples>; `user:*` wildcards; multi-tenant stores; versioned models.
- Logo: <https://github.com/cncf/artwork/tree/main/projects/openfga>; LICENSE.md says the artwork is made available under the Linux Foundation trademark usage guidelines <https://www.linuxfoundation.org/trademark-usage>; see also <https://www.cncf.io/brand-guidelines/>.

```text
model
  schema 1.1
type user
type folder
  relations
    define viewer: [user]
type document
  relations
    define parent: [folder]
    define owner: [user]
    define editor: [user] or owner
    define viewer: [user] or editor or viewer from parent
```

Pattern from <https://github.com/openfga/sample-stores/blob/main/stores/gdrive/model.fga>.

## Permify (FusionAuth)

- An open-source authorization service inspired by Zanzibar. FusionAuth acquired it on 2025-11-20 (<https://permify.co/post/fusionauth-acquires-permify/>, <https://fusionauth.io/blog/fusionauth-acquires-permify>); now sold as "FusionAuth FGA by Permify". Docs moved: docs.permify.co redirects (301) to <https://fusionauth.io/permify-docs>.
- AGPL-3.0 per the LICENSE file (changed from Apache-2.0 on 2025-05-12, commit "docs: update license"). Go, <https://github.com/Permify/permify>, first release 2022-08-03, active (v1.7.6 on 2026-11-05), about 6.0k stars.
- Namespace config: Permify Schema (`.perm`); keywords `entity`, `relation`, `permission` / `action`, `attribute`, `rule`. <https://fusionauth.io/permify-docs/getting-started/modeling>
- Tuple: `entity:id#relation@subject`, e.g. `document:2#owner@user:1`, `document:1#maintainer@organization:2#member`; attributes `post:546$is_restricted|boolean:true`. <https://fusionauth.io/permify-docs/getting-started/sync-data>
- Rewrites: `or`, `and`, `not`; a bare name is a computed userset; dot traversal (`org.admin`) is tuple_to_userset.
- Zookie: Snap Token (encoded timestamp returned by Write, passed to Check as `snap_token`; without one, the latest transaction id is used). <https://fusionauth.io/permify-docs/operations/snap-tokens>
- APIs: Permission `Check` / `BulkCheck` / `Expand` / `LookupEntity` / `LookupSubject` / `SubjectPermission`; Watch `Watch`; Data `Write` / `WriteRelationships` / `ReadRelationships` / `ReadAttributes` / `Delete`; plus Schema, Bundle, Tenancy. <https://github.com/Permify/permify/blob/master/proto/base/v1/service.proto>
- Storage: PostgreSQL and memory.
- Architecture: gRPC/HTTP servers on PostgreSQL with MVCC snapshots; per-pod Ristretto cache keyed with the snapshot token; optional distributed mode with a consistent-hash ring; circuit breaker for the database (cache docs seen via search snippet only).
- Differences: ABAC attributes and rules; multi-tenancy; PostgreSQL instead of Spanner.
- Logo: `assets/logo-permify-dark.png` / `logo-permify-light.png` in the repo; no Permify-specific usage terms found.

```text
entity user {}
entity folder {
  relation viewer @user
}
entity document {
  relation parent @folder
  relation owner @user
  relation editor @user
  relation viewer @user
  permission edit = owner or editor
  permission view = viewer or edit or parent.viewer
}
```

## Ory Keto

- Ory's open-source permission server, "open source implementation of Zanzibar". The Zanzibar-based rewrite shipped in v0.6.0-alpha.1 (2021-04-07); earlier versions used a different design. <https://github.com/ory/keto/releases/tag/v0.6.0-alpha.1>
- Apache-2.0, Go, <https://github.com/ory/keto>, docs <https://www.ory.com/docs/keto>, first release 2018-11-13, active but slower (v26.2.0 on 2026-03-20, last commit 2026-07-29), about 5.4k stars.
- Namespace config: Ory Permission Language (OPL), a TypeScript subset (`class X implements Namespace`, `related`, `permits`). <https://www.ory.com/docs/keto/reference/ory-permission-language>
- Tuple: `Group:group1#members@User:user1` ("User:user1 is in members of Group:group1"). <https://www.ory.com/docs/keto/concepts/relation-tuples>
- Rewrites: `||`, `&&`, `!`, `.includes(ctx.subject)`, `this.permits.x(ctx)` (computed), `.traverse(p => p.permits.x(ctx))` (tuple_to_userset).
- Zookie: `snaptoken` fields exist but are "not implemented yet and [have] no effect". <https://github.com/ory/keto/blob/master/proto/ory/keto/relation_tuples/v1alpha2/check_service.proto>
- APIs: `Check` / `BatchCheck`, `ListRelationTuples`, `TransactRelationTuples` / `DeleteRelationTuples`, `Expand`; no Watch; separate read and write ports.
- Storage: PostgreSQL, MySQL, CockroachDB, SQLite (not for production). <https://www.ory.com/docs/keto/guides/production>
- Architecture: stateless Keto containers expose a Read API and a Write API (never expose Write publicly); all containers share one SQL database; scale by adding containers.
- Logo: <https://raw.githubusercontent.com/ory/meta/master/static/banners/keto.svg>; terms <https://www.ory.com/brand> (marks "owned exclusively by Ory Corp", use per guidelines; seen via search snippet only).

```ts
class User implements Namespace {}
class Folder implements Namespace {
  related: { viewers: User[] }
  permits = { view: (ctx: Context) => this.related.viewers.includes(ctx.subject) }
}
class Document implements Namespace {
  related: { parents: Folder[]; owners: User[]; editors: User[]; viewers: User[] }
  permits = {
    edit: (ctx: Context) => this.related.owners.includes(ctx.subject) ||
      this.related.editors.includes(ctx.subject),
    view: (ctx: Context) => this.related.viewers.includes(ctx.subject) ||
      this.permits.edit(ctx) || this.related.parents.traverse((p) => p.permits.view(ctx)),
  }
}
```

Pattern from <https://github.com/ory/keto/blob/master/contrib/rewrites-example/namespaces.keto.ts>.

## Topaz (Aserto)

- An open-source authorizer combining OPA/Rego policies with a built-in directory "inspired by the Google Zanzibar data model". <https://github.com/aserto-dev/topaz>
- Status: Aserto announced on 2025-04-27 that it was sunsetting its SaaS by 2025-05-31 and winding down as a commercial entity, while maintainers continue to support Topaz (<https://www.aserto.com/blog/the-final-chapter-for-aserto>). Releases continue (v0.33.27 on 2026-11-10).
- Apache-2.0, Go, docs <https://www.topaz.sh/docs/intro>, first release 2022-10-25, about 1.4k stars.
- Namespace config: manifest (YAML, `model: version: 3`, `types` / `relations` / `permissions`); operators `|` union, `&` intersection, `-` exclusion, `->` arrow; wildcards `user:*`; subject relations `group#member`. <https://www.topaz.sh/docs/directory/manifest-reference>
- Zookie: none documented.
- APIs: Reader `Check` / `CheckPermission` / `CheckRelation` / `GetRelation(s)` / `GetGraph`; Writer `SetRelation` / `DeleteRelation`; Authorizer `Is` / `Query` / `DecisionTree`; no Watch. <https://github.com/aserto-dev/go-directory/blob/main/proto/aserto/directory/reader/v3/reader.proto>
- Storage: embedded BoltDB. <https://www.topaz.sh/docs/architecture>
- Architecture: the app calls the authorizer (`is` / `query`) over REST or gRPC; the OPA policy runs and calls `ds.check` against the local BoltDB directory; decisions go to rotating decision-log files; runs as a sidecar or microservice.
- Logo: <https://github.com/aserto-dev/topaz/blob/main/assets/logo.svg>; no explicit logo or trademark terms found.

```yaml
model:
  version: 3
types:
  user: {}
  folder:
    relations: { viewer: user }
    permissions: { can_read: viewer }
  document:
    relations: { parent: folder, owner: user, editor: user, viewer: user }
    permissions:
      can_write: owner | editor
      can_read: viewer | can_write | parent->can_read
```

Pattern from <https://github.com/aserto-dev/topaz/blob/main/assets/v34/gdrive/manifest.yaml>.

## Warrant (WorkOS)

- A ReBAC service inspired by Zanzibar, with RBAC and ABAC policies. <https://github.com/warrant-dev/warrant>
- Status: dormant as open source (last release v1.15.1 on 2024-06-10; last commit 2025-12-05, README only; not archived). <https://warrant.dev> shows "Warrant —> Now WorkOS FGA". Acquisition date 2024-04-23 from a WorkOS post on X (<https://x.com/WorkOS/status/1782774170146791776>); the first-party blog URL could not be verified. WorkOS FGA docs <https://workos.com/docs/fga> describe Dashboard-configured resource types.
- Apache-2.0, Go, first release 2023-02-23, about 1.3k stars.
- Namespace config: JSON object types with `inheritIf`, `anyOf` / `allOf` / `noneOf`, `ofType` + `withRelation` (tuple_to_userset). <https://github.com/warrant-dev/warrant/blob/main/pkg/authz/objecttype/spec.go>
- Tuple: "warrant", e.g. `[user:1] is an [editor] of [document:docA]`.
- Zookie: `Warrant-Token` header, accepts `latest`. <https://github.com/warrant-dev/warrant/blob/main/pkg/wookie/wookie.go>
- Storage: MySQL, PostgreSQL, SQLite. Architecture: a single Go HTTP service on a SQL database.
- Logo: no usage terms found.

## In-house systems

- Airbnb Himeji (Alan Yao). Primary post <https://medium.com/airbnb-engineering/himeji-a-scalable-centralized-system-for-authorization-at-airbnb-341664924574> (not fetchable, 403); cross-checked with InfoQ <https://www.infoq.com/news/2021/05/airbnb-himeji>: tuples `entity#relation@principal`, YAML config, fan-out on write, sharded and replicated in-memory cache via consistent hashing (about 98% target hit rate), Amazon Aurora instead of Spanner.
- Carta AuthZ. Primary posts <https://medium.com/building-carta/authz-cartas-highly-scalable-permissions-system-782a7f2c840f> and <https://medium.com/building-carta/user-authorization-in-less-than-10-milliseconds-f20d277fec47> (403). Search snippets only (low confidence): RelationTuples, Actor/Object index sets (mapped to Leopard's GROUP2GROUP / MEMBER2GROUP), "Tickets" equivalent to zookies.

## Status table (2026-11-13)

| Product | Owner | License | Stars | Latest release | Status |
| --- | --- | --- | --- | --- | --- |
| SpiceDB | AuthZed | Apache-2.0 | ~7.2k | v1.57.1 (2026-11-10) | Active |
| OpenFGA | CNCF (Okta core maintainer) | Apache-2.0 | ~6.1k | v1.22.1 (2026-10-28) | Active, CNCF Incubating |
| Permify | FusionAuth (acquired 2025-11-20) | AGPL-3.0 (Apache-2.0 until 2025-05) | ~6.0k | v1.7.6 (2026-11-05) | Active, docs at fusionauth.io |
| Ory Keto | Ory Corp | Apache-2.0 | ~5.4k | v26.2.0 (2026-03-20) | Active, slower cadence |
| Topaz | Community maintainers (Aserto wound down 2025) | Apache-2.0 | ~1.4k | v0.33.27 (2026-11-10) | Active OSS |
| Warrant | WorkOS (acquired 2024) | Apache-2.0 | ~1.3k | v1.15.1 (2024-06-10) | Dormant; continues as WorkOS FGA |

## Not verified

Himeji and Carta primary posts; the WorkOS acquisition blog post; the full text of the AuthZed, Ory and Permify cache and brand pages; Permify, Topaz and Warrant logo terms; whether "Okta FGA" is still an official name; OpenFGA's DSL `condition` syntax. None of the schema examples above has been run through its tool yet.
