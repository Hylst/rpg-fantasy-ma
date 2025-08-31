# Documentation des Améliorations du Moteur Narratif

Ce document détaille les améliorations apportées au `NarrativeEngine` pour une génération narrative plus contextuelle, des points de décision dynamiques et des micro-quêtes intelligentes.

## 1. Génération Contextuelle

La fonction `generate_narrative` a été améliorée pour intégrer de manière plus fluide l'état actuel du jeu dans la narration. Elle prend désormais en compte les éléments suivants :

*   **Nom du joueur:** Le nom du joueur est utilisé pour personnaliser la narration.
*   **Localisation actuelle:** La description de la localisation actuelle du joueur, y compris son nom et une description générale, est incluse.
*   **PNJ présents:** Les PNJ présents dans la localisation actuelle sont identifiés et mentionnés dans la narration.
*   **Quêtes actives:** Les titres des quêtes actives du joueur sont listés pour rappeler les objectifs en cours.
*   **Arc narratif actuel:** Le titre de l'arc narratif en cours est mentionné pour situer le joueur dans l'histoire principale.

**Exemple de narration générée (extrait):**

```
Alors que [Nom du joueur] [action du joueur], le monde réagit. Vous êtes actuellement à [Nom de la localisation], un endroit [description de la localisation]. Il fait [météo] et c'est le [heure de la journée]. Vous apercevez [PNJ 1], [PNJ 2] à proximité. Vos quêtes actives incluent: [Titre Quête 1], [Titre Quête 2]. L'arc narratif actuel '[Titre de l'arc]' progresse.
```

## 2. Affinement des Points de Décision Dynamiques

La fonction `generate_decision_point` a été affinée pour générer des points de décision plus organiques et pertinents, basés sur le contexte du jeu. Les décisions peuvent maintenant être déclenchées en fonction de :

*   **Localisation:** Des décisions spécifiques peuvent apparaître en fonction de l'endroit où se trouve le joueur (ex: au village, dans la forêt).
*   **Quêtes actives:** Des choix peuvent être proposés en lien avec les quêtes que le joueur a actuellement activées.

**Exemple de logique de décision (extrait de `generate_decision_point`):**

```python
        if current_location_id == "village_square":
            decisions.append({"id": "d1", "question": "Un marchand ambulant propose des marchandises rares. Voulez-vous les examiner ou passer votre chemin?", "options": ["Examiner les marchandises", "Passer mon chemin"]})
        # ...
        active_quests = [q for q in game_state.quests if q.status == "active"]
        for quest in active_quests:
            if quest.id == "mq1" and game_state.world_state.current_location == "village_square":
                decisions.append({"id": "d4", "question": "Vous entendez un miaulement faible venant d'une ruelle. Serait-ce le chat perdu de la quête?", "options": ["Investiguer la ruelle", "Ignorer le bruit"]})
```

## 3. Amélioration des Micro-Quêtes Intelligentes

La fonction `generate_micro_quest` a été améliorée pour générer des micro-quêtes plus variées et adaptées au contexte du jeu. Les micro-quêtes sont désormais générées en fonction de :

*   **Localisation:** Des quêtes spécifiques à certaines zones (village, forêt, etc.) sont proposées.
*   **Heure de la journée:** Des quêtes peuvent être spécifiques au jour ou à la nuit.
*   **Évitement des doublons:** Le moteur évite de proposer des micro-quêtes qui sont déjà actives pour le joueur.

**Exemple de logique de micro-quête (extrait de `generate_micro_quest`):**

```python
        if current_location_id == "village_square":
            micro_quests_pool.append({"id": "mq1", "title": "Retrouver le chat perdu", "description": "Un chaton a disparu dans le village. Demandez aux habitants si quelqu'un l'a vu !"})
            micro_quests_pool.append({"id": "mq3", "title": "Aider le forgeron", "description": "Le forgeron a besoin d'aide pour transporter du minerai lourd de la mine voisine."})
        # ...
        if time_of_day == "night":
            micro_quests_pool.append({"id": "mq5", "title": "Patrouille nocturne", "description": "Les gardes ont besoin d'aide pour patrouiller les environs du village pendant la nuit."})
        # ...
        available_quests = [q for q in micro_quests_pool if q["id"] not in active_quest_ids]
```

## 4. Utilisation des Endpoints API

Les endpoints suivants du blueprint `narrative_bp` ont été mis à jour pour utiliser ces améliorations :

*   `POST /api/narrative/generate`: Génère une narration contextuelle.
*   `POST /api/narrative/process_decision`: Traite la décision du joueur et met à jour l'état du jeu en conséquence.
*   `POST /api/narrative/complete_micro_quest`: Marque une micro-quête comme complétée et applique les récompenses/conséquences.

**Note:** Les requêtes à ces endpoints doivent inclure l'objet `game_state` complet dans le corps de la requête JSON, comme démontré dans les tests précédents.

