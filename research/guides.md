# Explainer fact base for the Zanzibar paper

Verified 2026-11-13. Quotes are copied from pages or PDFs actually read; paper quotes come from `content/en.yaml` (USENIX ATC '19, <https://www.usenix.org/conference/atc19/presentation/pang>). **Uncertain** marks claims not confirmed against a primary source. Sources for the timeline are in the per-item sections.

## 1. History of access control

### Timeline at a glance

| Year | Event |
| --- | --- |
| 1966 | Dennis & Van Horn introduce capability lists (C-lists) |
| 1971 | Lampson, "Protection" (access matrix) |
| 1971 | UNIX First Edition manual: owner / non-owner read and write bits |
| 1973 | Bell–LaPadula, MTR-2547 Vol. I |
| 1973 | UNIX Fourth Edition manual adds group rwx bits and set-group-ID |
| 1973/1974 | Saltzer, Multics ACLs |
| 1975/1977 | Biba integrity model, MTR-3153 |
| 1992 | Ferraiolo & Kuhn, RBAC |
| 1996 | Sandhu et al., RBAC96 |
| 1997/1998 | POSIX.1e draft 17 (Oct 1997); sponsorship withdrawn (Jan 1998) |
| 2003 | XACML 1.0 OASIS Standard |
| 2004 | ANSI INCITS 359-2004 RBAC |
| 2007 | Gates coins "Relationship-Based Access Control" |
| 2011 | Fong, ReBAC protection model and policy language |
| 2013 | XACML 3.0 OASIS Standard |
| 2014 | NIST SP 800-162 (ABAC) |
| by 2014 | Zanzibar in production ("more than 5 years" before July 2019) |
| 2016 | OPA first GitHub release (v0.1.0) |
| 2019 | Zanzibar paper |
| 2021 | Ory Keto Zanzibar rewrite (v0.6.0-alpha.1); SpiceDB first release; OPA graduates CNCF |
| 2022 | OpenFGA, Permify, Topaz first releases |
| 2023 | Cedar open-sourced; Amazon Verified Permissions GA; AuthZEN WG announced |
| 2026 | AuthZEN Authorization API 1.0 approved as OpenID Final Specification |

### Capabilities: Dennis & Van Horn (1966)

A capability is an unforgeable token that both names an object and grants rights to it; whoever holds it may use it. Dennis and Van Horn described a computation's "sphere of protection" as defined by its list of capabilities, the C-list. Capabilities answer "what can this subject touch?"; ACLs answer "who can touch this object?". Zanzibar is ACL-style.

Source: Jack B. Dennis and Earl C. Van Horn, "Programming Semantics for Multiprogrammed Computations," CACM 9(3), March 1966, pp. 143–155. PDF: <https://www.princeton.edu/~rblee/ELE572Papers/Fall04Readings/ProgramSemantics_DennisvanHorn.pdf>, MIT DSpace: <https://dspace.mit.edu/entities/publication/4f4d9ee2-671a-4dfd-a679-7b24fae5812a>

### The access matrix: Lampson, "Protection" (1971)

Lampson modelled protection as a matrix whose rows are domains (subjects), whose columns are objects, and whose cells list access rights. ACLs store its columns, capabilities its rows, and roles or attributes compute its cells.

Source: B. W. Lampson, "Protection," Proc. 5th Princeton Symposium on Information Sciences and Systems, March 1971, pp. 437–443; reprinted ACM SIGOPS Operating Systems Review 8(1), Jan 1974, pp. 18–24. PDF of the reprint: <https://cseweb.ucsd.edu/classes/fa01/cse221/papers/lampson-protection-osr74.pdf>

### Multics ACLs: Saltzer (1973/1974)

Multics attached an access control list to each file segment and directory, controlled access hierarchically through directories, and authenticated users before evaluating the lists. Saltzer's paper is the classic account and is reference [23] in the Zanzibar paper, which describes ACLs as going back to Multics. It was presented at SOSP in October 1973 and revised for CACM in July 1974. The paper is the citable description; Multics itself ran earlier.

Source: J. H. Saltzer, "Protection and the Control of Information Sharing in Multics," CACM 17(7), July 1974, pp. 388–402, <https://dl.acm.org/doi/10.1145/361011.361067>; SOSP '73 version and publication history in Saltzer's own list <https://web.mit.edu/Saltzer/www/publications/pubs.html>. Note: multicians.org lists the CACM issue as 17(4), April 1974; the ACM DL and Saltzer's list say 17(7), July 1974.

### Mandatory models: Bell–LaPadula (1973) and Biba (1975/1977)

In mandatory access control the system, not the owner, decides who can see what, based on labels such as "Secret" or "Top Secret". Bell–LaPadula protects confidentiality: no read up (simple security property) and no write down (the \*-property). Biba is its integrity dual: no read down and no write up, so low-integrity data cannot contaminate high-integrity data. Zanzibar is discretionary (owners share), so these are contrast.

Sources: D. Elliott Bell and Leonard J. La Padula, "Secure Computer Systems: Mathematical Foundations," MTR-2547 Vol. I, MITRE, 1 March 1973 (ESD-TR-73-278-I), as cited by Bell's own retrospective, <https://www.acsac.org/2005/papers/Bell.pdf>. K. J. Biba, "Integrity Considerations for Secure Computer Systems," MTR-3153, MITRE, June 1975 per the UC Davis archive <https://seclab.cs.ucdavis.edu/projects/history/CD/index.html>; usually cited as ESD-TR-76-372, April 1977 <https://www.ojp.gov/ncjrs/virtual-library/abstracts/integrity-considerations-secure-computer-systems>.

### UNIX permission bits (1971) and group bits (1973)

The UNIX First Edition manual (dated 11/3/71) gives chmod six mode bits: write non-owner, read non-owner, write owner, read owner, executable, and set-user-ID. There is no group class. The Third Edition chmod(II) page (dated 3/15/72) still has the same six bits. The Fourth Edition chmod(II) page (dated 8/5/73) introduces the familiar layout: set-user-ID, set-group-ID, owner rwx, "0070 read, write, execute by group", and others rwx.

Sources: First Edition sys-chmod(2), archived at <http://man.cat-v.org/unix-1st/2/sys-chmod> (seen via search snippet; the host returned HTTP 402 to direct fetch). Third and Fourth Edition man pages read directly from the Unix history repository: <https://github.com/dspinellis/unix-history-repo/blob/Research-V3/man/man2/chmod.2> and <https://github.com/dspinellis/unix-history-repo/blob/Research-V4/man/man2/chmod.2>.

### POSIX.1e ACLs (draft 17, withdrawn)

An IEEE working group tried to standardise ACLs, audit, capabilities, MAC and labels as POSIX 1003.1e/1003.2c. Grünbacher writes that "standardizing all these diverse areas was too ambitious a goal" and that "In January 1998, sponsorship for 1003.1e and 1003.2c was withdrawn." Draft 17 (October 1997) was released and became the basis of Linux ACLs. So "withdrawn draft, 1997" is half right: last draft 1997, withdrawal January 1998.

Source: Andreas Grünbacher, "POSIX Access Control Lists on Linux," USENIX ATC 2003 FREENIX Track, <https://www.usenix.org/legacy/publications/library/proceedings/usenix03/tech/freenix03/full_papers/gruenbacher/gruenbacher_html/main.html>

### RBAC: Ferraiolo & Kuhn (1992), RBAC96, ANSI INCITS 359-2004

Role-based access control assigns permissions to roles and users to roles, so administrators manage a few roles instead of many user–object pairs. Ferraiolo and Kuhn introduced it at the 15th National Computer Security Conference in 1992 (Zanzibar reference [17]); Sandhu et al. formalised the RBAC96 family in IEEE Computer, February 1996; a unified NIST model followed in 2000 and became ANSI INCITS 359-2004 (revised as INCITS 359-2012). The Zanzibar paper says roles "are similar to Zanzibar relations" and that "A number of Zanzibar clients have implemented RBAC policies on top of Zanzibar".

Sources: NIST RBAC project page (dates for 1992, Feb 1996, 2000, adoption on 11 Feb 2004, and 2012 revision), <https://csrc.nist.gov/projects/role-based-access-control>; NIST cyber history chapter, <https://csrc.nist.gov/nist-cyber-history/identity-access-management/chapter>; paper §5 Related Work.

### XACML: OASIS 1.0 (2003) and 3.0 (2013)

XACML is an XML policy language plus an architecture that separates the Policy Enforcement Point (the app) from the Policy Decision Point (the engine). Version 1.0 became an OASIS Standard in February 2003 (document dated 18 February 2003); version 3.0 is dated 22 January 2013 and, with Errata 01, is still the latest approved OASIS Standard.

Sources: XACML 3.0 core spec, which states its date and cites "OASIS Standard, Extensible access control markup language (XACML) Version 1.0. 18 February 2003.", <https://docs.oasis-open.org/xacml/3.0/xacml-3.0-core-spec-os-en.html>; OASIS TC page, <https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=xacml>. **Uncertain:** the exact approval day for 1.0 (6 Feb vs 18 Feb 2003) depends on the source; the year is solid.

### ABAC: NIST SP 800-162 (2014)

NIST defines ABAC as "a logical access control methodology where authorization to perform a set of operations is determined by evaluating attributes associated with the subject, object, requested operations, and, in some cases, environment against policy, rules, or relationships that describe the allowable operations for a given set of attributes." SP 800-162 was first published in January 2014 and updated on 2 August 2019.

Source: NIST SP 800-162, <https://csrc.nist.gov/pubs/sp/800/162/upd2/final>

### ReBAC: Gates (2007) and Fong (2011)

Relationship-based access control decides access from the relationship between the requester and the resource (or its owner), such as "friend of", "member of", "parent folder of". Carrie Gates coined the term in a 2007 W2SP position paper; Fong's abstract opens by saying "Gates coined the term Relationship-Based Access Control (ReBAC)" and defines a ReBAC model where "authorization decisions are based on the relationship between the resource owner and the resource accessor in a social network maintained by the protection system." Fong also stresses that binary relations compose (friends-of-friends), unlike unary roles. The Zanzibar paper does not use the word ReBAC; it is the industrial-scale version of the idea.

Sources: Philip W. L. Fong, "Relationship-Based Access Control: Protection Model and Policy Language," CODASPY '11, pp. 191–202, <https://dl.acm.org/doi/10.1145/1943513.1943539>, author PDF <https://pages.cpsc.ucalgary.ca/~pwlfong/Pub/codaspy2011.pdf>. C. Gates, "Access Control Requirements for Web 2.0 Security and Privacy," W2SP 2007, listed on her CV <https://web.cs.dal.ca/~gates/cv.html> (CV seen via search snippet only).

### Google Zanzibar (in production by about 2014; paper 2019)

The paper was presented at USENIX ATC '19 in Renton, WA, in July 2019. Section 4 says "Zanzibar has been in production use for more than 5 years", which places production use before mid-2014; the abstract's latency and availability figures cover "3 years of production use". No primary source found gives an exact start year, so "since about 2012–2014" is an inference and should be written as "by 2014 at the latest".

Sources: <https://www.usenix.org/conference/atc19/presentation/pang>; paper abstract and §4.

### The open-source wave (2021–2022)

After the paper, several teams built Zanzibar-style services. First releases from the GitHub API: Ory Keto's Zanzibar-based rewrite v0.6.0-alpha.1 on 2021-04-07 (Keto itself dates from 2018), SpiceDB 2021-09-30, OpenFGA 2022-06-10 (created at Auth0/Okta, CNCF Incubating since late 2025), Permify 2022-08-03, and Aserto's Topaz 2022-10-25. Details, licences and current status are in `research/ecosystem.md`.

Sources: <https://github.com/ory/keto/releases/tag/v0.6.0-alpha.1>, <https://github.com/authzed/spicedb>, <https://github.com/openfga/openfga>, <https://github.com/Permify/permify>, <https://github.com/aserto-dev/topaz>, <https://www.cncf.io/blog/2025/11/11/openfga-becomes-a-cncf-incubating-project/>

### OPA (2016; CNCF graduated 2021)

Open Policy Agent is a general-purpose policy engine with its own language, Rego; it evaluates policies over JSON input rather than storing a relationship graph. The GitHub repository was created in December 2015 and the first GitHub release (v0.1.0) is dated 2016-07-14. CNCF accepted it into the sandbox in April 2018, promoted it to incubation about a year later, and announced its graduation on 4 February 2021.

Sources: CNCF press release, <https://www.cncf.io/announcements/2021/02/04/cloud-native-computing-foundation-announces-open-policy-agent-graduation/>; release dates from the GitHub API for <https://github.com/open-policy-agent/opa/releases>.

### Amazon Cedar and AWS Verified Permissions (2023)

Cedar is a policy language and engine; policies are `permit`/`forbid` statements over principals, actions, resources and their attributes, with `in` for hierarchy membership. AWS open-sourced Cedar under Apache-2.0 on 10 May 2023, and Amazon Verified Permissions, a managed service that evaluates Cedar policies, became generally available on 13 June 2023.

Sources: <https://aws.amazon.com/about-aws/whats-new/2023/05/cedar-open-source-language-access-control>, <https://aws.amazon.com/about-aws/whats-new/2023/06/amazon-verified-permissions-generally-available/>

### OpenID AuthZEN (2023; Authorization API 1.0 Final in 2026)

AuthZEN standardises the call between an enforcement point and a decision point ("may subject S do action A on resource R?") so apps can swap authorization engines. The OpenID Foundation announced the working group on 20 October 2023, with a first meeting on 24 October 2023. Authorization API 1.0 reached Implementer's Draft in November 2024 and was approved as an OpenID Final Specification, announced 12 January 2026 (81 approve, 1 object, 25 abstain). As of November 2026 it is Final; the group is building a conformance program and in June 2026 adopted new Working Group Drafts.

Sources: <https://openid.net/announcing-authzen-working-group/>, <https://openid.net/authorization-api-1-0-final-specification-approved/>, <https://openid.net/specs/authorization-api-1_0.html>, <https://openid.net/wg/authzen/>. **Uncertain:** the exact charter acceptance day (14 or 17 October 2023 per secondary sources).

## 2. ACL vs RBAC vs ABAC vs ReBAC

### Definitions

**ACL.** Each object carries a list of (principal, rights) entries. Easy to audit per object; "everything Alice can see" needs a scan of all lists. Kuhn et al. tabulate ACLs as the mapping "U → perm". Source: <https://csrc.nist.gov/files/pubs/journal/2010/06/adding-attributes-to-rolebased-access-control/final/docs/kuhn-coyne-weil-10.pdf>

**RBAC.** "RBAC controls all access through roles assigned to users. Each role assigns a collection of permissions to users." Roles can form hierarchies, and the standard supports separation of duty. Sources: Kuhn, Coyne, Weil, IEEE Computer 43(6), June 2010 (same PDF); ANSI INCITS 359-2004 via <https://csrc.nist.gov/projects/role-based-access-control>

**ABAC.** Access is decided by evaluating attributes of subject, object, action and environment against rules (NIST SP 800-162 definition quoted in section 1). Source: <https://csrc.nist.gov/pubs/sp/800/162/upd2/final>

**ReBAC.** Access is decided by relationships between entities, typically stored as a graph and composed by following edges (Fong 2011). Zanzibar's relation tuples `object#relation@user` are the edges, and userset rewrites are the composition rules. Source: <https://pages.cpsc.ucalgary.ca/~pwlfong/Pub/codaspy2011.pdf>; paper §2.1 and §2.3.1.

### What each models well and badly

| Model | Good at | Bad at |
| --- | --- | --- |
| ACL | Per-object sharing; answering "who can access X?" | Inheritance and groups unless added on; "what can Alice access?" |
| RBAC | Organisation-wide job functions; reviewing a user's maximum permissions | Per-object sharing; context (time, location) leads to role explosion |
| ABAC | Context and data-classification rules; no per-user setup | Auditing who can access what; rule interactions; attribute quality |
| ReBAC | Sharing, nesting, inheritance (folders, groups, orgs); reverse queries | Pure context rules (time of day) unless extended; deep graphs cost traversal |

### Known trade-offs, with sources

**Role explosion (RBAC).** Kuhn et al.: "To support dynamic attributes, particularly in large organizations, a "role explosion" can result in thousands of separate roles being fashioned for different collections of permissions." They also note that implementing n Boolean attribute conditions in RBAC "could, in a worst case, require 2n roles" (2 to the n). Per-object sharing makes it worse (a role per document). Source: <https://csrc.nist.gov/files/pubs/journal/2010/06/adding-attributes-to-rolebased-access-control/final/docs/kuhn-coyne-weil-10.pdf>

**Attribute sprawl / un-auditability (ABAC).** The same paper: ABAC "is easy to set up, but analyzing or changing user permissions can be problematic", and determining a user's permissions may require running a large rule set, which "can make it impossible to determine risk exposure for a given employee position." The phrase "attribute sprawl" is industry shorthand, not a NIST term; the citable point is the 2^n combinations and the audit problem. Source: same PDF.

**Graph traversal cost (ReBAC).** Checking a relation may mean following many edges, one storage read per hop. The Zanzibar paper: "Recursive pointer chasing during check evaluation has difficulty maintaining low latency with groups that are deeply nested or have a large number of child groups" (§3.2.4). Open-source systems cap depth: SpiceDB's default limit is "50 hops" (`--dispatch-max-depth`), OpenFGA's `resolveNodeLimit` defaults to 25. Sources: paper §3.2.4; <https://authzed.com/docs/spicedb/modeling/recursion-and-max-depth>; <https://openfga.dev/docs/getting-started/setup-openfga/configuration>

### One scenario, four encodings

Scenario: document `readme` lives in folder `A`. Owners can edit; editors can edit; viewers can read; anyone who can view the folder can view the document; members of a group get the group's access. Alice owns the doc, Bob is an editor, group `eng` (containing Carol) can view folder `A`.

**ACL.** Each object stores its list. Folder inheritance and groups are not part of the model, so the app copies entries down or resolves groups itself.

```text
doc:readme   -> alice: edit,read ; bob: edit,read ; carol: read   (copied from folder A via group eng)
folder:A     -> group:eng: read
```

When Carol leaves `eng` or the doc moves, every copied entry must be rewritten.

**RBAC.** Roles are global, so per-document access needs per-document roles.

```text
role readme_owner  -> {edit, read} on doc:readme
role readme_editor -> {edit, read} on doc:readme
role folderA_viewer -> {read} on folder:A, {read} on doc:readme   (and every other doc in A)
user alice -> readme_owner ; bob -> readme_editor ; carol -> folderA_viewer
```

This works but creates roles per object, which is the role-explosion pattern.

**ABAC (Cedar-style).** Rules over attributes; hierarchy via `in`. The first policy is copied from the Cedar docs; the others are illustrative and unvalidated.

```cedar
permit (principal, action == Action::"editPhoto", resource)
when { resource.owner == principal };

permit (principal, action == Action::"edit", resource)
when { principal in resource.editors };

permit (principal, action == Action::"read", resource)
when { principal in resource.parentFolder.viewers };
```

The rules are compact, but `editors` and `viewers` are relationship data in disguise, and "list every document Carol can read" means evaluating rules over all documents. Source for syntax: <https://docs.cedarpolicy.com/policies/syntax-policy.html>

**ReBAC (Zanzibar).** Tuples in the paper's notation plus the paper's own Figure 1 config, which encodes this exact scenario ("All owners are editors, and all editors are viewers. Further, viewers of the parent folder are also viewers of the document.").

```text
doc:readme#owner@alice
doc:readme#editor@bob
doc:readme#parent@folder:A#...
folder:A#viewer@group:eng#member
group:eng#member@carol
```

```text
name: "doc"
relation { name: "owner" }
relation { name: "editor"
  userset_rewrite { union { child { _this {} } child { computed_userset { relation: "owner" } } } } }
relation { name: "viewer"
  userset_rewrite { union { child { _this {} } child { computed_userset { relation: "editor" } }
    child { tuple_to_userset { tupleset { relation: "parent" }
      computed_userset { object: $TUPLE_USERSET_OBJECT relation: "viewer" } } } } } }
```

Removing Carol from `eng` is one tuple delete; moving the doc is one `parent` tuple change. The cost moves to read time: `check(doc:readme#viewer@carol)` follows doc → folder A → group eng → carol. Source: paper §2.1 (tuple examples, Table 1) and Figure 1 (config condensed here from the paper's layout).

## 3. Prerequisites the paper assumes

### Serializability vs linearizability vs external consistency

Serializability is about transactions: the outcome equals some serial order, but not necessarily real-time order. Linearizability (Herlihy & Wing 1990) is about single operations on single objects: each appears to take effect at one instant between its call and return, respecting real time. External consistency (Gifford 1981, Zanzibar reference [18]) is the transaction-level real-time guarantee; Spanner states it as "if a transaction T1 commits before another transaction T2 starts, then T1's commit timestamp is smaller than T2's" and calls it equivalent to linearizability. Bailis summarises the combination as strict serializability: "transaction behavior is equivalent to some serial execution, and the serial order corresponds to real time."

Sources: C. H. Papadimitriou, "The serializability of concurrent database updates," JACM 26(4), Oct 1979, <https://doi.org/10.1145/322154.322158>; M. Herlihy and J. Wing, "Linearizability," ACM TOPLAS 12(3), July 1990, <https://dl.acm.org/doi/10.1145/78969.78972>; D. K. Gifford, PhD thesis, Stanford, 1981 (paper reference [18]); Spanner §1, <https://www.usenix.org/system/files/conference/osdi12/osdi12-final-16.pdf>; Peter Bailis, 24 Sep 2014, <http://www.bailis.org/blog/linearizability-versus-serializability/>

### Snapshot reads and MVCC

In a multi-version store, "each write on a data item produces a new copy (or version)" (Bernstein & Goodman), so a reader can ask for the database as of time T without blocking writers. Spanner calls itself "multi-version" and defines a snapshot read as "a read in the past that executes without locking", where the client gives either a timestamp or a staleness bound. Zanzibar evaluates each check at one snapshot timestamp so that all the reads in a multi-hop check see the same consistent ACL state.

Sources: P. A. Bernstein and N. Goodman, "Multiversion concurrency control—theory and algorithms," ACM TODS 8(4), Dec 1983, <https://doi.org/10.1145/319996.319998>; Spanner §4.1, same PDF; paper §2.2.

### Spanner TrueTime, epsilon, and commit wait

TrueTime returns an interval, not a point: `TT.now()` returns `[earliest, latest]` "guaranteed to contain the absolute time during which TT.now() was invoked". Epsilon (ε) is the instantaneous error bound, half the interval width; in Google's production it varied "from about 1 to 7 ms over each poll interval", about 4 ms most of the time (2012 figures). Commit wait: the leader does not let anyone see a transaction's writes until `TT.after(s)` is true for its timestamp s, so the timestamp is guaranteed to be in the past everywhere; the price is waiting out roughly 2ε per write. Zanzibar relies on this to give ACL writes causally ordered timestamps (§2.2) and notes that a read at a future timestamp simply waits "until TrueTime has moved past T" (§3.2.5).

Source: J. C. Corbett et al., "Spanner: Google's Globally-Distributed Database," OSDI '12, §3 and §4.1.2, <https://www.usenix.org/system/files/conference/osdi12/osdi12-final-16.pdf>; paper §2.2, §3.2.5.

### Bounded staleness and zookies

A bounded-staleness read may return slightly old data, but no older than a stated bound; this lets any nearby replica answer without cross-region coordination. Spanner supports it directly ("provide an upper bound on the desired timestamp's staleness and let Spanner choose a timestamp"). Zanzibar makes the bound per request with a zookie, an opaque token encoding a timestamp: a check carrying a zookie must use a snapshot "at least as fresh as the timestamp for the content version" (§2.2). By default Zanzibar picks a recent snapshot rounded up to a coarse granularity, "such as one or ten seconds" (§3.2.5), so many requests share cache entries.

Sources: Spanner §4.1; paper §2.2, §2.4, §3.2.5.

### The "new enemy" problem (paper §2.2)

The paper defines it as what "can arise when we fail to respect the ordering between ACL updates or when we apply old ACLs to new content." Example A: Alice removes Bob from a folder, then Charlie moves new documents into it; a check that ignores the order may let Bob see them. Example B: Alice removes Bob from a document, then new content is added; a check using the pre-removal ACL shows Bob the new content. The fix is external consistency plus snapshot reads bounded by the zookie stored with each content version.

Source: paper §2.2.

### Consistent hashing (Karger et al. 1997)

Consistent hashing maps keys and servers onto the same ring so that adding or removing a server moves only a small fraction of keys, unlike `hash(key) mod N`. Karger et al. introduced it for web caches to "decrease or eliminate the occurrence of hot spots". Zanzibar uses it to spread its distributed cache across servers in a cluster, with the forwarding key usually computed from the object ID so that related sub-checks land on the same server (§3.2.5).

Source: D. Karger et al., "Consistent Hashing and Random Trees," STOC '97, pp. 654–663, <https://people.csail.mit.edu/karger/Papers/web.pdf> (abstract seen via search snippet); paper reference [20] and §3.2.5.

### Request hedging ("The Tail at Scale", Dean & Barroso 2013)

When one request fans out to many servers, the slowest one sets the latency. A hedged request sends the same call to a second replica if the first is slow and takes whichever answer arrives first. Dean and Barroso suggest "waiting for the 95th-percentile expected latency before issuing the hedged request", which limits extra load to about 5%; in a BigTable benchmark, hedging after 10 ms cut 99.9th-percentile latency "from 1,800ms to 74ms while sending just 2% more requests." Zanzibar hedges calls to Spanner and Leopard using a dynamic Nth-percentile delay, but does not hedge between Zanzibar servers because check costs vary too much (§3.2.7).

Sources: J. Dean and L. A. Barroso, "The Tail at Scale," CACM 56(2), Feb 2013, pp. 74–80, <https://research.google/pubs/the-tail-at-scale/>, PDF <https://www.barroso.org/publications/TheTailAtScale.pdf>; paper §3.2.7.

### Cache stampede

A cache stampede happens when many concurrent requests miss the same cache key at once and all go to the backend together. The paper: "To handle the "cache stampede" problem [3], where concurrent requests create flash hot spots before the cache is populated with results, we maintain a lock table on each server"; only one request per key computes, the rest wait for its result. The paper's reference [3] is the Wikipedia article, not a paper. Zanzibar also caches all tuples of a hot object and delays cancelling a sub-check while others wait on its lock table entry (§3.2.5).

Source: paper §3.2.5; <https://en.wikipedia.org/wiki/Cache_stampede> (as cited by the paper).

### Paxos (Lamport 1998/2001) in Spanner

Paxos lets a group of replicas agree on a sequence of values so that a majority can keep going when some replicas fail. Lamport's "The Part-Time Parliament" appeared in ACM TOCS 16(2), May 1998, and the shorter "Paxos Made Simple" in ACM SIGACT News 32(4), Dec 2001. In Spanner, "each spanserver implements a single Paxos state machine on top of each tablet"; writes go through the Paxos leader, and reads can be served from any replica that is "sufficiently up-to-date". Zanzibar's own data has 5 voting replicas in 3 US metro areas "within 25 milliseconds of each other so that Paxos transactions commit quickly" (§3.1.4).

Sources: <https://lamport.azurewebsites.net/pubs/pubs.html>, <https://lamport.azurewebsites.net/pubs/paxos-simple.pdf>; Spanner §2.1.

## 4. Leopard and nested groups

### The paper's description (§3.2.4)

Leopard exists because "Recursive pointer chasing during check evaluation has difficulty maintaining low latency with groups that are deeply nested or have a large number of child groups." It stores sets as `(T, s, e)` tuples and answers union, intersection and exclusion queries over them. For groups it keeps two set types: GROUP2GROUP(s), every group that is "directly or indirectly" a sub-group of s, and MEMBER2GROUP(s), every group that user s is a "direct" member of. User U is in group G iff MEMBER2GROUP(U) ∩ GROUP2GROUP(G) is non-empty, and intersections over skip lists cost O(min(|A|, |B|)) seeks.

Source: paper §3.2.4.

### Reachability framing

The paper: "Group membership can be considered as a reachability problem in a graph, where nodes represent groups and users and edges represent direct membership. Flattening group-to-group paths allows reachability to be efficently evaluated by Leopard" (the typo "efficently" is in the original). Without Leopard, answering "is U reachable from G?" means a breadth-first walk with one storage read per level. With it, group-to-group paths are precomputed and only the user's direct edges are joined at query time.

Source: paper §3.2.4.

### Keeping it fresh and consistent

Leopard has three parts: in-memory serving, an offline builder that periodically expands a full snapshot into index shards, and an online incremental layer fed by Zanzibar's Watch API. The offline index alone "cannot do so at a fresh and consistent snapshot", so servers merge updates with timestamps up to the query timestamp on top of it, which keeps Leopard answers consistent with Zanzibar's snapshot model.

Source: paper §3.2.4.

### Why denormalization trades write cost for read cost

Storing the transitive closure turns a multi-hop read into one set intersection, but each write may now change many closure entries: adding group B under group A adds B and all of B's descendants to A and to every ancestor of A. The paper quantifies it: "a single Zanzibar tuple addition or deletion may yield potentially tens of thousands of discrete Leopard tuple events." It is worth it only where reads dominate and nesting is deep, which is why Zanzibar uses Leopard only "for selected namespaces that exhibit such structure."

Source: paper §3.2.4. The write-amplification framing is our inference from the quoted numbers.

### Later public descriptions

AuthZed's overview (12 May 2021) describes Leopard as keeping "an in-memory transitive closure of all groups that are subgroups of a higher level group", letting Zanzibar "reduce all nested group resolutions to a single call to the index." AuthZed Materialize "takes inspiration from the Leopard index component described in the Zanzibar paper" and precomputes configured permission sets, likened to a relational materialized view; its docs state no consistency or write-amplification trade-offs. No Google publication after 2019 describing Leopard was found.

Sources: <https://authzed.com/blog/what-is-google-zanzibar>, <https://authzed.com/docs/authzed/concepts/authzed-materialize>

## Not verified

- Exact start year of Zanzibar in production (only "more than 5 years" before July 2019 is citable).
- UNIX First Edition date 11/3/71: from the cat-v archive via search snippet and the Zanzibar paper's own Unix manual reference; the Bell Labs/Nokia mirror returned 403.
- Gates 2007: only the citation was checked, not the paper.
- Karger 1997 abstract: seen in a search snippet; the PDF was not opened.
- XACML 1.0 exact approval day (6 vs 18 February 2003).
- AuthZEN charter acceptance day (14 vs 17 October 2023).
- The ABAC Cedar snippets beyond the first one were not run through the Cedar validator.
