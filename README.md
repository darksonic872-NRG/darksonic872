# DarkSonic872 — V2.2

Base complète du site, avec l'index modulaire et tous les emplacements d'images préparés.

## Mise à jour GitHub

Le plus simple est de remplacer l'ancienne version du dépôt par le contenu de ce dossier.
`index.html` doit rester à la racine du dépôt.

Structure principale :

```text
index.html
collections.html
jeux-de-coeur.html
defis.html
emissions.html
evenements.html
css/
js/
data/
images/
```

## Bannière de l'accueil

Remplacer :

```text
images/hero/banniere.png
```

Il n'y a rien à modifier dans `index.html` : le chemin est déjà configuré dans `data/config.json`.

## Toutes les images de l'index

Voir le fichier :

```text
IMAGES-A-REMPLACER.txt
```

Les textes et liens généraux sont dans `data/config.json`.
Les cinq cartes de navigation de l'accueil sont dans `data/home.json`.

## Twitch

La chaîne configurée est `norage_gaming`.
Le lecteur Twitch utilise automatiquement le domaine du site comme paramètre `parent`, ce qui convient à GitHub Pages.

## Important pour les fichiers JSON

Pour tester en local, utiliser Live Server ou un petit serveur local. Un double-clic sur `index.html` peut empêcher le navigateur de charger les fichiers JSON.
