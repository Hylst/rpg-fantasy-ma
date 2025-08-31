# Documentation du Moteur de Simulation (Simulation Engine)

Ce document décrit les fonctionnalités du `SimulationEngine` et comment l'utiliser pour gérer les comportements des PNJ, leurs relations et leurs routines quotidiennes.

## 1. Vue d'ensemble du `SimulationEngine`

Le `SimulationEngine` est responsable de la mise à jour dynamique de l'état du monde du jeu, en se concentrant sur les PNJ (Personnages Non-Joueurs). Il gère leurs comportements basés sur leurs motivations, l'évolution de leurs relations et l'exécution de leurs routines quotidiennes.

## 2. Mise à jour des Modèles de Données

Le modèle `NPC` dans `src/models/game_state.py` a été étendu pour inclure les champs suivants afin de supporter les nouvelles fonctionnalités du moteur de simulation :

- `motivations`: Une liste de chaînes de caractères décrivant les motivations du PNJ (ex: `['protéger le village', 'chercher de la nourriture']`).
- `daily_routine`: Une liste de dictionnaires décrivant les actions du PNJ à différents moments de la journée (ex: `[{'time': 'morning', 'action': 'aller au marché'}]`).
- `relationships`: Un dictionnaire décrivant les relations du PNJ avec d'autres PNJ ou factions (ex: `{'npc_id_1': 'ami', 'faction_id_A': 'ennemi'}`).

## 3. Fonctionnalités du Moteur de Simulation

### 3.1. Mise à jour des Comportements des PNJ

Cette fonction met à jour les comportements des PNJ en fonction de leurs motivations et de l'état actuel du monde (météo, heure de la journée, etc.).

**Endpoint:** `POST /api/simulation/update_behaviors`

**Exemple de requête cURL:**

```bash
curl -X POST -H "Content-Type: application/json" --data-binary "$(cat /home/ubuntu/rpg-backend/src/wrapped_game_state.json)" https://<votre_url_backend>/api/simulation/update_behaviors
```

### 3.2. Mise à jour des Relations entre PNJ

Cette fonction gère l'évolution des relations entre les PNJ, en tenant compte des alliances, des rivalités et des événements qui peuvent les influencer.

**Endpoint:** `POST /api/simulation/update_relationships`

**Exemple de requête cURL:**

```bash
curl -X POST -H "Content-Type: application/json" --data-binary "$(cat /home/ubuntu/rpg-backend/src/wrapped_game_state.json)" https://<votre_url_backend>/api/simulation/update_relationships
```

### 3.3. Exécution des Routines Quotidiennes des PNJ

Cette fonction exécute les actions définies dans la `daily_routine` de chaque PNJ en fonction de l'heure de la journée dans le jeu.

**Endpoint:** `POST /api/simulation/process_daily_routines`

**Exemple de requête cURL:**

```bash
curl -X POST -H "Content-Type: application/json" --data-binary "$(cat /home/ubuntu/rpg-backend/src/wrapped_game_state.json)" https://<votre_url_backend>/api/simulation/process_daily_routines
```

### 3.4. Tick de Simulation Global

Cette fonction orchestre l'exécution de toutes les mises à jour du moteur de simulation (comportements, relations, routines quotidiennes) en une seule étape.

**Endpoint:** `POST /api/simulation/tick`

**Exemple de requête cURL:**

```bash
curl -X POST -H "Content-Type: application/json" --data-binary "$(cat /home/ubuntu/rpg-backend/src/wrapped_game_state.json)" https://<votre_url_backend>/api/simulation/tick
```

## 4. Prochaines Étapes

*   **Logique de Simulation Avancée:** Développer une logique plus complexe pour les comportements, les relations et les routines, en utilisant potentiellement des modèles d'IA pour des interactions plus dynamiques.
*   **Intégration Frontend:** Mettre à jour le frontend pour visualiser les PNJ, leurs relations et leurs routines, et permettre des interactions qui influencent la simulation.
*   **Persistance des Données:** Assurer que les changements apportés par le moteur de simulation à l'état du jeu sont correctement persistés.


