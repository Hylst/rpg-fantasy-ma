# Documentation des Améliorations du Moteur de Simulation

Ce document détaille les améliorations apportées au `SimulationEngine` pour des comportements PNJ plus sophistiqués, des relations dynamiques et des routines quotidiennes interactives.

## 1. Comportements PNJ Avancés

La fonction `update_npc_behaviors` a été étendue pour inclure des comportements PNJ plus sophistiqués, prenant en compte :

*   **Motivations et état du monde:** Les PNJ réagissent aux conditions environnementales et à leurs motivations profondes (ex: se préparer à une tempête, chercher de la nourriture).
*   **État émotionnel:** Des comportements simples basés sur la disposition du PNJ (ex: en colère, heureux) sont introduits.
*   **Objectifs personnels:** Les PNJ peuvent avoir des objectifs individuels qui influencent leurs actions (ex: s'entraîner pour améliorer des compétences).

**Exemple de logique de comportement (extrait de `update_npc_behaviors`):**

```python
            if "protéger le village" in npc.motivations and game_state.world_state.weather == "storm":
                print(f"{npc.name} se prépare à défendre le village contre la tempête.")
            elif "chercher de la nourriture" in npc.motivations and game_state.world_state.time_of_day == "day":
                print(f"{npc.name} part à la recherche de nourriture.")
            
            if npc.disposition == "angry":
                print(f"{npc.name} semble en colère et évite les interactions.")
            elif npc.disposition == "happy":
                print(f"{npc.name} est de bonne humeur et salue les passants.")

            if "améliorer ses compétences" in npc.motivations:
                print(f"{npc.name} s'entraîne à l'épée.")
```

## 2. Relations Dynamiques

La fonction `update_npc_relationships` a été améliorée pour implémenter un système où les relations entre PNJ évoluent dynamiquement. Les interactions entre PNJ sont désormais prises en compte :

*   **Renforcement des amitiés:** Si des PNJ amis se rencontrent au même endroit, leur amitié peut se renforcer.
*   **Intensification des rivalités:** Si des PNJ ennemis se rencontrent, leur rivalité peut s'intensifier.

**Exemple de logique de relation (extrait de `update_npc_relationships`):**

```python
        for npc1 in game_state.world_state.npcs.values():
            for npc2_id, relationship in npc1.relationships.items():
                npc2 = game_state.world_state.npcs.get(npc2_id)
                if npc2:
                    if relationship == "ami":
                        if npc1.location == npc2.location:
                            print(f"{npc1.name} et {npc2.name} renforcent leur amitié en discutant.")
                    elif relationship == "ennemi":
                        if npc1.location == npc2.location:
                            print(f"{npc1.name} et {npc2.name} échangent des regards hostiles.")
```

## 3. Routines Quotidiennes Interactives

La fonction `process_daily_routines` a été mise à jour pour permettre aux routines quotidiennes des PNJ d'être potentiellement interrompues ou influencées par le joueur. Bien que la logique d'interruption par le joueur soit actuellement un placeholder, la structure est en place pour de futures implémentations :

*   **Exécution des routines:** Les PNJ exécutent leurs actions définies à des moments spécifiques de la journée.
*   **Point d'intégration pour l'interruption:** Un commentaire indique où la logique d'interaction du joueur pourrait être ajoutée pour modifier le comportement ou la routine du PNJ.

**Exemple de logique de routine (extrait de `process_daily_routines`):**

```python
        current_time_of_day = game_state.world_state.time_of_day
        for npc in game_state.world_state.npcs.values():
            for routine_entry in npc.daily_routine:
                if routine_entry.get("time") == current_time_of_day:
                    action = routine_entry.get("action")
                    print(f"{npc.name} exécute sa routine: {action}")
                    # Placeholder pour l'interaction du joueur
                    # if player_is_interacting_with(npc):
                    #     print(f"{npc.name} est interrompu dans sa routine par le joueur.")
                    #     # Logique pour modifier la routine ou le comportement du PNJ
```

## 4. Utilisation des Endpoints API

Les endpoints suivants du blueprint `simulation_bp` ont été mis à jour pour utiliser ces améliorations :

*   `POST /api/simulation/tick`: Exécute un tick de simulation complet, incluant la mise à jour des comportements, des relations et des routines quotidiennes.
*   `POST /api/simulation/update_behaviors`: Met à jour spécifiquement les comportements des PNJ.
*   `POST /api/simulation/update_relationships`: Met à jour spécifiquement les relations entre PNJ.
*   `POST /api/simulation/process_daily_routines`: Exécute spécifiquement les routines quotidiennes des PNJ.

**Note:** Les requêtes à ces endpoints doivent inclure l'objet `game_state` complet dans le corps de la requête JSON, comme démontré dans les tests précédents.

