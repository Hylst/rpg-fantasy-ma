# Documentation du Moteur Narratif (Narrative Engine)

Ce document décrit les fonctionnalités du `NarrativeEngine` et comment l'utiliser pour créer des arcs narratifs pré-définis et dynamiques, intégrer des points de décision et générer des micro-quêtes.

## 1. Vue d'ensemble du `NarrativeEngine`

Le `NarrativeEngine` est responsable de la gestion des arcs narratifs, de la génération de la narration en fonction de l'état du jeu et des actions du joueur, et de l'intégration dynamique de points de décision et de micro-quêtes.

## 2. Définition et Chargement des Arcs Narratifs

Les arcs narratifs sont des structures de données qui définissent les quêtes principales et les intrigues secondaires de votre jeu. Ils sont chargés dans le moteur narratif au démarrage ou à tout moment pendant le jeu.

### Structure d'un Arc Narratif

Un arc narratif est un dictionnaire avec un `id` unique comme clé et un dictionnaire contenant les détails de l'arc comme valeur. Chaque arc peut avoir des propriétés comme `title` et `description`.

```json
{
  "arc1": {
    "title": "La Quête du Dragon",
    "description": "Une quête épique pour vaincre un dragon."
  },
  "arc2": {
    "title": "Le Mystère de la Forêt",
    "description": "Une intrigue secondaire dans une forêt enchantée."
  }
}
```

### Chargement des Arcs Narratifs

Pour charger des arcs narratifs dans le moteur, utilisez l'endpoint `POST /api/narrative/load_arcs` avec un corps de requête JSON contenant un dictionnaire d'arcs.

**Exemple de requête cURL:**

```bash
curl -X POST -H "Content-Type: application/json" -d \'{"arcs": {"arc1": {"title": "La Quête du Dragon", "description": "Une quête épique pour vaincre un dragon."}, "arc2": {"title": "Le Mystère de la Forêt", "description": "Une intrigue secondaire dans une forêt enchantée."}}}\' https://<votre_url_backend>/api/narrative/load_arcs
```

### Définir l'Arc Narratif Actuel

Vous pouvez définir l'arc narratif actuellement actif en utilisant l'endpoint `POST /api/narrative/set_arc`.

**Exemple de requête cURL:**

```bash
curl -X POST -H "Content-Type: application/json" -d \'{"arc_id": "arc1"}\' https://<votre_url_backend>/api/narrative/set_arc
```

## 3. Génération de la Narration

La narration est générée en fonction de l'état actuel du jeu et de l'action du joueur. Le moteur peut également intégrer dynamiquement des points de décision et des micro-quêtes.

### Endpoint

Utilisez l'endpoint `POST /api/narrative/generate` pour générer une narration.

**Exemple de requête cURL:**

```bash
curl -X POST -H "Content-Type: application/json" -d \'{"game_state": {"player": {"name": "Héros"}}, "player_action": "attaquer le gobelin"}\' https://<votre_url_backend>/api/narrative/generate
```

## 4. Points de Décision

Les points de décision sont des choix narratifs qui peuvent apparaître dynamiquement pendant le jeu, influençant le déroulement de l'histoire.

### Structure d'un Point de Décision

Un point de décision est un dictionnaire avec une `question` et une liste d'`options`.

```json
{
  "id": "d1",
  "question": "Voulez-vous explorer la grotte sombre ou suivre le chemin ensoleillé?",
  "options": ["Explorer la grotte", "Suivre le chemin"]
}
```

### Traitement d'une Décision

Pour traiter la décision d'un joueur, utilisez l'endpoint `POST /api/narrative/process_decision`.

**Exemple de requête cURL:**

```bash
curl -X POST -H "Content-Type: application/json" -d \'{"decision_id": "d1", "choice": "Explorer la grotte", "game_state": {"player": {"name": "Héros"}}}\' https://<votre_url_backend>/api/narrative/process_decision
```

## 5. Micro-Quêtes

Les micro-quêtes sont de petites tâches générées dynamiquement qui peuvent être complétées par le joueur pour enrichir l'expérience de jeu.

### Structure d'une Micro-Quête

Une micro-quête est un dictionnaire avec un `title` et une `description`.

```json
{
  "id": "mq1",
  "title": "Retrouver le chat perdu",
  "description": "Un chaton a disparu dans le village. Retrouvez-le !"
}
```

### Complétion d'une Micro-Quête

Pour marquer une micro-quête comme complétée, utilisez l'endpoint `POST /api/narrative/complete_micro_quest`.

**Exemple de requête cURL:**

```bash
curl -X POST -H "Content-Type: application/json" -d \'{"quest_id": "mq1", "game_state": {"player": {"name": "Héros"}}}\' https://<votre_url_backend>/api/narrative/complete_micro_quest
```

## 6. Prochaines Étapes

*   **Intégration Frontend:** Développer le frontend pour interagir avec ces endpoints et afficher les points de décision et les micro-quêtes de manière interactive.
*   **Logique de Jeu Avancée:** Implémenter une logique plus complexe dans les méthodes `process_decision` et `complete_micro_quest` pour que les choix et les complétions de quêtes aient un impact significatif sur l'état du jeu.
*   **Personnalisation des Arcs:** Permettre la création et la modification d'arcs narratifs via une interface d'administration ou des outils de développement.


