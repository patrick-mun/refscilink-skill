# RefSciLink Skill — Roadmap des améliorations

Ce document sert de plan de suivi pour rendre RefSciLink réellement utilisable par d'autres développeurs.

La colonne **Validé** doit être mise à jour au fur et à mesure de l'avancement.

Légende :

- `Non` : non commencé
- `En cours` : commencé mais non finalisé
- `Oui` : terminé, testé et documenté

---

## Tableau de suivi

| Priorité | Version cible | Amélioration | Objectif | Fichiers / dossiers concernés | Critère de validation | Validé |
|---:|---|---|---|---|---|---|
| 1 | v0.2.0 | Créer un exemple complet `examples/basic-site/` | Permettre à un développeur de tester RefSciLink immédiatement après clonage | `examples/basic-site/index.html`, `style.css`, `bibliographie.md`, `data/reference_bibliographique/` | `npm run demo` ou serveur local permet d'ouvrir une page fonctionnelle avec références | Non |
| 2 | v0.2.0 | Ajouter `refscilink.config.json` | Éviter de redemander les mêmes paramètres à chaque exécution | `refscilink.config.json` | Le fichier contient source Markdown, dossier de sortie, mode d'affichage, mode thème et langue | Non |
| 3 | v0.2.0 | Créer un installateur local | Installer automatiquement le module dans un site existant | `tools/install_refscilink.mjs` | La commande crée l'arborescence et ajoute le bouton `Références` sans casser `index.html` | Non |
| 4 | v0.2.0 | Standardiser les scripts npm | Rendre les commandes simples et mémorisables | `package.json` | Les commandes `npm run build:refs`, `npm run install:module`, `npm run serve`, `npm run demo` fonctionnent | Non |
| 5 | v0.2.0 | Documenter le quick start développeur | Réduire la friction d'installation | `README.md` | Un développeur peut installer et tester le module en moins de 5 minutes | Non |
| 6 | v0.3.0 | Renforcer la détection automatique de thème | Améliorer l'intégration graphique au site hôte | `tools/theme_detector.mjs`, `theme_refscilink.json`, `reference.css` | Le module détecte couleurs, typographie, boutons, radius et génère un thème cohérent | Non |
| 7 | v0.3.0 | Ajouter le mode `theme_refscilink.json` éditable | Permettre une surcharge manuelle propre | `data/reference_bibliographique/json/theme_refscilink.json` | Modifier le JSON permet d'ajuster le rendu sans toucher au CSS principal | Non |
| 8 | v0.3.0 | Ajouter tests de détection thème | Éviter les régressions visuelles | `tests/theme_detection.test.mjs` | Les tests vérifient l'extraction des couleurs, polices et radius | Non |
| 9 | v0.3.0 | Améliorer l'extraction des références Markdown | Gérer références mal formatées ou dispersées | `tools/extract_references.mjs`, `build_references.mjs` | Le parseur détecte plusieurs formats de bibliographie dans un même fichier | Non |
| 10 | v0.3.0 | Ajouter tests d'extraction | Fiabiliser la détection bibliographique | `tests/extract_references.test.mjs` | Les tests couvrent DOI, PMID, URL, numérotation et formats libres | Non |
| 11 | v0.4.0 | Ajouter validation persistante locale | Ne pas dépendre uniquement de `localStorage` | `tools/validate_reference.mjs` | Une validation utilisateur peut être réécrite dans `references.json` | Non |
| 12 | v0.4.0 | Ajouter validation du schéma JSON | Garantir la qualité des données | `tools/validate_schema.mjs`, `schema_references.json`, `tests/schema_validation.test.mjs` | `npm test` échoue si le JSON ne respecte pas le schéma | Non |
| 13 | v0.4.0 | Ajouter enrichissement PubMed / Europe PMC | Compléter les métadonnées scientifiques | `tools/enrich_pubmed.mjs`, `tools/enrich_europepmc.mjs` | DOI/PMID/PMCID permettent de récupérer des métadonnées fiables | Non |
| 14 | v0.4.0 | Ajouter classification Open Access via Unpaywall | Distinguer accès libre, abstract only, preprint, paywall | `tools/check_open_access.mjs` | Chaque référence reçoit un `access_type` documenté | Non |
| 15 | v0.5.0 | Ajouter exports BibTeX / RIS / CSL-JSON | Faciliter la réutilisation académique | `tools/export_bibtex.mjs`, `export_ris.mjs`, `export_csljson.mjs` | Les exports sont générés depuis `references.json` | Non |
| 16 | v0.5.0 | Ajouter templates GitHub Issues | Faciliter les retours communautaires | `.github/ISSUE_TEMPLATE/bug_report.md`, `feature_request.md` | GitHub propose des formulaires clairs pour bug et feature | Non |
| 17 | v0.5.0 | Ajouter template Pull Request | Standardiser les contributions | `.github/PULL_REQUEST_TEMPLATE.md` | Chaque PR demande tests, documentation et impact | Non |
| 18 | v0.5.0 | Ajouter `CONTRIBUTING.md` | Expliquer comment contribuer | `CONTRIBUTING.md` | Le fichier explique setup, branches, commits, tests et documentation | Non |
| 19 | v0.5.0 | Ajouter `CHANGELOG.md` | Suivre les versions | `CHANGELOG.md` | Les releases sont documentées par version | Non |
| 20 | v0.5.0 | Ajouter `SECURITY.md` | Clarifier la remontée des vulnérabilités | `SECURITY.md` | Le dépôt possède une procédure de signalement | Non |
| 21 | v0.6.0 | Préparer publication npm | Rendre l'installation universelle | `package.json`, `bin/refscilink.mjs`, `README.md` | `npx refscilink install` fonctionne localement | Non |
| 22 | v0.6.0 | Créer commandes CLI | Utiliser RefSciLink comme outil développeur | `bin/refscilink.mjs` | Commandes disponibles : `install`, `build`, `serve`, `validate`, `export` | Non |
| 23 | v0.7.0 | Ajouter GitHub Actions | Automatiser tests et validation | `.github/workflows/test.yml` | Les tests s'exécutent à chaque push / PR | Non |
| 24 | v0.7.0 | Ajouter release workflow | Préparer les versions publiques | `.github/workflows/release.yml` | Une release peut être créée proprement avec changelog | Non |
| 25 | v1.0.0 | Stabiliser API et schéma JSON | Atteindre une première version stable | `schema_references.json`, README, tests | Le schéma est stable, documenté et testé | Non |
| 26 | v1.0.0 | Documentation complète | Rendre le projet utilisable sans accompagnement | `docs/`, `README.md`, exemples | Un développeur externe peut comprendre, installer, personnaliser et contribuer | Non |

---

## Ordre recommandé de travail

1. Créer `examples/basic-site/`.
2. Ajouter `refscilink.config.json`.
3. Créer `tools/install_refscilink.mjs`.
4. Standardiser les scripts `package.json`.
5. Mettre à jour le README avec un vrai quick start.
6. Renforcer la détection automatique du thème.
7. Ajouter les premiers tests.
8. Ajouter les fichiers communautaires GitHub.
9. Préparer la CLI.
10. Préparer la publication npm.

---

## Règle de suivi

À chaque amélioration terminée :

1. passer la ligne correspondante en `Oui` ;
2. ajouter si nécessaire une note courte dans `CHANGELOG.md` ;
3. mettre à jour le README si le comportement utilisateur change ;
4. vérifier que le skill `/create_module_ref` reste cohérent avec l'implémentation réelle.
