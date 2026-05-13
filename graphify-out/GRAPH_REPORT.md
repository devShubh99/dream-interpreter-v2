# Graph Report - /Users/shubh/Projects/Personal/dream-interpreter-v2  (2026-05-13)

## Corpus Check
- 24 files · ~45,334 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 72 nodes · 51 edges · 30 communities detected
- Extraction: 63% EXTRACTED · 37% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]

## God Nodes (most connected - your core abstractions)
1. `AuthPage` - 6 edges
2. `Follow-Up Dream Conversation UI` - 5 edges
3. `Social Preview Asset` - 4 edges
4. `Dream Interpreter V2` - 4 edges
5. `Background Image` - 4 edges
6. `test_login_form_is_visible()` - 3 edges
7. `Dream Sharing and Deletion Controls` - 3 edges
8. `test_homepage_loads()` - 2 edges
9. `Test that the application's homepage loads correctly.` - 2 edges
10. `Test that the login elements are on the screen using the Page Object Model.` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Follow-Up Dream Conversation UI` --semantically_similar_to--> `Chat With Your Dream Feature`  [INFERRED] [semantically similar]
  src/components/DreamChat.tsx → README.md
- `Dream Sharing and Deletion Controls` --semantically_similar_to--> `Shared Visions Feature`  [INFERRED] [semantically similar]
  src/components/DreamResult.tsx → README.md
- `Runtime Environment Contract` --conceptually_related_to--> `Secure and Private Architecture`  [INFERRED]
  src/vite-env.d.ts → README.md
- `AuthProvider` --implements--> `Dream Interpreter Platform`  [INFERRED]
  src/lib/AuthContext.tsx → README.md
- `Friend-Like Dream Chat Service` --calls--> `Follow-Up Dream Conversation UI`  [EXTRACTED]
  netlify/functions/dream-chat.ts → src/components/DreamChat.tsx

## Hyperedges (group relationships)
- **Celestial Journal User Flow** — dreaminput_component, dreamhistory_component, analyticsdashboard_component [EXTRACTED 0.95]
- **Auth Context Pattern** — authcontext_authcontext, authcontext_useauth, authcontext_authprovider, authcontext_authcontexttype [EXTRACTED 0.98]
- **Filter Context Pattern** — filtercontext_filtercontext, filtercontext_usefilter, filtercontext_filterprovider, filtercontext_filtercontexttype [EXTRACTED 0.98]
- **Portrait Staircase Composition** — bg-mobile_staircase_scene, bg-mobile_person_on_staircase, bg-mobile_colored_lighting [EXTRACTED 0.95]
- **Social Preview Branding Composition** — social-preview_social_preview_asset, social-preview_dream_interpreter_v2, social-preview_translate_your_subconscious, social-preview_moon_and_stars_icon, social-preview_cosmic_background [EXTRACTED 0.95]
- **Background Image Composition** — bgdesktop_background_image, bgdesktop_seated_woman, bgdesktop_mattress_bench, bgdesktop_colored_wall_lamps, bgdesktop_moody_interior_scene [EXTRACTED 0.93]
- **Celestial Journal User Flow** — dreaminput_component, dreamhistory_component, analyticsdashboard_component [EXTRACTED 0.95]
- **Auth Context Pattern** — authcontext_authcontext, authcontext_useauth, authcontext_authprovider, authcontext_authcontexttype [EXTRACTED 0.98]
- **Shared Dream Distribution Flow** — dreamresult_sharing_and_deletion_controls, shareddream_public_interpretation_view, indexhtml_social_sharing_metadata, readme_shared_visions [INFERRED 0.84]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.24
Nodes (6): AuthPage, Helper method to fill the login form and submit., Test that the login elements are on the screen using the Page Object Model., Test that the application's homepage loads correctly., test_homepage_loads(), test_login_form_is_visible()

### Community 1 - "Community 1"
Cohesion: 0.2
Nodes (10): Archived Dream Audit View, Follow-Up Dream Conversation UI, Context-Enriched Dream Chat Rationale, Friend-Like Dream Chat Service, Interpret and Persist Flow, Dream Sharing and Deletion Controls, Social Sharing Metadata, Chat With Your Dream Feature (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.25
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.7
Nodes (5): Cosmic Background, Dream Interpreter V2, Moon and Stars Icon, Social Preview Asset, Translate your subconscious

### Community 4 - "Community 4"
Cohesion: 0.6
Nodes (5): Background Image, Colored Wall Lamps, Mattress Bench, Moody Interior Scene, Seated Woman

### Community 5 - "Community 5"
Cohesion: 0.67
Nodes (3): AuthProvider, Mystical Brand Presentation, Dream Interpreter Platform

### Community 6 - "Community 6"
Cohesion: 1.0
Nodes (3): Supabase Environment Config, isAdmin, Supabase Client

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (3): Purple and Orange Lighting, Person Behind Stair Railing, Neon-Lit Staircase Scene

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (2): Secure and Private Architecture, Runtime Environment Contract

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (2): Authenticated Application Shell, Admin-Aware Navigation

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (2): DreamHistory Component, DreamInput Component

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (1): React Vite Build Pipeline

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (1): interpret-dream function

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (1): Root Provider Composition

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (1): AnalyticsDashboard Component

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (1): Sentiment Score

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (1): Main Themes / Archetypes

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (1): AuthContext

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (1): useAuth

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (1): AuthContextType

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (1): FilterProvider

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (1): FilterContext

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (1): useFilter

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (1): FilterContextType

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (1): Context-Enriched Dream Chat Rationale

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (1): Dream Interpreter Platform

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (1): Fix Dashboard Layout Plan

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (1): Netlify Deployment Model

## Knowledge Gaps
- **32 isolated node(s):** `React Vite Build Pipeline`, `Helper method to fill the login form and submit.`, `Context-Enriched Dream Chat Rationale`, `interpret-dream function`, `Root Provider Composition` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 8`** (2 nodes): `Secure and Private Architecture`, `Runtime Environment Contract`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (2 nodes): `Authenticated Application Shell`, `Admin-Aware Navigation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (2 nodes): `DreamHistory Component`, `DreamInput Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `React Vite Build Pipeline`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `interpret-dream function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `Root Provider Composition`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `AnalyticsDashboard Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `Sentiment Score`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `Main Themes / Archetypes`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `AuthContext`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `useAuth`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `AuthContextType`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `FilterProvider`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `FilterContext`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `useFilter`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `FilterContextType`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `Context-Enriched Dream Chat Rationale`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `Dream Interpreter Platform`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `Fix Dashboard Layout Plan`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `Netlify Deployment Model`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 3 inferred relationships involving `AuthPage` (e.g. with `Test that the application's homepage loads correctly.` and `Test that the login elements are on the screen using the Page Object Model.`) actually correct?**
  _`AuthPage` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Follow-Up Dream Conversation UI` (e.g. with `Interpret and Persist Flow` and `Archived Dream Audit View`) actually correct?**
  _`Follow-Up Dream Conversation UI` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Dream Interpreter V2` (e.g. with `Moon and Stars Icon` and `Translate your subconscious`) actually correct?**
  _`Dream Interpreter V2` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `React Vite Build Pipeline`, `Helper method to fill the login form and submit.`, `Context-Enriched Dream Chat Rationale` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._